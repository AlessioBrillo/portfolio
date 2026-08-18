import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getPublishedCaseStudies } from '@/content/case-studies/registry';
import { getSpaFallbackSource, isSpaFallbackRewrite } from '@/lib/deploy-routing';

/** The repo root — vitest runs with the project root as the working
 * directory (npm scripts and CI both launch from there). */
const ROOT = resolve(process.cwd());

/** Every committed static file, as posix-style paths relative to `public/`. */
function listPublicFiles(dir: string, prefix = ''): readonly string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? listPublicFiles(join(dir, entry.name), rel) : [rel];
  });
}

describe('getSpaFallbackSource', () => {
  it('returns undefined for a config that is not a record', () => {
    expect(getSpaFallbackSource(null)).toBeUndefined();
    expect(getSpaFallbackSource([])).toBeUndefined();
  });

  it('returns undefined when the config has no rewrites', () => {
    expect(getSpaFallbackSource({})).toBeUndefined();
    expect(getSpaFallbackSource({ rewrites: 'nope' })).toBeUndefined();
  });

  it('returns undefined when no rewrite targets index.html', () => {
    expect(
      getSpaFallbackSource({ rewrites: [{ source: '/x', destination: '/y' }] }),
    ).toBeUndefined();
  });

  it('returns undefined when the fallback entry is not a record or has no source', () => {
    expect(
      getSpaFallbackSource({
        rewrites: [[], { source: '/x', destination: '/index.html' }],
      }),
    ).toBe('/x');
    expect(getSpaFallbackSource({ rewrites: [{ destination: '/index.html' }] })).toBeUndefined();
  });

  it('returns the source of the index.html rewrite', () => {
    const source = '/((?!assets/).*)';
    expect(getSpaFallbackSource({ rewrites: [{ source, destination: '/index.html' }] })).toBe(
      source,
    );
  });
});

describe('isSpaFallbackRewrite', () => {
  const source = '/((?!assets/|favicon\\.svg).*)';

  it('rewrites the home page and deep-link routes', () => {
    expect(isSpaFallbackRewrite('/', source)).toBe(true);
    expect(isSpaFallbackRewrite('/ai/transformer-italian-corpus', source)).toBe(true);
  });

  it('leaves excluded static files to the filesystem', () => {
    expect(isSpaFallbackRewrite('/assets/app.js', source)).toBe(false);
    expect(isSpaFallbackRewrite('/favicon.svg', source)).toBe(false);
  });
});

describe('vercel.json SPA-fallback contract', () => {
  const vercelConfig = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')) as unknown;
  const source = getSpaFallbackSource(vercelConfig);

  it('defines the SPA-fallback rewrite targeting index.html', () => {
    expect(source).toBeDefined();
  });

  it('never rewrites a static file of public/', () => {
    expect(source).toBeDefined();
    const files = listPublicFiles(join(ROOT, 'public'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(isSpaFallbackRewrite(`/${file}`, source!)).toBe(false);
    }
  });

  it('rewrites the home page and every published case-study route', () => {
    expect(source).toBeDefined();
    const routes = [
      '/',
      ...getPublishedCaseStudies().map((meta) => `/${meta.domain}/${meta.slug}`),
    ];
    expect(routes.length).toBeGreaterThan(1);
    for (const route of routes) {
      expect(isSpaFallbackRewrite(route, source!)).toBe(true);
    }
  });
});
