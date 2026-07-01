import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CaseStudyPage } from '@/pages/CaseStudyPage';

vi.mock('@/content/case-studies/registry', () => ({
  getCaseStudy: vi.fn((slug: string) => {
    if (slug === 'test-study') {
      return {
        meta: {
          slug: 'test-study',
          domain: 'ai',
          title: 'Test Study',
          role: 'Researcher',
          year: '2025',
          stack: ['Python'],
          summary: 'A test study',
        },
        load: () => Promise.resolve({ default: () => <div data-testid="body">Study content</div> }),
      };
    }
    return undefined;
  }),
}));

describe('CaseStudyPage', () => {
  it('shows NotFoundPage for unknown slug', () => {
    render(
      <MemoryRouter initialEntries={['/ai/unknown']}>
        <Routes>
          <Route path="/:domain/:slug" element={<CaseStudyPage />} />
          <Route path="*" element={<div />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Lost altitude.')).toBeInTheDocument();
  });

  it('renders case study content for known slug', async () => {
    render(
      <MemoryRouter initialEntries={['/ai/test-study']}>
        <Routes>
          <Route path="/:domain/:slug" element={<CaseStudyPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('body')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test Study' })).toBeInTheDocument();
  });
});
