import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { SCENE_SOFT_TEXT, SceneToneContext, useSceneTone } from '@/components/ascent/tone-context';

function Probe(): ReactElement {
  const { tone } = useSceneTone();
  return <span>tone:{tone}</span>;
}

function ReadTone(): ReactElement {
  const { tone, setTone } = useSceneTone();
  return (
    <button type="button" onClick={() => setTone('night')}>
      tone:{tone}
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
    expect(screen.getByText('tone:paper')).toBeInTheDocument();
  });

  it('exposes a default no-op setTone outside a scene', () => {
    render(<ReadTone />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('tone:paper')).toBeInTheDocument();
  });

  it('reads the tone published by the nearest SceneToneContext', () => {
    render(
      <SceneToneContext.Provider value={{ tone: 'night', setTone: () => undefined }}>
        <Probe />
      </SceneToneContext.Provider>,
    );
    expect(screen.getByText('tone:night')).toBeInTheDocument();
  });
});
