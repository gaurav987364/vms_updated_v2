/* eslint-disable react-refresh/only-export-components */
// src/pages/practice/practice.routes.tsx

import type { RouteObject } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Loader2 } from "lucide-react"

// Lazy load page component
const PracticePage = lazy(() => import("./PracticePage"))

// Loading fallback
const PracticeLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#ff6b35] mx-auto mb-4" />
      <p className="text-[var(--color-text-secondary)]">Loading practice environment...</p>
    </div>
  </div>
)

export const practiceRoutes: RouteObject[] = [
  {
    path: "practice/:problemId",
    element: (
      <Suspense fallback={<PracticeLoader />}>
        <PracticePage />
      </Suspense>
    ),
  },
]
