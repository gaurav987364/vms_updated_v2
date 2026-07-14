import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useQueryParams } from "@/shared/hooks/useQuery"
import { useDebouncedValue } from "@/shared/hooks/useDebounce"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  label?: string
  placeholder?: string
  className?: string
  debounceDelay?: number
  paramKey?: string
}

/**
 * SearchBar Component
 * ------------------------------------------------------
 * A responsive, theme-aware search input that updates URL query params.
 * Features:
 * - Debounced search (default 500ms)
 * - URL query param sync
 * - Clear button when value exists
 * - Fully responsive
 * - Theme-aware styling
 *
 * @example
 * <SearchBar label="Search Users" placeholder="Search by name..." />
 */
export function SearchBar({
  label = "Search",
  placeholder = "Search...",
  className,
  debounceDelay = 500,
  paramKey = "search",
}: SearchBarProps) {
  const [searchParams, setSearchParams] = useQueryParams()
  const [value, setValue] = useState(searchParams.get(paramKey) || "")
  const debouncedValue = useDebouncedValue(value, debounceDelay)

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)

    if (debouncedValue) {
      newParams.set(paramKey, debouncedValue)
      // Reset to page 1 when searching
      newParams.set("page", "1")
    } else {
      newParams.delete(paramKey)
    }

    setSearchParams(newParams)
  }, [debouncedValue])

  const handleClear = () => {
    setValue("")
  }

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          size={16}
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-9 pr-8 h-9 w-full bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
