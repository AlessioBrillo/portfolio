# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## What this is

**The Ascent** — a single-page, scroll-driven personal portfolio. Scrolling gains
altitude: the page climbs from ground (paper tones, daylight) to night, and the
light/dark shift is the journey, not a toggle. The repo is itself part of the
portfolio, so code quality and documentation are first-class.

## Stack

React 19, Vite 6, TypeScript 5 (strict), Tailwind CSS 4 (CSS-first `@theme`),
Framer Motion (reveals), GSAP ScrollTrigger (tonal engine), MDX (case studies),
React Router (case-study routes), Vitest. Package manager: **npm**. Path alias:
`@/*` maps to `src/*`.

## Non-negotiables

- **English only**, everywhere (code, comments, docs, commits).
- **Read `docs/adr/` before changing architecture.** ADRs are immutable; a change
  of mind is a new ADR, never an in-place edit.
- **Immutability and small files** — prefer new objects over mutation; keep files
  cohesive (target under 400 lines, hard cap 800).
- **Design discipline** — orange is the only accent and is never diluted; motion
  respects `prefers-reduced-motion`; text contrast meets AA.
- **Never commit the design paper** (`*.paper.md` / `portfolio-design-plan.md` are
  git-ignored) or any private content.

## Key references

- Decisions: `docs/adr/`
- Design tokens: `src/styles/tokens.css` (`@theme`),
  `src/styles/typography.css`
- Page order and bands: `docs/architecture/page-architecture.md`,
  `src/lib/altitude.ts`
- Roadmap and current phase: `docs/roadmap.md`

## Local gates

```bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build && npm run photos:check
```

Husky runs typecheck + lint-staged on commit; commitlint enforces Conventional
Commits.

`npm run e2e` runs the Playwright signature harness (`playwright.config.ts`,
`e2e/`) — the only thing that actually renders the tonal crossfade in a browser.
Not part of the commit-time gate; run it after touching `TonalScene`,
`useTonalEngine`, `src/lib/tone.ts`, the scene-tone context
(`tone-context`/`ToneProvider`, ADR-0011), or any section's tone/surface props.

## Current state

Phase 4 is closed; Phase 5 (content) is in progress — the structure of every
phase is live and validated; the author's content is the remaining input. The
tonal engine (`useTonalEngine` + `TonalScene`) is implemented, unit-tested,
and validated
end-to-end by the Playwright harness — both crossfades (climb paper→night,
descent night→paper) render and hold under `prefers-reduced-motion`. Scene
text follows the live backdrop tone (ADR-0011): `TonalScene` publishes the
engine's flips through `tone-context`, and scene bands, eyebrows, and muted
copy flip with the blend at each fade midpoint, so no ink-family text ever
sits on the night half of the flight. Case studies are real routes:
`/{domain}/{slug}` resolves through the data router (ADR-0005), owns its
document head via `useDocumentMeta`, returns to the exact scroll position via
the layout's `ScrollRestoration`, and contains lazy-MDX failures behind a
route-level error boundary so one broken study never crashes the app. Three
long-form studies are published as real routes: `transformer-italian-corpus`
(AI, carries a professional draft), `work-the-ascent` (work) and
`vds-licence` (sky); the mosaic index and its tiles are backed by a tested
content module.
Small-text contrast is AA-safe on every surface. All eight bands — Hero, Who,
Mosaic, AI & Physics, Work & School, Sky & Sport, Experiences, and Contact —
are implemented, content-driven sections backed by tested content modules;
Contact is complete (email + LinkedIn CTAs sourced from `lib/site.ts`) and
paints its own solid night outside `TonalScene`. What remains for Phase 5 is
content, not structure: real photos, real copy, and one more long-form
AI/physics study for the recruiter-facing core.
