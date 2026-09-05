import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionHeader } from '@/components/ui/SectionHeader';

describe('SectionHeader', () => {
  it('renders the eyebrow and the display heading', () => {
    render(<SectionHeader eyebrow="03 · AI & Physics" title="Where the thinking shows" />);
    expect(screen.getByText('[03 · AI & Physics]')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Where the thinking shows' }),
    ).toBeInTheDocument();
  });

  it('renders the intro when provided', () => {
    render(<SectionHeader eyebrow="01 · Who" title="Who" intro="Three statements, shown." />);
    expect(screen.getByText('Three statements, shown.')).toBeInTheDocument();
  });

  it('omits the intro when not provided', () => {
    render(<SectionHeader eyebrow="07 · Contact" title="Let's talk." />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('defaults the eyebrow to the light tone', () => {
    render(<SectionHeader eyebrow="Ground" title="Hero" />);
    expect(screen.getByText('[Ground]')).toHaveClass('text-ink-soft');
  });

  it('passes the dark tone to the eyebrow', () => {
    render(<SectionHeader eyebrow="Cruise" title="Night" tone="night" />);
    expect(screen.getByText('[Cruise]')).toHaveClass('text-phosphor-dim');
  });
});
