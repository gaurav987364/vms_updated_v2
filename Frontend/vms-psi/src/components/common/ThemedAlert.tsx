// src/components/common/ThemedAlert.tsx

import { useEffect, useState } from "react"
import { CircleCheck, AlertCircle, AlertTriangle, Info, X } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { AlertInstance } from "@/shared/types/alert.types";

/**
 * TYPE_CONFIG
 * ------------------------------------------------------
 * The ONLY place type-specific styling lives. Background,
 * border, text colors are ALWAYS the same (our brand blue
 * glass) — only the icon and its soft badge tint change here.
 *
 * To add a new type later (e.g. "loading"), add one entry here.
 * Nothing else in this file or the hook/stack needs to change.
 * ------------------------------------------------------
 */
const TYPE_CONFIG: Record<
  AlertInstance["type"],
  { icon: typeof CircleCheck; iconColor: string; badgeBg: string }
> = {
  success: { icon: CircleCheck, iconColor: "#4ade80", badgeBg: "rgba(74,222,128,0.16)" },
  error: { icon: AlertCircle, iconColor: "#f87171", badgeBg: "rgba(248,113,113,0.16)" },
  warning: { icon: AlertTriangle, iconColor: "#fbbf24", badgeBg: "rgba(251,191,36,0.16)" },
  info: { icon: Info, iconColor: "#60a5fa", badgeBg: "rgba(96,165,250,0.16)" },
}

const DEFAULT_DURATION = 5000

interface ThemedAlertProps {
  alert: AlertInstance
  onDismiss: (id: string) => void
}

interface AlertStackProps {
  alerts: AlertInstance[]
  onDismiss: (id: string) => void
}

/**
 * ThemedAlert
 * ------------------------------------------------------
 * One alert card. Unified blue-glass background/border for
 * every type — bold white title, lighter slate description,
 * and only the icon + its badge tint shift based on `type`.
 *
 * Handles its own auto-dismiss countdown + animated progress
 * bar, so AlertStack just renders a list of these and doesn't
 * need to know about timing at all.
 * ------------------------------------------------------
 */
export function ThemedAlert({ alert, onDismiss }: ThemedAlertProps) {
  const { id, type, title, description, action, duration = DEFAULT_DURATION } = alert
  const config = TYPE_CONFIG[type]
  const Icon = config.icon

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration <= 0) return // duration=0 means "stay until manually dismissed"

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onDismiss(id)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [id, duration, onDismiss])

  return (
    <Alert
      role="alert"
      className="
        relative overflow-hidden flex items-center gap-3 border rounded-xl p-3.5
        bg-[rgba(59,130,246,0.14)] border-[rgba(96,165,250,0.25)]
        backdrop-blur-md shadow-lg
      "
    >
      <div
        className="w-8.5 h-8.5 rounded-[9px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: config.badgeBg, width: 34, height: 34 }}
      >
        <Icon size={19} style={{ color: config.iconColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <AlertTitle className="text-[13.5px] font-bold text-white leading-tight">
          {title}
        </AlertTitle>
        {description && (
          <AlertDescription className="text-xs font-normal text-slate-300 mt-0.5">
            {description}
          </AlertDescription>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-semibold hover:underline"
            style={{ color: config.iconColor }}
          >
            {action.label}
          </button>
        )}
        <button
          onClick={() => onDismiss(id)}
          aria-label="Dismiss"
          className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Progress bar removed as per user preference */}
    </Alert>
  )
}



/**
 * AlertStack
 * ------------------------------------------------------
 * Fixed top-center overlay stacking multiple alerts. Newest
 * appears at the top. Rendered once by AlertProvider — never
 * imported or placed manually anywhere else.
 * ------------------------------------------------------
 */
export function AlertStack({ alerts, onDismiss }: AlertStackProps) {
  if (alerts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {alerts.map((alert) => (
        <div key={alert.id} className="pointer-events-auto animate-in slide-in-from-top-2 fade-in duration-300">
          <ThemedAlert alert={alert} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}