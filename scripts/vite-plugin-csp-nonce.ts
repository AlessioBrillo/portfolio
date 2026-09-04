import crypto from 'node:crypto';
import type { Plugin, ResolvedConfig } from 'vite';

interface CSPNoncePluginOptions {
  /** Environment variable name to inject the nonce into */
  envName?: string;
  /** Whether to enable in development (uses 'unsafe-inline' if false) */
  enableInDev?: boolean;
}

/**
 * Vite plugin to generate and inject CSP nonce for inline styles.
 *
 * In production: generates a cryptographically secure nonce per build,
 * injects it into index.html as a meta tag, and exposes it via import.meta.env.
 *
 * In development: uses 'unsafe-inline' fallback unless enableInDev=true.
 */
export function cspNoncePlugin(options: CSPNoncePluginOptions = {}): Plugin {
  const { envName = 'VITE_CSP_NONCE', enableInDev = false } = options;

  let config: ResolvedConfig;
  let nonce: string | null = null;
  let isDev = false;

  return {
    name: 'csp-nonce',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
      isDev = config.command === 'serve';

      if (isDev && !enableInDev) {
        // In dev without explicit enable, use a fixed nonce that allows unsafe-inline
        // via meta tag. This keeps dev ergonomic while production is strict.
        nonce = 'dev-unsafe-inline';
      } else {
        // Generate a cryptographically secure nonce for production (or dev if enabled)
        nonce = crypto.randomBytes(16).toString('base64');
      }

      // Expose nonce to client code via define
      config.define = config.define || {};
      config.define[`import.meta.env.${envName}`] = JSON.stringify(nonce);
    },

    transformIndexHtml(html) {
      if (!nonce) return html;

      if (isDev && !enableInDev) {
        // In dev without explicit enable, add a meta tag that allows unsafe-inline
        // This is a development convenience - production will have strict CSP
        return html.replace(
          '</head>',
          `  <meta http-equiv="Content-Security-Policy" content="style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';" />\n</head>`,
        );
      }

      // In production (or dev with enableInDev), inject the nonce into a meta tag
      // and also add the CSP header meta tag with the nonce
      const cspMeta = `  <meta http-equiv="Content-Security-Policy" content="style-src 'self' 'nonce-${nonce}'; script-src 'self';" />`;
      const nonceMeta = `  <meta name="csp-nonce" content="${nonce}" />`;

      return html.replace('</head>', `${cspMeta}\n${nonceMeta}\n</head>`);
    },

    // Provide a helper for server-side rendering or middleware to access the nonce
    configureServer(server) {
      if (!isDev || !enableInDev) return;

      server.middlewares.use((req, res, next) => {
        // Generate a fresh nonce per request in development
        const requestNonce = crypto.randomBytes(16).toString('base64');
        res.setHeader(
          'Content-Security-Policy',
          `style-src 'self' 'nonce-${requestNonce}'; script-src 'self';`,
        );
        // Make nonce available to any SSR or middleware
        (req as unknown as { cspNonce?: string }).cspNonce = requestNonce;
        next();
      });
    },
  };
}

export default cspNoncePlugin;
