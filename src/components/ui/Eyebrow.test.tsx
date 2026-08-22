import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ToneProvider } from '@/components/ascent/ToneProvider';

describe('Eyebrow', () => {
  it('renders its content', () => {
    render(<Eyebrow>45.6306&deg; N</Eyebrow>);
    expect(screen.getByText(/45\.6306/)).toBeInTheDocument();
  });

  it('is mono, uppercase and letter-spaced by default', () => {
    render(<Eyebrow>Ground</Eyebrow>);
    const label = screen.getByText('Ground');
    expect(label).toHaveClass('font-mono', 'uppercase');
  });

  it('defaults to the light tone (ink-soft on paper)', () => {
    render(<Eyebrow>Ground</Eyebrow>);
    expect(screen.getByText('Ground')).toHaveClass('text-ink-soft');
  });

  it('uses the dark tone (phosphor-dim on night) when requested', () => {
    render(<Eyebrow tone="dark">Cruise</Eyebrow>);
    expect(screen.getByText('Cruise')).toHaveClass('text-phosphor-dim');
  });

  it('defaults to the dark tone when the scene is on night', () => {
    render(
      <ToneProvider initialTone="night">
        <Eyebrow>Cruise</Eyebrow>
      </ToneProvider>,
    );
    expect(screen.getByText('Cruise')).toHaveClass('text-phosphor-dim');
  });

  it('follows the muted tone when the scene splits body and soft tones (ADR-0012)', () => {
    render(
      <ToneProvider initialTone="night" initialSoftTone="paper">
        <Eyebrow>Blending</Eyebrow>
      </ToneProvider>,
    );
    expect(screen.getByText('Blending')).toHaveClass('text-ink-soft');
  });

  it('lets an explicit tone override the scene tone', () => {
    render(
      <ToneProvider initialTone="night" initialSoftTone="night">
        <Eyebrow tone="light">Ground</Eyebrow>
      </ToneProvider>,
    );
    expect(screen.getByText('Ground')).toHaveClass('text-ink-soft');
  });

  it('merges a custom className', () => {
    render(<Eyebrow className="shrink-0">Meta</Eyebrow>);
    expect(screen.getByText('Meta')).toHaveClass('shrink-0');
  });
});
