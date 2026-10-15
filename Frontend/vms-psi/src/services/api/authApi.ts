/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/api/authApi.ts

import axiosInstance from "./axiosInstance"

// Type definitions
export interface User {
  _id: string
  email: string
  name: string
  username: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  name: string
  username: string
}

export interface ApiResponse<T> {
  success?: boolean
  message: string
  data?: T
}

export interface LoginResponse {
  message: string
  user: User
  accessToken?: string
}

export interface RefreshResponse {
  accessToken: string
}

// Auth API Service
export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        "/auth/login",
        credentials
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
        "/auth/register",
        userData
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.post<ApiResponse<null>>("/auth/logout")
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * Refresh access token using refresh token from httpOnly cookie
   */
  async refreshToken(): Promise<ApiResponse<RefreshResponse>> {
    try {
      const response = await axiosInstance.get<ApiResponse<RefreshResponse>>(
        "/auth/refresh"
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * Get current user info (verify session)
   */
  async getCurrentUser(): Promise<{ message: string; user: User }> {
    try {
      const response = await axiosInstance.get<{ message: string; user: User }>(
        "/session"
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * TEST ENDPOINT: Get all sessions (protected route to test token refresh)
   * This will trigger token refresh if access token is expired
   */
  async getAllSessions(): Promise<{ message: string; sessions: any[] }> {
    try {
      const response = await axiosInstance.get<{ message: string; sessions: any[] }>(
        "/session/getall"
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * Validate current session (check if session still exists)
   * Used for polling to detect if user was logged out from another device
   */
  async validateSession(): Promise<{ message: string; isValid: boolean }> {
    try {
      const response = await axiosInstance.get<{ message: string; isValid: boolean }>(
        "/session/validate"
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * Verify email with code
   */
  async verifyEmail(code: string): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await axiosInstance.post<ApiResponse<{ user: User }>>(
        "/auth/verify-email",
        { code }
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * Request password reset - sends email with reset link
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        "/auth/password/forgot",
        { email }
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * Reset password with verification code
   */
  async resetPassword(data: {
    password: string
    verificationCode: string
  }): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        "/auth/password/reset",
        data
      )
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  },

  /**
   * Handle API errors and extract meaningful error messages
   */
  handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || "An error occurred"
      const statusCode = error.response.status

      if (statusCode === 401) {
        return new Error("Unauthorized. Please login again.")
      } else if (statusCode === 403) {
        return new Error("Access denied. You don't have permission.")
      } else if (statusCode === 404) {
        return new Error("Resource not found.")
      } else if (statusCode === 422) {
        return new Error(message || "Validation error.")
      } else if (statusCode === 429) {
        return new Error("Too many requests. Please try again later.")
      } else if (statusCode >= 500) {
        return new Error("Server error. Please try again later.")
      }

      return new Error(message)
    } else if (error.request) {
      // Request made but no response
      return new Error("Network error. Please check your connection.")
    } else {
      // Error in request setup
      return new Error(error.message || "An unexpected error occurred")
    }
  },
}

export default authApi
