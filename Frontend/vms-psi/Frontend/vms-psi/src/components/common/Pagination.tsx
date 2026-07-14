import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQueryParams } from "@/shared/hooks/useQuery"
import { cn } from "@/lib/utils"

interface PaginationProps {
  totalPages: number
  currentPage?: number
  onPageChange?: (page: number) => void
  className?: string
  paramKey?: string
  showFirstLast?: boolean
  maxVisiblePages?: number
}

/**
 * Pagination Component
 * ------------------------------------------------------
 * A fully-featured, responsive pagination component with URL sync.
 * Features:
 * - URL query param sync
 * - First/Last page buttons
 * - Smart page number display
 * - Keyboard navigation
 * - Fully responsive
 * - Theme-aware styling
 *
 * @example
 * <Pagination totalPages={10} />
 */
export function Pagination({
  totalPages,
  currentPage: controlledPage,
  onPageChange,
  className,
  paramKey = "page",
  showFirstLast = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  const [searchParams, setSearchParams] = useQueryParams()
  const urlPage = parseInt(searchParams.get(paramKey) || "1", 10)
  const currentPage = controlledPage || urlPage

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return

    if (onPageChange) {
      onPageChange(page)
    } else {
      const newParams = new URLSearchParams(searchParams)
      newParams.set(paramKey, page.toString())
      setSearchParams(newParams)
    }
  }

  // Generate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    // Adjust if we're near the start
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages)
    }

    // Adjust if we're near the end
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1)
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) pages.push("...")
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...")
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]",
        className
      )}
    >
      {/* Page info */}
      <div className="text-sm text-[var(--color-text-secondary)]">
        Page <span className="font-medium text-[var(--color-text-primary)]">{currentPage}</span> of{" "}
        <span className="font-medium text-[var(--color-text-primary)]">{totalPages}</span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
            className="hidden sm:inline-flex"
          >
            <ChevronsLeft size={16} />
          </Button>
        )}

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {visiblePages.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-[var(--color-text-muted)]"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page as number)}
                className={cn(
                  "min-w-[32px]",
                  currentPage === page && "pointer-events-none"
                )}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden px-3 py-1 text-sm font-medium text-[var(--color-text-primary)]">
          {currentPage} / {totalPages}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </Button>

        {/* Last page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
            className="hidden sm:inline-flex"
          >
            <ChevronsRight size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
