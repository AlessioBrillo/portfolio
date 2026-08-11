import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AiPhysics } from '@/sections/AiPhysics';
import { CASE_STUDIES } from '@/content/case-studies/registry';

describe('AiPhysics', () => {
  it('renders one case-study card per AI entry in the registry', () => {
    render(
      <MemoryRouter>
        <AiPhysics />
      </MemoryRouter>,
    );
    const studies = Object.values(CASE_STUDIES).filter((entry) => entry.meta.domain === 'ai');
    expect(studies.length).toBeGreaterThan(0);
    for (const entry of studies) {
      expect(screen.getByRole('heading', { name: entry.meta.title })).toBeInTheDocument();
      expect(screen.getByText(entry.meta.summary)).toBeInTheDocument();
    }
  });

  it('links every card to its shareable case-study route', () => {
    render(
      <MemoryRouter>
        <AiPhysics />
      </MemoryRouter>,
    );
    const studies = Object.values(CASE_STUDIES).filter((entry) => entry.meta.domain === 'ai');
    for (const entry of studies) {
      const link = screen.getByRole('link', { name: new RegExp(entry.meta.title, 'i') });
      expect(link).toHaveAttribute('href', `/${entry.meta.domain}/${entry.meta.slug}`);
    }
  });
});
