/* eslint-disable react-refresh/only-export-components */
// src/pages/streak/streak.routes.tsx

import type { RouteObject } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Loader2 } from "lucide-react"

// Lazy load page component
const StreakPage = lazy(() => import("./StreakPage"))

// Loading fallback
const StreakLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#f77f00] mx-auto mb-4" />
      <p className="text-[var(--color-text-secondary)]">Loading streak...</p>
    </div>
  </div>
)

export const streakRoutes: RouteObject[] = [
  {
    path: "streak",
    element: (
      <Suspense fallback={<StreakLoader />}>
        <StreakPage />
      </Suspense>
    ),
  },
]
