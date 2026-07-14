import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import type { TileConfig } from "../types/tile.types"
import { TileGrid } from "./TileGrid"
import { ChildHeader, type BreadcrumbItem } from "@/components/common/ChildHeader"
interface ModuleHubPageProps {
  title: string
  tiles: TileConfig[]
  icon?: LucideIcon
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  showBack?: boolean
  headerActions?: ReactNode
}

export function ModuleHubPage({
  title,
  tiles,
  icon,
  subtitle,
  breadcrumbs,
  showBack,
  headerActions,
}: ModuleHubPageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <ChildHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        breadcrumbs={breadcrumbs}
        showBack={showBack}
      >
        {headerActions}
      </ChildHeader>

      <div className="max-w-[1920px] mx-auto">
        <TileGrid tiles={tiles} />
      </div>
    </div>
  )
}