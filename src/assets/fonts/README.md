# Self-hosted fonts

The site self-hosts three variable fonts (ADR-0007). The binaries are **not**
committed — add them here, then uncomment the `@font-face` block in
`src/styles/typography.css`.

| Family                    | File expected     | Source                           |
| ------------------------- | ----------------- | -------------------------------- |
| Fraunces (display)        | `Fraunces.woff2`  | Google Fonts / GitHub (variable) |
| Geist Sans (UI/body)      | `Geist.woff2`     | Vercel Geist                     |
| Geist Mono (data/eyebrow) | `GeistMono.woff2` | Vercel Geist                     |

Subset to the Latin range and use `font-display: swap`. Until the files are
present, the system fallback stacks defined in the `@theme` block apply.
