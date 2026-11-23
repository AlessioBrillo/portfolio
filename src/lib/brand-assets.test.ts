import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
function read(path: string): string {
  return readFileSync(join(root, path), 'utf8');
}

/** The old identity: one accent, one paper, one display/mono pairing. */
const STALE = ['#E9622E', '#e9622e', '#f4efe6', '#14161d', 'Fraunces', 'Geist'];

describe('brand assets', () => {
  it('uses the current accent in the favicon', () => {
    expect(read('public/favicon.svg')).toContain('#E61919');
  });

  it('uses the current paper in the manifest and the document theme colour', () => {
    expect(read('public/site.webmanifest')).toContain('"background_color": "#f4f4f0"');
    expect(read('public/site.webmanifest')).toContain('"theme_color": "#f4f4f0"');
    expect(read('index.html')).toContain('name="theme-color" content="#f4f4f0"');
  });

  it('renders the social card from the committed Archivo fonts and current tokens', () => {
    const card = read('docs/design/og-image.svg');
    expect(card).toContain('../../public/fonts/Archivo.woff2');
    expect(card).toContain('../../public/fonts/ArchivoBlack.woff2');
    expect(card).toContain('../../public/fonts/JetBrainsMono.woff2');
    expect(card).toContain('npm run og');
  });

  it('renders the touch icon with the current accent and paper, not the old terracotta', async () => {
    const { data, info } = await sharp(join(root, 'public/apple-touch-icon.png'))
      .raw()
      .toBuffer({ resolveWithObject: true });
    const colors = new Set<string>();
    for (let offset = 0; offset < data.length; offset += info.channels) {
      colors.add(
        [data[offset]!, data[offset + 1]!, data[offset + 2]!]
          .map((channel) => channel.toString(16).padStart(2, '0'))
          .join(''),
      );
    }
    expect(colors.has('e61919')).toBe(true);
    expect(colors.has('f4f4f0')).toBe(true);
    expect(colors.has('e9622e')).toBe(false);
  });

  it('keeps any stale palette or typeface out of the public brand surface', () => {
    for (const file of [
      'public/favicon.svg',
      'public/site.webmanifest',
      'index.html',
      'docs/design/og-image.svg',
    ]) {
      const text = read(file);
      for (const stale of STALE) {
        expect(text, `${file} still contains ${stale}`).not.toContain(stale);
      }
    }
  });
});
