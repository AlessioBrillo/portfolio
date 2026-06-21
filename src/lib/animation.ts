/**
 * Motion design tokens, mirrored from the CSS custom properties in
 * styles/tokens.css. Keep the two in sync: CSS drives declarative transitions,
 * these constants drive JS-orchestrated motion (Framer Motion / GSAP).
 */

/** Transition durations in milliseconds. */
export const DURATION = {
  fast: 150,
  normal: 300,
  slow: 600,
} as const;

/** Signature easing curve for reveals and quota transitions. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Vertical offset (px) for scroll reveals before they settle. */
export const REVEAL_OFFSET_PX = 14;
