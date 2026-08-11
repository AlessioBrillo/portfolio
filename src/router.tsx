import type { ReactElement } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { CaseStudyPage } from '@/pages/CaseStudyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Case studies are shareable, indexable routes (`/{domain}/{slug}`) rather than
 * overlays — see ADR-0005. The single page itself lives at the root.
 *
 * The layout route hosts the data router's `ScrollRestoration`: new
 * navigations land at the top of the page, and the back button returns to the
 * exact scroll position on the single page (ADR-0005's premise, covered by
 * `e2e/case-study.e2e.ts`) — deterministic behaviour instead of whatever the
 * browser happens to do with `history.scrollRestoration`.
 */
function RootLayout(): ReactElement {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/:domain/:slug', element: <CaseStudyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
