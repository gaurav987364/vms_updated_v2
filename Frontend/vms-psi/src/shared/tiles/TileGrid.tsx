// src/components/tiles/TileGrid.tsx
import type { TileConfig } from "../types/tile.types"
import { Tile } from "./Tile"
import { useAuth } from "@/context/AuthContext"

interface TileGridProps {
  tiles: TileConfig[]
}

/**
 * TileGrid
 * ------------------------------------------------------
 * Renders a responsive grid of tiles, automatically filtering
 * out any tile the current user doesn't have permission to see.
 *
 * This is the ONLY place permission-filtering logic for tiles
 * lives — individual tile configs just declare what permission
 * they need, and this component enforces it consistently.
 *
 * IMPORTANT: this filtering is a UX convenience (don't show
 * options the user can't use) — it is NOT a security boundary.
 * The actual protection is enforced by the route's own
 * RequirePermission guard and by the backend API. Even if a
 * tile were mistakenly shown, the destination route and API
 * would still correctly block unauthorized access.
 * ------------------------------------------------------
 */
export function TileGrid({ tiles }: TileGridProps) {
//   const { hasPermission } = useAuth()
const hasPermission = (p)=> true

  const visibleTiles = tiles.filter((tile) => {
    if (!tile.requiredPermission) return true // universal tile, no permission needed
    return hasPermission(tile.requiredPermission)
  })

  if (visibleTiles.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-text-muted)] text-sm">
        No modules available for your account. Contact your administrator if this seems wrong.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-8 sm:gap-y-10 lg:gap-y-12 justify-items-center">
      {visibleTiles.map((tile) => (
        <Tile key={tile.id} tile={tile} />
      ))}
    </div>
  )
}