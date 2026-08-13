import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { ToneProvider } from '@/components/ascent/ToneProvider';
import { useSceneTone } from '@/components/ascent/tone-context';

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

describe('ToneProvider', () => {
  it('seeds children with the initial tone and defaults to paper', () => {
    render(
      <ToneProvider>
        <ReadTone />
      </ToneProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('tone:paper soft:paper');
  });

  it('honours an explicit initial tone', () => {
    render(
      <ToneProvider initialTone="night">
        <ReadTone />
      </ToneProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('tone:night soft:night');
  });

  it('seeds the muted tone independently when requested', () => {
    render(
      <ToneProvider initialTone="night" initialSoftTone="paper">
        <ReadTone />
      </ToneProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('tone:night soft:paper');
  });

  it('publishes tone changes to all descendants', () => {
    render(
      <ToneProvider>
        <ReadTone />
        <ReadTone />
      </ToneProvider>,
    );
    screen.getAllByRole('button').forEach((button) => fireEvent.click(button));
    expect(screen.getAllByRole('button')).toHaveLength(2);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveTextContent('tone:night soft:night');
    }
  });
});
