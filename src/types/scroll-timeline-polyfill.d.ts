// Type declarations for scroll-timeline-polyfill
// This polyfill adds support for CSS Scroll-driven Animations (ScrollTimeline, ViewTimeline)
// in browsers that don't natively support them.

declare module 'scroll-timeline-polyfill' {
  // The polyfill is a side-effect import — it patches global APIs (ScrollTimeline, ViewTimeline)
  // No named exports, just import for side effects.
  const _: void;
  export default _;
}

// Augment global interfaces to include the polyfilled APIs
interface Window {
  ScrollTimeline: typeof ScrollTimeline;
  ViewTimeline: typeof ViewTimeline;
}

interface ScrollTimelineOptions {
  source: Document | Element;
  axis?: 'block' | 'inline' | 'x' | 'y';
  scrollOffsets?: Array<CSSUnitValue | number | string>;
  timeRange?: number;
  fill?: 'auto' | 'backwards' | 'forwards' | 'both' | 'none';
}

declare class ScrollTimeline {
  constructor(options: ScrollTimelineOptions);
  readonly source: Document | Element;
  readonly axis: 'block' | 'inline' | 'x' | 'y';
  readonly scrollOffsets: Array<CSSUnitValue | number | string>;
  readonly timeRange: number;
  readonly fill: 'auto' | 'backwards' | 'forwards' | 'both' | 'none';
  readonly currentTime: CSSNumberish | null;
}

interface ViewTimelineOptions {
  subject: Element;
  axis?: 'block' | 'inline' | 'x' | 'y';
  inset?: number | string;
}

declare class ViewTimeline {
  constructor(options: ViewTimelineOptions);
  readonly subject: Element;
  readonly axis: 'block' | 'inline' | 'x' | 'y';
  readonly inset: number | string;
  readonly currentTime: CSSNumberish | null;
}
