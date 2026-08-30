import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { ToneProvider } from '@/components/ascent/ToneProvider';
import { useSceneTone, useSceneToneSetter } from '@/components/ascent/tone-context';

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

describe('ToneProvider', () => {
  it('seeds children with the initial tone and defaults to carta', () => {
    render(
      <ToneProvider>
        <ReadTone />
      </ToneProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('tone:carta soft:carta');
  });

  it('honours an explicit initial tone', () => {
    render(
      <ToneProvider initialTone="notte">
        <ReadTone />
      </ToneProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('tone:notte soft:notte');
  });

  it('seeds the muted tone independently when requested', () => {
    render(
      <ToneProvider initialTone="notte" initialSoftTone="carta">
        <ReadTone />
      </ToneProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('tone:notte soft:carta');
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
      expect(button).toHaveTextContent('tone:notte soft:notte');
    }
  });
});
