import { Filter } from "lucide-react"
import { Select } from "@/components/ui/select"
import { useQueryParams } from "@/shared/hooks/useQuery"
import { cn } from "@/lib/utils"

export interface FilterOption {
  value: string
  name: string
  label?: string
}

interface FilterByProps {
  options: FilterOption[]
  label?: string
  className?: string
  paramKey?: string
  defaultValue?: string
}

/**
 * FilterBy Component
 * ------------------------------------------------------
 * A responsive, theme-aware filter dropdown that updates URL query params.
 * Features:
 * - URL query param sync
 * - Customizable filter options
 * - Fully responsive
 * - Theme-aware styling
 *
 * @example
 * const filterOptions = [
 *   { value: 'name', name: 'Name' },
 *   { value: 'email', name: 'Email' }
 * ]
 * <FilterBy options={filterOptions} label="Sort By" />
 */
export function FilterBy({
  options,
  label = "Filter By",
  className,
  paramKey = "filter",
  defaultValue,
}: FilterByProps) {
  const [searchParams, setSearchParams] = useQueryParams()
  const currentValue = searchParams.get(paramKey) || defaultValue || options[0]?.value || ""

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams)
    const value = e.target.value

    if (value) {
      newParams.set(paramKey, value)
      // Reset to page 1 when filter changes
      newParams.set("page", "1")
    } else {
      newParams.delete(paramKey)
    }

    setSearchParams(newParams)
  }

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        <Filter
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10"
          size={16}
        />
        <select
          value={currentValue}
          onChange={handleChange}
          className={cn(
            "h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm",
            "pl-9 pr-8 appearance-none cursor-pointer",
            "focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20",
            "hover:border-[var(--color-border-hover)] transition-colors"
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label || option.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="text-[var(--color-text-muted)]"
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
