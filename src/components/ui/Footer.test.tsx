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

  it('links the public repository in a new tab with no referrer', () => {
    render(<Footer />);
    const github = screen.getByRole('link', { name: /github/i });
    expect(github).toHaveAttribute('href', SITE.githubUrl);
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noreferrer');
  });

  it('offers the resume-on-request hook via pre-filled mailto', () => {
    render(<Footer />);
    const resume = screen.getByRole('link', { name: /resume/i });
    expect(resume).toHaveAttribute('href', SITE.resumeUrl);
  });
});
