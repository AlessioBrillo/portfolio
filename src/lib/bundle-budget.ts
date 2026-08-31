import { readFile, readdir } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { gzipSync, brotliCompressSync } from 'node:zlib';

/**
 * The bundle-size gate (ADR-0018): a hard, CI-enforced budget on the shipped
 * JavaScript payload. `scripts/check-bundle.mjs` is the thin CLI; this module
 * holds the pure logic so the budget stays unit-tested like every other piece
 * of `src/`.
 *
 * The gate measures *whole-file* compression of the real files in `dist/`
 * (what the network actually pays), not the per-module gzip sums a bundle
 * analyzer reports (those overstate the payload because every module carries
 * its own compression header).
 *
 * Two budgets per compression algorithm, both in kB:
 *  - `entryChunkKb` — the single module entry script (`index.html`'s module
 *    script). This is the chunk a visitor's first interaction waits on.
 *  - `totalJsKb` — every JS chunk summed (entry + lazy routes + lazy vendor
 *    like GSAP). This is the whole-JS cost of the site.
 *
 * Optional per-chunk baseline (`chunks`) enables `--fail-on-increase` which
 * fails if ANY individual chunk exceeds its recorded baseline (not just the
 * aggregate totals). This catches regressions in lazy-loaded chunks that the
 * total budget might mask.
 *
 * The gate fails only when BOTH gzip AND brotli exceed their respective
 * budgets — a regression in one algorithm but not the other is not a failure.
 */

export interface MeasuredChunk {
  readonly name: string;
  /** The chunk's real bytes — the whole-file compression is computed from these,
   * never from a size number (a zero-filled placeholder would compress to
   * nothing and lie about the payload). */
  readonly buffer: Buffer;
}

export interface CompressedChunk {
  readonly name: string;
  readonly gzipBytes: number;
  readonly brotliBytes: number;
}

export interface ChunkBaseline {
  readonly name: string;
  readonly gzipKb: number;
  readonly brotliKb: number;
}

export interface BudgetBaseline {
  readonly entryChunkKb: { readonly gzip: number; readonly brotli: number };
  readonly totalJsKb: { readonly gzip: number; readonly brotli: number };
  /** Optional per-chunk baselines for --fail-on-increase mode. */
  readonly chunks?: readonly ChunkBaseline[];
}

export interface BudgetResult {
  readonly entry:
    | {
        readonly file: string;
        readonly gzipKb: number;
        readonly brotliKb: number;
        readonly budgetKb: { gzip: number; brotli: number };
      }
    | undefined;
  readonly total: {
    readonly gzipKb: number;
    readonly brotliKb: number;
    readonly budgetKb: { gzip: number; brotli: number };
  };
  readonly violations: readonly string[];
}

const toKb = (bytes: number): number => bytes / 1024;

/** Whole-file gzip size of a byte buffer (Node's header carries mtime 0, so
 * the size is deterministic for a given input). */
export function gzipBytesOf(buffer: Buffer): number {
  return gzipSync(buffer).length;
}

/** Whole-file brotli size of a byte buffer (deterministic for given input). */
export function brotliBytesOf(buffer: Buffer): number {
  return brotliCompressSync(buffer).length;
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

/** Maps raw chunk bytes to whole-file compression sizes, preserving names. */
export function computeCompressed(chunks: readonly MeasuredChunk[]): readonly CompressedChunk[] {
  return chunks.map((chunk) => ({
    name: chunk.name,
    gzipBytes: gzipBytesOf(chunk.buffer),
    brotliBytes: brotliBytesOf(chunk.buffer),
  }));
}

/**
 * The gate itself: compares measured chunks against the committed baseline and
 * returns every violation (entry over budget, total over budget, entry chunk
 * absent). The entry chunk is located by basename so a fresh content hash on
 * every build cannot break the match.
 *
 * When `failOnIncrease` is true, also compares each chunk against its
 * per-chunk baseline (if present) and fails on any increase.
 *
 * A violation is only reported if BOTH gzip AND brotli exceed their respective
 * budgets. A regression in one algorithm but not the other is not a failure.
 */
export function checkBundle(
  chunks: readonly CompressedChunk[],
  entryFile: string | undefined,
  baseline: BudgetBaseline,
  failOnIncrease = false,
): BudgetResult {
  const entryName = entryFile ? basename(entryFile) : undefined;
  const entry = entryName ? chunks.find((chunk) => basename(chunk.name) === entryName) : undefined;

  const violations: string[] = [];

  // Entry chunk check: fail only if BOTH gzip and brotli exceed budget
  if (entry) {
    const gzipKb = toKb(entry.gzipBytes);
    const brotliKb = toKb(entry.brotliBytes);
    const gzipOver = gzipKb > baseline.entryChunkKb.gzip;
    const brotliOver = brotliKb > baseline.entryChunkKb.brotli;
    if (gzipOver && brotliOver) {
      violations.push(
        `entry chunk ${entry.name} is ${gzipKb.toFixed(1)} kB gzip (budget ${baseline.entryChunkKb.gzip} kB) and ${brotliKb.toFixed(1)} kB brotli (budget ${baseline.entryChunkKb.brotli} kB) — both exceed budget`,
      );
    }
  } else {
    violations.push('entry chunk not found in the build output');
  }

  // Total JS check: fail only if BOTH gzip and brotli exceed budget
  const totalGzipKb = toKb(chunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0));
  const totalBrotliKb = toKb(chunks.reduce((sum, chunk) => sum + chunk.brotliBytes, 0));
  const totalGzipOver = totalGzipKb > baseline.totalJsKb.gzip;
  const totalBrotliOver = totalBrotliKb > baseline.totalJsKb.brotli;
  if (totalGzipOver && totalBrotliOver) {
    violations.push(
      `total JS is ${totalGzipKb.toFixed(1)} kB gzip (budget ${baseline.totalJsKb.gzip} kB) and ${totalBrotliKb.toFixed(1)} kB brotli (budget ${baseline.totalJsKb.brotli} kB) — both exceed budget`,
    );
  }

  if (failOnIncrease && baseline.chunks) {
    const baselineMap = new Map(
      baseline.chunks.map((c) => [c.name, { gzipKb: c.gzipKb, brotliKb: c.brotliKb }]),
    );
    for (const chunk of chunks) {
      const gzipKb = toKb(chunk.gzipBytes);
      const brotliKb = toKb(chunk.brotliBytes);
      const baselineEntry = baselineMap.get(chunk.name);
      if (baselineEntry !== undefined) {
        // Compare at 0.1 kB precision (same as baseline rounding) to avoid
        // false positives from floating-point differences.
        const actualGzipRounded = Math.round(gzipKb * 10) / 10;
        const actualBrotliRounded = Math.round(brotliKb * 10) / 10;
        const gzipOver = actualGzipRounded > baselineEntry.gzipKb;
        const brotliOver = actualBrotliRounded > baselineEntry.brotliKb;
        if (gzipOver && brotliOver) {
          violations.push(
            `chunk ${chunk.name} increased to ${actualGzipRounded.toFixed(1)} kB gzip (baseline ${baselineEntry.gzipKb} kB) and ${actualBrotliRounded.toFixed(1)} kB brotli (baseline ${baselineEntry.brotliKb} kB) — both exceed baseline`,
          );
        }
      }
    }
  }

  return {
    entry: entry
      ? {
          file: entry.name,
          gzipKb: toKb(entry.gzipBytes),
          brotliKb: toKb(entry.brotliBytes),
          budgetKb: baseline.entryChunkKb,
        }
      : undefined,
    total: { gzipKb: totalGzipKb, brotliKb: totalBrotliKb, budgetKb: baseline.totalJsKb },
    violations,
  };
}
