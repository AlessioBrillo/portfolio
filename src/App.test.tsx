import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { App } from '@/App';

vi.mock('@/lib/gsap-loader', () => ({
  loadGsap: vi.fn().mockResolvedValue({
    gsap: {
      registerPlugin: vi.fn(),
      matchMedia: vi.fn(() => ({ add: vi.fn() })),
      context: vi.fn(() => ({ revert: vi.fn() })),
      fromTo: vi.fn(),
      set: vi.fn(),
    },
    ScrollTrigger: { create: vi.fn() },
  }),
}));

// Mock the lazy-loaded TonalScene to return the actual component synchronously in tests
vi.mock('@/components/ascent/TonalScene', () => ({
  TonalScene: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tonal-scene">{children}</div>
  ),
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

  it('boots the real router shell, MDX provider and error boundary', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});
