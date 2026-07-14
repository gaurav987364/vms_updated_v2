/* eslint-disable @typescript-eslint/no-explicit-any */
import { offlineQueue } from "@/utils/offlineQueue"
import axios, { AxiosError, type AxiosResponse } from "axios"

export function setupOfflineInterceptor() {
  axios.interceptors.request.use(
    (config) => {
      if (!navigator.onLine) {
        const error = new Error("No internet connection") as any
        error.isOfflineError = true
        error.config = config

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

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error: AxiosError) => {
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
      }

      return Promise.reject(error)
    }
  )
}

export function isOfflineError(error: any): boolean {
  return error?.isOfflineError === true || error?.message === "No internet connection"
}
