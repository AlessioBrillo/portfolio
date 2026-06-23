# Self-hosted fonts

The site self-hosts three Latin-subset **variable** fonts (ADR-0007). The binaries
are committed here and wired via `@font-face` in `src/styles/typography.css`; Vite
fingerprints and bundles them at build time. No CDN, no Google Fonts request.

| Family                    | File              | Axes                           | Source (OFL)                                  |
| ------------------------- | ----------------- | ------------------------------ | --------------------------------------------- |
| Fraunces (display)        | `Fraunces.woff2`  | `opsz`, `soft`, `wonk`, `wght` | `@fontsource-variable/fraunces` (latin, full) |
| Geist Sans (UI/body)      | `Geist.woff2`     | `wght`                         | `@fontsource-variable/geist` (latin)          |
| Geist Mono (data/eyebrow) | `GeistMono.woff2` | `wght`                         | `@fontsource-variable/geist-mono` (latin)     |

All three are licensed under the SIL Open Font License 1.1; the license text for
each ships alongside as `*.LICENSE`.

## Provenance / how to refresh

The binaries were copied from the Fontsource variable packages, which were then
removed from `package.json` (the repo stays self-hosted with committed binaries,
no build/runtime font dependency). To update:

```bash
npm i -D @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono
cp node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2 src/assets/fonts/Fraunces.woff2
cp node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2       src/assets/fonts/Geist.woff2
cp node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2 src/assets/fonts/GeistMono.woff2
npm un @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono
```

Fraunces uses the full axis set so `font-optical-sizing: auto` (browser default)
drives the optical axis from font-size. `font-display: swap` keeps text visible
during load; the `@theme` fallback stacks apply until the woff2 arrives.

> **Phase 6 (perf):** add a build-time `<link rel="preload">` for `Fraunces.woff2`
> (the one above-the-fold face). It is omitted for now because the bundled path is
> content-hashed and a static preload in `index.html` would break in production.
