import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CaseStudyPage } from '@/pages/CaseStudyPage';

const STUDIES = [
  {
    slug: 'first-study',
    domain: 'ai',
    title: 'First Study',
    role: 'Researcher',
    year: '2024',
    stack: ['Python'],
    summary: 'The first study',
  },
  {
    slug: 'test-study',
    domain: 'ai',
    title: 'Test Study',
    role: 'Researcher',
    year: '2025',
    stack: ['Python'],
    summary: 'A test study',
  },
  {
    slug: 'last-study',
    domain: 'sky',
    title: 'Last Study',
    role: 'Pilot',
    year: '2026',
    stack: ['Air'],
    summary: 'The last study',
  },
] as const;

vi.mock('@/content/case-studies/registry', () => ({
  getCaseStudy: vi.fn((slug: string) => {
    if (slug === 'draft-study') {
      return {
        meta: {
          slug: 'draft-study',
          domain: 'ai',
          title: 'Draft Study',
          role: 'TBD',
          year: '2026',
          stack: ['TBD'],
          summary: 'A registered but unpublished study',
        },
        load: () => Promise.resolve({ default: () => <div data-testid="body">Draft content</div> }),
      };
    }
    const found = STUDIES.find((study) => study.slug === slug);
    return found
      ? {
          meta: found,
          load: () =>
            Promise.resolve({ default: () => <div data-testid="body">Study content</div> }),
        }
      : undefined;
  }),
  getPublishedCaseStudies: vi.fn(() => [...STUDIES]),
  isPublishedStudy: vi.fn((slug: string) => slug !== 'draft-study'),
}));

function renderAt(path: string): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:domain/:slug" element={<CaseStudyPage />} />
        <Route path="*" element={<div />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CaseStudyPage', () => {
  it('shows NotFoundPage for unknown slug', () => {
    renderAt('/ai/unknown');
    expect(screen.getByText('Lost altitude.')).toBeInTheDocument();
  });

  it('renders case study content for known slug', async () => {
    renderAt('/ai/test-study');
    expect(await screen.findByTestId('body')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test Study' })).toBeInTheDocument();
  });

  it('rejects a known slug under the wrong domain', () => {
    renderAt('/work/test-study');
    expect(screen.getByText('Lost altitude.')).toBeInTheDocument();
    expect(screen.queryByTestId('body')).not.toBeInTheDocument();
  });

  it('links to the previous and next study for a middle study', async () => {
    renderAt('/ai/test-study');
    await screen.findByTestId('body');
    expect(screen.getByRole('link', { name: /Previous study\s*First Study/ })).toHaveAttribute(
      'href',
      '/ai/first-study',
    );
    expect(screen.getByRole('link', { name: /Next study\s*Last Study/ })).toHaveAttribute(
      'href',
      '/sky/last-study',
    );
  });

  it('hides the previous link on the first study', async () => {
    renderAt('/ai/first-study');
    await screen.findByTestId('body');
    expect(screen.queryByRole('link', { name: /Previous study/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Next study\s*Test Study/ })).toBeInTheDocument();
  });

  it('hides the next link on the last study', async () => {
    renderAt('/sky/last-study');
    await screen.findByTestId('body');
    expect(screen.queryByRole('link', { name: /Next study/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Previous study\s*Test Study/ })).toBeInTheDocument();
  });

  it('moves focus to the study heading when navigating between studies (WCAG 2.4.3)', async () => {
    renderAt('/ai/test-study');
    await screen.findByTestId('body');
    fireEvent.click(screen.getByRole('link', { name: /Next study/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Last Study' })).toHaveFocus();
  });

  it('does not steal focus on the initial deep-link load', async () => {
    renderAt('/ai/test-study');
    await screen.findByTestId('body');
    expect(screen.getByRole('heading', { level: 1, name: 'Test Study' })).not.toHaveFocus();
  });

  it('marks unpublished draft routes as noindex (ADR-0017)', async () => {
    const { unmount } = renderAt('/ai/draft-study');
    await screen.findByTestId('body');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

    unmount();
    expect(document.querySelector('meta[name="robots"]')).not.toBeInTheDocument();
  });

  it('leaves published routes indexable — no robots meta', async () => {
    renderAt('/ai/test-study');
    await screen.findByTestId('body');
    expect(document.querySelector('meta[name="robots"]')).not.toBeInTheDocument();
  });
});
