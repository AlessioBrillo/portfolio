import { describe, expect, it } from 'vitest';
import { privacyDocuments } from '@/content/legal/privacy';
import { legalDocuments } from '@/content/legal/terms';

const ADDRESS = 'privacy@example.com';

describe('legal content', () => {
  it.each([
    ['privacy', privacyDocuments(ADDRESS)],
    ['legal', legalDocuments(ADDRESS)],
  ])('%s is bilingual with matching section ids', (_name, documents) => {
    expect(documents.map((document) => document.lang)).toEqual(['it', 'en']);
    const italian = documents[0]!;
    const english = documents[1]!;
    expect(italian.sections.map((section) => section.id)).toEqual(
      english.sections.map((section) => section.id),
    );
  });

  it.each([
    ['privacy', privacyDocuments(ADDRESS)],
    ['legal', legalDocuments(ADDRESS)],
  ])('%s states that the Italian version prevails', (_name, documents) => {
    for (const document of documents) {
      expect(document.note).toBeDefined();
      expect(document.note?.toLowerCase()).toContain('italian');
    }
  });

  it.each([
    ['privacy', privacyDocuments(ADDRESS)],
    ['legal', legalDocuments(ADDRESS)],
  ])('%s carries the rights address into both languages', (_name, documents) => {
    for (const document of documents) {
      expect(JSON.stringify(document.sections)).toContain(ADDRESS);
    }
  });

  it('names the hosting and analytics providers in the privacy notice', () => {
    const italian = privacyDocuments(ADDRESS)[0]!;
    const text = JSON.stringify(italian.sections);
    expect(text).toContain('Vercel');
    expect(text).toContain('Plausible');
    expect(text).toContain('Garante');
  });

  it('discloses the content licence and the font licence in the legal notice', () => {
    const italian = legalDocuments(ADDRESS)[0]!;
    const text = JSON.stringify(italian.sections);
    expect(text).toContain('MIT');
    expect(text).toContain('CONTENT-LICENSE');
    expect(text).toContain('/fonts/OFL.txt');
  });
});
