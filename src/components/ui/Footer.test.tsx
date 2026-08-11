import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '@/components/ui/Footer';
import { SITE } from '@/lib/site';

describe('Footer', () => {
  it('renders the site name and tagline', () => {
    render(<Footer />);
    expect(screen.getByText(SITE.name)).toBeInTheDocument();
    expect(screen.getByText(SITE.tagline)).toBeInTheDocument();
  });

  it('renders the current year in the copyright line', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-11'));
    render(<Footer />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('sits on the night surface with cream text', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toHaveClass('bg-night', 'text-cream');
  });
});
