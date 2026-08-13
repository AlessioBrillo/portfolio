export interface SitemapEntry {
  /** Site-absolute path, e.g. `/ai/transformer-italian-corpus`. */
  readonly loc: string;
  /** ISO date (YYYY-MM-DD) of the entry's last meaningful change, optional. */
  readonly lastmod?: string;
}

const XML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

/**
 * Builds a sitemap.xml document from an origin and a list of entries. Pure and
 * side-effect free so the exact output is unit-tested; the Vite plugin in
 * `vite.config.ts` wires it to the build (only when a domain is configured).
 */
export function buildSitemapXml(origin: string, entries: readonly SitemapEntry[]): string {
  const base = origin.replace(/\/+$/, '');
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
      return `  <url>\n    <loc>${escapeXml(base)}${escapeXml(entry.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
