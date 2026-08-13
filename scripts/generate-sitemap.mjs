/**
 * Emits `dist/sitemap.xml` after the production build, using the published
 * case-study registry (`src/content/case-studies/registry.ts`) as the single
 * source of truth — no hand-maintained URL list.
 *
 * Skipped entirely while `VITE_SITE_URL` is unset (pre-domain), so the
 * interim vercel.app deployment never advertises itself to crawlers.
 *
 * The registry and the sitemap builder are TypeScript; this script relies on
 * Node's native type stripping (>=22.18, default in the supported LTS). On
 * older runtimes it degrades to a warning and skips, since sitemap emission
 * only matters once a real domain exists.
 */
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.VITE_SITE_URL;
if (!origin) {
  console.log('[sitemap] VITE_SITE_URL unset — skipping sitemap generation.');
  process.exit(0);
}

let buildSitemapXml;
let getPublishedCaseStudies;
try {
  ({ buildSitemapXml } = await import('../src/lib/sitemap.ts'));
  ({ getPublishedCaseStudies } = await import('../src/content/case-studies/registry.ts'));
} catch (error) {
  console.warn(`[sitemap] Could not load TypeScript sources (${error?.code ?? error}) — skipping.`);
  process.exit(0);
}

const entries = [
  { loc: '/' },
  ...getPublishedCaseStudies().map((meta) => ({ loc: `/${meta.domain}/${meta.slug}` })),
];

await mkdir('dist', { recursive: true });
await writeFile('dist/sitemap.xml', buildSitemapXml(origin, entries), 'utf8');
console.log(`[sitemap] wrote dist/sitemap.xml with ${entries.length} URLs.`);
