import * as React from "react"
import { Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hours, setHours] = React.useState("00")
  const [minutes, setMinutes] = React.useState("00")

  // Parse value when it changes
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      setHours(h || "00")
      setMinutes(m || "00")
    }
  }, [value])

  const handleHourChange = (h: string) => {
    setHours(h)
    onChange(`${h}:${minutes}`)
  }

  const handleMinuteChange = (m: string) => {
    setMinutes(m)
    onChange(`${hours}:${m}`)
  }

  const generateOptions = (max: number) => {
    return Array.from({ length: max }, (_, i) => {
      const val = i.toString().padStart(2, "0")
      return val
    })
  }

  const displayValue = value ? value : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 border-2 border-[var(--color-border)] shadow-xl" align="start">
        <div className="flex divide-x divide-[var(--color-border)]">
          {/* Hours */}
          <div className="flex flex-col w-[100px]">
            <div className="px-2 py-2 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-background)] border-b border-[var(--color-border)] text-center">
              Hours
            </div>
            <div className="h-[180px] overflow-y-auto custom-scrollbar">
              {generateOptions(24).map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleHourChange(hour)}
                  className={cn(
                    "w-full px-3 py-1.5 text-sm text-center hover:bg-[var(--color-hover)] transition-colors",
                    hours === hour
                      ? "bg-[#ff6b35] text-white font-medium hover:bg-[#f77f00]"
                      : "text-[var(--color-text-primary)]"
                  )}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes */}
          <div className="flex flex-col w-[100px]">
            <div className="px-2 py-2 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-background)] border-b border-[var(--color-border)] text-center">
              Minutes
            </div>
            <div className="h-[180px] overflow-y-auto custom-scrollbar">
              {generateOptions(60).map((minute) => (
                <button
                  key={minute}
                  onClick={() => handleMinuteChange(minute)}
                  className={cn(
                    "w-full px-3 py-1.5 text-sm text-center hover:bg-[var(--color-hover)] transition-colors",
                    minutes === minute
                      ? "bg-[#ff6b35] text-white font-medium hover:bg-[#f77f00]"
                      : "text-[var(--color-text-primary)]"
                  )}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Selection Display */}
        <div className="px-3 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-background)]">
          <div className="text-center">
            <div className="text-xs text-[var(--color-text-secondary)] mb-1">Selected Time</div>
            <div className="text-base font-bold text-[var(--color-text-primary)]">
              {hours}:{minutes}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
