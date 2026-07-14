import { Search, X } from "lucide-react"
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
 * - Animated clear button when value exists
 * - Active-state ring while a query is applied
 * - Fully responsive, theme-aware styling
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

  const isActive = value.length > 0

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group w-full">
        <Search
          size={16}
          className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10",
            "transition-colors duration-200",
            isActive
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)]"
          )}
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            "h-10 w-full pl-10 pr-9 text-sm rounded-[var(--radius-md)]",
            "bg-[var(--color-surface)] text-[var(--color-text-primary)]",
            "placeholder:text-[var(--color-text-muted)]",
            "border-[var(--color-border)]",
            "transition-all duration-200 ease-out",
            "hover:border-[var(--color-primary)]/50",
            "focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20",
            isActive && "border-[var(--color-primary)]/40 bg-[var(--color-primary-light)]/20"
          )}
        />
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          tabIndex={isActive ? 0 : -1}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-10",
            "w-6 h-6 flex items-center justify-center rounded-full",
            "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
            "hover:bg-[var(--color-border)]/40",
            "transition-all duration-150 ease-out",
            isActive
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 pointer-events-none"
          )}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}