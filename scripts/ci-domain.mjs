// Domain-mode dry run: build with production-like env, then assert the artifacts.
// Replaces the former `domain-dry-run` GitHub job; portable (no bash/grep needed).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

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
const checks = [
  ['sitemap has 7 URLs', (read('dist/sitemap.xml').match(/<url>/g) ?? []).length === 7],
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
