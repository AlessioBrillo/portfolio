import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArchivePage } from '@/pages/ArchivePage';

const ENTRIES = [
  {
    kind: 'study',
    title: 'The VDS licence, on purpose',
    line: 'Earning the Italian ultralight licence.',
    year: '2026',
    href: '/sky/vds-licence',
  },
  {
    kind: 'project',
    title: 'A school project',
    line: 'A project without a study behind it.',
    year: '2025',
    href: '/work/school-project',
  },
  {
    kind: 'experience',
    title: 'Court and trail',
    line: 'Two disciplines that keep the week honest.',
    year: undefined,
    href: undefined,
  },
] as const;

const mocks = vi.hoisted(() => ({
  SITE: { name: 'Alessio Brillo' },
  getArchiveEntries: vi.fn(() => [...ENTRIES]),
  canonicalOrigin: vi.fn(() => ''),
}));

vi.mock('@/content/archive', () => ({ getArchiveEntries: mocks.getArchiveEntries }));

vi.mock('@/lib/site', () => mocks);

function renderArchive(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/archive']}>
      <ArchivePage />
    </MemoryRouter>,
  );
}

describe('ArchivePage', () => {
  beforeEach(() => {
    mocks.canonicalOrigin.mockReturnValue('');
  });

  it('renders the route shell with a way back to the flight', () => {
    renderArchive();
    expect(screen.getByRole('heading', { level: 1, name: 'The archive' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to the ascent/ })).toHaveAttribute('href', '/');
  });

  it('renders every archive entry with its line and year label', () => {
    renderArchive();
    for (const entry of ENTRIES) {
      expect(screen.getByRole('heading', { name: entry.title })).toBeInTheDocument();
      expect(screen.getByText(entry.line)).toBeInTheDocument();
    }
    const withYear = ENTRIES.filter((entry) => entry.year);
    for (const entry of withYear) {
      expect(screen.getByText(entry.year as string)).toBeInTheDocument();
    }
  });

  it('links study and project rows to their route', () => {
    renderArchive();
    const linked = ENTRIES.filter((entry) => entry.href);
    for (const entry of linked) {
      expect(screen.getByRole('link', { name: entry.title })).toHaveAttribute(
        'href',
        entry.href as string,
      );
    }
  });

  it('renders experience rows without a link', () => {
    renderArchive();
    const story = ENTRIES.find((entry) => entry.kind === 'experience');
    expect(story).toBeDefined();
    expect(screen.queryByRole('link', { name: story?.title })).not.toBeInTheDocument();
  });

  it('sets the document head and emits no canonical pre-domain', () => {
    const { unmount } = renderArchive();
    expect(document.title).toContain('The archive');
    expect(document.querySelector('meta[name="description"]')).not.toBeNull();
    expect(document.querySelector('link[rel="canonical"]')).not.toBeInTheDocument();
    expect(document.querySelector('meta[name="robots"]')).not.toBeInTheDocument();

    unmount();
    expect(document.title).not.toContain('The archive');
  });

  it('emits the canonical link once an origin is configured', () => {
    mocks.canonicalOrigin.mockReturnValue('https://example.com');
    renderArchive();
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://example.com/archive',
    );
  });
});
