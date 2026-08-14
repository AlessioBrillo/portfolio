# Build Roadmap

Incremental construction: each phase is independently verifiable. **Phase 4 is
closed; the site is in Phase 5 (content) — all structure is live and validated.**

| Phase | Goal                                                                                                                              | Status                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 0     | **Content & assets.** Selected photos, 2-3 written case studies, headline, domain. _(The site is only as strong as its content.)_ | Pending (needs inputs)         |
| 1     | **Foundations.** Vite + Tailwind, color/typography tokens, self-hosted fonts, scale and grid.                                     | **Scaffolded**                 |
| 2     | **The signature.** Hero + first working quota transition. _Validate "the Ascent" before going further._                           | **Validated**                  |
| 3     | **The full ascent.** All tonal bands + altitude gauge + scroll engine (GSAP).                                                     | **Validated**                  |
| 4     | **Mosaic + one real case study** (MDX route end-to-end).                                                                          | **Validated**                  |
| 5     | **Content.** Remaining case studies, archive, experience storytelling.                                                            | In progress (structure live)   |
| 6     | **Finishing & deploy.** A11y, performance, OG card, 404, reduced-motion -> Vercel + domain.                                       | Ready (deploy waits on domain) |
| 7     | **After.** CV hook, analytics, optional private area.                                                                             | Pending                        |

Phase 2's crossfade (both climb and descent) is implemented and validated
end-to-end by the Playwright harness (`npm run e2e`) -- it now stands as the
signature's regression net for any future change to `TonalScene`,
`useTonalEngine`, `src/lib/tone.ts`, or the scene-tone context (ADR-0012). The
last known residual is closed: ADR-0012 flips each text family at its own
per-direction equal-legibility line (computed by bisection over the actual
blend), so the body family clears 4.5:1 at every instant of both crossfades
and the muted family's worst case is a documented 1.57:1 floor -- the old
fade-midpoint residual (muted at 1.03:1, body at 3.57:1) no longer exists.

Since the close of Phase 4, the remaining bands (Who, AI & Physics, Work &
School, Sky & Sport, Experiences) have been scaffolded as content-driven
sections backed by tested content modules (`src/content/`), and the mosaic
tiles now all resolve somewhere real -- either a case-study route or a section
anchor. Scene bands also now follow the live backdrop tone (ADR-0011): the
engine publishes each fade's winning tone and band text, eyebrows and muted
copy flip with it, so every element stays AA-legible at both ends of the
flight. The SPA fallback for the `/{domain}/{slug}` deep links (a pending
consequence of ADR-0005) is configured in `vercel.json`. Three long-form
studies are published as real routes: the corpus study
(`/ai/transformer-italian-corpus`, a professional draft), the ascent study
(`/work/the-ascent`) and the VDS licence study (`/sky/vds-licence`); each
domain route ships with its own code-split MDX body and E2E deep-link
coverage. Phase 5 still awaits the author's inputs below: real photos, real
copy, and one more long-form AI/physics study.

Phase 6 groundwork that needs no content is live: static social meta (OG
card rendered as `public/og-image.png` from `docs/design/og-image.svg`,
twitter card, theme-color — link previews now work without JS), `robots.txt`
(allow-all; `Sitemap:` line waits for the domain), and the Vercel SPA fallback
now excludes the static files (`favicon.svg`, `og-image.png`, `robots.txt`,
`sitemap.xml`). Deploy itself, the absolute og:image URL and `sitemap.xml`
still wait on the domain; the audit pass is done.

The photo pipeline is ready for input 1: content modules carry a full
responsive `ImageAsset` contract (intrinsic dimensions, typed AVIF/WebP
sources) rendered through `ImageBlock`'s `<picture>`, and
`npm run images -- --src <raw-dir>` converts raws into the optimized set and
prints the paste-ready asset blocks (`docs/content/photos.md`). The day real
photos land, they reserve their true layout with zero CLS — no structural
change needed. Two consistency fixes rode along: the GitHub footer link now
points at the repository itself (ADR-0014's claim is verifiable), and
`SITE.siteUrl` is driven by the same `VITE_SITE_URL` env contract as the
sitemap, so the canonical origin has a single source of truth.

An automated Lighthouse run on a headless Chrome (viewport 1440x960, reduced
motion) passed **100 on accessibility** (contrast failures 8 -> 0 after the
scene-tone and button-ink fixes), best-practices 100 and a zero-CLS score;
`robots.txt` is committed and served (SEO hardening, PR #80). The Playwright
tonal harness now really runs both motion paths:
the reduced-motion project emulates `prefers-reduced-motion` via the
`contextOptions` TestOption and hits the discrete-tone assertion, and the
settle-based waits removed the load-dependent flakes.

## Inputs needed to proceed

1. **5-8 strong photos** (one sober portrait for "Who", the rest sport / flying /
   experiences).
2. **2-3 case studies** to tell in full (at least one AI/physics for the
   recruiter).
3. The current **LinkedIn headline** (for the hero eyebrow).
4. A **domain** + how you want to sign (full name? a small personal brand?).
5. ~~**Font binaries**~~ — resolved: the Latin-subset variable woff2 files
   (Fraunces / Geist / Geist Mono, OFL licenses alongside) are committed under
   `src/assets/fonts/` and wired via `@font-face` (ADR-0007).

## The one justified risk

The signature is the flight-driven tonal ascent. Everything else stays disciplined
and quiet — so the only scenographic thing is also the only thing that truly tells
the author's story.
