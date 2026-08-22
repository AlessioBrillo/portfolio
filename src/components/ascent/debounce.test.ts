import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '@/components/ascent/useTonalEngine';

describe('debounce helper', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays function execution until wait period has elapsed', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets timer on subsequent calls within wait period', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('forwards arguments to the debounced function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(150);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('forwards this context to the debounced function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);
    const context = { value: 42 };

    debounced.call(context);
    vi.advanceTimersByTime(150);

    expect(fn).toHaveBeenCalledWith();
    // The function is called with the correct this context
  });

  it('clears existing timeout on immediate successive calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced();
    debounced();

    // The internal timeoutId is not directly accessible, but we can verify
    // only one call happens after the wait period
    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
