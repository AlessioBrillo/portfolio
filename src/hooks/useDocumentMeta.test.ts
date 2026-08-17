import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/**
 * Case-study routes must be shareable and indexable (ADR-0005): the document
 * head (title, description, OG tags, canonical) follows the route. Draft
 * routes, by contrast, ask search engines to stay away (ADR-0017). These tests
 * pin what the hook writes and that it restores the previous head on unmount.
 */
describe('useDocumentMeta', () => {
  beforeEach(() => {
    document.head
      .querySelectorAll(
        'meta[name="description"], meta[name="robots"], meta[property^="og:"], link[rel="canonical"]',
      )
      .forEach((node) => node.remove());
    document.title = '';
  });
  it('sets the document title with the site brand', () => {
    renderHook(() => useDocumentMeta({ title: 'A transformer on Italian' }));
    expect(document.title).toBe('A transformer on Italian — Alessio Brillo');
  });

  it('sets the meta description', () => {
    renderHook(() => useDocumentMeta({ title: 'Study', description: 'Short deck.' }));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Short deck.',
    );
  });

  it('mirrors the description into the Open Graph tags', () => {
    renderHook(() => useDocumentMeta({ title: 'Study', description: 'Short deck.' }));
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Study — Alessio Brillo',
    );
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute(
      'content',
      'Short deck.',
    );
  });

  it('sets the canonical URL', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'Study', canonical: 'https://example.test/ai/study' }),
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://example.test/ai/study',
    );
  });

  it('sets robots noindex when the route is not indexable', () => {
    renderHook(() => useDocumentMeta({ title: 'Draft study', robots: 'noindex' }));
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  it('removes the robots meta it created on unmount', () => {
    const { unmount } = renderHook(() =>
      useDocumentMeta({ title: 'Draft study', robots: 'noindex' }),
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

    unmount();

    expect(document.querySelector('meta[name="robots"]')).not.toBeInTheDocument();
  });

  it('leaves a pre-existing robots directive untouched and restored', () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      '<meta name="robots" content="noindex, nofollow">',
    );

    const { unmount } = renderHook(() => useDocumentMeta({ title: 'Study' }));
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );

    unmount();

    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });

  it('restores the previous title, description and canonical on unmount', () => {
    document.title = 'Previous title';
    document.head.insertAdjacentHTML(
      'beforeend',
      '<meta name="description" content="Previous description"><link rel="canonical" href="https://example.test/old">',
    );

    const { unmount } = renderHook(() =>
      useDocumentMeta({ title: 'Study', description: 'Short deck.' }),
    );
    expect(document.title).toBe('Study — Alessio Brillo');

    unmount();

    expect(document.title).toBe('Previous title');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Previous description',
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://example.test/old',
    );
  });
});
