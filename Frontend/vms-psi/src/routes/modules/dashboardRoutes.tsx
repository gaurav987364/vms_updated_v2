
// src/routes/modules/dashboardRoutes.tsx
/* eslint-disable react-refresh/only-export-components */

import { Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import ProtectedRoute from "@/utils/validators/ProtectedRoute"
import AppLayout from "@/layout/AppLayout"
import ErrorPage from "@/pages/ErrorPage"

// Lazy load dashboard pages
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"))

// Loading fallback
/**
 * Dashboard Routes (Protected)
 * ------------------------------------------------------
 * These routes require authentication.
 * Wrapped with ProtectedRoute and AppLayout.
 * ErrorPage catches any runtime errors in these routes.
 * ------------------------------------------------------
 */
export const dashboardRoutes = (
  <Route element={<ProtectedRoute />} errorElement={<ErrorPage />}>
    <Route path="/" element={<AppLayout />} errorElement={<ErrorPage />}>
      <Route
        index
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[var(--color-text-secondary)]">Loading...</p>
                </div>
              </div>
            }
          >
            <DashboardPage />
          </Suspense>
        }
        errorElement={<ErrorPage />}
      />
    </Route>
  </Route>
)
