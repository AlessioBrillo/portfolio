import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TonalScene } from '@/components/ascent/TonalScene';
import { TONE } from '@/lib/tone';

// The GSAP engine is exercised in useTonalEngine.test.ts; here we only assert
// the scene's rendering contract, so we stub the hook to keep GSAP out of jsdom.
vi.mock('@/components/ascent/useTonalEngine', () => ({
  useTonalEngine: vi.fn(),
}));

describe('TonalScene', () => {
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
    const backdrop = container.querySelector('.pointer-events-none.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveAttribute('aria-hidden');
    expect(backdrop).toHaveStyle({ backgroundColor: TONE.paper });
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
});
