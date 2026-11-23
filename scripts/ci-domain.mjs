// Domain-mode dry run: build with production-like env, then assert the artifacts.
// Replaces the former `domain-dry-run` GitHub job; portable (no bash/grep needed).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { getPublishedCaseStudies } from '../src/content/case-studies/registry.ts';
import { LEGAL_ROUTES } from '../src/lib/legal.ts';

const env = {
  ...process.env,
  VITE_SITE_URL: 'https://example.com',
  VITE_PLAUSIBLE_SRC: 'https://plausible.io/js/script.js',
  VITE_PLAUSIBLE_DOMAIN: 'example.com',
};
// `build` already runs validate-site-url, generate-sitemap and finalize-dist (postbuild).
for (const cmd of ['npm run build', 'npm run bundle:check:ci', 'npm run deploy:check']) {
  execSync(cmd, { stdio: 'inherit', env });
}

const read = (p) => readFileSync(p, 'utf8');
// Assert presence of each expected route instead of a magic URL count: adding a
// legal page or a study must not require editing this gate by hand.
const sitemap = read('dist/sitemap.xml');
const locs = [...sitemap.matchAll(/<loc>https:\/\/example\.com([^<]*)<\/loc>/g)].map(
  (match) => match[1],
);
const expectedPaths = [
  '/',
  '/archive',
  ...getPublishedCaseStudies().map((meta) => `/${meta.domain}/${meta.slug}`),
  ...LEGAL_ROUTES.map((route) => route.path),
];
const checks = [
  ...expectedPaths.map((path) => [`sitemap has ${path}`, locs.includes(path)]),
  ['sitemap has no unexpected URLs', locs.length === expectedPaths.length],
  ['absolute og:image', read('dist/index.html').includes('https://example.com/og-image.png')],
  ['JSON-LD url', read('dist/index.html').includes('"url": "https://example.com/"')],
  [
    'robots.txt Sitemap line',
    read('dist/robots.txt').includes('Sitemap: https://example.com/sitemap.xml'),
  ],
];
const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
