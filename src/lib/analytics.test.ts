import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initAnalytics, sendBeacon } from '@/lib/analytics';

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
    vi.unstubAllGlobals();
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

  it('is a no-op when the document is unavailable (SSR guard)', () => {
    vi.stubEnv('VITE_PLAUSIBLE_SRC', SRC);
    vi.stubEnv('VITE_PLAUSIBLE_DOMAIN', DOMAIN);
    vi.stubGlobal('document', undefined);
    initAnalytics();
    vi.unstubAllGlobals();
    expect(beacons()).toHaveLength(0);
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

describe('sendBeacon', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is a no-op when navigator.sendBeacon is unavailable', () => {
    vi.stubGlobal('navigator', {});
    expect(() => sendBeacon('/api/health', { test: 'data' })).not.toThrow();
  });

  it('calls navigator.sendBeacon with JSON payload when available', () => {
    const sendBeaconMock = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconMock });

    sendBeacon('/api/health', { engine: 'gsap', status: 'loaded' });

    expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    expect(sendBeaconMock).toHaveBeenCalledWith(
      '/api/health',
      new Blob([JSON.stringify({ engine: 'gsap', status: 'loaded' })], {
        type: 'application/json',
      }),
    );
  });

  it('handles sendBeacon returning false gracefully', () => {
    const sendBeaconMock = vi.fn().mockReturnValue(false);
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconMock });

    expect(() => sendBeacon('/api/health', { test: 'data' })).not.toThrow();
    expect(sendBeaconMock).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when navigator is undefined (SSR guard)', () => {
    vi.stubGlobal('navigator', undefined);
    expect(() => sendBeacon('/api/health', { test: 'data' })).not.toThrow();
  });
});
