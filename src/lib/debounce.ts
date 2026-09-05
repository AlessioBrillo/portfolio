/**
 * Trailing-edge debounce with `cancel`.
 *
 * Replaces the single `lodash-es` import the codebase had: one resize
 * listener does not justify a utility dependency. Contract: calls within
 * `wait` ms reset the timer, the function fires once `wait` ms after the
 * last call, and `cancel()` drops a pending firing.
 */
export function debounce<F extends (...args: never[]) => void>(
  fn: F,
  wait: number,
): ((...args: Parameters<F>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: Parameters<F>): void => {
    if (timeout !== undefined) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      fn(...args);
    }, wait);
  };
  const cancellable = debounced as ((...args: Parameters<F>) => void) & {
    cancel: () => void;
  };
  cancellable.cancel = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };
  return cancellable;
}
