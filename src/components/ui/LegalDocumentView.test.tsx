import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LegalDocumentView } from '@/components/ui/LegalDocumentView';
import type { LegalDocument } from '@/types/legal';

const DOCUMENTS: readonly LegalDocument[] = [
  {
    lang: 'it',
    label: 'Italiano',
    title: 'Privacy',
    intro: 'Intro italiano',
    note: 'La versione italiana prevale',
    sections: [
      {
        id: 'controller',
        heading: '1. Titolare',
        paragraphs: ['Primo paragrafo', 'Secondo paragrafo'],
        items: ['https://example.com'],
      },
    ],
  },
  {
    lang: 'en',
    label: 'English',
    title: 'Privacy',
    intro: 'English intro',
    sections: [{ id: 'controller', heading: '1. Controller', paragraphs: ['First paragraph'] }],
  },
];

describe('LegalDocumentView', () => {
  it('renders a language switch with a stable anchor per version', () => {
    render(<LegalDocumentView documents={DOCUMENTS} />);
    expect(screen.getByRole('link', { name: 'Italiano' })).toHaveAttribute('href', '#it');
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '#en');
    expect(document.getElementById('it')).toHaveAttribute('lang', 'it');
    expect(document.getElementById('en')).toHaveAttribute('lang', 'en');
  });

  it('renders both versions with their headings, paragraphs and notes', () => {
    render(<LegalDocumentView documents={DOCUMENTS} />);
    expect(screen.getByRole('heading', { name: '1. Titolare' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1. Controller' })).toBeInTheDocument();
    expect(screen.getByText('Secondo paragrafo')).toBeInTheDocument();
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('La versione italiana prevale');
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('omits the note when a version has no precedence line', () => {
    render(<LegalDocumentView documents={[DOCUMENTS[1]!]} />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
