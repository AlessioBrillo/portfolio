#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { brotliCompressSync } from 'node:zlib';

const DIST_DIR = 'dist';

async function listJsChunks(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  const chunks = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const name = relative(dir, join(entry.parentPath, entry.name)).replace(/\\/g, '/');
    if (!name.endsWith('.js') || name.endsWith('.js.map')) continue;
    const file = join(entry.parentPath, entry.name);
    chunks.push({ name, buffer: await readFile(file) });
  }
  return chunks.sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const chunks = await listJsChunks(DIST_DIR);

  const toKb = (bytes) => Math.round((bytes / 1024) * 10) / 10;

  console.log('Brotli sizes:');
  let totalBrotli = 0;
  const chunkBaselines = [];

  for (const chunk of chunks) {
    const brotliBytes = brotliCompressSync(chunk.buffer).length;
    const brotliKb = toKb(brotliBytes);
    totalBrotli += brotliBytes;
    chunkBaselines.push({ name: chunk.name, brotliKb });
    console.log(`  ${chunk.name.padEnd(44)} ${brotliKb.toFixed(2).padStart(9)} kB`);
  }

  console.log(`  ${'total'.padEnd(44)} ${toKb(totalBrotli).toFixed(2).padStart(9)} kB`);

  // Find entry chunk (the one referenced in index.html)
  const { readFile: readFileSync } = await import('node:fs/promises');
  const html = await readFileSync(join(DIST_DIR, 'index.html'), 'utf8');
  const entryMatch = html.match(/src="([^"]+\.js)"/);
  const entryFile = entryMatch?.[1] ? basename(entryMatch[1]) : undefined;
  const entryChunk = entryFile ? chunks.find((c) => basename(c.name) === entryFile) : undefined;
  const entryBrotliKb = entryChunk ? toKb(brotliCompressSync(entryChunk.buffer).length) : undefined;

  console.log('');
  console.log('Entry chunk:', entryChunk?.name);
  console.log('Entry brotli KB:', entryBrotliKb);
  console.log('Total brotli KB:', toKb(totalBrotli));

  // Output JSON for baseline
  const baseline = {
    entryChunkKb: entryBrotliKb,
    totalJsKb: toKb(totalBrotli),
    chunks: chunkBaselines,
    origin: 'Measured from current build',
  };
  console.log('');
  console.log(JSON.stringify(baseline, null, 2));
}

main().catch(console.error);
