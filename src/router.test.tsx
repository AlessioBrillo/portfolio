import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { router } from '@/router';
import { HomePage } from '@/pages/HomePage';
import { ArchivePage } from '@/pages/ArchivePage';
import { LegalPage } from '@/pages/LegalPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { CaseStudyPage } from '@/pages/CaseStudyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/** The component type of a route element, or `undefined` for non-element nodes. */
function elementType(node: ReactNode): unknown {
  return typeof node === 'object' && node !== null && 'type' in node ? node.type : undefined;
}

describe('router', () => {
  const layout = router.routes[0];

  it('wraps the six expected routes in the scroll-restoring layout', () => {
    expect(layout).toBeDefined();
    expect(layout!.children?.map((r) => r.path)).toEqual([
      '/',
      '/archive',
      '/privacy',
      '/legal',
      '/:domain/:slug',
      '*',
    ]);
  });

  it('maps the root to the single page', () => {
    expect(elementType(layout!.children?.[0]?.element)).toBe(HomePage);
  });

  it('maps the archive route to the archive page', () => {
    expect(elementType(layout!.children?.[1]?.element)).toBe(ArchivePage);
  });

  it('maps the legal routes to their pages, ahead of the dynamic route', () => {
    expect(elementType(layout!.children?.[2]?.element)).toBe(PrivacyPage);
    expect(elementType(layout!.children?.[3]?.element)).toBe(LegalPage);
  });

  it('maps the dynamic route to the case-study page', () => {
    expect(elementType(layout!.children?.[4]?.element)).toBe(CaseStudyPage);
  });

  it('maps the catch-all to the not-found page', () => {
    expect(elementType(layout!.children?.[5]?.element)).toBe(NotFoundPage);
  });

  it('renders the layout (ScrollRestoration + Outlet) inside a data router', () => {
    const memoryRouter = createMemoryRouter(
      [
        {
          element: layout!.element,
          children: [{ path: '*', element: <div data-testid="outlet-content" /> }],
        },
      ],
      { initialEntries: ['/'] },
    );
    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
  });
});
