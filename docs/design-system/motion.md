# Motion

> Decision record: [ADR-0003](../adr/0003-scroll-and-animation-engine.md).
> Accessibility constraints: [ADR-0009](../adr/0009-accessibility-performance-floor.md).

Discreet motion, never "AI-generated".

- **Tonal transitions:** the background tone changes continuously on scroll
  between bands. This is the heart of the light/dark effect and the _only_
  scenographic moment. The full multi-band engine is driven by GSAP ScrollTrigger
  (roadmap Phase 3); Phase 2 validates the _first_ transition with Framer Motion
  `useScroll`/`useTransform` to keep the JS budget low (see ADR-0003).
- **Reveals:** text and tiles rise 12-16px with a fade on scroll. Subtle. Driven
  by Framer Motion.
- **Hover:** mosaic tiles get a micro-lift and an orange edge.

## Tokens

| Token               | Value                           |
| ------------------- | ------------------------------- |
| `--duration-fast`   | 150ms                           |
| `--duration-normal` | 300ms                           |
| `--duration-slow`   | 600ms                           |
| `--ease-out-expo`   | `cubic-bezier(0.16, 1, 0.3, 1)` |

JS-side mirrors live in `src/lib/animation.ts` (`DURATION`, `EASE_OUT_EXPO`,
`REVEAL_OFFSET_PX`).

## Quality constraint

Honour `prefers-reduced-motion`: tonal transitions become instant, parallax and
reveals are disabled. Keyboard focus stays visible. Animate compositor-friendly
properties only (`transform`, `opacity`, `clip-path`) — never layout-bound ones.
