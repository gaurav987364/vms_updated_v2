/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
} from "react"
import axios from "axios"
import { authApi, type User, type LoginRequest, type RegisterRequest } from "@/services/api/authApi"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  setAccessToken: (token: string) => void
  clearError: () => void
  updateUser: (user: User) => void
  // hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * AuthProvider
 * ------------------------------------------------------
 * Manages global authentication state for the app.
 *
 * Features:
 * - Stores user info and access token in memory
 * - Handles login/register/logout operations
 * - Bootstraps auth state on app load (checks refresh token)
 * - Provides auth context to all components
 *
 * Security:
 * - Access token stored in memory (state + localStorage for persistence)
 * - Refresh token stored in httpOnly cookie (managed by backend)
 * ------------------------------------------------------
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User is authenticated if they have a user object (token might be in httpOnly cookie)
  const isAuthenticated = !!user

  /**
   * Set access token in both state and localStorage
   */
  const setAccessToken = useCallback((token: string) => {
    setAccessTokenState(token)
    localStorage.setItem("vms_access_token", token)
  }, [])

  /**
   * Clear all auth state
   */
  const clearAuthState = useCallback(() => {
    setUser(null)
    setAccessTokenState(null)
    localStorage.removeItem("vms_access_token")
  }, [])

  /**
   * Bootstrap: Check if user is already authenticated on app load
   * Calls /session endpoint which validates the session cookie
   * If access token expired but refresh token valid, tries to refresh first
   */
  useEffect(() => {
    let isMounted = true

    const bootstrapAuth = async () => {
      try {
        // Try to get current session (backend checks httpOnly cookie)
        const response = await authApi.getCurrentUser()

        // Only update state if component is still mounted
        if (isMounted) {
          if (response?.user) {
            setUser(response.user)
          } else {
            clearAuthState()
          }
        }
      } catch (error: any) {
        // If we got 401, access token might be expired - try to refresh
        if (error.message?.includes("Unauthorized") || error.message?.includes("401")) {
          console.log("⚠️ Access token expired on bootstrap, attempting refresh...")

          try {
            // Try to refresh the token using direct axios call (bypass interceptor to avoid loops)
            const refreshResponse = await axios.get(`${API_BASE_URL}/auth/refresh`, {
              withCredentials: true,
            })

            // Backend returns new access token in cookie, but we also check response body
            const newAccessToken = refreshResponse.data?.data?.accessToken ||
                                  refreshResponse.data?.accessToken

            if (isMounted) {
              console.log("✅ Token refreshed on bootstrap, retrying session...")

              // Store new access token if provided in response
              if (newAccessToken) {
                setAccessToken(newAccessToken)
              }

              // Retry getting current user with new token (from cookie or localStorage)
              const retryResponse = await authApi.getCurrentUser()
              if (retryResponse?.user) {
                setUser(retryResponse.user)
              } else {
                clearAuthState()
              }
            }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (refreshError) {
            // Refresh failed - both tokens are invalid/expired
            console.log("❌ Refresh token also expired or invalid - no active session")
            if (isMounted) {
              clearAuthState()
            }
          }
        } else {
          // Other error (network, etc)
          console.log("No active session found")
          if (isMounted) {
            clearAuthState()
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    bootstrapAuth()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [])

  /**
   * Session Monitoring: Poll backend to check if session is still valid
   * If user logs in from another device, this session will be invalidated
   * and user will be automatically logged out
   */
  useEffect(() => {
    // Only start monitoring if user is authenticated
    if (!isAuthenticated || !user) {
      return
    }

    let intervalId: ReturnType<typeof setInterval> | null = null

    const checkSessionValidity = async () => {
      try {
        const response = await authApi.validateSession()

        // If session is invalid, user was logged out from another device
        if (!response.isValid) {
          console.log("🚨 Session invalidated - user logged in from another device")
          clearAuthState()

          // Optionally show a notification to user
          // You can add a toast/notification here if you have a notification system
          window.location.href = "/login?reason=session_expired"
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // If validation fails (401/403), session is invalid
        console.log("🚨 Session validation failed - logging out")
        clearAuthState()
        window.location.href = "/login?reason=session_expired"
      }
    }

    // Poll every 30 seconds (adjust as needed for your use case)
    // For more aggressive detection, use 10-15 seconds
    // For less network overhead, use 60 seconds
    intervalId = setInterval(checkSessionValidity, 30000)

    // Cleanup on unmount or when user logs out
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isAuthenticated, user, clearAuthState])

  /**
   * Login user
   */
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.login(credentials)
      const { user: userData } = response

      // Set user (token is in httpOnly cookie managed by backend)
      setUser(userData)

      // If backend sends accessToken, store it (for future use)
      if (response.accessToken) {
        setAccessToken(response.accessToken)
      }
    } catch (error: any) {
      const errorMessage = error.message || "Login failed"
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register new user
   */
  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.register(userData)
      const { user: newUser, accessToken: token } = response.data!

      setUser(newUser)
      setAccessToken(token!)
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed"
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true)

      // Call logout API to clear refresh token cookie
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear local auth state, even if API call fails
      clearAuthState()
      setIsLoading(false)
    }
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null)
  }

  /**
   * Update user info
   */
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    setAccessToken,
    clearError,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook
 * ------------------------------------------------------
 * Custom hook to access auth context.
 * Always use this instead of useContext(AuthContext) directly.
 * ------------------------------------------------------
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
