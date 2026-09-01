import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTonalEngineHealth } from '@/hooks/useTonalEngineHealth';

describe('useTonalEngineHealth', () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.unstubAllGlobals();
    global.navigator = { sendBeacon: vi.fn().mockReturnValue(true) } as unknown as Navigator;
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.navigator = originalNavigator;
    global.window = originalWindow;
  });

  it('registers a listener for tonal-engine-load event', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useTonalEngineHealth());

    expect(addEventListenerSpy).toHaveBeenCalledWith('tonal-engine-load', expect.any(Function));
  });

  it('calls sendBeacon with engine status when tonal-engine-load fires', () => {
    const sendBeaconSpy = vi.spyOn(navigator, 'sendBeacon');
    let handler: EventListener;

    vi.spyOn(window, 'addEventListener').mockImplementation((event, fn) => {
      if (event === 'tonal-engine-load') handler = fn as EventListener;
    });

    renderHook(() => useTonalEngineHealth());

    act(() => {
      handler?.(new CustomEvent('tonal-engine-load', { detail: { engine: 'gsap' } }));
    });

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
    expect(sendBeaconSpy).toHaveBeenCalledWith('/api/tonal-health', expect.any(Blob));
  });

  it('includes error in payload when engine reports error', () => {
    const sendBeaconSpy = vi.spyOn(navigator, 'sendBeacon');
    let handler: EventListener;

    vi.spyOn(window, 'addEventListener').mockImplementation((event, fn) => {
      if (event === 'tonal-engine-load') handler = fn as EventListener;
    });

    renderHook(() => useTonalEngineHealth());

    act(() => {
      handler?.(
        new CustomEvent('tonal-engine-load', {
          detail: { engine: 'fallback', error: 'GSAP failed to load' },
        }),
      );
    });

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
    const call = sendBeaconSpy.mock.calls[0];
    const blob = call?.[1] as Blob | undefined;
    expect(blob).toBeInstanceOf(Blob);
  });

  it('reports only once even if multiple tonal-engine-load events fire', () => {
    const sendBeaconSpy = vi.spyOn(navigator, 'sendBeacon');
    let handler: EventListener;

    vi.spyOn(window, 'addEventListener').mockImplementation((event, fn) => {
      if (event === 'tonal-engine-load') handler = fn as EventListener;
    });

    renderHook(() => useTonalEngineHealth());

    act(() => {
      handler?.(new CustomEvent('tonal-engine-load', { detail: { engine: 'gsap' } }));
      handler?.(new CustomEvent('tonal-engine-load', { detail: { engine: 'fallback' } }));
    });

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
  });

  it('uses custom endpoint when provided', () => {
    const sendBeaconSpy = vi.spyOn(navigator, 'sendBeacon');
    let handler: EventListener;

    vi.spyOn(window, 'addEventListener').mockImplementation((event, fn) => {
      if (event === 'tonal-engine-load') handler = fn as EventListener;
    });

    renderHook(() => useTonalEngineHealth({ endpoint: '/api/custom-health' }));

    act(() => {
      handler?.(new CustomEvent('tonal-engine-load', { detail: { engine: 'gsap' } }));
    });

    expect(sendBeaconSpy).toHaveBeenCalledWith('/api/custom-health', expect.any(Blob));
  });

  it('includes custom meta in payload', () => {
    const sendBeaconSpy = vi.spyOn(navigator, 'sendBeacon');
    let handler: EventListener;

    vi.spyOn(window, 'addEventListener').mockImplementation((event, fn) => {
      if (event === 'tonal-engine-load') handler = fn as EventListener;
    });

    renderHook(() => useTonalEngineHealth({ meta: { version: '1.0.0', build: 'abc123' } }));

    act(() => {
      handler?.(new CustomEvent('tonal-engine-load', { detail: { engine: 'gsap' } }));
    });

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
    const call = sendBeaconSpy.mock.calls[0];
    const blob = call?.[1] as Blob | undefined;
    expect(blob).toBeInstanceOf(Blob);
  });

  it('cleans up listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useTonalEngineHealth());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('tonal-engine-load', expect.any(Function));
  });

  it('does not throw when navigator.sendBeacon is unavailable', () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });

    expect(() => {
      renderHook(() => useTonalEngineHealth());
    }).not.toThrow();
  });
});
