import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { TonalScene } from '@/components/ascent/TonalScene';
import { useSceneTone, useSceneToneSetter } from '@/components/ascent/tone-context';
import { TONE } from '@/lib/tone';

// The tonal engine reads live layout and writes the backdrop colour (ADR-0026);
// stub the hook to keep scroll geometry out of jsdom.
vi.mock('@/hooks/useSceneTonePublisher', () => ({
  useSceneTonePublisher: vi.fn(),
}));

// useReducedMotion is mocked at top level; tests control its return value
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('@/hooks/useForcedColors', () => ({
  useForcedColors: vi.fn(() => false),
}));

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useForcedColors } from '@/hooks/useForcedColors';

function ToneProbe(): ReactElement {
  const { tone } = useSceneTone();
  const { setTone } = useSceneToneSetter();
  return (
    <button type="button" onClick={() => setTone('night')}>
      tone:{tone}
    </button>
  );
}

describe('TonalScene', () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    vi.mocked(useForcedColors).mockReturnValue(false);
  });
  it('renders children', () => {
    render(
      <TonalScene>
        <span>inside the scene</span>
      </TonalScene>,
    );
    expect(screen.getByText('inside the scene')).toBeInTheDocument();
  });

  it('renders a fixed, decorative backdrop with flight-backdrop class', () => {
    const { container } = render(
      <TonalScene>
        <span>content</span>
      </TonalScene>,
    );
    const backdrop = container.querySelector('.flight-backdrop');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveAttribute('aria-hidden');
    expect(backdrop).toHaveClass('flight-backdrop');
    expect(backdrop).toHaveClass('pointer-events-none');
    expect(backdrop).toHaveClass('fixed');
    expect(backdrop).toHaveClass('inset-0');
    expect(backdrop).toHaveClass('-z-10');
  });

  it('paints the backdrop below all page content (negative z, no wrapper stacking context)', () => {
    const { container } = render(
      <TonalScene>
        <span>content</span>
      </TonalScene>,
    );
    // The backdrop's z-index resolves against the root stacking context (the
    // scene's wrapper divs are z-auto and create no context), so a negative
    // value paints it above the body background but below every in-flow
    // element -- solid bands outside the scene (Contact, Footer) must be able
    // to cover it. A z-0 backdrop would paint above static siblings and
    // silently cover the night landing (gated in e2e by pixel sampling).
    const backdrop = container.querySelector('.pointer-events-none.fixed.inset-0');
    expect(backdrop).toHaveClass('-z-10');
  });

  it('shows children above the backdrop in the z-stack', () => {
    render(
      <TonalScene>
        <span>front content</span>
      </TonalScene>,
    );
    const content = screen.getByText('front content');
    const parent = content.closest('.relative');
    expect(parent).toHaveClass('z-10');
  });

  it('publishes the scene tone to children without re-painting the CSS-owned backdrop', () => {
    const { container } = render(
      <TonalScene>
        <ToneProbe />
      </TonalScene>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('tone:paper');
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('tone:night');

    // React owns the seed colour only; the engine paints the backdrop after
    // mount, so a state flip must never snap it back to a React-driven value.
    const backdrop = container.querySelector('.flight-backdrop');
    expect(backdrop).toHaveClass('flight-backdrop');
    // The backdrop should NOT have a React-driven backgroundColor inline style:
    // the engine owns it after mount.
    expect(backdrop).not.toHaveStyle({ backgroundColor: TONE.paper });
  });

  it('renders scanlines with flight-scanlines class (hidden by default CSS)', () => {
    const { container } = render(
      <TonalScene>
        <span>content</span>
      </TonalScene>,
    );

    const scanlineLayer = container.querySelector('.flight-scanlines');
    expect(scanlineLayer).toBeInTheDocument();
    expect(scanlineLayer).toHaveClass('flight-scanlines');
    expect(scanlineLayer).toHaveClass('pointer-events-none');
    expect(scanlineLayer).toHaveClass('fixed');
    expect(scanlineLayer).toHaveClass('inset-0');
    expect(scanlineLayer).toHaveClass('-z-4');
  });

  it('renders scanlines hidden when prefers-reduced-motion is true (CSS handles display)', () => {
    // Mock prefersReducedMotion to return true
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const { container } = render(
      <TonalScene>
        <span>content</span>
      </TonalScene>,
    );

    // The scanline layer should have the base class (CSS handles display: none via media query)
    // In jsdom, we verify the class is present and the active modifier class is absent
    const scanlineLayer = container.querySelector('.flight-scanlines');
    expect(scanlineLayer).toBeInTheDocument();
    expect(scanlineLayer).toHaveClass('flight-scanlines');
    // When reduced motion, the --active modifier class should NOT be present
    expect(scanlineLayer).not.toHaveClass('flight-scanlines--active');
  });

  it('shows constellation on ArrowUp keydown when tone is night and reduced motion is false', async () => {
    // Set tone to night via setter
    render(
      <TonalScene>
        <ToneProbe />
      </TonalScene>,
    );

    // Set tone to night
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('tone:night');

    // Press ArrowUp key
    fireEvent.keyDown(window, { key: 'ArrowUp' });

    // Constellation layer should be visible (has --visible modifier class)
    const constellationLayer = document.querySelector('.flight-constellation');
    expect(constellationLayer).toBeInTheDocument();
    expect(constellationLayer).toHaveClass('flight-constellation--visible');
  });

  it('hides constellation on ArrowUp when prefers-reduced-motion is true', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    render(
      <TonalScene>
        <ToneProbe />
      </TonalScene>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('tone:night');

    fireEvent.keyDown(window, { key: 'ArrowUp' });

    // Constellation layer should be hidden (no --visible modifier class)
    const constellationLayer = document.querySelector('.flight-constellation');
    expect(constellationLayer).toBeInTheDocument();
    expect(constellationLayer).not.toHaveClass('flight-constellation--visible');
  });

  it('hides constellation on ArrowUp when tone is not night', () => {
    // Tone stays at paper (default)
    render(
      <TonalScene>
        <ToneProbe />
      </TonalScene>,
    );

    fireEvent.keyDown(window, { key: 'ArrowUp' });

    // Constellation layer should be hidden (no --visible modifier class)
    const constellationLayer = document.querySelector('.flight-constellation');
    expect(constellationLayer).toBeInTheDocument();
    expect(constellationLayer).not.toHaveClass('flight-constellation--visible');
  });

  it('keeps scanlines off under forced colors even on night', () => {
    vi.mocked(useForcedColors).mockReturnValue(true);
    const { container } = render(
      <TonalScene>
        <ToneProbe />
      </TonalScene>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(container.querySelector('.flight-scanlines')).not.toHaveClass(
      'flight-scanlines--active',
    );
  });

  it.each([
    ['motion is reduced', () => vi.mocked(useReducedMotion).mockReturnValue(true)],
    ['forced colors turn on', () => vi.mocked(useForcedColors).mockReturnValue(true)],
  ])('hides a visible constellation when %s', (_label, change) => {
    const scene = (): ReactElement => (
      <TonalScene>
        <ToneProbe />
      </TonalScene>
    );
    const { rerender } = render(scene());
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    const layer = document.querySelector<HTMLElement>('.flight-constellation')!;
    expect(layer).toHaveStyle({ display: 'block' });

    change();
    rerender(scene());
    expect(layer).toHaveStyle({ display: 'none' });
  });
});
