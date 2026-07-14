/* eslint-disable react-refresh/only-export-components */
// src/pages/users/user.routes.tsx

import type { RouteObject } from "react-router-dom"
import { Suspense, lazy } from "react"
import { RequirePermission } from "@/utils/validators/RequirePermission"
import { Loader2 } from "lucide-react"

// Lazy load page component
const UserListPage = lazy(() => import("./UserListPage"))

// Loading fallback
const UserPageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
      <p className="text-[var(--color-text-secondary)]">Loading users...</p>
    </div>
  </div>
)

export const usersRoutes: RouteObject[] = [
  {
    path: "users",
    element: (
      <RequirePermission permission="user:manage">
        <Suspense fallback={<UserPageLoader />}>
          <UserListPage />
        </Suspense>
      </RequirePermission>
    ),
  },
]