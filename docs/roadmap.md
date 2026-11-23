# Status and Open Inputs

This file is a snapshot, not a build diary. For the reasoning behind a choice,
read the [ADR index](adr/README.md).

## Done

- **Phases 0–3 — foundations and signature.** Vite + React + strict TypeScript,
  `@theme` tokens, self-hosted fonts, the eight-band flight profile and the
  layout-driven tonal engine (ADR-0010, ADR-0026). Both crossfades and their
  text-flip lines are asserted by the Playwright harness, including
  `prefers-reduced-motion` and forced colours (ADR-0011, ADR-0012, ADR-0023).
- **Phase 4 — routes.** Case studies are real `/{domain}/{slug}` routes with
  their own document head, code-split MDX bodies, error boundaries and exact
  scroll restoration (ADR-0005). The SPA-fallback contract is gated by
  `npm run deploy:check`.
- **Phase 5 — content.** Five long-form studies: `transformer-italian-corpus`,
  `grokking-modular-addition`, `physics-of-flight`, `work-the-ascent` and
  `vds-licence`. The experiences archive is a real route with reverse-chronological
  projection and automatic dedupe (ADR-0019).
- **Phase 6 — finishing.** Bundle budget (ADR-0018), photo-asset contract
  (ADR-0016), strict CSP/HSTS, OG card, canonical URLs and sitemap gated on
  `VITE_SITE_URL`, cookieless Plausible proxy (ADR-0013, ADR-0024), and the
  public Privacy/Legal pages with an explicit content licence (ADR-0029).

## Now

The code is launch-ready. What remains is owner input, not engineering:

| Input                                | Where it lands                                                |
| ------------------------------------ | ------------------------------------------------------------- |
| Buy and configure the domain         | `VITE_SITE_URL` in the Vercel project                         |
| Create the `privacy@` alias          | Derived automatically from the canonical origin               |
| Publish the CV PDF                   | `RESUME_PDF` in `src/lib/site.ts` (ADR-0028)                  |
| Supply real photographs              | `npm run images -- --src photos-src` (docs/content/photos.md) |
| Sign off the aviation figures        | `src/content/case-studies/physics-of-flight.mdx`              |
| Confirm DPA acceptance and retention | `docs/legal/analytics-assessment.md`                          |

## Gates

`npm run ci` and `npm run ci:domain` are the local commands; the Woodpecker
pipeline in `.woodpecker/ci.yml` is the single gate, followed by the dev and
preview E2E harnesses. GitHub Actions mirrors those steps but is not the source
of truth. See [`CLAUDE.md`](../CLAUDE.md) and the local CI policy at `~/.agents/CI.md`.

## Deferred

A private area, an interactive performance calculator, and a narrower CSP
(removing `style-src 'unsafe-inline'`) are deliberately out of scope until a
dedicated pass proves them. Each needs its own ADR before implementation.
