import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { App } from '@/App';

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    matchMedia: vi.fn(() => ({ add: vi.fn() })),
    context: vi.fn(() => ({ revert: vi.fn() })),
    fromTo: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { create: vi.fn() },
}));

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

  it('boots the real router shell, MDX provider and error boundary', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
