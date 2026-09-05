import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { TonalScene } from '@/components/ascent/TonalScene';
import { useSceneTone, useSceneToneSetter } from '@/components/ascent/tone-context';
import { TONE } from '@/lib/tone';

// The GSAP engine is exercised in useTonalEngine.test.ts; here we only assert
// the scene's rendering contract, so we stub the hook to keep GSAP out of jsdom.
vi.mock('@/components/ascent/useTonalEngine', () => ({
  useTonalEngine: vi.fn(),
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

  it('renders a fixed, decorative backdrop seeded on the paper tone', () => {
    const { container } = render(
      <TonalScene>
        <span>content</span>
      </TonalScene>,
    );
    const backdrop = container.querySelector('.pointer-events-none.fixed.inset-0.-z-10');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveAttribute('aria-hidden');
    expect(backdrop).toHaveStyle({ backgroundColor: TONE.paper });
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

  it('publishes the scene tone to children without re-painting the GSAP-owned backdrop', () => {
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
    const backdrop = container.querySelector('.pointer-events-none.fixed.inset-0.-z-10');
    expect(backdrop).toHaveStyle({ backgroundColor: TONE.paper });
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
        detail: { message: 'GSAP failed', cause: new Error('test'), stack: 'stack' },
      }),
    );

    // The error boundary toast should be rendered
    await waitFor(() => {
      expect(screen.getByText('Animation unavailable — static view active')).toBeInTheDocument();
    });
  });

  it('renders scanlines hidden when prefers-reduced-motion is true', () => {
    // Mock prefersReducedMotion to return true
    vi.mocked(useReducedMotion).mockReturnValue(true);

    render(
      <TonalScene>
        <span>content</span>
      </TonalScene>,
    );

    // The scanline layer should have display: none
    const scanlineLayer = document.querySelector('.pointer-events-none.fixed.inset-0.-z-4');
    expect(scanlineLayer).toHaveStyle({ display: 'none' });
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

    // Constellation layer should be visible (not display: none)
    const constellationLayer = document.querySelector('.pointer-events-none.fixed.inset-0.-z-3');
    expect(constellationLayer).not.toHaveStyle({ display: 'none' });
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

    // Constellation layer should be hidden when reduced motion
    const constellationLayer = document.querySelector('.pointer-events-none.fixed.inset-0.-z-3');
    expect(constellationLayer).toHaveStyle({ display: 'none' });
  });

  it('hides constellation on ArrowUp when tone is not night', () => {
    // Tone stays at paper (default)
    render(
      <TonalScene>
        <ToneProbe />
      </TonalScene>,
    );

    fireEvent.keyDown(window, { key: 'ArrowUp' });

    // Constellation layer should be hidden when tone is not night
    const constellationLayer = document.querySelector('.pointer-events-none.fixed.inset-0.-z-3');
    expect(constellationLayer).toHaveStyle({ display: 'none' });
  });
});
