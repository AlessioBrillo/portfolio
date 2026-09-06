import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { NotFoundPage } from '@/pages/NotFoundPage';

describe('NotFoundPage', () => {
  it('renders the 404 eyebrow', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders "Lost altitude." as the heading', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Lost altitude.')).toBeInTheDocument();
  });

  it('provides a link back to the home page', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /return to ground/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('marks the page noindex (the SPA fallback serves unknown routes as 200)', () => {
    const { unmount } = render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    unmount();
  });
});
