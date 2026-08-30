import { render, type RenderResult, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EntryCard } from '@/components/ui/EntryCard';
import { ToneProvider } from '@/components/ascent/ToneProvider';

function renderWithRouter(element: React.ReactElement): RenderResult {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe('EntryCard', () => {
  const base = { title: 'The Ascent', line: 'A scroll-driven flight.' };

  it('renders title, line and optional meta', () => {
    renderWithRouter(<EntryCard {...base} meta="2026" />);
    expect(screen.getByRole('heading', { name: 'The Ascent' })).toBeInTheDocument();
    expect(screen.getByText('A scroll-driven flight.')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('wraps in a link when href is provided', () => {
    renderWithRouter(<EntryCard {...base} href="/ai/transformer-italian-corpus" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/ai/transformer-italian-corpus');
    expect(link).toContainElement(screen.getByRole('heading', { name: 'The Ascent' }));
  });

  it('keeps the heading inside the link so the link has an accessible name', () => {
    renderWithRouter(<EntryCard {...base} href="/ai/test" />);
    expect(screen.getByRole('link')).toContainElement(
      screen.getByRole('heading', { name: 'The Ascent' }),
    );
  });

  it('does not render a link when href is missing', () => {
    renderWithRouter(<EntryCard {...base} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('omits the meta line when not provided', () => {
    renderWithRouter(<EntryCard {...base} />);
    expect(screen.queryByText('2026')).not.toBeInTheDocument();
  });

  it('defaults to the light copy tone outside a night scene', () => {
    renderWithRouter(<EntryCard {...base} meta="2026" />);
    expect(screen.getByText(base.line)).toHaveClass('text-ink-soft');
  });

  it('defaults to the dark copy tone when the scene is on notte (ADR-0011)', () => {
    render(
      <ToneProvider initialTone="notte">
        <MemoryRouter>
          <EntryCard {...base} meta="2026" />
        </MemoryRouter>
      </ToneProvider>,
    );
    expect(screen.getByText(base.line)).toHaveClass('text-panna-dim');
  });

  it('lets an explicit tone override the scene tone', () => {
    renderWithRouter(<EntryCard {...base} tone="dark" />);
    expect(screen.getByText(base.line)).toHaveClass('text-panna-dim');
  });
});
