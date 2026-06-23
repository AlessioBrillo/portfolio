import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Hero } from '@/sections/Hero';

describe('Hero', () => {
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
});
