import { describe, expect, it } from 'vitest';
import { buildSitemapXml } from '@/lib/sitemap';

describe('buildSitemapXml', () => {
  it('emits a urlset with one loc per entry', () => {
    const xml = buildSitemapXml('https://example.com', [
      { loc: '/' },
      { loc: '/ai/transformer-italian-corpus' },
    ]);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<loc>https://example.com/ai/transformer-italian-corpus</loc>');
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it('omits lastmod when no entry carries one', () => {
    const xml = buildSitemapXml('https://example.com', [{ loc: '/' }]);
    expect(xml).not.toContain('<lastmod>');
  });

  it('emits lastmod for entries that carry it', () => {
    const xml = buildSitemapXml('https://example.com', [{ loc: '/ai/x', lastmod: '2026-08-13' }]);
    expect(xml).toContain('<lastmod>2026-08-13</lastmod>');
  });

  it('normalises a trailing slash on the origin', () => {
    const xml = buildSitemapXml('https://example.com/', [{ loc: '/' }]);
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).not.toContain('example.com//');
  });

  it('escapes XML-significant characters in loc values', () => {
    const xml = buildSitemapXml('https://example.com', [{ loc: '/ai/a&b<c>d"e' }]);
    expect(xml).toContain('<loc>https://example.com/ai/a&amp;b&lt;c&gt;d&quot;e</loc>');
  });

  it('emits an empty urlset for no entries', () => {
    const xml = buildSitemapXml('https://example.com', []);
    expect(xml).toContain('<urlset');
    expect(xml).not.toContain('<url>');
  });

  it('emits a trailing newline', () => {
    const xml = buildSitemapXml('https://example.com', [{ loc: '/' }]);
    expect(xml.endsWith('\n')).toBe(true);
  });
});
