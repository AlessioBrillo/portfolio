import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Experiences } from '@/sections/Experiences';
import { ToneProvider } from '@/components/ascent/ToneProvider';
import { getExperienceEntries } from '@/content/experiences';

function renderExperiences(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <Experiences />
    </MemoryRouter>,
  );
}

describe('Experiences', () => {
  it('renders every curated experience story', () => {
    renderExperiences();
    for (const entry of getExperienceEntries()) {
      expect(screen.getByRole('heading', { name: entry.title })).toBeInTheDocument();
      expect(screen.getByText(entry.line)).toBeInTheDocument();
    }
  });

  it('renders the year where the content module provides one', () => {
    renderExperiences();
    const withYear = getExperienceEntries().filter((entry) => entry.year);
    for (const entry of withYear) {
      expect(screen.getByText(entry.year as string)).toBeInTheDocument();
    }
  });

  it('links "dig deeper" to the archive route (ADR-0019)', () => {
    renderExperiences();
    expect(screen.getByRole('link', { name: 'Dig Deeper — The Archive' })).toHaveAttribute(
      'href',
      '/archive',
    );
  });

  it('uses the notte muted tone for stories when the scene is on notte', () => {
    render(
      <MemoryRouter>
        <ToneProvider initialTone="notte">
          <Experiences surface="scene" />
        </ToneProvider>
      </MemoryRouter>,
    );
    const entry = getExperienceEntries()[0];
    if (!entry) return;
    expect(screen.getByText(entry.line)).toHaveClass('text-panna-dim');
  });
});
