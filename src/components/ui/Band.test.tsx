import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Band } from '@/components/ui/Band';
import { ToneProvider } from '@/components/ascent/ToneProvider';
import { useSceneTone, useSceneToneSetter } from '@/components/ascent/tone-context';
import type { ReactElement } from 'react';
import type { SectionId } from '@/types/domain';

describe('Band', () => {
  it('renders with the given id and aria-label', () => {
    render(
      <Band id="hero" ariaLabel="Introduction">
        content
      </Band>,
    );
    const section = screen.getByRole('region', { name: 'Introduction' });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'hero');
  });

  const testId: SectionId = 'hero';

  it('renders children', () => {
    render(
      <Band id={testId} ariaLabel="Test">
        <span>hello</span>
      </Band>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies ink text colour on carta tone (default)', () => {
    render(
      <Band id={testId} ariaLabel="Test">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('text-ink');
  });

  it('applies panna text colour on notte tone', () => {
    render(
      <Band id={testId} ariaLabel="Test" tone="notte">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('text-panna');
  });

  it('applies carta background with solid surface (default)', () => {
    render(
      <Band id={testId} ariaLabel="Test">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('bg-carta');
  });

  it('applies notte background with solid surface and notte tone', () => {
    render(
      <Band id={testId} ariaLabel="Test" tone="notte">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('bg-notte');
  });

  it('applies transparent background with scene surface', () => {
    render(
      <Band id={testId} ariaLabel="Test" surface="scene">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('bg-transparent');
  });

  it('applies scroll margin for anchor navigation', () => {
    render(
      <Band id={testId} ariaLabel="Test">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('scroll-mt-16');
  });

  it('derives text colour from the live scene tone when transparent', () => {
    render(
      <ToneProvider>
        <Band id={testId} ariaLabel="Test" surface="scene">
          content
        </Band>
      </ToneProvider>,
    );
    expect(screen.getByRole('region')).toHaveClass('text-ink');
  });

  it('flips to panna text on a notte scene tone', () => {
    render(
      <ToneProvider initialTone="notte">
        <Band id={testId} ariaLabel="Test" surface="scene">
          content
        </Band>
      </ToneProvider>,
    );
    expect(screen.getByRole('region')).toHaveClass('text-panna');
  });

  it('reacts to scene tone changes published by the tonal engine', () => {
    function ToneProbe(): ReactElement {
      const { tone } = useSceneTone();
      const { setTone } = useSceneToneSetter();
      return (
        <button type="button" onClick={() => setTone('notte')}>
          probe:{tone}
        </button>
      );
    }

    render(
      <ToneProvider>
        <Band id={testId} ariaLabel="Test" surface="scene">
          content
        </Band>
        <ToneProbe />
      </ToneProvider>,
    );

    expect(screen.getByRole('region')).toHaveClass('text-ink');
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('region')).toHaveClass('text-panna');
  });

  it('keeps its own tone prop for solid surfaces, ignoring the scene tone', () => {
    render(
      <ToneProvider initialTone="notte">
        <Band id={testId} ariaLabel="Test" tone="carta">
          content
        </Band>
      </ToneProvider>,
    );
    expect(screen.getByRole('region')).toHaveClass('text-ink');
    expect(screen.getByRole('region')).toHaveClass('bg-carta');
  });
});
