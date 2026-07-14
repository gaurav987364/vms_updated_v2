import { useEffect, useState } from "react"
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw } from "lucide-react"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (isOnline && wasOffline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  if (isOnline && !showReconnected) return null

  if (showReconnected) {
    return (
      <div className="fixed top-20 right-4 z-50 animate-slide-down">
        <div className="flex items-center gap-3 bg-[var(--color-success)] text-white px-4 py-3 rounded-lg shadow-lg">
          <Wifi className="h-5 w-5" />
          <span className="font-medium">Back online</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-down">
      <div className="flex items-center gap-3 bg-[var(--color-warning)] text-white px-4 py-3 rounded-lg shadow-lg">
        <WifiOff className="h-5 w-5 animate-pulse" />
        <span className="font-medium">No internet connection</span>
      </div>
    </div>
  )
}

export function OfflineOverlay() {
  const { isOnline } = useOnlineStatus()
  const [attempting, setAttempting] = useState(false)

  const handleRetry = () => {
    setAttempting(true)
    setTimeout(() => {
      setAttempting(false)
      window.location.reload()
    }, 1000)
  }

  if (isOnline) return null

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--color-background)] flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-[var(--color-warning-light)] opacity-20 animate-ping" />
          </div>
          <div className="relative flex items-center justify-center">
            <CloudOff className="h-24 w-24 text-[var(--color-text-muted)] animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3">
          You're Offline
        </h1>

        <p className="text-[var(--color-text-secondary)] mb-8">
          No internet connection detected. Please check your network settings and try again.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            disabled={attempting}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {attempting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Checking connection...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <WifiOff className="h-4 w-4" />
            <span>Waiting for connection to restore...</span>
          </div>
        </div>

        <div className="mt-12 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            Quick troubleshooting tips:
          </h3>
          <ul className="text-sm text-[var(--color-text-secondary)] space-y-1 text-left">
            <li>• Check if WiFi or mobile data is enabled</li>
            <li>• Verify you're connected to the correct network</li>
            <li>• Try turning airplane mode on and off</li>
            <li>• Restart your router if using WiFi</li>
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Cloud className="h-3 w-3" />
          <span>Connection will resume automatically</span>
        </div>
      </div>
    </div>
  )
}
