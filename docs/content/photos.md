# Photos — Asset Pipeline

The site is photography-forward (Who portrait, Sky & Sport grid), so photos get
a real pipeline instead of a manual copy-paste ritual. The contract is
`ImageAsset` in `src/types/domain.ts`; the tool is `scripts/optimize-images.mjs`.

## Workflow

1. Drop the raw photos (JPG/PNG/HEIC/...) into a **git-ignored** directory on
   your machine, e.g. `photos-src/` at the repo root (already in `.gitignore`).
   Raw sources never enter the repository — only optimized derivatives do.
2. Optimize:

   ```bash
   npm run images -- --src photos-src
   # per-layout sizes hint, e.g. for the three-column sport grid:
   npm run images -- --src photos-src --sizes "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
   ```

3. The script writes `public/photos/{subject}-{width}.{avif,webp,jpg}` and
   prints the exact `ImageAsset` block for each photo. Paste it into the right
   content module — the author reviews it like any copy:

   ```ts
   // src/content/sky.ts — the vds entry
   image: {
     alt: 'An ultralight aircraft on the ramp before a flight', // keep human-written
     caption: 'VDS · northern Italy',
     src: '/photos/vds-volo-01-1600.jpg',
     sources: [
       { type: 'image/avif', srcSet: '/photos/vds-volo-01-480.avif 480w, /photos/vds-volo-01-960.avif 960w, /photos/vds-volo-01-1600.avif 1600w' },
       { type: 'image/webp', srcSet: '/photos/vds-volo-01-480.webp 480w, /photos/vds-volo-01-960.webp 960w, /photos/vds-volo-01-1600.webp 1600w' },
     ],
     width: 1600,
     height: 1200,
     sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
   },
   ```

4. Replace a photo later? Re-run the script over the same `--src` dir; filenames
   are derived from the source name, so the emitted URLs stay stable and only
   the bytes change (cache-safe thanks to the immutable asset headers).

## What the script does

- **Formats**: AVIF (`quality 55`) and WebP (`quality 78`) at every configured
  width, plus a single JPEG fallback (`quality 82`, mozjpeg) at the largest
  width — served through the `<picture>` in `ImageBlock`, so every modern
  browser gets the best format and ancient ones still see the photo.
- **Widths**: `480 / 960 / 1600` by default (`--widths` to override). A width
  larger than the source is never produced (no upscaling).
- **Ratio**: the printed `width`/`height` are the _delivered_ fallback's
  dimensions; `ImageBlock` reserves that exact ratio on the frame, keeping
  layout shift at zero (ADR-0009).

## Rules

- Alt text stays human-written (ADR-0009) — never auto-generated from the file.
- Keep raw sources out of git; the derivatives are the deliverable.
- After pasting a block, run the local gates (`npm run typecheck && npm test`)
  — the content-module tests assert the asset is complete.
