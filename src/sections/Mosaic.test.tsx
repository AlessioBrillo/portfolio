import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Mosaic } from '@/sections/Mosaic';
import { getMosaicEntries } from '@/content/mosaic';

describe('Mosaic', () => {
  it('renders every curated tile', () => {
    render(
      <MemoryRouter>
        <Mosaic />
      </MemoryRouter>,
    );
    const entries = getMosaicEntries();
    for (const entry of entries) {
      expect(screen.getByRole('heading', { name: entry.title })).toBeInTheDocument();
      expect(screen.getByText(entry.line)).toBeInTheDocument();
    }
  });

  it('links route tiles into their case study and anchor tiles into their band', () => {
    render(
      <MemoryRouter>
        <Mosaic />
      </MemoryRouter>,
    );
    const entries = getMosaicEntries();
    for (const entry of entries) {
      const link = screen.getByRole('link', { name: new RegExp(entry.title, 'i') });
      expect(link).toHaveAttribute('href', entry.href);
    }
  });
});
