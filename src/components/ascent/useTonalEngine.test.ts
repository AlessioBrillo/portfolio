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

function setReducedMotion(reduced: boolean) {
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
        { backgroundColor: TONE[climb.from] },
        expect.objectContaining({
          backgroundColor: TONE[climb.to],
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

      const bodyLine = flipLineFor(TEXT_TONE, climb).progress;
      const softLine = flipLineFor(SOFT_TEXT_TONE, climb).progress;

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
      const section = document.getElementById('ai-physics');
      const marker = document.createElement('h2');
      marker.setAttribute('data-tone-trigger', '');
      marker.textContent = 'Trigger heading';
      if (!section) throw new Error('expected the ai-physics section');
      section.appendChild(marker);

      renderEngine();
      await waitFor(() => expect(mocks.fromTo).toHaveBeenCalled());

      const climb = mocks.fromTo.mock.calls[0]?.[2] as FromToConfig;
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

      const descent = mocks.fromTo.mock.calls[1]?.[2] as FromToConfig;
      expect(descent.scrollTrigger.trigger).toBe(section);

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

      await waitFor(() => expect(mocks.registerPlugin).toHaveBeenCalled());
      unmount();
      releaseReady?.();
      await Promise.resolve();
      await Promise.resolve();
      expect(mocks.refresh).not.toHaveBeenCalled();
    });

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

      loadCb?.();
      await Promise.resolve();

      expect(mocks.refresh).toHaveBeenCalledTimes(2);

      addEventListener.mockRestore();
    });

    it('guards refreshIfActive when scrollTriggerRef is not yet set', async () => {
      Object.defineProperty(document, 'fonts', {
        configurable: true,
        value: { ready: Promise.resolve() },
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
      expect(mocks.set).toHaveBeenCalledWith(ref.current, { backgroundColor: TONE[descent.to] });
      expect(onToneChange).toHaveBeenLastCalledWith(descent.to);
      expect(onSoftToneChange).toHaveBeenLastCalledWith(descent.to);

      config.onLeaveBack();
      expect(mocks.set).toHaveBeenCalledWith(ref.current, { backgroundColor: TONE[descent.from] });
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
});
