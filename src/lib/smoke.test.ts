import { describe, expect, it } from 'vitest';
import { hasSmokeFailures, runSmokeChecks, type SmokeCheck } from './smoke';

const ORIGIN = 'https://example.com';

const VERCEL_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'content-security-policy':
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'",
  'strict-transport-security': 'max-age=63072000; includeSubDomains',
  'x-content-type-options': 'nosniff',
};

interface StubRoute {
  readonly status?: number;
  readonly headers?: Record<string, string>;
  readonly body?: string;
}

function stubFetch(routes: Record<string, StubRoute>): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? new URL(input)
        : input instanceof URL
          ? input
          : new URL(input.url);
    const route = routes[`${init?.method ?? 'GET'} ${url.origin}${url.pathname}`];
    if (!route) return new Response('not found', { status: 404 });
    return new Response(route.body ?? '', {
      status: route.status ?? 200,
      headers: route.headers,
    });
  }) as typeof fetch;
}

function greenRoutes(): Record<string, StubRoute> {
  return {
    [`GET ${ORIGIN}/`]: { headers: VERCEL_HEADERS, body: '<html></html>' },
    [`GET ${ORIGIN}/js/script.js`]: {
      headers: { 'content-type': 'application/javascript' },
      body: '/* plausible */',
    },
    [`POST ${ORIGIN}/api/event`]: {
      headers: { 'content-type': 'application/json' },
      body: '{}',
    },
    [`GET ${ORIGIN}/sitemap.xml`]: {
      headers: { 'content-type': 'application/xml' },
      body: '<urlset><url><loc>https://example.com/</loc></url></urlset>',
    },
    [`GET ${ORIGIN}/robots.txt`]: {
      headers: { 'content-type': 'text/plain' },
      body: 'Sitemap: https://example.com/sitemap.xml',
    },
    [`GET ${ORIGIN}/og-image.png`]: { headers: { 'content-type': 'image/png' }, body: 'PNG' },
    [`GET ${ORIGIN}/ai/transformer-italian-corpus`]: {
      headers: { 'content-type': 'text/html' },
      body: '<html></html>',
    },
  };
}

function names(results: readonly SmokeCheck[]): Record<string, SmokeCheck['status']> {
  return Object.fromEntries(results.map((result) => [result.name, result.status]));
}

describe('runSmokeChecks', () => {
  it('passes everything on a healthy domain-mode deploy with analytics on', async () => {
    const results = await runSmokeChecks(ORIGIN, stubFetch(greenRoutes()), {
      apexHost: 'example.com',
    });
    // The www redirect is stubbed below: without a route it 404s, so add it.
    expect(names(results)['apex-redirect']).toBe('fail');

    const withWww = stubFetch({
      ...greenRoutes(),
      'GET https://www.example.com/': {
        status: 301,
        headers: { location: 'https://example.com/' },
      },
    });
    const full = await runSmokeChecks(ORIGIN, withWww, { apexHost: 'example.com' });
    expect(full.every((result) => result.status === 'pass')).toBe(true);
    expect(hasSmokeFailures(full)).toBe(false);
  });

  it('passes the inert pre-domain deploy and skips domain-only checks', async () => {
    const routes = greenRoutes();
    const results = await runSmokeChecks(
      ORIGIN,
      stubFetch({
        ...routes,
        [`GET ${ORIGIN}/js/script.js`]: {
          status: 404,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
          body: 'Not found',
        },
        [`POST ${ORIGIN}/api/event`]: { status: 404 },
        [`GET ${ORIGIN}/sitemap.xml`]: { status: 404 },
        [`GET ${ORIGIN}/robots.txt`]: {
          headers: { 'content-type': 'text/plain' },
          body: 'User-agent: *',
        },
      }),
    );
    const byName = names(results);
    expect(byName['analytics-script']).toBe('pass');
    expect(byName['analytics-beacon']).toBe('pass');
    expect(byName['sitemap']).toBe('skip');
    expect(byName['robots']).toBe('pass');
    expect(byName['apex-redirect']).toBe('skip');
    expect(hasSmokeFailures(results)).toBe(false);
  });

  it('fails when the script path serves fallback HTML as JavaScript', async () => {
    const results = await runSmokeChecks(
      ORIGIN,
      stubFetch({
        ...greenRoutes(),
        [`GET ${ORIGIN}/js/script.js`]: {
          headers: { 'content-type': 'text/html' },
          body: '<html></html>',
        },
      }),
    );
    expect(names(results)['analytics-script']).toBe('fail');
    expect(hasSmokeFailures(results)).toBe(true);
  });

  it('fails when the beacon answers HTML', async () => {
    const results = await runSmokeChecks(
      ORIGIN,
      stubFetch({
        ...greenRoutes(),
        [`POST ${ORIGIN}/api/event`]: {
          headers: { 'content-type': 'text/html' },
          body: '<html></html>',
        },
      }),
    );
    expect(names(results)['analytics-beacon']).toBe('fail');
  });

  it('fails on an unexpected beacon status', async () => {
    const results = await runSmokeChecks(
      ORIGIN,
      stubFetch({
        ...greenRoutes(),
        [`POST ${ORIGIN}/api/event`]: {
          status: 502,
          headers: { 'content-type': 'application/json' },
        },
      }),
    );
    expect(names(results)['analytics-beacon']).toBe('fail');
  });

  it('fails when the root does not serve HTML', async () => {
    const results = await runSmokeChecks(
      ORIGIN,
      stubFetch({ ...greenRoutes(), [`GET ${ORIGIN}/`]: { status: 500 } }),
    );
    expect(names(results)['root-serves-html']).toBe('fail');
  });

  it('fails on weak security headers', async () => {
    const results = await runSmokeChecks(
      ORIGIN,
      stubFetch({
        ...greenRoutes(),
        [`GET ${ORIGIN}/`]: {
          headers: {
            'content-type': 'text/html',
            'content-security-policy': "script-src 'self' plausible.io",
          },
          body: '<html></html>',
        },
      }),
    );
    expect(names(results)['security-headers']).toBe('fail');
  });

  it('fails on a sitemap without URLs and on robots without the Sitemap line', async () => {
    const empty = await runSmokeChecks(
      ORIGIN,
      stubFetch({
        ...greenRoutes(),
        [`GET ${ORIGIN}/sitemap.xml`]: {
          headers: { 'content-type': 'application/xml' },
          body: '<urlset></urlset>',
        },
      }),
    );
    expect(names(empty)['sitemap']).toBe('fail');

    const noLine = await runSmokeChecks(
      ORIGIN,
      stubFetch({
        ...greenRoutes(),
        [`GET ${ORIGIN}/robots.txt`]: {
          headers: { 'content-type': 'text/plain' },
          body: 'User-agent: *',
        },
      }),
    );
    expect(names(noLine)['robots']).toBe('fail');
  });

  it('fails on a broken og image, deep link, or apex redirect', async () => {
    const results = await runSmokeChecks(
      ORIGIN,
      stubFetch({
        ...greenRoutes(),
        [`GET ${ORIGIN}/og-image.png`]: { status: 404 },
        [`GET ${ORIGIN}/ai/transformer-italian-corpus`]: { status: 404 },
        'GET https://www.example.com/': { status: 200 },
      }),
      { apexHost: 'example.com' },
    );
    const byName = names(results);
    expect(byName['og-image']).toBe('fail');
    expect(byName['deep-link-fallback']).toBe('fail');
    expect(byName['apex-redirect']).toBe('fail');
  });

  it('throws on a malformed base URL', async () => {
    await expect(runSmokeChecks('not a url', stubFetch({}))).rejects.toThrow('Invalid base URL');
  });

  it('hasSmokeFailures is false when everything passes or skips', () => {
    expect(hasSmokeFailures([])).toBe(false);
    expect(
      hasSmokeFailures([
        { name: 'a', status: 'pass', detail: '' },
        { name: 'b', status: 'skip', detail: '' },
      ]),
    ).toBe(false);
  });
});
