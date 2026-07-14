import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

interface NetworkContextType {
  isOnline: boolean
  connectionQuality: "good" | "poor" | "offline"
  showOfflineMode: boolean
  setShowOfflineMode: (show: boolean) => void
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const { isOnline, connectionQuality } = useOnlineStatus()
  const [showOfflineMode, setShowOfflineMode] = useState(false)

  useEffect(() => {
    setShowOfflineMode(!isOnline)
  }, [isOnline])

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        connectionQuality,
        showOfflineMode,
        setShowOfflineMode,
      }}
    >
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider")
  }
  return context
}
