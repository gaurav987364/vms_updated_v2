// src/routes/AppRoutes.tsx

import { createBrowserRouter, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import { Loader2 } from "lucide-react"
import { moduleRoutes } from "./moduleRegistry"
import LoginPage from "@/pages/auth/LoginPage"
import ErrorPage from "@/pages/ErrorPage"
import NotFoundPage from "@/pages/NotFoundPage"
import UnauthorizedPage from "@/pages/UnauthorizedPage"
import ProtectedRoute from "@/utils/validators/ProtectedRoute"
import AppLayout from "@/layout/AppLayout"

// Lazy load reset password page
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"))

// Loading fallback for lazy routes
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
      <p className="text-[var(--color-text-secondary)]">Loading...</p>
    </div>
  </div>
)

/**
 * Application Router
 * ------------------------------------------------------
 * Centralized router configuration using createBrowserRouter (data router API).
 *
 * Route Structure:
 * - /login                     → Public login page
 * - /common                    → Protected routes wrapper
 *   - /common/dashboard        → Dashboard (home)
 *   - /common/users            → Users module
 *   - /common/unauthorized     → 403 page
 *   - /common/*                → 404 page (catch-all for invalid protected routes)
 * - /                          → Redirects to /common/dashboard
 * - /*                         → 404 page (catch-all for invalid root paths)
 * ------------------------------------------------------
 */
export const router = createBrowserRouter([
  // Public login route
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },

  // Public reset password route
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<RouteLoader />}>
        <ResetPasswordPage />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },

  // Protected routes (require authentication)
  {
    path: "/common",
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AppLayout />,       // Header + Sidebar shell
        errorElement: <ErrorPage />,  // Catch errors in layout/modules
        children: [
          // Redirect /common to /common/dashboard
          { index: true, element: <Navigate to="dashboard" replace /> },

          // All module routes (dashboard, users, vendors, etc.)
          ...moduleRoutes,

          // Unauthorized access page (403)
          { path: "unauthorized", element: <UnauthorizedPage /> },

          // Catch-all for invalid /common/* routes (404)
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },

  // Root redirect
  { path: "/", element: <Navigate to="/common/dashboard" replace /> },

  // Catch-all for completely invalid paths (404)
  { path: "*", element: <NotFoundPage /> },
])