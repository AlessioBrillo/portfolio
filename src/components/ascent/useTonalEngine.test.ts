import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '@/lib/debounce';
import { useTonalEngine, renderStaticFlightGradient } from '@/components/ascent/useTonalEngine';
import {
  flipLineFor,
  TEXT_TONE,
  TONAL_TRANSITIONS,
  BACKDROP_TONES,
  FLIP_PROGRESS,
  type ToneName,
} from '@/lib/tone';

interface FromToConfig {
  scrollTrigger: {
    trigger: Element;
    start: string;
    end: string;
    scrub: true;
    onUpdate: (self: { progress: number; getVelocity: () => number }) => void;
  };
}

interface CreateConfig {
  onEnter: () => void;
  onLeaveBack: () => void;
}

const mocks = vi.hoisted(() => {
  return {
    registerPlugin: vi.fn(),
    matchMedia: vi.fn(),
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

// Mock the GSAP loader module instead of gsap directly
vi.mock('@/lib/gsap-loader', () => ({
  loadGsap: vi.fn().mockResolvedValue({
    gsap: {
      registerPlugin: mocks.registerPlugin,
      matchMedia: mocks.matchMedia,
      context: mocks.context,
      fromTo: mocks.fromTo,
      set: mocks.set,
    },
    ScrollTrigger: {
      create: mocks.create,
      refresh: mocks.refresh,
    },
  }),
}));

function setReducedMotion(reduced: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? reduced : !reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  for (const transition of TONAL_TRANSITIONS) {
    const section = document.createElement('section');
    section.id = transition.trigger;
    document.body.appendChild(section);
  }
  setReducedMotion(false); // default: full motion
});

afterEach(() => {
  for (const transition of TONAL_TRANSITIONS) {
    document.getElementById(transition.trigger)?.remove();
  }
  delete (document as Omit<Document, 'fonts'> & { fonts?: unknown }).fonts;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

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
  describe('full motion (default)', () => {
    beforeEach(() => {
      setReducedMotion(false);
    });

    it('registers ScrollTrigger once GSAP has loaded', async () => {
      renderEngine();
      await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalledTimes(1));
    });

    it('scrubs one crossfade per transition under full motion', async () => {
      renderEngine();
      await waitFor(() => expect(mocks.fromTo).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length));

      const climb = TONAL_TRANSITIONS[0];
      if (!climb) throw new Error('expected a climb transition');
      expect(mocks.fromTo).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        { backgroundColor: BACKDROP_TONES[climb.from] },
        expect.objectContaining({
          backgroundColor: BACKDROP_TONES[climb.to],
          immediateRender: false,
          scrollTrigger: expect.objectContaining({
            start: climb.start,
            end: climb.end,
            scrub: true,
          }),
        }),
      );
    });

    it('fires body and soft tone changes at their equal-legibility lines via onUpdate', async () => {
      const onToneChange = vi.fn();
      const onSoftToneChange = vi.fn();
      renderEngine(onToneChange, onSoftToneChange);
      await waitFor(() => expect(mocks.fromTo).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length));

      const climb = TONAL_TRANSITIONS[0];
      if (!climb) throw new Error('expected a climb transition');

      const call = mocks.fromTo.mock.calls[0]?.[2] as FromToConfig;
      const onUpdate = call.scrollTrigger.onUpdate;

      // Use the precomputed FLIP_PROGRESS for the trigger (which matches the engine)
      const lines = FLIP_PROGRESS[climb.trigger];
      if (!lines) throw new Error(`no flip lines for trigger ${climb.trigger}`);
      const bodyLine = lines.body;
      const softLine = lines.soft;

      onUpdate({ progress: bodyLine - 0.01, getVelocity: () => 0 });
      expect(onToneChange).not.toHaveBeenCalled();
      expect(onSoftToneChange).not.toHaveBeenCalled();

      onUpdate({ progress: bodyLine + 0.01, getVelocity: () => 600 });
      expect(onToneChange).toHaveBeenLastCalledWith(climb.to);

      onUpdate({ progress: softLine + 0.01, getVelocity: () => 600 });
      expect(onSoftToneChange).toHaveBeenLastCalledWith(climb.to);

      onUpdate({ progress: softLine - 0.01, getVelocity: () => -600 });
      expect(onSoftToneChange).toHaveBeenLastCalledWith(climb.from);

      onUpdate({ progress: bodyLine - 0.01, getVelocity: () => -600 });
      expect(onToneChange).toHaveBeenLastCalledWith(climb.from);
    });

    it('anchors fades to the explicit data-tone-trigger marker when present', async () => {
      const section = document.getElementById('who');
      const marker = document.createElement('h2');
      marker.setAttribute('data-tone-trigger', '');
      marker.textContent = 'Trigger heading';
      if (!section) throw new Error('expected the who section');
      section.appendChild(marker);

      renderEngine();
      await waitFor(() => expect(mocks.fromTo).toHaveBeenCalled());

      const climb = mocks.fromTo.mock.calls[0]?.[2] as FromToConfig;
      expect(climb.scrollTrigger.trigger).toBe(marker);
    });

    it('falls back to the heading query then the section when no marker exists', async () => {
      const section = document.getElementById('mosaic');
      if (!section) throw new Error('expected the mosaic section');
      const h3 = document.createElement('h3');
      h3.textContent = 'Section title';
      section.appendChild(h3);

      renderEngine();
      await waitFor(() => expect(mocks.fromTo).toHaveBeenCalled());

      const secondTransition = mocks.fromTo.mock.calls[1]?.[2] as FromToConfig;
      expect(secondTransition.scrollTrigger.trigger).toBe(section);

      h3.remove();
    });

    it('skips transitions whose trigger section is missing from the DOM', async () => {
      for (const transition of TONAL_TRANSITIONS) {
        document.getElementById(transition.trigger)?.remove();
      }

      renderEngine();
      await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
      expect(mocks.fromTo).not.toHaveBeenCalled();
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it('re-measures trigger geometry once the display fonts settle', async () => {
      const variableFont = { family: 'Archivo', load: vi.fn().mockResolvedValue(undefined) };
      const regularFont = { family: 'JetBrains Mono', load: vi.fn().mockResolvedValue(undefined) };
      const fontSet = {
        ready: Promise.resolve(),
        *[Symbol.iterator]() {
          yield variableFont;
          yield regularFont;
        },
      };
      Object.defineProperty(document, 'fonts', {
        configurable: true,
        value: fontSet,
      });

      renderEngine();
      // Wait for GSAP to initialize AND font loading to complete
      await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
      await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
      expect(variableFont.load).toHaveBeenCalled();
      expect(regularFont.load).toHaveBeenCalled();
    });

    it('waits for variable fonts to load before ScrollTrigger.refresh', async () => {
      let resolveVariableLoad: (() => void) | undefined;
      const variableLoadPromise = new Promise<void>((resolve) => {
        resolveVariableLoad = resolve;
      });
      const variableFont = {
        family: 'Archivo',
        load: vi.fn().mockReturnValue(variableLoadPromise),
      };
      const regularFont = { family: 'JetBrains Mono', load: vi.fn().mockResolvedValue(undefined) };
      const fontSet = {
        ready: Promise.resolve(),
        *[Symbol.iterator]() {
          yield variableFont;
          yield regularFont;
        },
      };
      Object.defineProperty(document, 'fonts', {
        configurable: true,
        value: fontSet,
      });

      renderEngine();

      // registerPlugin should be called immediately
      await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());

      // refresh should not be called until variable font loads
      await Promise.resolve(); // let ready resolve
      expect(mocks.refresh).not.toHaveBeenCalled();

      // resolve variable font load
      resolveVariableLoad?.();
      await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
      expect(variableFont.load).toHaveBeenCalled();
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

      await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
      unmount();
      releaseReady?.();
      await Promise.resolve();
      await Promise.resolve();
      expect(mocks.refresh).not.toHaveBeenCalled();
    });

    it('registers load and resize listeners after GSAP initializes', async () => {
      const regularFont = { family: 'JetBrains Mono', load: vi.fn().mockResolvedValue(undefined) };
      const fontSet = {
        ready: Promise.resolve(),
        *[Symbol.iterator]() {
          yield regularFont;
        },
      };
      Object.defineProperty(document, 'fonts', {
        configurable: true,
        value: fontSet,
      });

      const addEventListener = vi.spyOn(window, 'addEventListener');
      const removeEventListener = vi.spyOn(window, 'removeEventListener');

      const _ref = renderEngine();
      void _ref;
      await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
      await waitFor(() => expect(mocks.refresh).toHaveBeenCalled());

      expect(addEventListener).toHaveBeenCalledTimes(2);
      expect(addEventListener).toHaveBeenNthCalledWith(1, 'load', expect.any(Function), {
        once: true,
      });
      expect(addEventListener).toHaveBeenNthCalledWith(2, 'resize', expect.any(Function));

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
      const regularFont = { family: 'JetBrains Mono', load: vi.fn().mockResolvedValue(undefined) };
      const fontSet = {
        ready: Promise.resolve(),
        *[Symbol.iterator]() {
          yield regularFont;
        },
      };
      Object.defineProperty(document, 'fonts', {
        configurable: true,
        value: fontSet,
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

      loadCb?.();
      await Promise.resolve();

      expect(mocks.refresh).toHaveBeenCalledTimes(2);

      addEventListener.mockRestore();
    });

    it('guards refreshIfActive when scrollTriggerRef is not yet set', async () => {
      const regularFont = { family: 'JetBrains Mono', load: vi.fn().mockResolvedValue(undefined) };
      const fontSet = {
        ready: Promise.resolve(),
        *[Symbol.iterator]() {
          yield regularFont;
        },
      };
      Object.defineProperty(document, 'fonts', {
        configurable: true,
        value: fontSet,
      });

      const _ref = renderEngine();
      void _ref;
      await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
      await waitFor(() => expect(mocks.refresh).toHaveBeenCalled());

      expect(mocks.refresh).toHaveBeenCalledTimes(1);
    });

    it('guards refreshIfActive when load fires before scrollTriggerRef is set (race)', async () => {
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

      loadCb?.();
      await Promise.resolve();

      expect(mocks.refresh).not.toHaveBeenCalled();

      addEventListener.mockRestore();
    });
  });

  describe('reduced motion', () => {
    beforeEach(() => {
      setReducedMotion(true);
    });

    it('creates discrete switches at body line for each transition', async () => {
      const onToneChange = vi.fn();
      const onSoftToneChange = vi.fn();
      const ref = renderEngine(onToneChange, onSoftToneChange);
      await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(TONAL_TRANSITIONS.length));

      const descent = TONAL_TRANSITIONS[1];
      if (!descent) throw new Error('expected a descent transition');

      const config = mocks.create.mock.calls[1]?.[0] as CreateConfig & { start: string };
      expect(config.start).toBe(flipLineFor(TEXT_TONE, descent).position);

      config.onEnter();
      expect(mocks.set).toHaveBeenCalledWith(ref.current, {
        backgroundColor: BACKDROP_TONES[descent.to],
      });
      expect(onToneChange).toHaveBeenLastCalledWith(descent.to);
      expect(onSoftToneChange).toHaveBeenLastCalledWith(descent.to);

      config.onLeaveBack();
      expect(mocks.set).toHaveBeenCalledWith(ref.current, {
        backgroundColor: BACKDROP_TONES[descent.from],
      });
      expect(onToneChange).toHaveBeenLastCalledWith(descent.from);
      expect(onSoftToneChange).toHaveBeenLastCalledWith(descent.from);
    });

    it('does not create fromTo tweens', async () => {
      renderEngine();
      await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
      expect(mocks.fromTo).not.toHaveBeenCalled();
    });
  });

  it('does nothing when the backdrop ref is empty', async () => {
    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useTonalEngine(ref);
    });
    await Promise.resolve();
    expect(mocks.registerPlugin).not.toHaveBeenCalled();
  });

  describe('debounce utility', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('delays function execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancels pending execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(100);
      expect(fn).not.toHaveBeenCalled();
    });

    it('resets timer on subsequent calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('renderStaticFlightGradient', () => {
  it('applies the correct flight profile gradient to the element', () => {
    const el = document.createElement('div');
    renderStaticFlightGradient(el);

    const style = el.style.backgroundImage;
    // Browser converts hex to rgb() in computed styles
    expect(style).toContain('rgb(244, 244, 240)'); // paper
    expect(style).toContain('rgb(122, 122, 122)'); // foschia
    expect(style).toContain('rgb(10, 10, 10)'); // night
    expect(style).toContain('rgb(133, 133, 133)'); // alba

    // Verify the gradient stops match the flight profile (8 sections ≈ 12.5% each)
    expect(style).toContain('0%');
    expect(style).toContain('12.5%');
    expect(style).toContain('25%');
    expect(style).toContain('62.5%');
    expect(style).toContain('75%');
    expect(style).toContain('87.5%');
    expect(style).toContain('100%');
  });

  it('sets backgroundColor to transparent', () => {
    const el = document.createElement('div');
    renderStaticFlightGradient(el);
    expect(el.style.backgroundColor).toBe('transparent');
  });

  it('produces deterministic output for the same input', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    renderStaticFlightGradient(el1);
    renderStaticFlightGradient(el2);
    expect(el1.style.backgroundImage).toBe(el2.style.backgroundImage);
  });
});
