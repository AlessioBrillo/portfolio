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
- Design tokens: `src/index.css` (`@theme`), `src/styles/tokens.css`,
  `src/styles/typography.css`
- Page order and bands: `docs/architecture/page-architecture.md`,
  `src/lib/altitude.ts`
- Roadmap and current phase: `docs/roadmap.md`

## Local gates

```bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
```

Husky runs typecheck + lint-staged on commit; commitlint enforces Conventional
Commits.

`npm run e2e` runs the Playwright signature harness (`playwright.config.ts`,
`e2e/`) — the only thing that actually renders the tonal crossfade in a browser.
Not part of the commit-time gate; run it after touching `TonalScene`,
`useTonalEngine`, `src/lib/tone.ts`, or any section's tone/surface props.

## Current state

End of Phase 2 (the signature). The GSAP tonal engine (`useTonalEngine` +
`TonalScene`) is implemented, unit-tested, and validated end-to-end by the
Playwright harness — both crossfades (climb paper→night, descent night→paper)
render and hold under `prefers-reduced-motion`. Sections/components/navigation
are otherwise still typed, compile-clean stubs; real content and the full
multi-band altitude gauge (Phase 3+) are later roadmap phases — do not assume
they exist yet.
