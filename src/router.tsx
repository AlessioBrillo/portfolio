import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { CaseStudyPage } from '@/pages/CaseStudyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Case studies are shareable, indexable routes (`/{domain}/{slug}`) rather than
 * overlays — see ADR-0005. The single page itself lives at the root.
 */
export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/:domain/:slug', element: <CaseStudyPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
