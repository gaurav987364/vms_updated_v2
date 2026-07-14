// src/context/AlertContext.tsx

import { AlertStack } from "@/components/common/ThemedAlert"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import type { AlertInstance, AlertOptions } from "@/shared/types/alert.types"
import { createContext, useContext, useCallback, useState, type ReactNode } from "react"

export interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "danger"
  icon?: "warning" | "delete"
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void
  dismissAlert: (id: string) => void
  showConfirm: (options: ConfirmOptions) => Promise<boolean>
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

/**
 * AlertProvider
 * ------------------------------------------------------
 * Mount ONCE, at the root of the app (in App.tsx). Manages
 * the queue of currently-visible alerts and renders the
 * AlertStack overlay. Any component/hook anywhere in the app
 * calls useAlert().showAlert(...) to trigger one — most
 * commonly from a TanStack Query mutation's onSuccess/onError.
 * Also provides showConfirm() for confirmation dialogs.
 * ------------------------------------------------------
 */
export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertInstance[]>([])
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    options: ConfirmOptions | null
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  })

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const showAlert = useCallback((options: AlertOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setAlerts((prev) => [...prev, { ...options, id }])
  }, [])

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true)
    }
    setConfirmState({ isOpen: false, options: null, resolve: null })
  }, [confirmState])

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false)
    }
    setConfirmState({ isOpen: false, options: null, resolve: null })
  }, [confirmState])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      handleCancel()
    }
  }, [handleCancel])

  return (
    <AlertContext.Provider value={{ showAlert, dismissAlert, showConfirm }}>
      {children}
      <AlertStack alerts={alerts} onDismiss={dismissAlert} />
      {confirmState.options && (
        <ConfirmDialog
          open={confirmState.isOpen}
          onOpenChange={handleOpenChange}
          title={confirmState.options.title}
          description={confirmState.options.description}
          confirmText={confirmState.options.confirmText}
          cancelText={confirmState.options.cancelText}
          variant={confirmState.options.variant}
          icon={confirmState.options.icon}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </AlertContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider")
  }
  return context
}