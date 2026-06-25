import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Band } from '@/components/ui/Band';
import type { SectionId } from '@/types/domain';

describe('Band', () => {
  it('renders with the given id and aria-label', () => {
    render(
      <Band id="hero" ariaLabel="Introduction">
        content
      </Band>,
    );
    const section = screen.getByRole('region', { name: 'Introduction' });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'hero');
  });

  const testId: SectionId = 'hero';

  it('renders children', () => {
    render(
      <Band id={testId} ariaLabel="Test">
        <span>hello</span>
      </Band>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies ink text colour on paper tone (default)', () => {
    render(
      <Band id={testId} ariaLabel="Test">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('text-ink');
  });

  it('applies cream text colour on night tone', () => {
    render(
      <Band id={testId} ariaLabel="Test" tone="night">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('text-cream');
  });

  it('applies paper background with solid surface (default)', () => {
    render(
      <Band id={testId} ariaLabel="Test">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('bg-paper');
  });

  it('applies night background with solid surface and night tone', () => {
    render(
      <Band id={testId} ariaLabel="Test" tone="night">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('bg-night');
  });

  it('applies transparent background with scene surface', () => {
    render(
      <Band id={testId} ariaLabel="Test" surface="scene">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('bg-transparent');
  });

  it('applies scroll margin for anchor navigation', () => {
    render(
      <Band id={testId} ariaLabel="Test">
        content
      </Band>,
    );
    expect(screen.getByRole('region')).toHaveClass('scroll-mt-16');
  });
});
