#!/usr/bin/env node
/**
 * Generates synthetic test images for validating the photo pipeline.
 * Creates 4 images matching the expected slots: portrait, VDS, tennis, MTB.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = 'temp-raw-photos';

async function generateTestImages() {
  await mkdir(OUT_DIR, { recursive: true });

  // 1. Portrait: 1200x1500 (4:5)
  await sharp({
    create: {
      width: 1200,
      height: 1500,
      channels: 3,
      background: { r: 120, g: 100, b: 80 }, // Warm paper tone
    },
  })
    .png()
    .toFile(path.join(OUT_DIR, 'portrait-4x5.png'));

  // 2. VDS: 1200x900 (4:3) - sky blue
  await sharp({
    create: {
      width: 1200,
      height: 900,
      channels: 3,
      background: { r: 100, g: 150, b: 200 }, // Sky blue
    },
  })
    .png()
    .toFile(path.join(OUT_DIR, 'vds-aircraft-ramp.jpg'));

  // 3. Tennis: 1200x900 (4:3) - clay court orange
  await sharp({
    create: {
      width: 1200,
      height: 900,
      channels: 3,
      background: { r: 200, g: 100, b: 50 }, // Clay court orange
    },
  })
    .png()
    .toFile(path.join(OUT_DIR, 'tennis-court-evening.png'));

  // 4. MTB: 1200x900 (4:3) - forest green
  await sharp({
    create: {
      width: 1200,
      height: 900,
      channels: 3,
      background: { r: 60, g: 120, b: 60 }, // Forest green
    },
  })
    .png()
    .toFile(path.join(OUT_DIR, 'mtb-trail-downhill.jpg'));

  console.log('[test-images] Generated 4 synthetic test images in', OUT_DIR);
}

generateTestImages().catch((err) => {
  console.error('[test-images] Failed:', err);
  process.exit(1);
});
