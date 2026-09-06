/**
 * Executable deploy smoke checks (domain landing, Phase 6). The pure logic
 * behind `npm run smoke` (see `scripts/smoke-deploy.mjs`): given a base URL
 * and a fetch implementation, it verifies the deploy-time contracts that CI
 * cannot — the Edge middleware behaviour, the security headers, and the
 * domain-mode artifacts — against a real Vercel deployment.
 *
 * Mode auto-detection (no flags for the common case): the analytics pair is
 * ON when `/js/script.js` answers 200 as JavaScript, domain mode is ON when
 * `/sitemap.xml` exists. A canonical link cannot be curled — it is injected
 * client-side by `useDocumentMeta` — so it stays a manual/E2E check in the
 * runbook; everything else here is plain HTTP.
 */

export interface SmokeCheck {
  readonly name: string;
  readonly status: 'pass' | 'fail' | 'skip';
  readonly detail: string;
}

export interface SmokeOptions {
  /** Apex host for the www→apex redirect check; omit to skip it. */
  readonly apexHost?: string;
}

function check(name: string, status: SmokeCheck['status'], detail: string): SmokeCheck {
  return { name, status, detail };
}

function contentType(headers: Headers): string {
  return headers.get('content-type') ?? '';
}

/**
 * Runs every smoke check against `baseUrl`. Throws on a malformed base URL —
 * the CLI maps that to "cannot check" (exit 2), never to a pass.
 */
export async function runSmokeChecks(
  baseUrl: string,
  fetchFn: typeof fetch,
  options: SmokeOptions = {},
): Promise<readonly SmokeCheck[]> {
  let origin: string;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    throw new Error(`Invalid base URL: ${baseUrl}`);
  }

  const results: SmokeCheck[] = [];

  const root = await fetchFn(`${origin}/`);
  const rootCt = contentType(root.headers);
  results.push(
    root.status === 200 && rootCt.includes('text/html')
      ? check('root-serves-html', 'pass', `GET / → 200 ${rootCt}`)
      : check('root-serves-html', 'fail', `GET / → ${root.status} ${rootCt}`),
  );

  // Security headers only exist on Vercel (vercel.json) — their absence
  // means this is not the deployment under test, which is a failure here.
  const csp = root.headers.get('content-security-policy') ?? '';
  const headerProblems: string[] = [];
  if (!csp.includes("script-src 'self'")) headerProblems.push("CSP without script-src 'self'");
  if (csp.includes('plausible.io')) headerProblems.push('CSP leaks plausible.io');
  if (!root.headers.get('strict-transport-security')?.includes('max-age'))
    headerProblems.push('HSTS missing');
  if (root.headers.get('x-content-type-options') !== 'nosniff')
    headerProblems.push('X-Content-Type-Options missing');
  results.push(
    headerProblems.length === 0
      ? check('security-headers', 'pass', 'CSP/HSTS/nosniff as specified')
      : check('security-headers', 'fail', headerProblems.join('; ')),
  );

  // Analytics mode: the middleware answers 404 as text/plain while the env
  // pair is unset, so the script path can never be SPA fallback HTML bytes
  // served as JavaScript (the MIME-block footgun).
  const script = await fetchFn(`${origin}/js/script.js`);
  const scriptCt = contentType(script.headers);
  const scriptBody = await script.text();
  if (script.status === 200) {
    results.push(
      scriptCt.includes('application/javascript') && !scriptBody.includes('<html')
        ? check('analytics-script', 'pass', 'proxy active, JS body')
        : check('analytics-script', 'fail', `200 but content-type=${scriptCt} (fallback leak?)`),
    );
  } else if (script.status === 404 && scriptCt.includes('text/plain')) {
    results.push(check('analytics-script', 'pass', 'proxy inert pre-domain (404 text/plain)'));
  } else {
    results.push(
      check('analytics-script', 'fail', `GET /js/script.js → ${script.status} ${scriptCt}`),
    );
  }

  const beacon = await fetchFn(`${origin}/api/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ n: 'pageview', u: `${origin}/`, d: 'smoke' }),
  });
  await beacon.text();
  const beaconCt = contentType(beacon.headers);
  if (beaconCt.includes('text/html')) {
    results.push(
      check('analytics-beacon', 'fail', `POST /api/event answered HTML (${beacon.status})`),
    );
  } else if (beacon.status === 200) {
    results.push(check('analytics-beacon', 'pass', 'beacon relayed, JSON answer'));
  } else if ([403, 404, 405].includes(beacon.status)) {
    results.push(check('analytics-beacon', 'pass', `guarded/inert (${beacon.status}), never HTML`));
  } else {
    results.push(check('analytics-beacon', 'fail', `unexpected ${beacon.status} ${beaconCt}`));
  }

  // Domain mode is ON exactly when the postbuild emitted a sitemap.
  const sitemap = await fetchFn(`${origin}/sitemap.xml`);
  const sitemapBody = await sitemap.text();
  const domainOn = sitemap.status === 200 && contentType(sitemap.headers).includes('xml');
  if (sitemap.status === 404) {
    results.push(check('sitemap', 'skip', 'absent pre-domain'));
  } else if (domainOn && sitemapBody.includes('<loc>')) {
    results.push(check('sitemap', 'pass', 'domain mode, URLs present'));
  } else {
    results.push(check('sitemap', 'fail', `GET /sitemap.xml → ${sitemap.status}`));
  }

  const robots = await fetchFn(`${origin}/robots.txt`);
  const robotsBody = await robots.text();
  if (robots.status !== 200 || !contentType(robots.headers).includes('text/plain')) {
    results.push(check('robots', 'fail', `GET /robots.txt → ${robots.status}`));
  } else if (domainOn && !robotsBody.includes('Sitemap:')) {
    results.push(check('robots', 'fail', 'domain mode but no Sitemap: line'));
  } else {
    results.push(
      check('robots', 'pass', domainOn ? 'Sitemap: line present' : 'pre-domain, no Sitemap: line'),
    );
  }

  const og = await fetchFn(`${origin}/og-image.png`);
  await og.text();
  results.push(
    og.status === 200 && contentType(og.headers).includes('image/')
      ? check('og-image', 'pass', 'card image served as image bytes')
      : check('og-image', 'fail', `GET /og-image.png → ${og.status}`),
  );

  // A deep link must resolve (SPA fallback serves the shell with 200); the
  // study content itself is client-rendered and covered by E2E instead.
  const deep = await fetchFn(`${origin}/ai/transformer-italian-corpus`);
  const deepCt = contentType(deep.headers);
  await deep.text();
  results.push(
    deep.status === 200 && deepCt.includes('text/html')
      ? check('deep-link-fallback', 'pass', 'study route resolves through the fallback')
      : check('deep-link-fallback', 'fail', `study route → ${deep.status} ${deepCt}`),
  );

  if (!options.apexHost) {
    results.push(check('apex-redirect', 'skip', 'no --apex host given'));
  } else {
    const www = await fetchFn(`https://www.${options.apexHost}/`, { redirect: 'manual' });
    await www.text();
    const location = www.headers.get('location') ?? '';
    results.push(
      [301, 302, 307, 308].includes(www.status) &&
        location.includes(options.apexHost) &&
        !location.includes('www.')
        ? check('apex-redirect', 'pass', `www → ${location}`)
        : check('apex-redirect', 'fail', `www → ${www.status} ${location || '(no location)'}`),
    );
  }

  return results;
}

/** True when at least one check failed — skips never fail the run. */
export function hasSmokeFailures(results: readonly SmokeCheck[]): boolean {
  return results.some((result) => result.status === 'fail');
}
