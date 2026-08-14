import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AiPhysics } from '@/sections/AiPhysics';
import { getPublishedCaseStudies } from '@/content/case-studies/registry';
import type { CaseStudyMeta } from '@/types/domain';

describe('AiPhysics', () => {
  const aiStudies = (): readonly CaseStudyMeta[] =>
    getPublishedCaseStudies().filter((meta) => meta.domain === 'ai');

  it('renders one case-study card per published AI study', () => {
    render(
      <MemoryRouter>
        <AiPhysics />
      </MemoryRouter>,
    );
    const studies = aiStudies();
    expect(studies.length).toBeGreaterThan(0);
    for (const meta of studies) {
      expect(screen.getByRole('heading', { name: meta.title })).toBeInTheDocument();
      expect(screen.getByText(meta.summary)).toBeInTheDocument();
    }
  });

  it('renders the studies in the curated published order', () => {
    render(
      <MemoryRouter>
        <AiPhysics />
      </MemoryRouter>,
    );
    const headings = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(aiStudies().map((meta) => meta.title));
  });

  it('links every card to its shareable case-study route', () => {
    render(
      <MemoryRouter>
        <AiPhysics />
      </MemoryRouter>,
    );
    for (const meta of aiStudies()) {
      const link = screen.getByRole('link', { name: new RegExp(meta.title, 'i') });
      expect(link).toHaveAttribute('href', `/${meta.domain}/${meta.slug}`);
    }
  });
});
