// src/utils/validators/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/**
 * ProtectedRoute
 * ------------------------------------------------------
 * Route wrapper that requires authentication.
 *
 * Flow:
 * 1. Wait for auth bootstrap to complete (isLoading)
 * 2. If not authenticated → redirect to /login with return URL
 * 3. If authenticated → render child routes
 *
 * Usage:
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 * ------------------------------------------------------
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Wait for auth state to be determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    // Save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Authenticated → render protected routes
  return <Outlet />
}

export default ProtectedRoute
