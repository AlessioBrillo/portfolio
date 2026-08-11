import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTonalEngine } from '@/components/ascent/useTonalEngine';
import { TONAL_TRANSITIONS, TONE, type ToneName } from '@/lib/tone';

interface CreateConfig {
  onEnter: () => void;
  onLeaveBack: () => void;
}

const mocks = vi.hoisted(() => {
  // `add(query, cb)` invokes the callback immediately so both media branches
  // run their transition loops under test (real GSAP gates this on the query).
  const matchMediaAdd = vi.fn((_query: string, cb: () => void) => cb());
  return {
    matchMediaAdd,
    registerPlugin: vi.fn(),
    matchMedia: vi.fn(() => ({ add: matchMediaAdd })),
    context: vi.fn((fn: () => void) => {
      fn();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn(),
    set: vi.fn(),
    create: vi.fn(),
  };
});

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: mocks.registerPlugin,
    matchMedia: mocks.matchMedia,
    context: mocks.context,
    fromTo: mocks.fromTo,
    set: mocks.set,
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { create: mocks.create },
}));

beforeEach(() => {
  // Each transition is anchored to a real section element.
  for (const transition of TONAL_TRANSITIONS) {
    const section = document.createElement('section');
    section.id = transition.trigger;
    document.body.appendChild(section);
  }
});

afterEach(() => {
  for (const transition of TONAL_TRANSITIONS) {
    document.getElementById(transition.trigger)?.remove();
  }
  vi.clearAllMocks();
});

/** Renders the hook against a real backdrop element, with an optional tone listener. */
function renderEngine(onToneChange?: (tone: ToneName) => void): RefObject<HTMLDivElement | null> {
  const { result } = renderHook(() => {
    const ref = useRef<HTMLDivElement>(null);
    if (!ref.current) ref.current = document.createElement('div');
    useTonalEngine(ref, onToneChange);
    return ref;
  });
  return result.current;
}

describe('useTonalEngine', () => {
  it('registers ScrollTrigger once GSAP has loaded', async () => {
    renderEngine();
    await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalledTimes(1));
  });

  it('registers both motion-preference branches via matchMedia', async () => {
    renderEngine();
    await waitFor(() => expect(mocks.matchMedia).toHaveBeenCalled());

    expect(mocks.matchMediaAdd).toHaveBeenCalledWith(
      '(prefers-reduced-motion: no-preference)',
      expect.any(Function),
    );
    expect(mocks.matchMediaAdd).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)',
      expect.any(Function),
    );
  });

  it('scrubs one crossfade per transition under full motion', async () => {
    renderEngine();
    await waitFor(() => expect(mocks.fromTo).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length));

    const climb = TONAL_TRANSITIONS[0];
    if (!climb) throw new Error('expected a climb transition');
    expect(mocks.fromTo).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      { backgroundColor: TONE[climb.from] },
      expect.objectContaining({
        backgroundColor: TONE[climb.to],
        immediateRender: false,
        scrollTrigger: expect.objectContaining({ start: climb.start, end: climb.end, scrub: true }),
      }),
    );
  });

  // ScrollTrigger.create call order is deterministic under the stubbed
  // matchMedia: the full-motion branch runs first (one fade-midpoint flip per
  // transition), then the reduced-motion branch (one discrete switch per
  // transition). Indices below follow that order.
  const flipIndex = (transitionIndex: number): number => transitionIndex;
  const discreteIndex = (transitionIndex: number): number => {
    return TONAL_TRANSITIONS.length + transitionIndex;
  };

  it('flips the scene text tone at each fade midpoint under full motion', async () => {
    const onToneChange = vi.fn();
    renderEngine(onToneChange);
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length * 2));

    const climb = TONAL_TRANSITIONS[0];
    if (!climb) throw new Error('expected a climb transition');
    const flip = mocks.create.mock.calls[flipIndex(0)]?.[0] as CreateConfig & { start: unknown };

    expect(flip.start).toBeTypeOf('function');
    flip.onEnter();
    expect(onToneChange).toHaveBeenLastCalledWith(climb.to);
    flip.onLeaveBack();
    expect(onToneChange).toHaveBeenLastCalledWith(climb.from);
  });

  it('switches tone discretely and publishes it under reduced motion', async () => {
    const onToneChange = vi.fn();
    const ref = renderEngine(onToneChange);
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length * 2));

    const descent = TONAL_TRANSITIONS[1];
    if (!descent) throw new Error('expected a descent transition');
    const config = mocks.create.mock.calls[discreteIndex(1)]?.[0] as CreateConfig;
    config.onEnter();
    expect(mocks.set).toHaveBeenCalledWith(ref.current, { backgroundColor: TONE[descent.to] });
    expect(onToneChange).toHaveBeenLastCalledWith(descent.to);
    config.onLeaveBack();
    expect(mocks.set).toHaveBeenCalledWith(ref.current, { backgroundColor: TONE[descent.from] });
    expect(onToneChange).toHaveBeenLastCalledWith(descent.from);
  });

  it('does nothing when the backdrop ref is empty', async () => {
    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useTonalEngine(ref);
    });
    await Promise.resolve();
    expect(mocks.registerPlugin).not.toHaveBeenCalled();
  });

  it('re-measures switch points lazily so later layout shifts are respected', async () => {
    renderEngine();
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length * 2));

    const config = mocks.create.mock.calls[flipIndex(0)]?.[0] as { start: () => number };
    expect(config.start).toBeTypeOf('function');

    const trigger = document.getElementById('ai-physics');
    expect(trigger).not.toBeNull();
    if (!trigger) return;

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      height: 40,
      bottom: 140,
      left: 0,
      right: 0,
      x: 0,
      y: 100,
      width: 0,
      toJSON: () => ({}),
    });

    const before = config.start();
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 800,
      height: 40,
      bottom: 840,
      left: 0,
      right: 0,
      x: 0,
      y: 800,
      width: 0,
      toJSON: () => ({}),
    });
    const after = config.start();

    expect(after).not.toBe(before);
  });
});
