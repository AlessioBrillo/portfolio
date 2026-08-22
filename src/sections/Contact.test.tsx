import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Contact } from '@/sections/Contact';
import { SITE } from '@/lib/site';

describe('Contact', () => {
  it('renders the closing invitation', () => {
    render(<Contact />);
    expect(screen.getByRole('region', { name: /contact/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'LANDING PROTOCOL: ESTABLISH COMMUNICATIONS' }),
    ).toBeInTheDocument();
  });

  it('links the primary CTA to the public email address', () => {
    render(<Contact />);
    const emailLink = screen.getByRole('link', { name: 'EMAIL ME' });
    expect(emailLink).toHaveAttribute('href', `mailto:${SITE.email}`);
  });

  it('links the ghost link to the LinkedIn profile in a new tab', () => {
    render(<Contact />);
    const linkedin = screen.getByRole('link', { name: 'LINKEDIN' });
    expect(linkedin).toHaveAttribute('href', SITE.linkedinUrl);
    expect(linkedin).toHaveAttribute('target', '_blank');
  });
});
