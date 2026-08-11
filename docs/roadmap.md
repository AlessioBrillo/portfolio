# Build Roadmap

Incremental construction: each phase is independently verifiable. **This repo is
currently at the end of Phase 4 (mosaic + one real case study end-to-end).**

| Phase | Goal                                                                                                                              | Status                 |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0     | **Content & assets.** Selected photos, 2-3 written case studies, headline, domain. _(The site is only as strong as its content.)_ | Pending (needs inputs) |
| 1     | **Foundations.** Vite + Tailwind, color/typography tokens, self-hosted fonts, scale and grid.                                     | **Scaffolded**         |
| 2     | **The signature.** Hero + first working quota transition. _Validate "the Ascent" before going further._                           | **Validated**          |
| 3     | **The full ascent.** All tonal bands + altitude gauge + scroll engine (GSAP).                                                     | **Validated**          |
| 4     | **Mosaic + one real case study** (MDX route end-to-end).                                                                          | **Validated**          |
| 5     | **Content.** Remaining case studies, archive, experience storytelling.                                                            | Pending                |
| 6     | **Finishing & deploy.** A11y, performance, OG card, 404, reduced-motion -> Vercel + domain.                                       | Pending                |
| 7     | **After.** CV hook, analytics, optional private area.                                                                             | Pending                |

Phase 2's crossfade (both climb and descent) is implemented and validated
end-to-end by the Playwright harness (`npm run e2e`) -- it now stands as the
signature's regression net for any future change to `TonalScene`,
`useTonalEngine`, or `src/lib/tone.ts`. One known, documented residual remains:
right at a crossfade's exact mathematical midpoint, text contrast can dip below
its nominal WCAG floor, since the backdrop there is a fixed blend of the two
locked ADR-0008 tones (see the diagnostic in `e2e/signature.e2e.ts`). Closing it
for good means either animating each heading's own text colour in sync with the
backdrop or revisiting the palette -- deferred as real, non-trivial work, not
silently dropped.

Since the close of Phase 4, the remaining bands (Who, AI & Physics, Work &
School, Sky & Sport, Experiences) have been scaffolded as content-driven
sections backed by tested content modules (`src/content/`), and the mosaic
tiles now all resolve somewhere real -- either a case-study route or a section
anchor. The SPA fallback for the `/{domain}/{slug}` deep links (a pending
consequence of ADR-0005) is configured in `vercel.json`. Phase 5 still awaits
the author's inputs below: real photos, real copy, and 1-2 more long-form case
studies to fill the `/work/` and `/sky/` domains.

## Inputs needed to proceed

1. **5-8 strong photos** (one sober portrait for "Who", the rest sport / flying /
   experiences).
2. **2-3 case studies** to tell in full (at least one AI/physics for the
   recruiter).
3. The current **LinkedIn headline** (for the hero eyebrow).
4. A **domain** + how you want to sign (full name? a small personal brand?).
5. **Font binaries** for Fraunces / Geist / Geist Mono (see
   `src/assets/fonts/README.md`).

## The one justified risk

The signature is the flight-driven tonal ascent. Everything else stays disciplined
and quiet — so the only scenographic thing is also the only thing that truly tells
the author's story.
