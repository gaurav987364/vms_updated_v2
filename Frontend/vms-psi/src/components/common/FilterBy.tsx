import { Filter, ChevronDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQueryParams } from "@/shared/hooks/useQuery"
import { cn } from "@/lib/utils"

export interface FilterOption {
  value: string
  name: string
  label?: string
  children?: FilterOption[] // For nested sub-menus
  separator?: boolean // Add separator after this item
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
 * A flexible, theme-aware filter dropdown supporting flat and nested options.
 * Built on shadcn's DropdownMenu with full submenu support.
 *
 * Features:
 * - URL query param sync
 * - Flat or nested (multi-level) options
 * - Animated open/close panel, rotating chevron, selected checkmark
 * - Active-state highlight when a non-default filter is applied
 * - Fully responsive, theme-aware styling
 * - Auto-width matching with trigger
 *
 * @example
 * // USAGE 1: Simple flat options
 * const flatOptions = [
 *   { value: 'name', name: 'Name (A-Z)' },
 *   { value: 'email', name: 'Email' },
 *   { value: 'date', name: 'Date Created', separator: true }, // Add separator after
 *   { value: 'status', name: 'Status' }
 * ]
 * <FilterBy options={flatOptions} label="Sort By" defaultValue="name" />
 *
 * @example
 * // USAGE 2: Nested options with submenus
 * const nestedOptions = [
 *   { value: 'all', name: 'All Users' },
 *   {
 *     value: 'role',
 *     name: 'By Role',
 *     children: [
 *       { value: 'admin', name: 'Admin' },
 *       { value: 'user', name: 'User' },
 *       { value: 'guest', name: 'Guest' }
 *     ]
 *   },
 *   {
 *     value: 'department',
 *     name: 'By Department',
 *     children: [
 *       { value: 'it', name: 'IT' },
 *       { value: 'hr', name: 'HR' },
 *       {
 *         value: 'sales',
 *         name: 'Sales',
 *         children: [ // Multi-level nesting
 *           { value: 'sales-na', name: 'North America' },
 *           { value: 'sales-eu', name: 'Europe' }
 *         ]
 *       }
 *     ]
 *   },
 *   { value: 'date', name: 'By Date', separator: true }
 * ]
 * <FilterBy options={nestedOptions} label="Filter" paramKey="userFilter" />
 */
export function FilterBy({
  options,
  label = "Filter By",
  className,
  paramKey = "filter",
  defaultValue,
}: FilterByProps) {
  const [searchParams, setSearchParams] = useQueryParams()
  const fallback = defaultValue || options[0]?.value || ""
  const currentValue = searchParams.get(paramKey) || fallback
  const isActive = currentValue !== fallback

  // Recursive function to find selected option in nested structure
  const findOption = (opts: FilterOption[], value: string): FilterOption | null => {
    for (const opt of opts) {
      if (opt.value === value) return opt
      if (opt.children) {
        const found = findOption(opt.children, value)
        if (found) return found
      }
    }
    return null
  }

  const selectedOption = findOption(options, currentValue)

  const handleChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)

    if (value) {
      newParams.set(paramKey, value)
      // Reset to page 1 when filter changes
      newParams.set("page", "1")
    } else {
      newParams.delete(paramKey)
    }

    setSearchParams(newParams)
  }

  // Recursive component to render menu items (supports nesting)
  const renderMenuItems = (items: FilterOption[]): React.ReactNode => {
    return items.map((option) => {
      const selected = option.value === currentValue
      const hasChildren = option.children && option.children.length > 0

      if (hasChildren) {
        // Render submenu
        return (
          <DropdownMenuSub key={option.value}>
            <DropdownMenuSubTrigger
              className={cn(
                "flex items-center gap-2 px-2.5 py-2 text-sm rounded-[var(--radius-sm)] cursor-pointer",
                "transition-colors duration-150",
                "focus:bg-[var(--color-primary-light)] focus:text-[var(--color-primary)]",
                selected && "text-[var(--color-primary)] font-medium bg-[var(--color-primary-light)]/60"
              )}
            >
              {option.label || option.name}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className={cn(
                  "min-w-[10rem] p-1.5",
                  "rounded-[var(--radius-md)] border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
                )}
              >
                {renderMenuItems(option.children!)}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )
      }

      // Render regular menu item
      return (
        <div key={option.value}>
          <DropdownMenuItem
            onPointerDown={(e) => {
              e.preventDefault()
              handleChange(option.value)
            }}
            className={cn(
              "flex w-full items-center justify-between gap-2 px-2.5 py-2 text-sm rounded-[var(--radius-sm)] cursor-pointer",
              "transition-colors duration-150",
              "focus:bg-[var(--color-primary-light)] focus:text-[var(--color-primary)]",
              selected && "text-[var(--color-primary)] font-medium bg-[var(--color-primary-light)]/60"
            )}
          >
            <span className="truncate">{option.label || option.name}</span>
            {selected && (
              <Check size={14} className="shrink-0 text-[var(--color-primary)]" />
            )}
          </DropdownMenuItem>
          {option.separator && <DropdownMenuSeparator className="bg-[var(--color-border)] my-1" />}
        </div>
      )
    })
  }

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "group flex items-center gap-2.5 w-full h-10 px-3.5 text-sm text-left",
            "rounded-[var(--radius-md)] border bg-[var(--color-surface)]",
            "transition-all duration-200 ease-out",
            "hover:border-[var(--color-primary)]/50 hover:shadow-sm",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 focus-visible:border-[var(--color-primary)]",
            "data-[state=open]:border-[var(--color-primary)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--color-primary)]/20 data-[state=open]:shadow-sm",
            isActive
              ? "border-[var(--color-primary)]/40 bg-[var(--color-primary-light)]/20"
              : "border-[var(--color-border)]"
          )}
        >
          <Filter
            size={16}
            className={cn(
              "shrink-0 transition-colors duration-200",
              isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
            )}
          />
          <span
            className={cn(
              "flex-1 truncate",
              isActive
                ? "text-[var(--color-primary)] font-medium"
                : "text-[var(--color-text-primary)]"
            )}
          >
            {selectedOption?.label || selectedOption?.name || "Select..."}
          </span>
          <ChevronDown
            size={15}
            className={cn(
              "shrink-0 text-[var(--color-text-muted)]",
              "transition-transform duration-200 ease-out",
              "group-data-[state=open]:rotate-180"
            )}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className={cn(
            "w-[var(--radix-dropdown-menu-trigger-width)] min-w-[12rem] p-1.5",
            "rounded-[var(--radius-md)] border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
          )}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
              {label}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--color-border)] mb-1" />

            {renderMenuItems(options)}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}