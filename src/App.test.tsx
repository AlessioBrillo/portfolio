import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

describe('App', () => {
  it('renders without crashing', () => {
    const router = createMemoryRouter([
      { path: '/', element: <div data-testid="mock-page">Home</div> },
    ]);
    render(
      <ErrorBoundary>
        <MDXProvider components={{}}>
          <RouterProvider router={router} />
        </MDXProvider>
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('mock-page')).toBeInTheDocument();
  });
});
