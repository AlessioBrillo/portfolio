#!/usr/bin/env node
/**
 * Rasterise public/favicon.svg to the 180x180 Apple touch icon.
 *
 * The SVG is the single source of truth for the mark and its accent colour;
 * rendering it keeps the touch icon from drifting when the palette changes.
 * Run `npm run icon` after editing the favicon.
 */
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const svg = readFileSync('public/favicon.svg', 'utf8');

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#f4f4f0">
    <style>svg { display:block; width:180px; height:180px; }</style>${svg}
  </body></html>`);
  await page.locator('svg').screenshot({ path: 'public/apple-touch-icon.png' });
} finally {
  await browser.close();
}
console.log('[icon] wrote public/apple-touch-icon.png from public/favicon.svg');
