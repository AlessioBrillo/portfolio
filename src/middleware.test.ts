import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import middleware from '../middleware';

// The Edge middleware is plain Web APIs + process.env, so it is unit-testable
// without Vercel: these tests pin the contract vercel.json cannot express
// (404-not-HTML when inert, method guards, CORS echo, no-store beacons).

const SCRIPT_SRC = 'https://plausible.io/js/script.js';
const DOMAIN = 'example.com';

function setEnv(src?: string, domain?: string): void {
  if (src === undefined) delete process.env.VITE_PLAUSIBLE_SRC;
  else process.env.VITE_PLAUSIBLE_SRC = src;
  if (domain === undefined) delete process.env.VITE_PLAUSIBLE_DOMAIN;
  else process.env.VITE_PLAUSIBLE_DOMAIN = domain;
}

function request(path: string, init?: RequestInit): Request {
  return new Request(`https://site.test${path}`, init);
}

describe('plausible edge middleware', () => {
  beforeEach(() => {
    setEnv(SCRIPT_SRC, DOMAIN);
  });

  afterEach(() => {
    setEnv();
    vi.unstubAllGlobals();
  });

  it('ignores non-proxy paths', async () => {
    await expect(middleware(request('/'))).resolves.toBeUndefined();
    await expect(middleware(request('/ai/some-study'))).resolves.toBeUndefined();
  });

  it('answers 404 (not SPA HTML) when the env pair is unset', async () => {
    setEnv();
    for (const path of ['/js/script.js', '/api/event']) {
      const response = (await middleware(request(path))) as Response;
      expect(response.status).toBe(404);
      expect(response.headers.get('content-type')).toContain('text/plain');
      await expect(response.text()).resolves.not.toContain('<html');
    }
  });

  it('answers 404 when only one env var is set', async () => {
    setEnv(SCRIPT_SRC);
    const response = (await middleware(request('/js/script.js'))) as Response;
    expect(response.status).toBe(404);
  });

  it('answers 404 on malformed or foreign script origins (no open proxy)', async () => {
    setEnv('not-a-url', DOMAIN);
    await expect(middleware(request('/js/script.js'))).resolves.toMatchObject({ status: 404 });
    setEnv('https://example.com/js/script.js', DOMAIN);
    await expect(middleware(request('/js/script.js'))).resolves.toMatchObject({ status: 404 });
  });

  it('proxies the script on GET with cache and CSP headers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('/* plausible */')),
    );
    const response = (await middleware(request('/js/script.js'))) as Response;
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/javascript');
    expect(response.headers.get('cache-control')).toContain('immutable');
    expect(response.headers.get('content-security-policy')).not.toContain('unsafe-inline');
    await expect(response.text()).resolves.toContain('plausible');
  });

  it('rejects non-GET on the script path and non-POST on the event path', async () => {
    await expect(middleware(request('/js/script.js', { method: 'POST' }))).resolves.toMatchObject({
      status: 405,
    });
    await expect(middleware(request('/api/event', { method: 'GET' }))).resolves.toMatchObject({
      status: 405,
    });
  });

  it('proxies beacons with CORS echo and no-store', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}')),
    );
    const withOrigin = (await middleware(
      request('/api/event', {
        method: 'POST',
        headers: { Origin: 'https://site.test' },
        body: JSON.stringify({ n: 'pageview' }),
      }),
    )) as Response;
    expect(withOrigin.status).toBe(200);
    expect(withOrigin.headers.get('content-type')).toContain('application/json');
    expect(withOrigin.headers.get('access-control-allow-origin')).toBe('https://site.test');
    expect(withOrigin.headers.get('cache-control')).toBe('no-store');

    const anonymous = (await middleware(
      request('/api/event', { method: 'POST', body: '{}' }),
    )) as Response;
    expect(anonymous.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('maps upstream failures to 502', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('x', { status: 500 })),
    );
    await expect(middleware(request('/js/script.js'))).resolves.toMatchObject({ status: 502 });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      }),
    );
    await expect(
      middleware(request('/api/event', { method: 'POST', body: '{}' })),
    ).resolves.toMatchObject({ status: 502 });
  });
});
