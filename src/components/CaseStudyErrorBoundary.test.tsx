import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CaseStudyErrorBoundary } from '@/components/CaseStudyErrorBoundary';

describe('CaseStudyErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <CaseStudyErrorBoundary>
        <div>Study content</div>
      </CaseStudyErrorBoundary>,
    );
    expect(screen.getByText('Study content')).toBeInTheDocument();
  });

  it('catches errors and shows the contained fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const Bomb = (): never => {
      throw new Error('Chunk load failed');
    };

    render(
      <CaseStudyErrorBoundary>
        <Bomb />
      </CaseStudyErrorBoundary>,
    );

    expect(screen.getByText('This case study failed to load.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it('recovers when the retry button is pressed', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    let fail = true;
    const Bomb = (): React.ReactElement => {
      if (fail) throw new Error('Chunk load failed');
      return <div>Recovered content</div>;
    };

    render(
      <CaseStudyErrorBoundary>
        <Bomb />
      </CaseStudyErrorBoundary>,
    );

    fail = false;
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText('Recovered content')).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
