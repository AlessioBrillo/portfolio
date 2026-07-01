import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '@/components/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <div>Safe content</div>
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('catches errors and displays fallback UI', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const Bomb = (): never => {
      throw new Error('Boom');
    };

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to ground/i })).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
