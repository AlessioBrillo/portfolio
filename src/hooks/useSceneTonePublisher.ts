import { useEffect, useRef, type RefObject } from 'react';
import { TONAL_TRANSITIONS } from '@/lib/flight-profile';
import type { ToneName } from '@/lib/tone';
import { tonalStateAt, type TriggerTops } from '@/lib/tonal-state';
import { useReducedMotion } from './useReducedMotion';

interface TonePublisherOptions {
  /** Called when the body text tone should flip */
  onToneChange: (tone: ToneName) => void;
  /** Called when the muted text tone should flip */
  onSoftToneChange: (tone: ToneName) => void;
  /** The fixed backdrop element whose colour the flight drives */
  backdropRef: RefObject<HTMLDivElement | null>;
}

/**
 * The element a fade is anchored to: the section's explicit tone trigger, else
 * its heading (so the fade survives wrapper or heading-level changes), else the
 * section itself.
 */
function transitionTrigger(sectionId: string): Element | null {
  const section = document.getElementById(sectionId);
  return (
    section?.querySelector('[data-tone-trigger]') ?? section?.querySelector('h1, h2') ?? section
  );
}

function readTops(): TriggerTops {
  const tops: Record<string, number> = {};
  for (const { trigger } of TONAL_TRANSITIONS) {
    const element = transitionTrigger(trigger);
    if (element) tops[trigger] = element.getBoundingClientRect().top;
  }
  return tops;
}

/**
 * The tonal engine (ADR-0026). One rAF-throttled scroll handler maps where each
 * transition trigger sits in the viewport to the backdrop colour and to the
 * scene text tones (`tonalStateAt`), writes the colour straight to the fixed
 * backdrop, and publishes tone changes to React. Positions are read live on
 * every pass, so late layout shifts (fonts, images) never leave stale geometry.
 */
export function useSceneTonePublisher({
  onToneChange,
  onSoftToneChange,
  backdropRef,
}: TonePublisherOptions): void {
  const reducedMotion = useReducedMotion();
  const onToneChangeRef = useRef(onToneChange);
  onToneChangeRef.current = onToneChange;
  const onSoftToneChangeRef = useRef(onSoftToneChange);
  onSoftToneChangeRef.current = onSoftToneChange;

  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;

    let frame = 0;
    let announced = false;
    let last: { color?: string; tone?: ToneName; softTone?: ToneName } = {};

    const update = (): void => {
      frame = 0;
      const state = tonalStateAt(readTops(), window.innerHeight, reducedMotion);
      if (state.color !== last.color) backdrop.style.backgroundColor = state.color;
      if (state.tone !== last.tone) onToneChangeRef.current(state.tone);
      if (state.softTone !== last.softTone) onSoftToneChangeRef.current(state.softTone);
      last = state;

      if (!announced) {
        announced = true;
        (window as unknown as { __TONAL_ENGINE_LOADED__: boolean }).__TONAL_ENGINE_LOADED__ = true;
        window.dispatchEvent(
          new CustomEvent('tonal-engine-load', { detail: { engine: 'scroll' } }),
        );
      }
    };
    const schedule = (): void => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    void document.fonts?.ready.then(schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [backdropRef, reducedMotion]);
}
