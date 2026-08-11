import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkySport } from '@/sections/SkySport';
import { ToneProvider } from '@/components/ascent/ToneProvider';
import { getSportEntries } from '@/content/sky';

describe('SkySport', () => {
  it('renders every sport entry with its photo alt text', () => {
    render(<SkySport />);
    for (const entry of getSportEntries()) {
      expect(screen.getByRole('heading', { name: entry.title })).toBeInTheDocument();
      expect(screen.getByText(entry.line)).toBeInTheDocument();
      expect(screen.getByText(entry.image.alt)).toBeInTheDocument();
    }
  });

  it('renders captions only where the content module provides them', () => {
    render(<SkySport />);
    const withCaption = getSportEntries().filter((entry) => entry.image.caption);
    const withoutCaption = getSportEntries().filter((entry) => !entry.image.caption);
    for (const entry of withCaption) {
      expect(screen.getByText(entry.image.caption as string)).toBeInTheDocument();
    }
    for (const entry of withoutCaption) {
      const caption = entry.image.caption;
      if (caption) continue;
      expect(screen.queryByText(entry.image.alt)).toBeInTheDocument();
    }
  });

  it('uses the night muted tone for entry lines when the scene is on night', () => {
    render(
      <ToneProvider initialTone="night">
        <SkySport surface="scene" />
      </ToneProvider>,
    );
    const entry = getSportEntries()[0];
    if (!entry) return;
    expect(screen.getByText(entry.line)).toHaveClass('text-muted-dark');
  });
});
