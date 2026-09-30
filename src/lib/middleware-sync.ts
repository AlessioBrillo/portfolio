/**
 * Runtime guard: verifies that the client and the middleware are aligned.
 * Call in `main.tsx` after `initAnalytics()`.
 * If desynchronized, logs warning — analytics will fail silently.
 * The middleware exposes its state via `X-Plausible-Proxy` header on the
 * proxied script response (/js/script.js).
 */

export function verifyMiddlewareSync(): void {
  const clientHasPlausible = !!(
    import.meta.env.VITE_PLAUSIBLE_SRC && import.meta.env.VITE_PLAUSIBLE_DOMAIN
  );

  if (!clientHasPlausible) {
    return; // Client has no analytics config — nothing to verify
  }

  // Fire-and-forget HEAD request to check middleware state
  // Uses HEAD to avoid downloading the script body
  fetch('/js/script.js', { method: 'HEAD', cache: 'no-store' })
    .then((response) => {
      const middlewareActive = response.headers.get('X-Plausible-Proxy') === 'active';
      if (!middlewareActive) {
        console.warn(
          '[Analytics] Middleware inactive but client has VITE_PLAUSIBLE_* env vars — ' +
            'analytics beacons will 404. Rebuild required after setting Vercel env vars.',
        );
      }
    })
    .catch(() => {
      // Network error or middleware not deployed — silently ignore in dev
    });
}
