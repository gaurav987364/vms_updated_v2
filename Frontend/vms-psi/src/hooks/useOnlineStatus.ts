import { useState, useEffect, useCallback, useRef } from "react"

interface OnlineStatusReturn {
  isOnline: boolean
  wasOffline: boolean
  lastOnlineTime: Date | null
  lastOfflineTime: Date | null
  connectionQuality: "good" | "poor" | "offline"
}

const PING_INTERVAL = 30000 // 30 seconds
const PING_TIMEOUT = 5000 // 5 seconds
const POOR_CONNECTION_THRESHOLD = 3000 // 3 seconds response time

export function useOnlineStatus(): OnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  )
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null)
  const [connectionQuality, setConnectionQuality] = useState<"good" | "poor" | "offline">(
    navigator.onLine ? "good" : "offline"
  )

  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousOnlineState = useRef(navigator.onLine)

  const checkActualConnectivity = useCallback(async () => {
    if (!navigator.onLine) {
      setConnectionQuality("offline")
      return false
    }

    try {
      const startTime = Date.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT)

      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
        signal: controller.signal,
      }).catch(() =>
        fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
          signal: controller.signal,
        })
      )

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (response) {
        setConnectionQuality(responseTime > POOR_CONNECTION_THRESHOLD ? "poor" : "good")
        return true
      }

      setConnectionQuality("offline")
      return false
    } catch (error) {
      setConnectionQuality("offline")
      return false
    }
  }, [])

  const handleOnline = useCallback(async () => {
    const actuallyOnline = await checkActualConnectivity()

    if (actuallyOnline) {
      const now = new Date()
      setIsOnline(true)
      setLastOnlineTime(now)

      if (!previousOnlineState.current) {
        setWasOffline(true)
        console.log("[Network] Connection restored at", now.toLocaleTimeString())

        if (lastOfflineTime) {
          const offlineDuration = now.getTime() - lastOfflineTime.getTime()
          console.log(`[Network] Was offline for ${Math.round(offlineDuration / 1000)}s`)
        }

        window.dispatchEvent(new CustomEvent("connection-restored"))
      }

      previousOnlineState.current = true
    }
  }, [checkActualConnectivity, lastOfflineTime])

  const handleOffline = useCallback(() => {
    const now = new Date()
    setIsOnline(false)
    setLastOfflineTime(now)
    setConnectionQuality("offline")
    setWasOffline(false)

    if (previousOnlineState.current) {
      console.log("[Network] Connection lost at", now.toLocaleTimeString())
      window.dispatchEvent(new CustomEvent("connection-lost"))
    }

    previousOnlineState.current = false
  }, [])

  useEffect(() => {
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    checkActualConnectivity()

    pingIntervalRef.current = setInterval(checkActualConnectivity, PING_INTERVAL)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkActualConnectivity()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const handleFocus = () => {
      checkActualConnectivity()
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [handleOnline, handleOffline, checkActualConnectivity])

  return {
    isOnline,
    wasOffline,
    lastOnlineTime,
    lastOfflineTime,
    connectionQuality,
  }
}
