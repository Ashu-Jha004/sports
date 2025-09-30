// hooks/useDebounce.ts
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * =============================================================================
 * DEBOUNCE HOOK TYPES
 * =============================================================================
 */

interface DebounceOptions {
  readonly leading?: boolean;
  readonly trailing?: boolean;
  readonly maxWait?: number;
}

interface DebounceWithLoadingReturn<T> {
  readonly debouncedValue: T;
  readonly isDebouncing: boolean;
  readonly cancel: () => void;
}

type DebouncedFunction<T extends (...args: any[]) => any> = T & {
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
};

/**
 * =============================================================================
 * CORE DEBOUNCE HOOKS
 * =============================================================================
 */

/**
 * Debounces a value with configurable delay and cleanup
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @param options - Additional debounce configuration
 *
 * @example
 * ```
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     performSearch(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(
  value: T,
  delay: number,
  options: DebounceOptions = {}
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const { leading = false, trailing = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leadingRef = useRef(true);

  useEffect(() => {
    // Leading edge execution
    if (leading && leadingRef.current) {
      setDebouncedValue(value);
      leadingRef.current = false;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        leadingRef.current = true;
      }, delay);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedValue;
}

/**
 * Debounces a callback function with enhanced control
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Additional debounce configuration
 *
 * @example
 * ```
 * const debouncedSearch = useDebounceCallback((term: string) => {
 *   api.search(term);
 * }, 300);
 *
 * // Use in input handler
 * const handleChange = (e) => debouncedSearch(e.target.value);
 * ```
 */
export function useDebounceCallback<TFunc extends (...args: any[]) => any>(
  callback: TFunc,
  delay: number,
  options: DebounceOptions = {}
): DebouncedFunction<TFunc> {
  const { leading = false, trailing = true, maxWait } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<TFunc>>();
  const resultRef = useRef<ReturnType<TFunc>>();

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    lastCallTimeRef.current = 0;
  }, []);

  const flush = useCallback(() => {
    if (lastArgsRef.current) {
      const result = callback(...lastArgsRef.current);
      resultRef.current = result;
      cancel();
      return result;
    }
    return resultRef.current;
  }, [callback, cancel]);

  const debouncedFn = useCallback(
    (...args: Parameters<TFunc>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;
      lastArgsRef.current = args;

      const invokeFunction = () => {
        const result = callback(...args);
        resultRef.current = result;
        lastCallTimeRef.current = Date.now();
        return result;
      };

      // Leading edge execution
      if (leading && (!lastCallTimeRef.current || timeSinceLastCall >= delay)) {
        cancel();
        return invokeFunction();
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set up max wait timeout
      if (maxWait && !maxTimeoutRef.current && lastCallTimeRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          invokeFunction();
          cancel();
        }, maxWait - timeSinceLastCall);
      }

      // Trailing edge execution
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          invokeFunction();
          if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
            maxTimeoutRef.current = null;
          }
        }, delay);
      }

      return resultRef.current;
    },
    [callback, delay, leading, trailing, maxWait, cancel]
  ) as DebouncedFunction<TFunc>;

  // Add cancel and flush methods
  debouncedFn.cancel = cancel;
  debouncedFn.flush = flush;

  // Cleanup on unmount
  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return debouncedFn;
}

/**
 * Debounces a value with loading state indicator
 * Perfect for search inputs and form validation
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 *
 * @example
 * ```
 * const [query, setQuery] = useState('');
 * const { debouncedValue, isDebouncing, cancel } = useDebounceWithLoading(query, 500);
 *
 * return (
 *   <div>
 *     <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *     {isDebouncing && <Spinner />}
 *     <button onClick={cancel}>Cancel</button>
 *   </div>
 * );
 * ```
 */
export function useDebounceWithLoading<T>(
  value: T,
  delay: number
): DebounceWithLoadingReturn<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDebouncing(false);
  }, []);

  useEffect(() => {
    // Start debouncing
    setIsDebouncing(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return {
    debouncedValue,
    isDebouncing,
    cancel,
  };
}

/**
 * =============================================================================
 * UTILITY HOOKS
 * =============================================================================
 */

/**
 * Debounce hook specifically optimized for search functionality
 * Includes common search patterns and optimizations
 */
export function useSearchDebounce(
  searchTerm: string,
  delay: number = 300,
  minLength: number = 2
) {
  const [isSearching, setIsSearching] = useState(false);

  const debouncedTerm = useDebounce(searchTerm, delay);

  // Only consider it a valid search if it meets minimum length
  const shouldSearch = debouncedTerm.length >= minLength;

  useEffect(() => {
    setIsSearching(
      searchTerm.length >= minLength && searchTerm !== debouncedTerm
    );
  }, [searchTerm, debouncedTerm, minLength]);

  return {
    debouncedSearchTerm: shouldSearch ? debouncedTerm : "",
    isSearching,
    shouldSearch,
  };
}
