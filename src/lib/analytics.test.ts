import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initAnalytics } from '@/lib/analytics';

const SRC = '/js/script.js';
const DOMAIN = 'ilcassero.it';

function beacons(): HTMLScriptElement[] {
  return Array.from(document.head.querySelectorAll<HTMLScriptElement>('script[data-domain]'));
}

describe('initAnalytics', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is a no-op without the analytics env pair (dev and tests)', () => {
    initAnalytics();
    expect(beacons()).toHaveLength(0);
  });

  it('is a no-op when only one of the two env vars is set', () => {
    vi.stubEnv('VITE_PLAUSIBLE_SRC', SRC);
    initAnalytics();
    expect(beacons()).toHaveLength(0);
  });

  it('loads the analytics script exactly once when the pair is set', () => {
    vi.stubEnv('VITE_PLAUSIBLE_SRC', SRC);
    vi.stubEnv('VITE_PLAUSIBLE_DOMAIN', DOMAIN);
    initAnalytics();
    initAnalytics();
    const loaded = beacons();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toHaveAttribute('src', SRC);
    expect(loaded[0]).toHaveAttribute('async');
    expect(loaded[0]).toHaveAttribute('defer');
    expect(loaded[0]?.dataset.domain).toBe(DOMAIN);
  });

  it('exposes the self-proxied event endpoint when configured', () => {
    vi.stubEnv('VITE_PLAUSIBLE_SRC', SRC);
    vi.stubEnv('VITE_PLAUSIBLE_DOMAIN', DOMAIN);
    vi.stubEnv('VITE_PLAUSIBLE_API', '/api/event');
    initAnalytics();
    expect(beacons()[0]?.dataset.api).toBe('/api/event');
  });

  it('applies SRI with crossOrigin when an integrity hash is configured', () => {
    vi.stubEnv('VITE_PLAUSIBLE_SRC', SRC);
    vi.stubEnv('VITE_PLAUSIBLE_DOMAIN', DOMAIN);
    vi.stubEnv('VITE_PLAUSIBLE_INTEGRITY', 'sha384-abc123');
    initAnalytics();
    const script = beacons()[0];
    expect(script).toBeDefined();
    expect(script?.integrity).toBe('sha384-abc123');
    expect(script?.crossOrigin).toBe('anonymous');
  });
});
