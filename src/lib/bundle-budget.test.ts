import { afterAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  checkBundle,
  computeCompressed,
  brotliBytesOf,
  gzipBytesOf,
  listJsChunks,
  readEntryScript,
  type BudgetBaseline,
  type CompressedChunk,
  type MeasuredChunk,
} from '@/lib/bundle-budget';

const BASELINE: BudgetBaseline = {
  entryChunkKb: { gzip: 165, brotli: 150 },
  totalJsKb: { gzip: 225, brotli: 200 },
};
const BASELINE_WITH_CHUNKS: BudgetBaseline = {
  entryChunkKb: { gzip: 165, brotli: 150 },
  totalJsKb: { gzip: 225, brotli: 200 },
  chunks: [
    { name: 'assets/index-abc.js', gzipKb: 140, brotliKb: 125 },
    { name: 'assets/gsap-abc.js', gzipKb: 25, brotliKb: 22 },
    { name: 'assets/lazy-abc.js', gzipKb: 15, brotliKb: 13 },
  ],
};

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

describe('brotliBytesOf', () => {
  it('compresses a repeated payload to a fraction of its raw size', () => {
    const raw = Buffer.alloc(4096, 0x61);
    const brotli = brotliBytesOf(raw);
    expect(brotli).toBeGreaterThan(0);
    expect(brotli).toBeLessThan(raw.length);
  });

  it('is deterministic for the same input', () => {
    const raw = Buffer.from('The Ascent — a deterministic payload', 'utf8');
    expect(brotliBytesOf(raw)).toBe(brotliBytesOf(raw));
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
    writeFileSync(join(dir, 'assets', 'Archivo-Black.woff2'), Buffer.alloc(10));
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

describe('computeCompressed', () => {
  it('maps raw bytes to whole-file compression sizes, preserving names', () => {
    const chunks: readonly MeasuredChunk[] = [
      { name: 'assets/index.js', buffer: Buffer.alloc(4096, 0x61) },
      { name: 'assets/lazy.js', buffer: Buffer.alloc(1024, 0x62) },
    ];

    const compressed = computeCompressed(chunks);

    expect(compressed).toHaveLength(2);
    expect(compressed[0]).toMatchObject({ name: 'assets/index.js' });
    expect(compressed[0]!.gzipBytes).toBeLessThan(4096);
    expect(compressed[0]!.brotliBytes).toBeLessThan(4096);
    expect(compressed[1]).toMatchObject({ name: 'assets/lazy.js' });
    expect(compressed[1]!.gzipBytes).toBeLessThan(1024);
    expect(compressed[1]!.brotliBytes).toBeLessThan(1024);
  });
});

describe('checkBundle', () => {
  const chunk = (name: string, gzipBytes: number, brotliBytes: number): CompressedChunk => ({
    name,
    gzipBytes,
    brotliBytes,
  });

  it('passes when entry and total sit under both budgets', () => {
    const result = checkBundle(
      [
        chunk('assets/index-abc.js', 140 * 1024, 125 * 1024),
        chunk('assets/gsap-abc.js', 40 * 1024, 35 * 1024),
      ],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toEqual([]);
    expect(result.entry).toMatchObject({ file: 'assets/index-abc.js' });
    expect(result.total.gzipKb).toBeCloseTo(180, 1);
    expect(result.total.brotliKb).toBeCloseTo(160, 1);
  });

  it('fails when the entry chunk exceeds BOTH gzip and brotli budgets', () => {
    const result = checkBundle(
      [
        chunk('assets/index-abc.js', 170 * 1024, 160 * 1024), // both over budget
        chunk('assets/lazy-abc.js', 10 * 1024, 10 * 1024),
      ],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain('both exceed budget');
  });

  it('does NOT fail when entry chunk exceeds only gzip budget (not brotli)', () => {
    const result = checkBundle(
      [
        chunk('assets/index-abc.js', 170 * 1024, 140 * 1024), // gzip over, brotli under
        chunk('assets/lazy-abc.js', 10 * 1024, 10 * 1024),
      ],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toEqual([]);
  });

  it('does NOT fail when entry chunk exceeds only brotli budget (not gzip)', () => {
    const result = checkBundle(
      [
        chunk('assets/index-abc.js', 140 * 1024, 160 * 1024), // brotli over, gzip under
        chunk('assets/lazy-abc.js', 10 * 1024, 10 * 1024),
      ],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toEqual([]);
  });

  it('fails when total JS exceeds BOTH budgets', () => {
    const result = checkBundle(
      [
        chunk('assets/index-abc.js', 150 * 1024, 135 * 1024),
        chunk('assets/gsap-abc.js', 80 * 1024, 75 * 1024), // both over total
      ],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain('both exceed budget');
  });

  it('does NOT fail when total JS exceeds only gzip budget', () => {
    const result = checkBundle(
      [
        chunk('assets/index-abc.js', 150 * 1024, 120 * 1024),
        chunk('assets/gsap-abc.js', 80 * 1024, 70 * 1024), // gzip over total, brotli under
      ],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toEqual([]);
  });

  it('fails when the entry chunk cannot be located', () => {
    const result = checkBundle(
      [chunk('assets/index-abc.js', 100 * 1024, 90 * 1024)],
      undefined,
      BASELINE,
    );

    expect(result.violations).toEqual(['entry chunk not found in the build output']);
    expect(result.entry).toBeUndefined();
  });

  it('reports every violation, not just the first', () => {
    const result = checkBundle(
      [
        chunk('assets/index-abc.js', 180 * 1024, 170 * 1024), // both over entry budget
        chunk('assets/gsap-abc.js', 90 * 1024, 85 * 1024), // both over total
      ],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toHaveLength(2);
  });

  it('passes exactly at the budget boundary', () => {
    const result = checkBundle(
      [
        chunk('assets/index-abc.js', 165 * 1024, 150 * 1024),
        chunk('assets/gsap-abc.js', 60 * 1024, 50 * 1024),
      ],
      'assets/index-abc.js',
      BASELINE,
    );

    expect(result.violations).toEqual([]);
  });

  describe('failOnIncrease mode', () => {
    it('passes when all chunks are at or below their per-chunk baseline (both algorithms)', () => {
      const result = checkBundle(
        [
          chunk('assets/index-abc.js', 140 * 1024, 125 * 1024),
          chunk('assets/gsap-abc.js', 25 * 1024, 22 * 1024),
          chunk('assets/lazy-abc.js', 15 * 1024, 13 * 1024),
        ],
        'assets/index-abc.js',
        BASELINE_WITH_CHUNKS,
        true,
      );

      expect(result.violations).toEqual([]);
    });

    it('fails when any chunk exceeds its per-chunk baseline in BOTH algorithms', () => {
      const result = checkBundle(
        [
          chunk('assets/index-abc.js', 140 * 1024, 125 * 1024),
          chunk('assets/gsap-abc.js', 30 * 1024, 25 * 1024), // both increased from baseline
          chunk('assets/lazy-abc.js', 15 * 1024, 13 * 1024),
        ],
        'assets/index-abc.js',
        BASELINE_WITH_CHUNKS,
        true,
      );

      expect(result.violations).toContain(
        'chunk assets/gsap-abc.js increased to 30.0 kB gzip (baseline 25 kB) and 25.0 kB brotli (baseline 22 kB) — both exceed baseline',
      );
    });

    it('does NOT fail when chunk exceeds baseline in only one algorithm', () => {
      const result = checkBundle(
        [
          chunk('assets/index-abc.js', 140 * 1024, 125 * 1024),
          chunk('assets/gsap-abc.js', 30 * 1024, 22 * 1024), // gzip increased, brotli same
          chunk('assets/lazy-abc.js', 15 * 1024, 13 * 1024),
        ],
        'assets/index-abc.js',
        BASELINE_WITH_CHUNKS,
        true,
      );

      expect(result.violations).toEqual([]);
    });

    it('ignores chunks not present in the per-chunk baseline', () => {
      const result = checkBundle(
        [
          chunk('assets/index-abc.js', 140 * 1024, 125 * 1024),
          chunk('assets/new-chunk.js', 50 * 1024, 45 * 1024), // new chunk, no baseline
        ],
        'assets/index-abc.js',
        BASELINE_WITH_CHUNKS,
        true,
      );

      expect(result.violations).toEqual([]);
    });

    it('does nothing when per-chunk baseline is absent', () => {
      const result = checkBundle(
        [chunk('assets/index-abc.js', 200 * 1024, 180 * 1024)], // way over entry budget
        'assets/index-abc.js',
        BASELINE, // no chunks field
        true,
      );

      // Only the entry budget violation should be reported (both algorithms over)
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('both exceed budget');
    });
  });
});
