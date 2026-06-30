import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { router } from '@/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const MDX_COMPONENTS = {};

export function App(): ReactElement {
  return (
    <ErrorBoundary>
      <MDXProvider components={MDX_COMPONENTS}>
        <RouterProvider router={router} />
      </MDXProvider>
    </ErrorBoundary>
  );
}
