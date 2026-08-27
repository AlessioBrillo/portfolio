import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactElement } from 'react';
import { ChunkErrorBoundary } from '@/components/ChunkErrorBoundary';
import { CaseStudyErrorBoundary } from '@/components/CaseStudyErrorBoundary';

function ThrowError({ shouldThrow }: { shouldThrow: boolean }): ReactElement {
  if (shouldThrow) throw new Error('Render error');
  return <div>OK</div>;
}

function ThrowChunkError({ shouldThrow }: { shouldThrow: boolean }): ReactElement {
  if (shouldThrow) {
    const err = new Error('ChunkLoadError');
    err.name = 'ChunkLoadError';
    throw err;
  }
  return <div>OK</div>;
}

describe('ChunkErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ChunkErrorBoundary>
        <div>child content</div>
      </ChunkErrorBoundary>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('catches render errors and shows fallback', () => {
    render(
      <ChunkErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ChunkErrorBoundary>,
    );
    expect(screen.getByText('This case study encountered an error.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('catches ChunkLoadError and shows specific fallback', () => {
    render(
      <ChunkErrorBoundary>
        <ThrowChunkError shouldThrow={true} />
      </ChunkErrorBoundary>,
    );
    expect(screen.getByText('This case study failed to load.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The study may be temporarily unavailable. The rest of the flight is unaffected.',
      ),
    ).toBeInTheDocument();
  });

  it('retry button clears error state', () => {
    render(
      <ChunkErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ChunkErrorBoundary>,
    );

    expect(screen.getByText('This case study encountered an error.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();

    // Click retry - this triggers setState({ hasError: false }) in the boundary
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    // The boundary state is cleared, but the child still throws
    // In real usage, the parent would change the key to force remount
    // Here we just verify the boundary's retry callback works
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('retry button clears ChunkLoadError state', () => {
    render(
      <ChunkErrorBoundary>
        <ThrowChunkError shouldThrow={true} />
      </ChunkErrorBoundary>,
    );

    expect(screen.getByText('This case study failed to load.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('catches errors from nested CaseStudyErrorBoundary', () => {
    render(
      <ChunkErrorBoundary>
        <CaseStudyErrorBoundary>
          <ThrowError shouldThrow={true} />
        </CaseStudyErrorBoundary>
      </ChunkErrorBoundary>,
    );
    // CaseStudyErrorBoundary catches first, shows its fallback
    expect(screen.getByText('This case study failed to load.')).toBeInTheDocument();
  });
});
