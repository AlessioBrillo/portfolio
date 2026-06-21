# ADR-0003: Scroll & Animation Engine — GSAP ScrollTrigger + Framer Motion

## Metadata

| Field          | Value              |
| -------------- | ------------------ |
| **Status**     | Accepted           |
| **Date**       | 2026-06-21         |
| **Authors**    | AlessioBrillo      |
| **Deciders**   | AlessioBrillo      |
| **Supersedes** | N/A                |
| **Relates to** | ADR-0001, ADR-0009 |
| **Project**    | The Ascent         |

## Context

The signature effect is the continuous tonal transition between altitude bands,
driven by scroll. Around it sit smaller, disciplined reveals (text and tiles
rising 12-16px with a fade) and micro hover states. Two different jobs: a precise
scroll-progress timeline, and component-level enter/hover animation.

## Decision Drivers

1. **One scenographic effect** — the quota transition is _the_ moment; everything
   else stays quiet.
2. **Right tool per job** — scroll-linked scrubbing vs. declarative component
   motion.
3. **Accessibility** — all motion must collapse cleanly under
   `prefers-reduced-motion` (ADR-0009).
4. **Performance** — animate compositor-friendly properties only.

## Considered Options

### Option A: GSAP ScrollTrigger for the tonal timeline + Framer Motion for reveals (CHOSEN)

GSAP ScrollTrigger (now fully free) scrubs background-tone transitions to scroll
position; Framer Motion handles component reveals and hovers.

### Option B: Framer Motion alone (`useScroll`/`useTransform`)

Rejected: viable for simple parallax but less ergonomic than ScrollTrigger for
orchestrated, pinned, multi-step scroll timelines spanning the whole page.

### Option C: Hand-rolled IntersectionObserver + CSS

Rejected: minimal dependencies, but re-implements scrubbing and easing that
ScrollTrigger already solves robustly; more code to maintain for the showcase.

## Decision

Use GSAP + ScrollTrigger for the scroll-driven tonal engine and Framer Motion for
reveals and hover micro-interactions. Heavy libraries are dynamically imported.
The engine itself is **out of scope for the scaffold** — `useScrollProgress`
provides a lightweight baseline; the full timeline lands in roadmap Phase 2-3.

## Consequences

- **Positive:** the hardest effect uses a proven tool; component motion stays
  ergonomic; clear separation of concerns.
- **Negative:** two animation libraries to keep lean — justified by distinct
  responsibilities and code-splitting.
- **Constraint:** under reduced motion, tonal transitions become instantaneous
  and reveals/parallax are disabled.
