import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Experiences } from '@/sections/Experiences';
import { ToneProvider } from '@/components/ascent/ToneProvider';
import { getExperienceEntries } from '@/content/experiences';

describe('Experiences', () => {
  it('renders every curated experience story', () => {
    render(<Experiences />);
    for (const entry of getExperienceEntries()) {
      expect(screen.getByRole('heading', { name: entry.title })).toBeInTheDocument();
      expect(screen.getByText(entry.line)).toBeInTheDocument();
    }
  });

  it('renders the year where the content module provides one', () => {
    render(<Experiences />);
    const withYear = getExperienceEntries().filter((entry) => entry.year);
    for (const entry of withYear) {
      expect(screen.getByText(entry.year as string)).toBeInTheDocument();
    }
  });

  it('uses the night muted tone for stories when the scene is on night', () => {
    render(
      <ToneProvider initialTone="night">
        <Experiences surface="scene" />
      </ToneProvider>,
    );
    const entry = getExperienceEntries()[0];
    if (!entry) return;
    expect(screen.getByText(entry.line)).toHaveClass('text-muted-dark');
  });
});
