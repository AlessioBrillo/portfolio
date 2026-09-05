# Build Roadmap

Incremental construction: each phase is independently verifiable. **Phase 5 is
closed; the site is in Phase 6 (finishing & deploy) — all content is live and
validated, deploy waits on domain.**

| Phase | Goal                                                                                                                              | Status                               |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 0     | **Content & assets.** Selected photos, 2-3 written case studies, headline, domain. _(The site is only as strong as its content.)_ | **Complete**                         |
| 1     | **Foundations.** Vite + Tailwind, color/typography tokens, self-hosted fonts, scale and grid.                                     | **Scaffolded**                       |
| 2     | **The signature.** Hero + first working quota transition. _Validate "the Ascent" before going further._                           | **Validated**                        |
| 3     | **The full ascent.** All tonal bands + altitude gauge + scroll engine (GSAP).                                                     | **Validated**                        |
| 4     | **Mosaic + one real case study** (MDX route end-to-end).                                                                          | **Validated**                        |
| 5     | **Content.** Remaining case studies, archive, experience storytelling.                                                            | **Complete**                         |
| 6     | **Finishing & deploy.** A11y, performance, OG card, 404, reduced-motion -> Vercel + domain.                                       | In progress (deploy waits on domain) |
| 7     | **After.** CV hook, analytics, optional private area.                                                                             | Pending                              |

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
consequence of ADR-0005) is configured in `vercel.json`. Four long-form
studies are published as real routes: the corpus study
(`/ai/transformer-italian-corpus`, a professional draft), the grokking study
(`/ai/grokking-modular-addition`, a manifest-backed positive-negative on
modular addition), the ascent study
(`/work/the-ascent`) and the VDS licence study (`/sky/vds-licence`); each
domain route ships with its own code-split MDX body and E2E deep-link
coverage. The publishing pipeline (ADR-0017) remains live: registering a
study in `CASE_STUDIES` without placing it in `PUBLISHED_ORDER` renders it
as a `noindex` draft by direct URL for review, and the deep-link and
prev/next E2E tests are registry-driven -- a new published study is covered
without editing the harness.
Phase 5 is complete: all author inputs have been provided and validated.
The `KNOWN_DEBT` ledger in `src/content/case-studies/registry.test.ts` is
empty — the corpus study's run-log numbers, the physics study's POH figures
and logbook example, and the ascent study's reflection are all filled with
real data. The registry contract tests enforce this: any placeholder in a
published body fails the build.

Five long-form studies are published as real routes: the corpus study
(`/ai/transformer-italian-corpus`), the grokking study
(`/ai/grokking-modular-addition`), the physics study (`/ai/physics-of-flight`,
ADR-0017), the ascent study (`/work/the-ascent`) and the VDS licence study
(`/sky/vds-licence`); each domain route ships with its own code-split MDX
body and E2E deep-link coverage. The publishing pipeline (ADR-0017) remains
live: registering a study in `CASE_STUDIES` without placing it in
`PUBLISHED_ORDER` renders it as a `noindex` draft by direct URL for review,
and the deep-link and prev/next E2E tests are registry-driven — a new
published study is covered without editing the harness.

The experiences archive (ADR-0019) is a real route (`/archive`) — a
reverse-chronological projection over the published-study registry, the
projects and the experience stories, with automatic dedupe (a project already
covered by a published study appears once). The band's "Dig deeper" link
reaches it through SPA navigation, it carries its own document head
(canonical only once the domain lands), and the E2E harness covers the deep
link and the navigation path.

The photo pipeline is live: 8 optimized derivatives (portrait + 3 sport
disciplines × AVIF/WebP/JPG at 2 widths) are committed under
`public/photos/` and referenced by content modules (`who.ts`, `sky.ts`). The
`npm run photos:check` gate enforces the contract bidirectionally — every
referenced URL exists, and every committed derivative is referenced.

CSP note (deliberate tradeoffs in `vercel.json`): `style-src 'unsafe-inline'`
is required by the Framer Motion / GSAP inline style attributes that drive
the tonal signature, and `img-src 'self' data:` admits only same-origin
images plus inline data (photo derivatives live in `public/photos/`); the
moment a CDN origin is chosen, `img-src` must be widened to that exact
origin behind a new ADR. Both are scoped allowances inside
an otherwise strict policy (ADR-0009); they are not loosened further for
third-party scripts, whose addition would require their own ADR. HSTS
(`max-age=63072000`) is applied to every deployment, previews included —
deliberate: Vercel is always TLS, so the interim origin's pin is harmless;
revisit only if the domain ever moves off HTTPS.

Phase 6 groundwork that needs no content is live: static social meta (OG
card rendered as `public/og-image.png` from `docs/design/og-image.svg`,
twitter card, theme-color — link previews now work without JS), `robots.txt`
(allow-all; `Sitemap:` line waits for the domain), the Vercel SPA fallback
now excludes the static files (`favicon.svg`, `og-image.png`, `robots.txt`,
`sitemap.xml`, `apple-touch-icon.png`, `*.webmanifest`) and the photo route
(`photos/`). The exclusion list is pinned by a contract test plus a CI step
(`npm run deploy:check`) that walks `public/` and fails the pipeline if any
committed static file would be rewritten to `index.html` — the day a new photo
or static file lands without an exclusion, the build fails instead of serving
HTML bytes as an image. The icon family is
complete — `apple-touch-icon.png` (iOS home screen) and `site.webmanifest`
(Android/install) derive from the `favicon.svg` glyph, so the SPA-fallback
exclusions for them are live, not dead entries. The JavaScript payload is
under a CI-enforced budget (ADR-0018): every build runs `npm run bundle:check`
against the committed `bundle-baseline-gzip.json` /
`bundle-baseline-brotli.json` (entry chunk 165 kB, total JS
225 kB gzip), so a growing bundle fails the pipeline instead of waiting for a
manual analyzer run. Deploy itself, the absolute og:image URL and
`sitemap.xml` still wait on the domain; the audit pass is done. The
domain-landing checklist lives in `docs/domain-runbook.md` — every gated
step is already built, the runbook is only the order of operations. Node is pinned
to 24 everywhere (`.nvmrc` + `engines`): CI reads the file and Vercel resolves
the same runtime, so the `postbuild` sitemap step can never silently skip on a
stale runner.

The photo pipeline is ready for input 1: content modules carry a full
responsive `ImageAsset` contract (intrinsic dimensions, typed AVIF/WebP
sources) rendered through `ImageBlock`'s `<picture>`, and
`npm run images -- --src <raw-dir>` converts raws into the optimized set and
prints the paste-ready asset blocks (`docs/content/photos.md`). The day real
photos land, they reserve their true layout with zero CLS — no structural
change needed. The paste workflow is now also contract-gated: every URL a
content module references must exist in `public/photos/` and every committed
derivative must be referenced (`npm run photos:check`, CI-enforced, pure
logic in `src/lib/photo-assets.ts`), so a pasted typo can no longer become a
permanent 404 under the immutable cache headers. Two consistency fixes rode
along: the GitHub footer link now points at the repository itself (ADR-0014's
claim is verifiable), and `SITE.siteUrl` is driven by the same
`VITE_SITE_URL` env contract as the sitemap, so the canonical origin has a
single source of truth.

An automated Lighthouse run on a headless Chrome (viewport 1440x960, reduced
motion) passed **100 on accessibility** (contrast failures 8 -> 0 after the
scene-tone and button-ink fixes), best-practices 100 and a zero-CLS score;
`robots.txt` is committed and served (SEO hardening, PR #80). The Playwright
tonal harness now really runs both motion paths:
the reduced-motion project emulates `prefers-reduced-motion` via the
`contextOptions` TestOption and hits the discrete-tone assertion, and the
settle-based waits removed the load-dependent flakes.

Two Phase-6 readiness edges are closed ahead of the domain: the CI coverage
comment now matches the real gate (100% in `vitest.config.ts`, not the old
"80%" wording), and the canonical policy is explicit — with `VITE_SITE_URL`
unset no canonical link is emitted anywhere (`src/lib/site.ts`), so a
public-repo preview or fork can never advertise a throwaway origin as the
authoritative one. The day the domain lands, set `VITE_SITE_URL` and the
canonical links appear on every case-study route with no code change.

The bundle gate (ADR-0018) is expected to trip on the next study — that is
the gate working, not a failure. The re-baseline protocol: write the study,
`npm run build`, then `npm run bundle:report` to measure. Over budget?
Either shave the chunk (inline tables and heavy sections are the usual
suspects) or accept the regression deliberately: raise `entryChunkKb` /
`totalJsKb` in both baseline files with the measured numbers and record why
in the `origin` note (`npm run bundle:check -- --update-baseline --origin
"<reason>"` refreshes only the per-chunk inventory, never the budgets).
Never raise a budget without that note — an unexplained bump
is the one thing the gate cannot catch.

## Inputs needed to proceed

1. ~~**5-8 strong photos**~~ — resolved: portrait + VDS, tennis, MTB
   derivatives committed under `public/photos/`.
2. ~~**2-3 case studies**~~ — resolved: five studies published
   (corpus, grokking, physics, ascent, VDS).
3. ~~**LinkedIn headline**~~ — Hero eyebrow uses coordinates + VDS marker
   (`[ 45.6306° N · 8.7281° E — VDS ]`), the author's pilot identity.
4. A **domain** + how you want to sign (full name? a small personal brand?).
5. ~~**Font binaries**~~ — resolved: the Latin-subset variable woff2 files
   (Fraunces / Geist / Geist Mono, OFL licenses alongside) are committed under
   `src/assets/fonts/` and wired via `@font-face` (ADR-0007).

**Only the domain remains.** All code, content, assets, and gates are ready.

## The one justified risk

The signature is the flight-driven tonal ascent. Everything else stays disciplined
and quiet — so the only scenographic thing is also the only thing that truly tells
the author's story.
