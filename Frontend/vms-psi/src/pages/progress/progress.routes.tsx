/* eslint-disable react-refresh/only-export-components */
// src/pages/progress/progress.routes.tsx

import type { RouteObject } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Loader2 } from "lucide-react"

const ProgressPage = lazy(() => import("./ProgressPage"))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
      <p className="text-[var(--color-text-secondary)]">Loading Progress...</p>
    </div>
  </div>
)

export const progressRoutes: RouteObject[] = [
  {
    path: "progress",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProgressPage />
      </Suspense>
    ),
  },
]
