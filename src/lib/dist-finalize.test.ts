import { describe, expect, it } from 'vitest';
import {
  absolutizeOgImage,
  finalizeRobotsTxt,
  injectJsonLdUrl,
  stripTrailingSlash,
} from '@/lib/dist-finalize';

const HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta property="og:image" content="/og-image.png" />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Alessio Brillo",
        "jobTitle": "Student of AI and physics"
      }
    </script>
  </head>
</html>`;

const ROBOTS = `User-agent: *
Allow: /

# Sitemap: https://<domain>/sitemap.xml — add the real domain at deploy (Phase 6).
`;

describe('stripTrailingSlash', () => {
  it('removes trailing slashes, keeps the bare origin intact', () => {
    expect(stripTrailingSlash('https://example.com')).toBe('https://example.com');
    expect(stripTrailingSlash('https://example.com/')).toBe('https://example.com');
    expect(stripTrailingSlash('https://example.com///')).toBe('https://example.com');
  });
});

describe('absolutizeOgImage', () => {
  it('makes the relative og:image absolute under the origin', () => {
    const out = absolutizeOgImage(HTML, 'https://example.com');
    expect(out).toContain(
      '<meta property="og:image" content="https://example.com/og-image.png" />',
    );
  });

  it('tolerates a trailing slash on the origin and stays idempotent', () => {
    const once = absolutizeOgImage(HTML, 'https://example.com/');
    expect(once).toContain('content="https://example.com/og-image.png"');
    expect(absolutizeOgImage(once, 'https://example.com')).toBe(once);
  });

  it('leaves html without a relative og:image untouched', () => {
    expect(absolutizeOgImage('<html></html>', 'https://example.com')).toBe('<html></html>');
  });
});

describe('injectJsonLdUrl', () => {
  it('adds the canonical url to the Person block', () => {
    const out = injectJsonLdUrl(HTML, 'https://example.com');
    expect(out).toContain('"url": "https://example.com/",');
  });

  it('is a no-op when a url is already present', () => {
    const once = injectJsonLdUrl(HTML, 'https://example.com');
    expect(injectJsonLdUrl(once, 'https://example.com')).toBe(once);
  });
});

describe('finalizeRobotsTxt', () => {
  it('replaces the placeholder with a real Sitemap line', () => {
    const out = finalizeRobotsTxt(ROBOTS, 'https://example.com');
    expect(out).toContain('Sitemap: https://example.com/sitemap.xml');
    expect(out).not.toContain('<domain>');
  });

  it('is a no-op without the placeholder', () => {
    const plain = 'User-agent: *\nAllow: /\n';
    expect(finalizeRobotsTxt(plain, 'https://example.com')).toBe(plain);
  });
});
