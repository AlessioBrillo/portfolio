import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { ImageAsset } from '@/types/domain';
import { getAllImageAssets } from '@/content/assets';
import {
  collectReferencedPhotoPaths,
  findMissingPhotoFiles,
  findOrphanPhotoDerivatives,
  validateImageDimensions,
} from '@/lib/photo-assets';

const AVIF_SRCSET =
  '/photos/vds-volo-01-480-a1b2c3d4.avif 480w, /photos/vds-volo-01-960-a1b2c3d4.avif 960w, /photos/vds-volo-01-1600-a1b2c3d4.avif 1600w';

const { mockSharp } = vi.hoisted(() => ({
  mockSharp: {
    metadata: vi.fn().mockResolvedValue({ width: 960, height: 720 }),
  },
}));

vi.mock('sharp', () => ({
  default: vi.fn(() => mockSharp),
}));

describe('collectReferencedPhotoPaths', () => {
  it('returns an empty list for an asset without src or sources', () => {
    const asset: ImageAsset = { alt: 'x', width: 100, height: 100, sizes: '100vw' };
    expect(collectReferencedPhotoPaths([asset])).toEqual([]);
  });

  it('collects the primary src and every srcSet variant', () => {
    const asset: ImageAsset = {
      alt: 'x',
      src: '/photos/vds-volo-01-1600-a1b2c3d4.jpg',
      sources: [{ type: 'image/avif', srcSet: AVIF_SRCSET }],
    };
    expect(collectReferencedPhotoPaths([asset])).toEqual([
      '/photos/vds-volo-01-1600-a1b2c3d4.jpg',
      '/photos/vds-volo-01-480-a1b2c3d4.avif',
      '/photos/vds-volo-01-960-a1b2c3d4.avif',
      '/photos/vds-volo-01-1600-a1b2c3d4.avif',
    ]);
  });

  it('parses a flat fallback srcSet', () => {
    const asset: ImageAsset = {
      alt: 'x',
      srcSet: '/photos/p-480-a1b2c3d4.jpg 480w, /photos/p-1600-a1b2c3d4.jpg 1600w',
    };
    expect(collectReferencedPhotoPaths([asset])).toEqual([
      '/photos/p-480-a1b2c3d4.jpg',
      '/photos/p-1600-a1b2c3d4.jpg',
    ]);
  });

  it('ignores URLs outside the /photos/ route (future CDN origins)', () => {
    const asset: ImageAsset = {
      alt: 'x',
      src: 'https://cdn.example.com/p-1600-a1b2c3d4.jpg',
      sources: [{ type: 'image/avif', srcSet: 'https://cdn.example.com/p-480-a1b2c3d4.avif 480w' }],
    };
    expect(collectReferencedPhotoPaths([asset])).toEqual([]);
  });

  it('deduplicates repeated URLs across assets', () => {
    const asset: ImageAsset = {
      alt: 'x',
      src: '/photos/p-1600-a1b2c3d4.jpg',
      sources: [{ type: 'image/avif', srcSet: '/photos/p-1600-a1b2c3d4.jpg 1600w' }],
    };
    expect(collectReferencedPhotoPaths([asset, asset])).toEqual(['/photos/p-1600-a1b2c3d4.jpg']);
  });
});

describe('findMissingPhotoFiles', () => {
  const committed = ['photos/vds-volo-01-1600-a1b2c3d4.jpg', 'photos/README.md'];

  it('returns every referenced URL that is not committed', () => {
    const referenced = [
      '/photos/vds-volo-01-1600-a1b2c3d4.jpg',
      '/photos/vds-volo-01-480-a1b2c3d4.avif',
    ];
    expect(findMissingPhotoFiles(referenced, committed)).toEqual([
      '/photos/vds-volo-01-480-a1b2c3d4.avif',
    ]);
  });

  it('returns an empty list when every URL is committed', () => {
    expect(findMissingPhotoFiles(['/photos/vds-volo-01-1600-a1b2c3d4.jpg'], committed)).toEqual([]);
  });

  it('returns an empty list when nothing is referenced', () => {
    expect(findMissingPhotoFiles([], committed)).toEqual([]);
  });
});

describe('findOrphanPhotoDerivatives', () => {
  const committed = [
    'photos/vds-volo-01-1600-a1b2c3d4.jpg',
    'photos/vds-volo-01-480-a1b2c3d4.avif',
    'photos/README.md',
    'favicon.svg',
  ];

  it('returns committed photos nothing references, excluding README and non-photo files', () => {
    const referenced = ['/photos/vds-volo-01-1600-a1b2c3d4.jpg'];
    expect(findOrphanPhotoDerivatives(committed, referenced)).toEqual([
      'photos/vds-volo-01-480-a1b2c3d4.avif',
    ]);
  });

  it('returns an empty list when every photo is referenced', () => {
    const referenced = [
      '/photos/vds-volo-01-1600-a1b2c3d4.jpg',
      '/photos/vds-volo-01-480-a1b2c3d4.avif',
    ];
    expect(findOrphanPhotoDerivatives(committed, referenced)).toEqual([]);
  });
});

describe('validateImageDimensions', () => {
  it('returns no violations when dimensions match', async () => {
    mockSharp.metadata.mockResolvedValue({ width: 960, height: 720 });
    const assets: ImageAsset[] = [
      {
        alt: 'test',
        src: '/photos/test-960-abc123.jpg',
        width: 960,
        height: 720,
      },
    ];
    const violations = await validateImageDimensions(assets, '/tmp/photos');
    expect(violations).toEqual([]);
  });

  it('returns violation when width mismatches', async () => {
    mockSharp.metadata.mockResolvedValueOnce({ width: 800, height: 720 });
    const assets: ImageAsset[] = [
      {
        alt: 'test',
        src: '/photos/test-960-abc123.jpg',
        width: 960,
        height: 720,
      },
    ];
    const violations = await validateImageDimensions(assets, '/tmp/photos');
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('declared 960x720 but actual is 800x720');
  });

  it('returns violation when height mismatches', async () => {
    mockSharp.metadata.mockResolvedValueOnce({ width: 960, height: 600 });
    const assets: ImageAsset[] = [
      {
        alt: 'test',
        src: '/photos/test-960-abc123.jpg',
        width: 960,
        height: 720,
      },
    ];
    const violations = await validateImageDimensions(assets, '/tmp/photos');
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('declared 960x720 but actual is 960x600');
  });

  it('skips assets without src or dimensions', async () => {
    mockSharp.metadata.mockResolvedValue({ width: 960, height: 720 });
    const assets: ImageAsset[] = [
      { alt: 'test', src: '/photos/test-960-abc123.jpg' },
      { alt: 'test', src: 'https://cdn.example.com/test.jpg', width: 960, height: 720 },
    ];
    const violations = await validateImageDimensions(assets, '/tmp/photos');
    expect(violations).toEqual([]);
  });

  it('skips asset if sharp throws (file missing)', async () => {
    mockSharp.metadata.mockRejectedValueOnce(new Error('File not found'));
    const assets: ImageAsset[] = [
      {
        alt: 'test',
        src: '/photos/missing-960-abc123.jpg',
        width: 960,
        height: 720,
      },
    ];
    const violations = await validateImageDimensions(assets, '/tmp/photos');
    expect(violations).toEqual([]);
  });
});

describe('photo-asset contract against the live repo', () => {
  const ROOT = resolve(process.cwd());
  const PHOTOS_DIR = join(ROOT, 'public', 'photos');

  function listPhotoFiles(dir: string, prefix = ''): readonly string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      return entry.isDirectory() ? listPhotoFiles(join(dir, entry.name), rel) : [rel];
    });
  }

  const committed = listPhotoFiles(PHOTOS_DIR, 'photos');
  const referenced = collectReferencedPhotoPaths(getAllImageAssets());

  it('every referenced photo URL resolves to a committed file', () => {
    expect(findMissingPhotoFiles(referenced, committed)).toEqual([]);
  });

  it('every committed derivative is referenced by a content module', () => {
    expect(findOrphanPhotoDerivatives(committed, referenced)).toEqual([]);
  });
});
