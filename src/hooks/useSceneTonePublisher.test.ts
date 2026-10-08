import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSceneTonePublisher } from '@/hooks/useSceneTonePublisher';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TONAL_TRANSITIONS } from '@/lib/flight-profile';
import { BACKDROP_TONES, FLIP_PROGRESS, backdropColorAt } from '@/lib/tone';

vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn(() => false) }));

const VH = window.innerHeight;
const topAt = (progress: number): number => VH - progress * (VH / 2);

/** What the browser reports for a colour once assigned to `style.backgroundColor`. */
function normalised(color: string): string {
  const probe = document.createElement('div');
  probe.style.backgroundColor = color;
  return probe.style.backgroundColor;
}

describe('useSceneTonePublisher', () => {
  let tops: Record<string, number>;
  let frames: FrameRequestCallback[];
  let backdrop: HTMLDivElement;
  const onToneChange = vi.fn();
  const onSoftToneChange = vi.fn();

  const scrollTo = (next: Record<string, number>): void => {
    tops = { ...tops, ...next };
    window.dispatchEvent(new Event('scroll'));
    const pending = frames.splice(0);
    pending.forEach((frame) => frame(0));
  };

  const mount = (): ReturnType<typeof renderHook> =>
    renderHook(() =>
      useSceneTonePublisher({ onToneChange, onSoftToneChange, backdropRef: { current: backdrop } }),
    );

  beforeEach(() => {
    tops = {};
    frames = [];
    vi.mocked(useReducedMotion).mockReturnValue(false);
    onToneChange.mockClear();
    onSoftToneChange.mockClear();
    delete (window as { __TONAL_ENGINE_LOADED__?: boolean }).__TONAL_ENGINE_LOADED__;

    document.body.innerHTML = TONAL_TRANSITIONS.map(
      ({ trigger }) => `<section id="${trigger}"><h2>${trigger}</h2></section>`,
    ).join('');
    backdrop = document.createElement('div');
    document.body.append(backdrop);

    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return { top: tops[this.closest('section')?.id ?? ''] ?? 9e3 } as DOMRect;
    });
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal('cancelAnimationFrame', () => frames.splice(0));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('paints the ground on mount and announces the engine to the harness', () => {
    const loaded = vi.fn();
    window.addEventListener('tonal-engine-load', loaded, { once: true });
    mount();

    expect(backdrop.style.backgroundColor).toBe(normalised(BACKDROP_TONES.paper));
    expect(onToneChange).toHaveBeenCalledWith('paper');
    expect(onSoftToneChange).toHaveBeenCalledWith('paper');
    expect(loaded).toHaveBeenCalledTimes(1);
    expect((window as { __TONAL_ENGINE_LOADED__?: boolean }).__TONAL_ENGINE_LOADED__).toBe(true);
  });

  it('blends the backdrop with the trigger position as the page scrolls', () => {
    mount();
    scrollTo({ who: topAt(0.5) });
    expect(backdrop.style.backgroundColor).toBe(
      normalised(backdropColorAt(TONAL_TRANSITIONS[0]!, 0.5)),
    );
  });

  it('publishes night text only after the mosaic body line, and back below it', () => {
    mount();
    const line = FLIP_PROGRESS.mosaic!.body;
    scrollTo({ who: 0, mosaic: topAt(line - 0.02) });
    expect(onToneChange).not.toHaveBeenCalledWith('night');

    scrollTo({ mosaic: topAt(line + 0.02) });
    expect(onToneChange).toHaveBeenLastCalledWith('night');

    scrollTo({ mosaic: topAt(line - 0.02) });
    expect(onToneChange).toHaveBeenLastCalledWith('paper');
  });

  it('coalesces a burst of scroll events into one frame', () => {
    mount();
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(frames).toHaveLength(1);
  });

  it('switches discretely under reduced motion', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    mount();
    scrollTo({ who: 0, mosaic: topAt(0.05) });
    expect(backdrop.style.backgroundColor).toBe(normalised(BACKDROP_TONES.foschia));
    scrollTo({ mosaic: 0 });
    expect(backdrop.style.backgroundColor).toBe(normalised(BACKDROP_TONES.night));
  });

  it('stops listening after unmount', () => {
    const { unmount } = mount();
    unmount();
    scrollTo({ who: topAt(0.5) });
    expect(backdrop.style.backgroundColor).toBe(normalised(BACKDROP_TONES.paper));
  });

  it('anchors a fade to an explicit tone trigger before the heading', () => {
    const marker = document.createElement('div');
    marker.setAttribute('data-tone-trigger', '');
    document.getElementById('who')!.prepend(marker);
    vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(function (this: Element) {
      return { top: this === marker ? topAt(0.5) : 9e3 } as DOMRect;
    });
    mount();
    scrollTo({});
    expect(backdrop.style.backgroundColor).toBe(
      normalised(backdropColorAt(TONAL_TRANSITIONS[0]!, 0.5)),
    );
  });

  it('falls back to the section itself when it has no heading', () => {
    document.getElementById('who')!.innerHTML = '';
    vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(function (this: Element) {
      return { top: this.id === 'who' ? topAt(0.5) : 9e3 } as DOMRect;
    });
    mount();
    scrollTo({});
    expect(backdrop.style.backgroundColor).toBe(
      normalised(backdropColorAt(TONAL_TRANSITIONS[0]!, 0.5)),
    );
  });

  it('does not republish when a scroll frame changes nothing', () => {
    mount();
    const calls = onToneChange.mock.calls.length;
    scrollTo({});
    scrollTo({});
    expect(onToneChange).toHaveBeenCalledTimes(calls);
  });

  it('does nothing when the backdrop is not mounted', () => {
    renderHook(() =>
      useSceneTonePublisher({ onToneChange, onSoftToneChange, backdropRef: { current: null } }),
    );
    expect(onToneChange).not.toHaveBeenCalled();
  });
});
