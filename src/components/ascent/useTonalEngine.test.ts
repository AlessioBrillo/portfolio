import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTonalEngine } from '@/components/ascent/useTonalEngine';
import { TONAL_TRANSITIONS, TONE } from '@/lib/tone';

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

/** Renders the hook against a real backdrop element. */
function renderEngine(): RefObject<HTMLDivElement | null> {
  const { result } = renderHook(() => {
    const ref = useRef<HTMLDivElement>(null);
    if (!ref.current) ref.current = document.createElement('div');
    useTonalEngine(ref);
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

  it('switches tone discretely under reduced motion', async () => {
    const ref = renderEngine();
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length));

    const descent = TONAL_TRANSITIONS[1];
    if (!descent) throw new Error('expected a descent transition');
    const config = mocks.create.mock.calls[1]?.[0] as CreateConfig;
    config.onEnter();
    expect(mocks.set).toHaveBeenCalledWith(ref.current, { backgroundColor: TONE[descent.to] });
    config.onLeaveBack();
    expect(mocks.set).toHaveBeenCalledWith(ref.current, { backgroundColor: TONE[descent.from] });
  });

  it('does nothing when the backdrop ref is empty', async () => {
    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useTonalEngine(ref);
    });
    await Promise.resolve();
    expect(mocks.registerPlugin).not.toHaveBeenCalled();
  });
});
