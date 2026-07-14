// src/components/tiles/Tile.tsx

import { Link } from "react-router-dom"
import type { TileConfig } from "../types/tile.types"

const ACCENT_STYLES: Record<NonNullable<TileConfig["accent"]>, string> = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
}

interface TileProps {
  tile: TileConfig
}

/**
 * Tile
 * ------------------------------------------------------
 * Clean, professional tile component with subtle hover effect.
 * Each tile navigates to its module (Vendors, Users, etc).
 *
 * FIX: title and subtitle are both clamped to a fixed number
 * of lines (line-clamp-2) AND the whole text block has a
 * min-height reserved. This means a short title ("QCD") and a
 * long title ("Supplier Complaint Register") both occupy the
 * exact same vertical space — so subtitles and "Coming soon"
 * badges line up evenly across every tile in the grid, instead
 * of shifting based on how much each tile's text wraps.
 * ------------------------------------------------------
 */
export function Tile({ tile }: TileProps) {
  const iconColor = ACCENT_STYLES[tile.accent ?? "primary"]
  const Icon = tile.icon

  const content = (
    <div className="flex flex-col items-center gap-4 w-full group">
      {/* Tile card - clean and simple */}
      <div
        className={`
          relative flex items-center justify-center
          w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44
          rounded-[20px] sm:rounded-[22px] lg:rounded-[24px] xl:rounded-[26px]
          bg-[var(--color-surface)]
          border border-[var(--color-border)]
          shadow-sm
          transition-all duration-200 ease-out
          ${tile.disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-primary)]"
          }
        `}
      >
        {/* Badge count */}
        {typeof tile.badgeCount === "number" && tile.badgeCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
            style={{ backgroundColor: "var(--color-danger)" }}
          >
            {tile.badgeCount > 99 ? "99+" : tile.badgeCount}
          </span>
        )}

        {/* Icon */}
        <Icon
          size={28}
          className="sm:w-[30px] sm:h-[30px] md:w-8 md:h-8 lg:w-[34px] lg:h-[34px] xl:w-9 xl:h-9 transition-transform duration-200 group-hover:scale-110"
          strokeWidth={1.8}
          style={{ color: iconColor }}
        />
      </div>

      {/* Text content — fixed-height block so every tile aligns evenly */}
      <div className="flex flex-col items-center w-full max-w-[160px] px-2 min-h-[76px] sm:min-h-[82px]">
        {/* Title - clamped to 2 lines max, reserves space for 2 lines always */}
        <h3 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-text-primary)] leading-tight text-center line-clamp-2 min-h-[2.4em] flex items-center">
          {tile.title}
        </h3>

        {/* Subtitle - clamped to 2 lines max, reserves space consistently */}
        {tile.subtitle && (
          <p className="text-[10px] sm:text-xs font-medium text-[var(--color-text-secondary)] leading-relaxed text-center line-clamp-2 min-h-[2.4em] mt-1">
            {tile.subtitle}
          </p>
        )}

        {/* Coming soon badge - pinned consistently below the text block */}
        {tile.disabled && (
          <span className="inline-block text-[9px] sm:text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mt-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
            Coming soon
          </span>
        )}
      </div>
    </div>
  )

  if (tile.disabled) {
    return <div className="block">{content}</div>
  }

  return (
    <Link to={tile.link} className="block">
      {content}
    </Link>
  )
}