/* eslint-disable react-refresh/only-export-components */
// src/pages/profile/profile.routes.tsx

import type { RouteObject } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Loader2 } from "lucide-react"

// Lazy load page component
const ProfilePage = lazy(() => import("./ProfilePage"))

// Loading fallback
const ProfileLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
      <p className="text-[var(--color-text-secondary)]">Loading profile...</p>
    </div>
  </div>
)

export const profileRoutes: RouteObject[] = [
  {
    path: "profile",
    element: (
      <Suspense fallback={<ProfileLoader />}>
        <ProfilePage />
      </Suspense>
    ),
  },
]
