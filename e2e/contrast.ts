/**
 * WCAG 2.x contrast ratio between two sRGB colours, used by the signature
 * harness to assert text stays AA-legible while `TonalScene` crossfades the
 * backdrop underneath it (ADR-0009). No framework — this is the whole spec:
 * relative luminance (WCAG 2.1 ✓1.4.3) -> contrast ratio.
 */

import { pathToFileURL } from 'node:url';

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parse a CSS `rgb(...)`/`rgba(...)` computed-style string into channels. */
export function parseRgb(css: string): Rgb {
  const match = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(css);
  if (!match) throw new Error(`Unrecognised colour string: ${css}`);
  const [, r, g, b] = match;
  return { r: Number(r), g: Number(g), b: Number(b) };
}

function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance of an sRGB colour, in [0, 1]. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** WCAG contrast ratio between two colours, in [1, 21]. Order doesn't matter. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** ponytail: inline self-check (`node e2e/contrast.ts`) instead of a test file for one pure module. */
function demo(): void {
  const white: Rgb = { r: 255, g: 255, b: 255 };
  const black: Rgb = { r: 0, g: 0, b: 0 };
  console.assert(Math.abs(contrastRatio(white, black) - 21) < 0.01, 'white/black should be ~21:1');
  console.assert(contrastRatio(white, white) === 1, 'identical colours should be 1:1');
  console.assert(
    Math.abs(contrastRatio(parseRgb('rgb(255, 255, 255)'), parseRgb('rgb(0, 0, 0)')) - 21) < 0.01,
    'parseRgb should round-trip through contrastRatio',
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  demo();
}
