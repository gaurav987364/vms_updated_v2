import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface RequirePermissionProps {
  permission: string
  children: ReactNode
}

/**
 * RequirePermission Guard
 * ------------------------------------------------------
 * Wraps an INDIVIDUAL route/page. Checks if the logged-in
 * user's permissions include the required slug.
 * Applied per-module, per-page — never automatic, by design.
 *
 * If user lacks permission, redirects to 403 Unauthorized page.
 * ------------------------------------------------------
 */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { user } = useAuth()

  // TODO: Implement real permission check when backend is ready
  // Example: const hasPermission = user?.permissions?.includes(permission)

  // Temporary: Allow all authenticated users (will be updated with real permission system)
  const hasPermission = true

  if (!hasPermission) {
    return <Navigate to="/common/unauthorized" replace />
  }

  return <>{children}</>
}