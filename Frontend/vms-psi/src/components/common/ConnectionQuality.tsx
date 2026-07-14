import { Wifi, WifiOff } from "lucide-react"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

export function ConnectionQuality() {
  const { isOnline, connectionQuality } = useOnlineStatus()

  if (!isOnline || connectionQuality === "offline") {
    return (
      <div className="flex items-center gap-2 text-[var(--color-danger)] text-sm">
        <WifiOff className="h-4 w-4" />
        <span className="hidden sm:inline">Offline</span>
      </div>
    )
  }

  if (connectionQuality === "poor") {
    return (
      <div className="flex items-center gap-2 text-[var(--color-warning)] text-sm">
        <Wifi className="h-4 w-4" />
        <span className="hidden sm:inline">Slow connection</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-[var(--color-success)] text-sm">
      <Wifi className="h-4 w-4" />
      <span className="hidden sm:inline">Connected</span>
    </div>
  )
}
