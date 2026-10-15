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

// Lazy load forgot password page
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"))

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
 * - /login                     → Public login/signup page
 * - /reset-password            → Public reset password page
 * - /                          → Protected routes wrapper
 *   - /dashboard               → Dashboard (home)
 *   - /unauthorized            → 403 page
 *   - /*                       → 404 page (catch-all for invalid routes)
 * ------------------------------------------------------
 */
export const router = createBrowserRouter([
  // Public login route
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },

  // Public forgot password route
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<RouteLoader />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
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
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AppLayout />,       // Header + Sidebar shell
        errorElement: <ErrorPage />,  // Catch errors in layout/modules
        children: [
          // Redirect / to /dashboard
          { index: true, element: <Navigate to="dashboard" replace /> },

          // All module routes
          ...moduleRoutes,

          // Unauthorized access page (403)
          { path: "unauthorized", element: <UnauthorizedPage /> },

          // Catch-all for invalid routes (404)
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },

  // Catch-all for completely invalid paths (404)
  { path: "*", element: <NotFoundPage /> },
])