#!/usr/bin/env node
/**
 * CSP img-src Widener — patches vercel.json to add CDN origin to img-src.
 *
 * Run when photos pipeline moves to CDN (Cloudflare R2, Vercel Blob, etc.).
 * Reads CDN origin from VITE_PHOTOS_CDN_ORIGIN in .env.production.local.
 *
 * Usage:
 *   node scripts/csp-widen-img-src.mjs              # live run
 *   node scripts/csp-widen-img-src.mjs --dry-run    # preview only
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = argv.includes('--dry-run');
const VERCEL_JSON = resolve(ROOT, 'vercel.json');

function parseEnvFile(path) {
  const content = readFileSync(path, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valParts] = trimmed.split('=');
    if (key && valParts.length > 0) {
      env[key.trim()] = valParts.join('=').trim();
    }
  }
  return env;
}

async function main() {
  const envPath = resolve(ROOT, '.env.production.local');
  if (!existsSync(envPath)) {
    console.error('[ERROR] .env.production.local not found');
    process.exit(1);
  }

  const env = parseEnvFile(envPath);
  const cdnOrigin = env.VITE_PHOTOS_CDN_ORIGIN;

  if (!cdnOrigin) {
    console.log('⊘ VITE_PHOTOS_CDN_ORIGIN not set — skipping CSP update');
    console.log(
      '  Set VITE_PHOTOS_CDN_ORIGIN=https://your-cdn.domain in .env.production.local when photos move to CDN',
    );
    return;
  }

  let cdnHostname;
  try {
    cdnHostname = new URL(cdnOrigin).origin;
  } catch {
    console.error('[ERROR] Invalid VITE_PHOTOS_CDN_ORIGIN:', cdnOrigin);
    process.exit(1);
  }

  if (!existsSync(VERCEL_JSON)) {
    console.error('[ERROR] vercel.json not found');
    process.exit(1);
  }

  const vercelConfig = JSON.parse(readFileSync(VERCEL_JSON, 'utf8'));

  // Find the main headers entry (source: "/(.*)")
  const mainHeaders = vercelConfig.headers?.find((h) => h.source === '/(.*)');
  if (!mainHeaders) {
    console.error('[ERROR] No headers entry for source "/(.*)" found in vercel.json');
    process.exit(1);
  }

  const cspHeader = mainHeaders.headers?.find((h) => h.key === 'Content-Security-Policy');
  if (!cspHeader) {
    console.error('[ERROR] No Content-Security-Policy header found');
    process.exit(1);
  }

  const currentCsp = cspHeader.value;
  const imgSrcMatch = currentCsp.match(/img-src\s+([^;]+)/);

  if (!imgSrcMatch) {
    console.error('[ERROR] No img-src directive found in CSP');
    process.exit(1);
  }

  const currentImgSrc = imgSrcMatch[1].trim();
  const cdnAlreadyPresent = currentImgSrc.includes(cdnHostname);

  if (cdnAlreadyPresent) {
    console.log(`⊘ CDN origin ${cdnHostname} already in img-src — skipping`);
    return;
  }

  // Build new img-src: keep existing, add CDN origin
  const newImgSrc = `${currentImgSrc} ${cdnHostname}`;
  const newCsp = currentCsp.replace(/img-src\s+[^;]+/, `img-src ${newImgSrc}`);

  console.log('Current CSP img-src:', currentImgSrc);
  console.log('New CSP img-src:', newImgSrc);

  if (DRY_RUN) {
    console.log('\n[DRY-RUN] Would update vercel.json with new CSP');
    return;
  }

  // Update the header
  cspHeader.value = newCsp;
  writeFileSync(VERCEL_JSON, JSON.stringify(vercelConfig, null, 2) + '\n');

  console.log('\n✓ vercel.json updated with widened img-src');
  console.log(
    '  Commit and deploy to apply: git add vercel.json && git commit -m "chore(csp): widen img-src for CDN" && vercel --prod',
  );
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
