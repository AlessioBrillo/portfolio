import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PullQuote } from '@/components/ui/PullQuote';

describe('PullQuote', () => {
  it('renders children', () => {
    render(<PullQuote>Memorable insight</PullQuote>);
    expect(screen.getByText('Memorable insight')).toBeInTheDocument();
  });

  it('renders citation when provided', () => {
    render(<PullQuote cite="A. Author">Quote</PullQuote>);
    expect(screen.getByText('A. Author')).toBeInTheDocument();
  });

  it('does not render citation when omitted', () => {
    const { container } = render(<PullQuote>Quote</PullQuote>);
    expect(container.querySelector('cite')).not.toBeInTheDocument();
  });
});
