import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { WorkSchool } from '@/sections/WorkSchool';
import { getProjectEntries } from '@/content/projects';

describe('WorkSchool', () => {
  it('renders every project entry', () => {
    render(
      <MemoryRouter>
        <WorkSchool />
      </MemoryRouter>,
    );
    for (const entry of getProjectEntries()) {
      expect(screen.getByRole('heading', { name: entry.title })).toBeInTheDocument();
      expect(screen.getByText(entry.line)).toBeInTheDocument();
    }
  });

  it('links entries that have a case-study route and leaves the rest as plain cards', () => {
    render(
      <MemoryRouter>
        <WorkSchool />
      </MemoryRouter>,
    );
    for (const entry of getProjectEntries()) {
      const link = screen.queryByRole('link', { name: new RegExp(entry.title, 'i') });
      if (entry.href) {
        expect(link).not.toBeNull();
        expect(link).toHaveAttribute('href', entry.href);
      } else {
        expect(link).toBeNull();
      }
    }
  });
});
