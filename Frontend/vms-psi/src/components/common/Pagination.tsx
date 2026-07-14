import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQueryParams } from "@/shared/hooks/useQuery"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

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
  maxVisiblePages = 3,
}: PaginationProps) {
  const [searchParams, setSearchParams] = useQueryParams()
  const urlPage = parseInt(searchParams.get(paramKey) || "1", 10)

  // Sanitize and validate current page
  let currentPage = controlledPage || urlPage

  // Ensure currentPage is within valid range
  if (currentPage < 1) currentPage = 1
  if (currentPage > totalPages) currentPage = totalPages
  if (isNaN(currentPage)) currentPage = 1

  const handlePageChange = (page: number) => {
    // Strict validation
    if (!page || isNaN(page) || page < 1 || page > totalPages || page === currentPage) {
      return
    }

    if (onPageChange) {
      onPageChange(page)
    } else {
      const newParams = new URLSearchParams(searchParams)
      newParams.set(paramKey, page.toString())
      setSearchParams(newParams)
    }
  }

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      if (e.key === "ArrowLeft" && currentPage > 1) {
        handlePageChange(currentPage - 1)
      } else if (e.key === "ArrowRight" && currentPage < totalPages) {
        handlePageChange(currentPage + 1)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentPage, totalPages])

  // Generate visible page numbers with production-level edge case handling
  const getVisiblePages = () => {
    const pages: (number | string)[] = []

    // Edge case: invalid totalPages
    if (totalPages <= 0 || isNaN(totalPages)) return [1]

    // If total pages fits within maxVisiblePages, show all
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    // Calculate range for sliding window
    const halfVisible = Math.floor(maxVisiblePages / 2)
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    // Adjust range if near the start
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages)
      startPage = 1
    }

    // Adjust range if near the end
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1)
      endPage = totalPages
    }

    // Always show first page
    if (startPage > 1) {
      pages.push(1)
      // Add ellipsis if there's a gap
      if (startPage > 2) {
        pages.push("...")
      }
    }

    // Add visible pages in range
    for (let i = startPage; i <= endPage; i++) {
      // Avoid duplicating first page if it's in range
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      } else if (i === 1 && startPage === 1) {
        pages.push(i)
      } else if (i === totalPages && endPage === totalPages) {
        pages.push(i)
      }
    }

    // Always show last page
    if (endPage < totalPages) {
      // Add ellipsis if there's a gap
      if (endPage < totalPages - 1) {
        pages.push("...")
      }
      pages.push(totalPages)
    }

    return pages
  }

  // Don't render if only 1 page or invalid totalPages
  if (totalPages <= 1 || isNaN(totalPages)) return null

  const visiblePages = getVisiblePages()

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]",
        className
      )}
    >
      {/* Page info - aligned to right on desktop */}
      <div className="order-2 sm:order-1 text-sm text-[var(--color-text-secondary)]">
        Page <span className="font-medium text-[var(--color-text-primary)]">{currentPage}</span> of{" "}
        <span className="font-medium text-[var(--color-text-primary)]">{totalPages}</span>
      </div>

      {/* Pagination controls - centered */}
      <div className="order-1 sm:order-2 flex items-center gap-1">
        {/* First page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
            className="h-9 w-9 hover:bg-[var(--color-surface-hover)] cursor-pointer disabled:cursor-not-allowed"
            title="First page"
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
          className="h-9 w-9 hover:bg-[var(--color-surface-hover)] cursor-pointer disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-[var(--color-text-muted)] select-none"
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
                  "h-9 min-w-[36px] font-medium",
                  currentPage === page
                    ? "bg-[var(--color-primary)] text-white pointer-events-none shadow-sm"
                    : "hover:bg-[var(--color-surface-hover)] cursor-pointer disabled:cursor-not-allowed"
                )}
                title={`Go to page ${page}`}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="h-9 w-9 hover:bg-[var(--color-surface-hover)] cursor-pointer disabled:cursor-not-allowed"
          title="Next page"
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
            className="h-9 w-9 hover:bg-[var(--color-surface-hover)] cursor-pointer disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight size={16} />
          </Button>
        )}
      </div>

      {/* Empty spacer for desktop to keep center alignment */}
      <div className="hidden sm:block order-3 w-[100px]"></div>
    </div>
  )
}
