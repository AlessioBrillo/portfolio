import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '@/sections/Hero';

const mockUseReducedMotion = vi.fn();

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: (...args: unknown[]) => mockUseReducedMotion(...args),
}));

describe('Hero', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it('renders the name as the page heading', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { name: 'Alessio Brillo' })).toBeInTheDocument();
  });

  it('renders the one-line manifesto', () => {
    render(<Hero />);
    expect(screen.getByText(/student of ai and physics/i)).toBeInTheDocument();
  });

  it('renders the mono eyebrow with real VDS coordinates', () => {
    render(<Hero />);
    expect(screen.getByText(/45\.6306.*8\.7281.*VDS/i)).toBeInTheDocument();
  });

  it('skips the entrance animation under reduced motion (ADR-0009)', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { container } = render(<Hero />);
    expect(container.querySelector('h1')).not.toHaveStyle({ opacity: '0' });
  });
});
