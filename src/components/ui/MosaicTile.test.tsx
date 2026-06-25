import { render, type RenderResult, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MosaicTile } from '@/components/ui/MosaicTile';
import type { MosaicEntry } from '@/types/domain';

function renderWithRouter(element: React.ReactElement): RenderResult {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

const linkedEntry: MosaicEntry = {
  id: 'ai-physics',
  title: 'AI & Physics',
  line: 'The serious core.',
  href: '/ai/test',
};

const plainEntry: MosaicEntry = {
  id: 'projects',
  title: 'Projects',
  line: 'Work and school.',
};

describe('MosaicTile', () => {
  it('renders the entry title', () => {
    renderWithRouter(<MosaicTile entry={linkedEntry} />);
    expect(screen.getByText('AI & Physics')).toBeInTheDocument();
  });

  it('renders the entry line', () => {
    renderWithRouter(<MosaicTile entry={plainEntry} />);
    expect(screen.getByText('Work and school.')).toBeInTheDocument();
  });

  it('wraps in a link when href is provided', () => {
    renderWithRouter(<MosaicTile entry={linkedEntry} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/ai/test');
  });

  it('does not render a link when href is missing', () => {
    renderWithRouter(<MosaicTile entry={plainEntry} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
