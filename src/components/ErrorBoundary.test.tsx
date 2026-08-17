import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
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
    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i);

    vi.restoreAllMocks();
  });

  it('recovers to the children after returning to ground', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let armed = true;
    const Bomb = (): ReactElement => {
      if (armed) throw new Error('Boom');
      return <div>Recovered content</div>;
    };

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    // React 19 re-renders the root once while recovering from the throw, so
    // the bomb stays armed until the fallback is on screen.
    armed = false;
    fireEvent.click(screen.getByRole('link', { name: /return to ground/i }));

    expect(screen.getByText('Recovered content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
