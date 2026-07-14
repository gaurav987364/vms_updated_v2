// src/@types/alert.types.ts

export type AlertType = "success" | "error" | "warning" | "info"

export interface AlertAction {
  label: string
  onClick: () => void
}

export interface AlertOptions {
  type: AlertType
  title: string
  description?: string
  /** Optional inline action link, e.g. "Retry" next to the dismiss button */
  action?: AlertAction
  /** Auto-dismiss duration in ms. Set to 0 to disable auto-dismiss (stays until manually closed). Default: 5000 */
  duration?: number
}

export interface AlertInstance extends AlertOptions {
  id: string
}