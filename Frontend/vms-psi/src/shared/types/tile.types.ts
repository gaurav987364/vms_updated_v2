// src/shared/types/tile.types.ts

import type { LucideIcon } from "lucide-react"

/**
 * HierarchyNode
 * ------------------------------------------------------
 * Core adjacency-list pattern for tracking hierarchy anywhere in the app.
 * Used for tiles, modules, roles, permissions — one mental model, reused everywhere.
 * ------------------------------------------------------
 */
export interface HierarchyNode {
  /** Globally unique slug, e.g. "vendors", "vendors-onboarding" */
  id: string

  /** Parent node ID; null = top-level/root node */
  parentId: string | null
}

/**
 * TileConfig
 * ------------------------------------------------------
 * A single dashboard tile's definition. Fully data-driven —
 * to add a new module tile later, you only add a new object
 * matching this shape to a config array. No component code
 * ever needs to change.
 *
 * Extends HierarchyNode to support multi-level tile hierarchies.
 * ------------------------------------------------------
 */
export interface TileConfig extends HierarchyNode {
  /** Route path the tile navigates to on click, e.g. "/common/vendors" */
  link: string

  /** Main label, e.g. "Vendors" */
  title: string

  /** Optional secondary line, e.g. "Manage vendor profiles and compliance" */
  subtitle?: string

  /** lucide-react icon component, e.g. Building2 */
  icon: LucideIcon

  /**
   * Permission slug required to see this tile, e.g. "vendor:read".
   * If omitted, the tile is visible to ANY authenticated user —
   * only omit this for genuinely universal tiles (e.g. "My Profile").
   */
  requiredPermission?: string

  /** Optional numeric badge, e.g. pending approval count. Omit if not needed. */
  badgeCount?: number

  /** Accent color token name — maps to a predefined palette in Tile.tsx */
  accent?: "primary" | "secondary" | "success" | "warning" | "danger" | "info"

  /** Set true to render the tile but visually disabled (e.g. "Coming soon") */
  disabled?: boolean
}