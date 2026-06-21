# ADR-0006: Navigation as an Altitude Gauge (No Hamburger / Classic Menu)

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

A long single page needs orientation: users must always know where they are and
be able to jump. A generic menu would sit outside the concept. The navigation can
_be_ the metaphor: an altitude gauge that fills as you climb.

## Decision Drivers

1. **Orientation** — always answer "where am I on the climb?".
2. **Jumpability** — let users skip to any band.
3. **Concept coherence** — navigation should reinforce, not interrupt, the story.
4. **Keyboard accessibility** — gauge stops must be reachable and operable.

## Considered Options

### Option A: Fixed vertical altitude gauge (CHOSEN)

A thin right-side bar (desktop) labelled `GROUND -> HAZE -> CLEAR -> ALTITUDE ->
NIGHT`; the orange accent marks the current band; labels are clickable anchors. A
minimal top bar (name + Contact) appears only on upward scroll. On mobile the
gauge collapses to a thin top progress bar plus band label.

### Option B: Classic top nav / hamburger menu

Rejected: generic, breaks immersion, and duplicates what the gauge does better.

### Option C: No persistent navigation (scroll only)

Rejected: fails the orientation and jumpability drivers on a long page.

## Decision

Adopt the altitude gauge as the sole primary navigation. It is the one place the
orange accent is purely functional (marking position). Full scroll-linked fill,
the upward-reveal top bar, and the mobile collapse are roadmap Phase 3; the
scaffold ships the gauge structure wired to real scroll progress.

## Consequences

- **Positive:** navigation and storytelling are the same object; distinctive and
  on-brand.
- **Negative:** a bespoke control needs deliberate keyboard/ARIA work and mobile
  adaptation (tracked in ADR-0009 and the responsive doc).
