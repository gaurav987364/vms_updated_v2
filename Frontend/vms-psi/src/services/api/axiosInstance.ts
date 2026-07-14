/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/api/axiosInstance.ts

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { offlineQueue } from "@/utils/offlineQueue"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: Send cookies with requests
})

// Track if a token refresh is in progress
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

// Notify all subscribers when new token is received
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

// Add request to queue while refresh is in progress
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

// Request interceptor - attach access token to all requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if offline
    if (!navigator.onLine) {
      const error = new Error("No internet connection") as any
      error.isOfflineError = true
      error.config = config

      // Queue POST/PUT/PATCH requests for later
      if (config.method && ["post", "put", "patch"].includes(config.method.toLowerCase())) {
        offlineQueue.addRequest(
          config.url || "",
          config.method,
          config.data,
          config.headers as Record<string, string>
        )
        console.log("[Axios] Request queued for later:", config.url)
      }

      return Promise.reject(error)
    }

    // Get access token from memory (will be set by AuthContext)
    const accessToken = localStorage.getItem("vms_access_token")

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    // Handle offline errors
    if (!navigator.onLine || error.message === "Network Error") {
      const enhancedError = error as any
      enhancedError.isOfflineError = true

      if (error.config?.method && ["post", "put", "patch"].includes(error.config.method)) {
        offlineQueue.addRequest(
          error.config.url || "",
          error.config.method,
          error.config.data,
          error.config.headers as Record<string, string>
        )
        console.log("[Axios] Request queued after network error:", error.config.url)
      }

      return Promise.reject(enhancedError)
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("⚠️ Got 401 error for:", originalRequest.url)

      // Don't retry refresh endpoint, login endpoint, or base session endpoint
      // Note: We use exact match for /session to allow /session/getall and other session routes to trigger refresh
      if (
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url === "/session"
      ) {
        console.log("❌ Skipping refresh for excluded endpoint:", originalRequest.url)
        return Promise.reject(error)
      }

      console.log("✅ Will attempt token refresh for:", originalRequest.url)
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true

        try {
          console.log("🔄 Access token expired, refreshing token...")

          // Call refresh endpoint (refresh token is in httpOnly cookie)
          const response = await axios.get(
            `${API_BASE_URL}/auth/refresh`,
            {
              withCredentials: true, // Send refresh token cookie
            }
          )

          const { accessToken } = response.data.data || response.data

          // Store new access token if provided
          if (accessToken) {
            localStorage.setItem("vms_access_token", accessToken)
            console.log("✅ Token refreshed successfully!")
          }

          // Notify all waiting requests
          onRefreshed(accessToken || "")

          isRefreshing = false

          // Retry original request with new token
          if (accessToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }

          console.log("🔁 Retrying original request:", originalRequest.url)
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          console.error("❌ Refresh token expired or invalid, logging out...")

          // Refresh failed - clear auth state
          isRefreshing = false
          refreshSubscribers = []
          localStorage.removeItem("vms_access_token")

          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/login")) {
            console.log("↗️ Redirecting to login page...")
            window.location.href = "/login"
          }

          return Promise.reject(refreshError)
        }
      }

      // If refresh is already in progress, queue this request
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          resolve(axiosInstance(originalRequest))
        })
      })
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export default axiosInstance
