#!/usr/bin/env node
/**
 * Download variable font subsets from Google Fonts for self-hosting.
 * Uses Google Fonts CSS API to get actual font URLs, then downloads woff2.
 * Targets: Archivo variable (400-900), JetBrains Mono variable (100-800)
 * Geist Sans already in public/fonts/.
 * Subset: Latin only (~120KB total per ADR-0022).
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_FONTS = join(process.cwd(), 'public', 'fonts');
mkdirSync(PUBLIC_FONTS, { recursive: true });

const FONT_FAMILIES = [
  { family: 'Archivo', weights: 'wght@400;900', filename: 'Archivo.woff2' },
  { family: 'JetBrains Mono', weights: 'wght@100;800', filename: 'JetBrainsMono.woff2' },
];

async function fetchFontCss(family, weights) {
  const familyParam = family.replace(/\s+/g, '+');
  const weightParam = weights ? `:${weights}` : '';
  const response = await fetch(
    `https://fonts.googleapis.com/css2?family=${familyParam}${weightParam}&subset=latin&display=optional`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
  );
  if (!response.ok) throw new Error(`CSS API HTTP ${response.status}`);
  return response.text();
}

function extractWoff2Url(css, family) {
  // Google Fonts CSS contains @font-face with src: url(...)
  // Variable fonts return woff2 with format('woff2-variations') or format('woff2')
  const escapedFamily = family.replace(' ', '\\s+');
  const regex = new RegExp(
    `font-family:\\s*['"]${escapedFamily}['"].*?url\\(([^)]+\\.woff2)\\)`,
    's',
  );
  const match = css.match(regex);
  if (!match) {
    // Debug: print CSS to understand format
    console.error(`[fonts] CSS for ${family}:\n${css}`);
    throw new Error(`No woff2 URL found for ${family}`);
  }
  return match[1];
}

async function downloadFont(font) {
  const dest = join(PUBLIC_FONTS, font.filename);
  if (existsSync(dest)) {
    console.log(`[fonts] ${font.filename} already exists, skipping`);
    return;
  }
  console.log(`[fonts] Fetching CSS for ${font.family} (${font.weights})...`);
  const css = await fetchFontCss(font.family, font.weights);
  const url = extractWoff2Url(css, font.family);
  console.log(`[fonts] Downloading ${font.family} -> ${font.filename}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font download HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  writeFileSync(dest, Buffer.from(buffer));
  const sizeKB = (buffer.byteLength / 1024).toFixed(1);
  console.log(`[fonts] ✓ ${font.filename} (${sizeKB} KB)`);
}

async function main() {
  console.log('[fonts] Downloading variable font subsets for self-hosting...');
  await Promise.all(FONT_FAMILIES.map(downloadFont));
  console.log('[fonts] Done. Verify in public/fonts/');
}

main();
