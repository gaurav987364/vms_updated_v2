import { useEffect, useRef, useState } from 'react'

/**
 * useDebounce Hook
 * ------------------------------------------------------
 * Debounces a callback function by the specified delay.
 * Useful for search inputs, API calls, or any action that
 * should only trigger after the user stops typing/interacting.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @param dependencies - Dependency array like useEffect
 *
 * @example
 * useDebounce(() => {
 *   fetchData(searchTerm)
 * }, 500, [searchTerm])
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  dependencies: any[] = []
): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback()
    }, delay)

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, dependencies)
}

/**
 * useDebouncedValue Hook
 * ------------------------------------------------------
 * Returns a debounced version of the provided value.
 * The value will only update after the specified delay has passed
 * without the value changing.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebouncedValue(searchTerm, 500)
 *
 * useEffect(() => {
 *   fetchData(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
