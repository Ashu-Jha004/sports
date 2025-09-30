// lib/utils/debounce.ts

/**
 * =============================================================================
 * DEBOUNCE UTILITIES & HELPERS
 * =============================================================================
 */

/**
 * Creates a debounced version of a function (non-hook utility)
 * Useful for event handlers and utility functions outside React
 */
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate: boolean = false
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    const callNow = immediate && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) func.apply(this, args);
    }, delay);

    if (callNow) func.apply(this, args);
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Throttle function utility
 * Limits function execution to once per specified interval
 */
export function createThrottledFunction<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle: boolean = false;
  let timeoutId: NodeJS.Timeout | null = null;

  const throttled = function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      timeoutId = setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  } as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    inThrottle = false;
  };

  return throttled;
}
