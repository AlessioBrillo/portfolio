import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { router } from '@/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { mdxComponents } from '@/content/mdx-components';

export function App(): ReactElement {
  return (
    <ErrorBoundary>
      <MDXProvider components={mdxComponents}>
        <RouterProvider router={router} />
      </MDXProvider>
    </ErrorBoundary>
  );
}
