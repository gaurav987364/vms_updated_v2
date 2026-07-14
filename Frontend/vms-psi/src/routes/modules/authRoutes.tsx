// src/routes/modules/authRoutes.tsx

import { Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import ErrorPage from "@/pages/ErrorPage"

// Lazy load auth pages
// eslint-disable-next-line react-refresh/only-export-components
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"))
// eslint-disable-next-line react-refresh/only-export-components
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"))

// Loading fallback
// eslint-disable-next-line react-refresh/only-export-components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[var(--color-text-secondary)]">Loading...</p>
    </div>
  </div>
)

/**
 * Auth Routes (Public)
 * ------------------------------------------------------
 * These routes don't require authentication.
 * Users can access login without being logged in.
 * ErrorPage catches any runtime errors in auth pages.
 * ------------------------------------------------------
 */
export const authRoutes = (
  <>
    <Route
      path="/login"
      element={
        <Suspense fallback={<LoadingFallback />}>
          <LoginPage />
        </Suspense>
      }
      errorElement={<ErrorPage />}
    />
    <Route
      path="/reset-password"
      element={
        <Suspense fallback={<LoadingFallback />}>
          <ResetPasswordPage />
        </Suspense>
      }
      errorElement={<ErrorPage />}
    />
  </>
)
