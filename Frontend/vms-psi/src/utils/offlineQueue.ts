/* eslint-disable @typescript-eslint/no-explicit-any */
interface QueuedRequest {
  id: string
  url: string
  method: string
  data?: any
  headers?: Record<string, string>
  timestamp: number
  retryCount: number
}

const QUEUE_STORAGE_KEY = "vms-offline-queue"
const MAX_RETRY_COUNT = 3

class OfflineQueueManager {
  private queue: QueuedRequest[] = []

  constructor() {
    this.loadQueue()
    this.setupConnectionListener()
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch (error) {
      console.error("[OfflineQueue] Failed to load queue:", error)
      this.queue = []
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue))
    } catch (error) {
      console.error("[OfflineQueue] Failed to save queue:", error)
    }
  }

  private setupConnectionListener() {
    window.addEventListener("connection-restored", () => {
      this.processQueue()
    })
  }

  addRequest(
    url: string,
    method: string,
    data?: any,
    headers?: Record<string, string>
  ): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const request: QueuedRequest = {
      id,
      url,
      method,
      data,
      headers,
      timestamp: Date.now(),
      retryCount: 0,
    }

    this.queue.push(request)
    this.saveQueue()

    console.log(`[OfflineQueue] Added request ${id} to queue`)
    return id
  }

  async processQueue() {
    if (this.queue.length === 0) {
      console.log("[OfflineQueue] Queue is empty")
      return
    }

    console.log(`[OfflineQueue] Processing ${this.queue.length} queued requests`)

    const requestsToProcess = [...this.queue]
    this.queue = []

    for (const request of requestsToProcess) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            "Content-Type": "application/json",
            ...request.headers,
          },
          body: request.data ? JSON.stringify(request.data) : undefined,
        })

        if (response.ok) {
          console.log(`[OfflineQueue] Successfully processed request ${request.id}`)
          window.dispatchEvent(
            new CustomEvent("offline-request-processed", { detail: request })
          )
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        request.retryCount++

        if (request.retryCount < MAX_RETRY_COUNT) {
          console.log(
            `[OfflineQueue] Retry ${request.retryCount}/${MAX_RETRY_COUNT} for request ${request.id}`
          )
          this.queue.push(request)
        } else {
          console.error(
            `[OfflineQueue] Failed to process request ${request.id} after ${MAX_RETRY_COUNT} retries:`,
            error
          )
          window.dispatchEvent(
            new CustomEvent("offline-request-failed", { detail: request })
          )
        }
      }
    }

    this.saveQueue()
  }

  getQueueSize(): number {
    return this.queue.length
  }

  clearQueue() {
    this.queue = []
    this.saveQueue()
    console.log("[OfflineQueue] Queue cleared")
  }

  getQueue(): QueuedRequest[] {
    return [...this.queue]
  }
}

export const offlineQueue = new OfflineQueueManager()
