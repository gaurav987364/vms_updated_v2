/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useThrottle Hook
 * ------------------------------------------------------
 * Throttles a callback function to execute at most once per specified delay.
 * Unlike debounce, throttle ensures the function executes at regular intervals
 * during continuous calls.
 *
 * @param callback - The function to throttle
 * @param delay - Minimum time between executions in milliseconds (default: 500ms)
 * @returns A throttled version of the callback
 *
 * @example
 * const handleScroll = useThrottle(() => {
 *   console.log('Scrolling...')
 * }, 200)
 *
 * window.addEventListener('scroll', handleScroll)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lastRan.current = Date.now();
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      } else {
        // Schedule the call for later if it's within the throttle window
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRan.current = Date.now();
          },
          delay - (now - lastRan.current),
        );
      }
    },
    [callback, delay],
  );
}

/**
 * useThrottledValue Hook
 * ------------------------------------------------------
 * Returns a throttled version of the provided value.
 * The value will update at most once per specified delay.
 *
 * @param value - The value to throttle
 * @param delay - Minimum time between updates in milliseconds (default: 500ms)
 * @returns The throttled value
 *
 * @example
 * const [scrollY, setScrollY] = useState(0)
 * const throttledScrollY = useThrottledValue(scrollY, 200)
 */
export function useThrottledValue<T>(value: T, delay: number = 500): T {
  const lastUpdated = useRef<number>(0);
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lastUpdated.current === 0) {
      lastUpdated.current = Date.now();
    }

    const now = Date.now();

    if (now - lastUpdated.current >= delay) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(
        () => {
          setThrottledValue(value);
          lastUpdated.current = Date.now();
        },
        delay - (now - lastUpdated.current),
      );
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return throttledValue;
}
