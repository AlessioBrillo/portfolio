import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from '@/pages/HomePage';

// Mock the lazy-loaded TonalScene to return the actual component synchronously in tests
vi.mock('@/components/ascent/TonalScene', () => ({
  TonalScene: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tonal-scene">{children}</div>
  ),
}));

function renderHome(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('mounts without throwing', () => {
    renderHome();
    // The Contact section (outside TonalScene) is always rendered
    expect(screen.getByRole('region', { name: 'Contact' })).toBeInTheDocument();
  });
});
