#!/usr/bin/env node
/**
 * Rasterise docs/design/og-image.svg to public/og-image.png.
 *
 * The SVG declares @font-face with paths to the committed /fonts binaries.
 * File URLs are not portable and a browser blocks file-relative font loads, so
 * this script inlines each woff2 as a data URL before rendering the SVG through
 * Playwright chromium at its intrinsic 1200x630 size. Run `npm run og` after
 * changing the card or the font set; the PNG is committed and served as-is.
 */
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const FONT_FILES = ['Archivo.woff2', 'ArchivoBlack.woff2', 'JetBrainsMono.woff2'];

let svg = readFileSync('docs/design/og-image.svg', 'utf8');
for (const file of FONT_FILES) {
  const data = readFileSync(`public/fonts/${file}`).toString('base64');
  svg = svg.replaceAll(`../../public/fonts/${file}`, `data:font/woff2;base64,${data}`);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
  await page.locator('svg').screenshot({ path: 'public/og-image.png' });
} finally {
  await browser.close();
}
console.log('[og] wrote public/og-image.png from docs/design/og-image.svg');
