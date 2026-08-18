import { afterAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  checkBundle,
  computeGzip,
  gzipBytesOf,
  listJsChunks,
  readEntryScript,
  type BudgetBaseline,
  type GzipChunk,
  type MeasuredChunk,
} from '@/lib/bundle-budget';

const BASELINE: BudgetBaseline = { entryChunkKb: 165, totalJsKb: 225 };

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'bundle-budget-'));
  tempDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

describe('gzipBytesOf', () => {
  it('compresses a repeated payload to a fraction of its raw size', () => {
    const raw = Buffer.alloc(4096, 0x61);
    const gzip = gzipBytesOf(raw);
    expect(gzip).toBeGreaterThan(0);
    expect(gzip).toBeLessThan(raw.length);
  });

  it('is deterministic for the same input', () => {
    const raw = Buffer.from('The Ascent — a deterministic payload', 'utf8');
    expect(gzipBytesOf(raw)).toBe(gzipBytesOf(raw));
  });
});

describe('listJsChunks', () => {
  it('lists every JS file with its real bytes, recursively', async () => {
    const dir = makeTempDir();
    mkdirSync(join(dir, 'assets'), { recursive: true });
    mkdirSync(join(dir, 'nested'), { recursive: true });
    writeFileSync(join(dir, 'assets', 'index-a1b2c3d4.js'), 'console.log(1);');
    writeFileSync(join(dir, 'assets', 'lazy-0000.js'), 'console.log(2);');
    writeFileSync(join(dir, 'nested', 'deep.js'), 'console.log(3);');

    const chunks = await listJsChunks(dir);

    expect(chunks).toHaveLength(3);
    expect(chunks.map((chunk) => chunk.name)).toContain(
      join('assets', 'index-a1b2c3d4.js').replace(/\\/g, '/'),
    );
    expect(chunks.map((chunk) => chunk.name)).toContain(
      join('nested', 'deep.js').replace(/\\/g, '/'),
    );
    const index = chunks.find((chunk) => chunk.name.endsWith('index-a1b2c3d4.js'));
    expect(index?.buffer.toString('utf8')).toBe('console.log(1);');
  });

  it('ignores non-JS assets and source maps', async () => {
    const dir = makeTempDir();
    mkdirSync(join(dir, 'assets'), { recursive: true });
    writeFileSync(join(dir, 'assets', 'index.js'), 'console.log(1);');
    writeFileSync(join(dir, 'assets', 'index.css'), 'body {}');
    writeFileSync(join(dir, 'assets', 'Fraunces.woff2'), Buffer.alloc(10));
    writeFileSync(join(dir, 'assets', 'index.js.map'), '{}');

    const chunks = await listJsChunks(dir);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.name).toBe('assets/index.js');
    expect(chunks[0]?.buffer.toString('utf8')).toBe('console.log(1);');
  });
});

describe('readEntryScript', () => {
  const SAMPLE = `<html>
  <head><title>Ascent</title></head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="/assets/index-DTzJCiYG.js"></script>
  </body>
</html>`;

  it('extracts the module script src from a built index.html', () => {
    expect(readEntryScript(SAMPLE)).toBe('/assets/index-DTzJCiYG.js');
  });

  it('returns undefined when no module script is present', () => {
    expect(readEntryScript('<html><body>no scripts</body></html>')).toBeUndefined();
  });
});

describe('computeGzip', () => {
  it('maps raw bytes to whole-file gzip sizes, preserving names', () => {
    const chunks: readonly MeasuredChunk[] = [
      { name: 'assets/index.js', buffer: Buffer.alloc(4096, 0x61) },
      { name: 'assets/lazy.js', buffer: Buffer.alloc(1024, 0x62) },
    ];

    const gzip = computeGzip(chunks);

    expect(gzip).toHaveLength(2);
    expect(gzip[0]).toMatchObject({ name: 'assets/index.js' });
    expect(gzip[0]!.gzipBytes).toBeLessThan(4096);
    expect(gzip[1]).toMatchObject({ name: 'assets/lazy.js' });
    expect(gzip[1]!.gzipBytes).toBeLessThan(1024);
  });
});

describe('checkBundle', () => {
  const chunk = (name: string, gzipBytes: number): GzipChunk => ({ name, gzipBytes });

  it('passes when entry and total sit under their budgets', () => {
    const result = checkBundle(
      [chunk('assets/index-abc.js', 140 * 1024), chunk('assets/gsap-abc.js', 40 * 1024)],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toEqual([]);
    expect(result.entry).toMatchObject({ file: 'assets/index-abc.js' });
    expect(result.total.gzipKb).toBeCloseTo(180, 1);
  });

  it('fails when the entry chunk exceeds its budget', () => {
    const result = checkBundle(
      [chunk('assets/index-abc.js', 170 * 1024), chunk('assets/lazy-abc.js', 10 * 1024)],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toEqual([
      'entry chunk assets/index-abc.js is 170.0 kB gzip — budget 165 kB',
    ]);
  });

  it('fails when total JS exceeds its budget', () => {
    const result = checkBundle(
      [chunk('assets/index-abc.js', 150 * 1024), chunk('assets/gsap-abc.js', 80 * 1024)],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toEqual(['total JS is 230.0 kB gzip — budget 225 kB']);
  });

  it('fails when the entry chunk cannot be located', () => {
    const result = checkBundle([chunk('assets/index-abc.js', 100 * 1024)], undefined, BASELINE);

    expect(result.violations).toEqual(['entry chunk not found in the build output']);
    expect(result.entry).toBeUndefined();
  });

  it('reports every violation, not just the first', () => {
    const result = checkBundle(
      [chunk('assets/index-abc.js', 180 * 1024), chunk('assets/gsap-abc.js', 90 * 1024)],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toHaveLength(2);
  });

  it('passes exactly at the budget boundary', () => {
    const result = checkBundle(
      [chunk('assets/index-abc.js', 165 * 1024), chunk('assets/gsap-abc.js', 60 * 1024)],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toEqual([]);
  });
});
