import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { SCENE_SOFT_TEXT, SceneToneContext, useSceneTone } from '@/components/ascent/tone-context';

function Probe(): ReactElement {
  const { tone, softTone } = useSceneTone();
  return (
    <span>
      tone:{tone} soft:{softTone}
    </span>
  );
}

function ReadTone(): ReactElement {
  const { tone, setTone, softTone, setSoftTone } = useSceneTone();
  return (
    <button
      type="button"
      onClick={() => {
        setTone('night');
        setSoftTone('night');
      }}
    >
      tone:{tone} soft:{softTone}
    </button>
  );
}

describe('SCENE_SOFT_TEXT', () => {
  it('maps each tone to an AA-soft text utility class (ADR-0011)', () => {
    expect(SCENE_SOFT_TEXT.paper).toBe('text-ink-soft');
    expect(SCENE_SOFT_TEXT.night).toBe('text-muted-dark');
    expect(SCENE_SOFT_TEXT.paper).not.toBe(SCENE_SOFT_TEXT.night);
  });
});

describe('useSceneTone', () => {
  it('falls back to the paper default when no scene is mounted', () => {
    render(<Probe />);
    expect(screen.getByText(/tone:paper/)).toBeInTheDocument();
    expect(screen.getByText(/soft:paper/)).toBeInTheDocument();
  });

  it('exposes default no-op setters outside a scene', () => {
    render(<ReadTone />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/tone:paper/)).toBeInTheDocument();
    expect(screen.getByText(/soft:paper/)).toBeInTheDocument();
  });

  it('reads the tones published by the nearest SceneToneContext', () => {
    render(
      <SceneToneContext.Provider
        value={{
          tone: 'night',
          setTone: () => undefined,
          softTone: 'paper',
          setSoftTone: () => undefined,
        }}
      >
        <Probe />
      </SceneToneContext.Provider>,
    );
    expect(screen.getByText(/tone:night/)).toBeInTheDocument();
    expect(screen.getByText(/soft:paper/)).toBeInTheDocument();
  });
});
