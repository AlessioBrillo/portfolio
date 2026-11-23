import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '@/components/ui/Footer';
import { SITE } from '@/lib/site';

function renderFooter(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  it('renders the site name and tagline', () => {
    renderFooter();
    expect(screen.getByText(SITE.name)).toBeInTheDocument();
    expect(screen.getByText(SITE.tagline)).toBeInTheDocument();
  });

  it('renders the current year in the copyright line', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-11'));
    renderFooter();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('sits on the night surface with phosphor text', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toHaveClass('bg-night', 'text-phosphor');
  });

  it('links the public repository in a new tab with no referrer', () => {
    renderFooter();
    const github = screen.getByRole('link', { name: /github/i });
    expect(github).toHaveAttribute('href', SITE.githubUrl);
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noreferrer');
  });

  it('offers the resume-on-request hook via pre-filled mailto', () => {
    renderFooter();
    const resume = screen.getByRole('link', { name: /resume/i });
    expect(resume).toHaveAttribute('href', SITE.resumeUrl);
  });

  it('links both legal pages in a dedicated navigation', () => {
    renderFooter();
    const nav = screen.getByRole('navigation', { name: 'Legal links' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Legal' })).toHaveAttribute('href', '/legal');
  });
});
