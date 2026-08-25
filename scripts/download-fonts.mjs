#!/usr/bin/env node
/**
 * Download and extract variable fonts for The Ascent from official releases.
 * Sources:
 *   - Geist Sans: Vercel (OFL) - from GitHub release zip (WOFF2 variable)
 *   - JetBrains Mono: JetBrains (OFL) - from GitHub release zip (TTF variable, convert to WOFF2)
 *   - Archivo: Google Fonts (OFL) - try multiple sources for variable font
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  createWriteStream,
  renameSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import AdmZip from 'adm-zip';
import woff2 from 'woff2';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT = resolve(__dirname, '..');
const PUBLIC_FONTS = join(ROOT, 'public', 'fonts');

const RELEASES = [
  {
    name: 'Geist Sans',
    target: 'Geist.woff2',
    zipUrl: 'https://github.com/vercel/geist-font/releases/download/v1.7.2/geist-font-v1.7.2.zip',
    // The variable font inside the zip has [wght] in the name
    fontPattern: /Geist\[wght\]\.woff2$/i,
    format: 'woff2',
  },
  {
    name: 'JetBrains Mono',
    target: 'JetBrainsMono.woff2',
    zipUrl:
      'https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip',
    // Variable font in TTF format in the variable/ directory
    fontPattern: /JetBrainsMono\[wght\]\.ttf$/i,
    format: 'ttf',
  },
];

// Archivo variable font - try multiple sources
const ARCHIVO_SOURCES = [
  {
    name: 'Google Fonts GitHub (TTF variable)',
    url: 'https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf',
    format: 'ttf',
  },
  {
    name: 'Google Fonts GitHub alt',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf',
    format: 'ttf',
  },
  {
    name: 'Bunny Fonts CDN',
    url: 'https://fonts.bunny.net/css2?family=Archivo:wdth,wght@75..125,400..900',
    format: 'css', // This returns CSS, not the font file
  },
];

function log(step, msg) {
  console.log(`  [${step}] ${msg}`);
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  if (existsSync(dir)) {
    for (const file of readdirSync(dir)) {
      rmSync(join(dir, file), { force: true });
    }
  } else {
    mkdirSync(dir, { recursive: true });
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            downloadFile(redirectUrl, dest).then(resolve).catch(reject);
            return;
          }
        }
        if (response.statusCode !== 200) {
          file.close();
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', (err) => {
          file.close();
          reject(err);
        });
      })
      .on('error', reject);
  });
}

async function downloadAndExtractZip(release) {
  const targetPath = join(PUBLIC_FONTS, release.target);
  const tempZip = join(PUBLIC_FONTS, 'temp-' + release.name.replace(/\s+/g, '-') + '.zip');

  try {
    log(release.name, `Downloading release zip...`);
    await downloadFile(release.zipUrl, tempZip);

    log(release.name, `Extracting variable font...`);
    const zip = new AdmZip(tempZip);
    const entries = zip.getEntries();

    let found = false;
    for (const entry of entries) {
      const fileName = entry.entryName.split('/').pop() || entry.entryName;
      if (release.fontPattern.test(fileName)) {
        log(release.name, `Found in zip: ${entry.entryName}`);
        zip.extractEntryTo(entry, PUBLIC_FONTS, false, true);
        const extractedPath = join(PUBLIC_FONTS, fileName);
        log('DEBUG', `Looking for extracted file at: ${extractedPath}`);
        if (existsSync(extractedPath)) {
          if (release.format === 'ttf') {
            // Convert TTF to WOFF2
            log(release.name, `Converting TTF to WOFF2...`);
            const ttfBuffer = readFileSync(extractedPath);
            const woff2Buffer = woff2.encode(ttfBuffer);
            writeFileSync(targetPath, woff2Buffer);
            rmSync(extractedPath, { force: true });
          } else {
            // Already WOFF2, just rename
            renameSync(extractedPath, targetPath);
          }
          found = true;
        } else {
          log('ERROR', `Extracted file not found at ${extractedPath}`);
        }
        break;
      }
    }

    rmSync(tempZip, { force: true });

    if (!found) {
      log('ERROR', `Variable font not found in zip (pattern: ${release.fontPattern})`);
      // List all matching files for debugging
      const matchingEntries = entries.filter((e) =>
        release.fontPattern.test(e.entryName.split('/').pop() || ''),
      );
      if (matchingEntries.length > 0) {
        log('DEBUG', `Matching entries: ${matchingEntries.map((e) => e.entryName).join(', ')}`);
      }
      return false;
    }

    return true;
  } catch (err) {
    log('ERROR', `Failed: ${err.message}`);
    if (existsSync(tempZip)) rmSync(tempZip, { force: true });
    return false;
  }
}

async function downloadArchivo() {
  const targetPath = join(PUBLIC_FONTS, 'Archivo.woff2');

  for (const source of ARCHIVO_SOURCES) {
    if (source.format === 'css') {
      // This is a CSS endpoint, not a direct font file
      continue;
    }

    try {
      log('Archivo', `Trying ${source.name}...`);
      await downloadFile(source.url, targetPath.replace('.woff2', '.ttf'));

      // Convert TTF to WOFF2
      log('Archivo', `Converting TTF to WOFF2...`);
      const ttfBuffer = readFileSync(targetPath.replace('.woff2', '.ttf'));
      const woff2Buffer = woff2.encode(ttfBuffer);
      writeFileSync(targetPath, woff2Buffer);
      rmSync(targetPath.replace('.woff2', '.ttf'), { force: true });

      return true;
    } catch (err) {
      log('WARN', `${source.name} failed: ${err.message}`);
      // Clean up any partial file
      const ttfPath = targetPath.replace('.woff2', '.ttf');
      if (existsSync(ttfPath)) rmSync(ttfPath, { force: true });
      if (existsSync(targetPath)) rmSync(targetPath, { force: true });
    }
  }

  // Fallback: Use Archivo Black (900) static font from @fontsource/archivo
  log('Archivo', `Trying fallback: Archivo Black 900 from @fontsource...`);
  try {
    const fallbackPath = join(
      ROOT,
      'node_modules',
      '@fontsource',
      'archivo',
      'files',
      'archivo-latin-900-normal.woff2',
    );
    if (existsSync(fallbackPath)) {
      const buffer = readFileSync(fallbackPath);
      writeFileSync(targetPath, buffer);
      log('OK', `Used Archivo Black 900 as fallback (variable font not available)`);
      return true;
    }
  } catch (e) {
    log('ERROR', `Fallback also failed: ${e.message}`);
  }

  return false;
}

async function main() {
  console.log('\n📥 Downloading variable fonts from official releases...\n');

  cleanDir(PUBLIC_FONTS);
  ensureDir(PUBLIC_FONTS);

  let successCount = 0;

  // Download Geist (already WOFF2)
  if (await downloadAndExtractZip(RELEASES[0])) {
    const stats = statSync(join(PUBLIC_FONTS, 'Geist.woff2'));
    log('OK', `Installed Geist.woff2 (${(stats.size / 1024).toFixed(1)} KB)`);
    successCount++;
  }

  // Download JetBrains Mono (TTF -> WOFF2)
  if (await downloadAndExtractZip(RELEASES[1])) {
    const stats = statSync(join(PUBLIC_FONTS, 'JetBrainsMono.woff2'));
    log('OK', `Installed JetBrainsMono.woff2 (${(stats.size / 1024).toFixed(1)} KB)`);
    successCount++;
  }

  // Download Archivo (try variable, fallback to static 900)
  if (await downloadArchivo()) {
    const stats = statSync(join(PUBLIC_FONTS, 'Archivo.woff2'));
    log('OK', `Installed Archivo.woff2 (${(stats.size / 1024).toFixed(1)} KB)`);
    successCount++;
  }

  console.log(`\n✅ Font installation complete: ${successCount}/3 fonts installed.`);
  console.log(`   Output: ${PUBLIC_FONTS}\n`);

  if (successCount !== 3) {
    console.warn('⚠️  Some fonts failed to install. Check errors above.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
