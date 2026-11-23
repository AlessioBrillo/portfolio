import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LegalPage } from '@/pages/LegalPage';
import { PrivacyPage } from '@/pages/PrivacyPage';

const mocks = vi.hoisted(() => ({
  SITE: { name: 'Alessio Brillo', email: 'alessio@ilcassero.it', siteUrl: '' },
  canonicalOrigin: vi.fn(() => ''),
}));

vi.mock('@/lib/site', () => mocks);

function renderPage(page: 'privacy' | 'legal'): ReturnType<typeof render> {
  return render(
    <MemoryRouter>{page === 'privacy' ? <PrivacyPage /> : <LegalPage />}</MemoryRouter>,
  );
}

describe('legal pages', () => {
  beforeEach(() => {
    mocks.canonicalOrigin.mockReturnValue('');
  });

  it.each([
    ['privacy', 'Privacy', '/privacy'],
    ['legal', 'Legal', '/legal'],
  ] as const)('%s renders the bilingual document and its own navigation', (page, title, path) => {
    renderPage(page);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Italiano' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Legal pages' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: title })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: title })).toHaveAttribute('href', path);
  });

  it('sets the document head without a canonical before the domain lands', () => {
    const { unmount } = renderPage('privacy');
    expect(document.title).toContain('Privacy');
    expect(document.querySelector('meta[name="description"]')).not.toBeNull();
    expect(document.querySelector('link[rel="canonical"]')).not.toBeInTheDocument();
    unmount();
    expect(document.title).not.toContain('Privacy');
  });

  it('emits a canonical URL once an origin is configured', () => {
    mocks.canonicalOrigin.mockReturnValue('https://example.com');
    renderPage('legal');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://example.com/legal',
    );
  });
});
