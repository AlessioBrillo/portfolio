import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomePage } from '@/pages/HomePage';

function renderHome(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('mounts the full Phase-2 tree, including the tonal scene, without throwing', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: 'Alessio Brillo' })).toBeInTheDocument();
  });

  it('renders the ground -> cruise sections wrapped by the tonal scene', () => {
    renderHome();
    // The cruise section (ai-physics) is the destination of the first crossfade.
    expect(screen.getByRole('region', { name: /ai and physics/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /the mosaic/i })).toBeInTheDocument();
  });
});
