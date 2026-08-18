import { readFile, readdir } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

/**
 * The bundle-size gate (ADR-0018): a hard, CI-enforced budget on the shipped
 * JavaScript payload. `scripts/check-bundle.mjs` is the thin CLI; this module
 * holds the pure logic so the budget stays unit-tested like every other piece
 * of `src/`.
 *
 * The gate measures *whole-file* gzip of the real files in `dist/` (what the
 * network actually pays), not the per-module gzip sums a bundle analyzer
 * reports (those overstate the payload because every module carries its own
 * gzip header).
 *
 * Two budgets, both in kB of gzip:
 *  - `entryChunkKb` — the single module entry script (`index.html`'s module
 *    script). This is the chunk a visitor's first interaction waits on.
 *  - `totalJsKb` — every JS chunk summed (entry + lazy routes + lazy vendor
 *    like GSAP). This is the whole-JS cost of the site.
 */

export interface MeasuredChunk {
  readonly name: string;
  /** The chunk's real bytes — the whole-file gzip is computed from these,
   * never from a size number (a zero-filled placeholder would compress to
   * nothing and lie about the payload). */
  readonly buffer: Buffer;
}

export interface GzipChunk {
  readonly name: string;
  readonly gzipBytes: number;
}

export interface BudgetBaseline {
  readonly entryChunkKb: number;
  readonly totalJsKb: number;
}

export interface BudgetResult {
  readonly entry:
    { readonly file: string; readonly gzipKb: number; readonly budgetKb: number } | undefined;
  readonly total: { readonly gzipKb: number; readonly budgetKb: number };
  readonly violations: readonly string[];
}

const toKb = (bytes: number): number => bytes / 1024;

/** Whole-file gzip size of a byte buffer (Node's header carries mtime 0, so
 * the size is deterministic for a given input). */
export function gzipBytesOf(buffer: Buffer): number {
  return gzipSync(buffer).length;
}

/** Recursively lists every JS chunk in a build directory (source maps and
 * non-JS assets excluded), as posix-style paths relative to the directory,
 * carrying the real file bytes. */
export async function listJsChunks(dir: string): Promise<readonly MeasuredChunk[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  const chunks: MeasuredChunk[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const name = relative(dir, join(entry.parentPath, entry.name)).replace(/\\/g, '/');
    if (!name.endsWith('.js') || name.endsWith('.js.map')) continue;
    const file = join(entry.parentPath, entry.name);
    chunks.push({ name, buffer: await readFile(file) });
  }
  return chunks.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The entry script src from a built `index.html` (the module script tag Vite
 * emits for the entry chunk; lazy chunks are loaded at runtime and never get
 * a tag). Returns undefined when no module script exists — a build without an
 * entry is not a build worth shipping.
 */
export function readEntryScript(html: string): string | undefined {
  return html.match(/src="([^"]+\.js)"/)?.[1];
}

/** Maps raw chunk bytes to whole-file gzip sizes, preserving names. */
export function computeGzip(chunks: readonly MeasuredChunk[]): readonly GzipChunk[] {
  return chunks.map((chunk) => ({
    name: chunk.name,
    gzipBytes: gzipBytesOf(chunk.buffer),
  }));
}

/**
 * The gate itself: compares measured chunks against the committed baseline and
 * returns every violation (entry over budget, total over budget, entry chunk
 * absent). The entry chunk is located by basename so a fresh content hash on
 * every build cannot break the match.
 */
export function checkBundle(
  chunks: readonly GzipChunk[],
  entryFile: string | undefined,
  baseline: BudgetBaseline,
): BudgetResult {
  const entryName = entryFile ? basename(entryFile) : undefined;
  const entry = entryName ? chunks.find((chunk) => basename(chunk.name) === entryName) : undefined;

  const violations: string[] = [];
  if (entry) {
    const gzipKb = toKb(entry.gzipBytes);
    if (gzipKb > baseline.entryChunkKb) {
      violations.push(
        `entry chunk ${entry.name} is ${gzipKb.toFixed(1)} kB gzip — budget ${baseline.entryChunkKb} kB`,
      );
    }
  } else {
    violations.push('entry chunk not found in the build output');
  }

  const totalKb = toKb(chunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0));
  if (totalKb > baseline.totalJsKb) {
    violations.push(`total JS is ${totalKb.toFixed(1)} kB gzip — budget ${baseline.totalJsKb} kB`);
  }

  return {
    entry: entry
      ? { file: entry.name, gzipKb: toKb(entry.gzipBytes), budgetKb: baseline.entryChunkKb }
      : undefined,
    total: { gzipKb: totalKb, budgetKb: baseline.totalJsKb },
    violations,
  };
}
