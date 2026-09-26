import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { TonalScene } from '@/components/ascent/TonalScene';
import { useSceneTone, useSceneToneSetter } from '@/components/ascent/tone-context';
import { TONE } from '@/lib/tone';

// The tonal engine is now native CSS Scroll-driven Animations; we stub the hook
// to keep browser APIs out of jsdom.
vi.mock('@/hooks/useSceneTonePublisher', () => ({
  useSceneTonePublisher: vi.fn(),
}));

// useReducedMotion is mocked at top level; tests control its return value
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

import { useReducedMotion } from '@/hooks/useReducedMotion';

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
    // The backdrop should NOT have a React-driven backgroundColor inline style
    // (it's painted by CSS). In jsdom without CSS, we just verify the class is present.
    expect(backdrop).not.toHaveStyle({ backgroundColor: TONE.paper });
  });

  it('handles tonal engine error event and sets error state', async () => {
    render(
      <TonalScene>
        <span>content</span>
      </TonalScene>,
    );

    // Dispatch the tonal-engine-error event to trigger the error handler
    window.dispatchEvent(
      new CustomEvent('tonal-engine-error', {
        detail: { message: 'Engine failed', cause: new Error('test'), stack: 'stack' },
      }),
    );

    // The error boundary toast should be rendered
    await waitFor(() => {
      expect(screen.getByText('Animation unavailable — static view active')).toBeInTheDocument();
    });
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
});
