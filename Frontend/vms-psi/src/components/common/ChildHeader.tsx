import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface ChildHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  breadcrumbs?: BreadcrumbItem[]
  showBack?: boolean
  onBack?: () => void
  children?: ReactNode
}

/**
 * ChildHeader
 * ------------------------------------------------------
 * SELF-CONTAINED full-bleed header. Works correctly whether
 * used directly in a leaf page OR inside ModuleHubPage —
 * no page needs to add its own margin hacks.
 *
 * How the full-bleed works: AppLayout's <main> wraps every
 * routed page in `p-4 lg:p-6` padding. The negative margins
 * below (-mx-4 lg:-mx-6 -mt-4 lg:-mt-6) exactly cancel that
 * padding on the top/left/right sides, so this header visually
 * touches the edges of the content area and sits flush under
 * the main app Header — while the page's own content (rendered
 * after this component) still gets normal padding untouched.
 *
 * IMPORTANT: if AppLayout's <main> padding value ever changes
 * (currently p-4 lg:p-6), update the negative margins below to
 * match — they must always be equal and opposite.
 * ------------------------------------------------------
 */
export function ChildHeader({
  title,
  subtitle,
  icon: Icon,
  breadcrumbs,
  showBack = false,
  onBack,
  children,
}: ChildHeaderProps) {
  const navigate = useNavigate()
  const ResolvedIcon = Icon ?? LayoutGrid

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <div
      className="
        -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 mb-6
        w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)]
        bg-[var(--color-surface)] border-b border-[var(--color-border)]
      "
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4">
        {/* ---------- Breadcrumb trail (optional) ---------- */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center flex-wrap gap-1 mb-1.5 text-xs">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                  {crumb.path && !isLast ? (
                    <button
                      onClick={() => navigate(crumb.path!)}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={isLast ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-secondary)]"}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight size={12} className="text-[var(--color-text-muted)]" />}
                </span>
              )
            })}
          </nav>
        )}

        {/* ---------- Main row ---------- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {showBack && (
              <button
                onClick={handleBack}
                aria-label="Go back"
                className="shrink-0 w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <div className="shrink-0 w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-primary-light)] flex items-center justify-center">
              <ResolvedIcon size={19} className="text-[var(--color-primary)]" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide text-[var(--color-text-primary)] truncate leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {children && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}