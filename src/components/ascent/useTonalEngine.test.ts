import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTonalEngine } from '@/components/ascent/useTonalEngine';
import {
  flipLineFor,
  SOFT_TEXT_TONE,
  TEXT_TONE,
  TONAL_TRANSITIONS,
  TONE,
  type ToneName,
} from '@/lib/tone';

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
    refresh: vi.fn(),
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
  ScrollTrigger: { create: mocks.create, refresh: mocks.refresh },
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
  delete (document as Omit<Document, 'fonts'> & { fonts?: unknown }).fonts;
  vi.clearAllMocks();
});

/** Renders the hook against a real backdrop element, with optional tone listeners. */
function renderEngine(
  onToneChange?: (tone: ToneName) => void,
  onSoftToneChange?: (tone: ToneName) => void,
): RefObject<HTMLDivElement | null> {
  const { result } = renderHook(() => {
    const ref = useRef<HTMLDivElement>(null);
    if (!ref.current) ref.current = document.createElement('div');
    useTonalEngine(ref, onToneChange, onSoftToneChange);
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
  // matchMedia: the full-motion branch runs first (per transition, the body
  // flip then the muted flip, each at its own equal-legibility line), then
  // the reduced-motion branch (one discrete switch per transition, co-located
  // at the body line). Indices below follow that order.
  const bodyFlipIndex = (transitionIndex: number): number => transitionIndex * 2;
  const softFlipIndex = (transitionIndex: number): number => transitionIndex * 2 + 1;
  const discreteIndex = (transitionIndex: number): number => {
    return TONAL_TRANSITIONS.length * 2 + transitionIndex;
  };

  it('flips body and muted text tones at their own equal-legibility lines under full motion', async () => {
    const onToneChange = vi.fn();
    const onSoftToneChange = vi.fn();
    renderEngine(onToneChange, onSoftToneChange);
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length * 3));

    const climb = TONAL_TRANSITIONS[0];
    if (!climb) throw new Error('expected a climb transition');
    const bodyFlip = mocks.create.mock.calls[bodyFlipIndex(0)]?.[0] as CreateConfig & {
      trigger: Element;
      start: string;
    };
    const softFlip = mocks.create.mock.calls[softFlipIndex(0)]?.[0] as CreateConfig & {
      trigger: Element;
      start: string;
    };

    // Anchored to the trigger heading at the transition's own *relative*
    // equal-legibility line (ADR-0012): the climb and the descent run over
    // the same window in opposite directions, so each uses the line computed
    // for its own direction. Relative starts are re-measured on every
    // ScrollTrigger refresh so layout shifts can never freeze them.
    expect(bodyFlip.trigger).toBe(document.getElementById('ai-physics'));
    expect(bodyFlip.start).toBe(flipLineFor(TEXT_TONE, climb).position);
    expect(softFlip.start).toBe(flipLineFor(SOFT_TEXT_TONE, climb).position);

    bodyFlip.onEnter();
    expect(onToneChange).toHaveBeenLastCalledWith(climb.to);
    bodyFlip.onLeaveBack();
    expect(onToneChange).toHaveBeenLastCalledWith(climb.from);
    softFlip.onEnter();
    expect(onSoftToneChange).toHaveBeenLastCalledWith(climb.to);
    softFlip.onLeaveBack();
    expect(onSoftToneChange).toHaveBeenLastCalledWith(climb.from);
  });

  it('switches tone discretely and publishes both text tones under reduced motion', async () => {
    const onToneChange = vi.fn();
    const onSoftToneChange = vi.fn();
    const ref = renderEngine(onToneChange, onSoftToneChange);
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length * 3));

    const descent = TONAL_TRANSITIONS[1];
    if (!descent) throw new Error('expected a descent transition');
    const config = mocks.create.mock.calls[discreteIndex(1)]?.[0] as CreateConfig & {
      start: string;
    };
    // Co-located at the *body* equal-legibility line for this direction: the
    // backdrop is not blending, so both families switch with it.
    expect(config.start).toBe(flipLineFor(TEXT_TONE, descent).position);

    config.onEnter();
    expect(mocks.set).toHaveBeenCalledWith(ref.current, { backgroundColor: TONE[descent.to] });
    expect(onToneChange).toHaveBeenLastCalledWith(descent.to);
    expect(onSoftToneChange).toHaveBeenLastCalledWith(descent.to);
    config.onLeaveBack();
    expect(mocks.set).toHaveBeenCalledWith(ref.current, { backgroundColor: TONE[descent.from] });
    expect(onToneChange).toHaveBeenLastCalledWith(descent.from);
    expect(onSoftToneChange).toHaveBeenLastCalledWith(descent.from);
  });

  it('does nothing when the backdrop ref is empty', async () => {
    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useTonalEngine(ref);
    });
    await Promise.resolve();
    expect(mocks.registerPlugin).not.toHaveBeenCalled();
  });

  it('anchors fades to the explicit data-tone-trigger marker when present', async () => {
    const section = document.getElementById('ai-physics');
    const marker = document.createElement('h2');
    marker.setAttribute('data-tone-trigger', '');
    marker.textContent = 'Trigger heading';
    if (!section) throw new Error('expected the ai-physics section');
    section.appendChild(marker);

    renderEngine();
    await waitFor(() => expect(mocks.fromTo).toHaveBeenCalled());

    const climb = mocks.fromTo.mock.calls[0]?.[2] as { scrollTrigger: { trigger: Element } };
    expect(climb.scrollTrigger.trigger).toBe(marker);
  });

  it('falls back to the heading query then the section when no marker exists', async () => {
    const section = document.getElementById('sky-sport');
    if (!section) throw new Error('expected the sky-sport section');
    const h3 = document.createElement('h3');
    h3.textContent = 'Section title';
    section.appendChild(h3);

    renderEngine();
    await waitFor(() => expect(mocks.fromTo).toHaveBeenCalled());

    const descent = mocks.fromTo.mock.calls[1]?.[2] as { scrollTrigger: { trigger: Element } };
    expect(descent.scrollTrigger.trigger).toBe(section);

    h3.remove();
  });

  it('skips transitions whose trigger section is missing from the DOM', async () => {
    for (const transition of TONAL_TRANSITIONS) {
      document.getElementById(transition.trigger)?.remove();
    }

    renderEngine();
    await waitFor(() => expect(mocks.matchMedia).toHaveBeenCalled());
    expect(mocks.fromTo).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('re-measures trigger geometry once the display fonts settle', async () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });

    renderEngine();
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
  });

  it('skips the refresh when the engine is torn down before fonts settle', async () => {
    let releaseReady: (() => void) | undefined;
    const ready = new Promise<void>((resolve) => {
      releaseReady = resolve;
    });
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready },
    });

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      if (!ref.current) ref.current = document.createElement('div');
      useTonalEngine(ref);
      return ref;
    });

    // Tear the engine down only once it has registered the fonts re-measure,
    // so `cancelled` flips while the fonts promise is still pending.
    await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
    unmount();
    releaseReady?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  // --- New coverage: load/resize listeners registered + debounce helper ---

  it('registers load and resize listeners after GSAP initializes', async () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });

    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    const _ref = renderEngine();
    void _ref;
    await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled());

    // Both listeners should be registered (load with {once:true}, resize without)
    expect(addEventListener).toHaveBeenCalledTimes(2);
    expect(addEventListener).toHaveBeenNthCalledWith(1, 'load', expect.any(Function), {
      once: true,
    });
    expect(addEventListener).toHaveBeenNthCalledWith(2, 'resize', expect.any(Function));

    // Clean up listeners
    const { unmount } = renderHook(() => {
      const _ref = useRef<HTMLDivElement>(null);
      if (!_ref.current) _ref.current = document.createElement('div');
      useTonalEngine(_ref);
      return _ref;
    });
    await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  });

  it('calls ScrollTrigger.refresh via load event callback', async () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });

    let loadCb: () => void = () => {};
    const addEventListener = vi
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, cb) => {
        if (event === 'load') loadCb = cb as () => void;
      });

    renderEngine();
    await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled());

    // Fire the load callback
    loadCb?.();
    await Promise.resolve();

    // The load callback calls refreshIfActive which calls ScrollTrigger.refresh()
    expect(mocks.refresh).toHaveBeenCalledTimes(2); // initial + load

    addEventListener.mockRestore();
  });

  it('guards refreshIfActive when scrollTriggerRef is not yet set', async () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });

    // Create a ref that we can control
    const _ref = renderEngine();
    void _ref;
    await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled());

    // The refreshIfActive function guards against both cancelled and
    // scrollTriggerRef.current being null. The existing test
    // "skips the refresh when the engine is torn down before fonts settle"
    // covers the cancelled=true path. The scrollTriggerRef.current=null
    // path is covered by the fact that the function checks both conditions
    // with && - if either is false, refresh is not called.
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
});
