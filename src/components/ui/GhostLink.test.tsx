import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GhostLink } from '@/components/ui/GhostLink';

describe('GhostLink', () => {
  it('renders an anchor with the given href and children', () => {
    render(
      <GhostLink href="https://example.com" target="_blank" rel="noreferrer">
        LinkedIn
      </GhostLink>,
    );
    const link = screen.getByRole('link', { name: 'LinkedIn' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('inherits the surrounding text colour and draws the orange underline on hover', () => {
    render(<GhostLink href="#contact">Contact</GhostLink>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('text-current', 'no-underline');
    expect(link).toHaveClass('after:bg-orange');
    expect(link).toHaveClass('hover:after:scale-x-100');
  });

  it('merges a custom className', () => {
    render(
      <GhostLink href="#x" className="mt-4">
        Link
      </GhostLink>,
    );
    expect(screen.getByRole('link')).toHaveClass('mt-4');
  });
});
