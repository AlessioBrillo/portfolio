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

## Current state

End of Phase 1 (scaffold). Sections/components/navigation are typed, compile-clean
stubs. The GSAP tonal engine and real content are later roadmap phases — do not
assume they exist yet.
