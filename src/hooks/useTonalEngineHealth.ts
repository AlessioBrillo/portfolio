import { useEffect, useRef } from 'react';
import { sendBeacon } from '@/lib/analytics';

type EngineStatus = 'gsap' | 'fallback' | 'error';

interface TonalEngineHealthOptions {
  /** Endpoint to send the beacon to. Defaults to '/api/tonal-health'. */
  endpoint?: string;
  /** Additional metadata to include with the beacon. */
  meta?: Record<string, unknown>;
}

/**
 * Reports the tonal engine's load status via a non-blocking beacon.
 * Called once when the engine resolves (success or fallback).
 *
 * The beacon is sent to a same-origin endpoint (default: '/api/tonal-health')
 * which can be handled by a Vercel serverless function or simply logged.
 * Uses `navigator.sendBeacon` so it doesn't block the main thread and
 * survives page unload.
 */
export function useTonalEngineHealth({
  endpoint = '/api/tonal-health',
  meta = {},
}: TonalEngineHealthOptions = {}): void {
  const reportedRef = useRef(false);

  useEffect(() => {
    if (reportedRef.current) return;

    const handleEngineLoad = (
      event: CustomEvent<{ engine: EngineStatus; error?: string }>,
    ): void => {
      if (reportedRef.current) return;
      reportedRef.current = true;

      sendBeacon(endpoint, {
        engine: event.detail.engine,
        error: event.detail.error,
        timestamp: Date.now(),
        ...meta,
      });
    };

    window.addEventListener('tonal-engine-load', handleEngineLoad as EventListener);

    return () => {
      window.removeEventListener('tonal-engine-load', handleEngineLoad as EventListener);
    };
  }, [endpoint, meta]);
}
