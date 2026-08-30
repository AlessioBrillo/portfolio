import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import {
  SCENE_SOFT_TEXT,
  SceneToneContext,
  useSceneTone,
  useSceneToneSetter,
} from '@/components/ascent/tone-context';

function Probe(): ReactElement {
  const { tone, softTone } = useSceneTone();
  return (
    <span>
      tone:{tone} soft:{softTone}
    </span>
  );
}

function ReadTone(): ReactElement {
  const { tone, softTone } = useSceneTone();
  const { setTone, setSoftTone } = useSceneToneSetter();
  return (
    <button
      type="button"
      onClick={() => {
        setTone('notte');
        setSoftTone('notte');
      }}
    >
      tone:{tone} soft:{softTone}
    </button>
  );
}

describe('SCENE_SOFT_TEXT', () => {
  it('maps each tone to an AA-soft text utility class (ADR-0011)', () => {
    expect(SCENE_SOFT_TEXT.carta).toBe('text-ink-soft');
    expect(SCENE_SOFT_TEXT.notte).toBe('text-panna-dim');
    expect(SCENE_SOFT_TEXT.carta).not.toBe(SCENE_SOFT_TEXT.notte);
  });
});

describe('useSceneTone', () => {
  it('falls back to the carta default when no scene is mounted', () => {
    render(<Probe />);
    expect(screen.getByText(/tone:carta/)).toBeInTheDocument();
    expect(screen.getByText(/soft:carta/)).toBeInTheDocument();
  });

  it('exposes default no-op setters outside a scene', () => {
    render(<ReadTone />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/tone:carta/)).toBeInTheDocument();
    expect(screen.getByText(/soft:carta/)).toBeInTheDocument();
  });

  it('reads the tones published by the nearest SceneToneContext', () => {
    render(
      <SceneToneContext.Provider value={{ tone: 'notte', softTone: 'carta' }}>
        <Probe />
      </SceneToneContext.Provider>,
    );
    expect(screen.getByText(/tone:notte/)).toBeInTheDocument();
    expect(screen.getByText(/soft:carta/)).toBeInTheDocument();
  });
});
