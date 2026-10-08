import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '@/components/ui/Footer';

// The slot is empty in the committed site; this file exercises the branch that
// goes live the day a resume PDF is published (ADR-0028).
vi.mock('@/lib/site', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  resumeLink: () => ({ href: '/cv/alessio-brillo-cv.pdf', label: 'Resume — PDF', isFile: true }),
}));

describe('Footer with a published resume PDF', () => {
  it('opens the file in a new tab with no referrer', () => {
    render(<Footer />);
    const resume = screen.getByRole('link', { name: /resume/i });
    expect(resume).toHaveAttribute('href', '/cv/alessio-brillo-cv.pdf');
    expect(resume).toHaveTextContent('Resume — PDF');
    expect(resume).toHaveAttribute('target', '_blank');
    expect(resume).toHaveAttribute('rel', 'noreferrer');
  });
});
