import { useSearchParams } from 'react-router-dom'

/**
 * useQuery Hook
 * ------------------------------------------------------
 * A convenient hook to read URL query parameters.
 * Returns the value of the specified query param or null if not present.
 *
 * @example
 * const search = useQuery('search') // Gets ?search=value from URL
 * const page = useQuery('page') || '1' // Gets page with default fallback
 */
export function useQuery(key: string): string | null {
  const [searchParams] = useSearchParams()
  return searchParams.get(key)
}

/**
 * useQueryParams Hook
 * ------------------------------------------------------
 * Returns both searchParams and setSearchParams for full control
 * over URL query parameters.
 *
 * @example
 * const [searchParams, setSearchParams] = useQueryParams()
 * setSearchParams({ page: '2', search: 'test' })
 */
export function useQueryParams() {
  return useSearchParams()
}
