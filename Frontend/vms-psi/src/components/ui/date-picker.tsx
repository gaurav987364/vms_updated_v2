import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    value ? new Date(value) : null
  )
  const [currentMonth, setCurrentMonth] = React.useState(
    value ? new Date(value) : new Date()
  )

  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setCurrentMonth(date)
    }
  }, [value])

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newDate)
    const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(formatted)
    setOpen(false)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    )
  }

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return placeholder
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="w-9 h-9" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={cn(
          "w-9 h-9 text-sm rounded-md transition-all flex items-center justify-center",
          isSelected(day)
            ? "bg-[#ff6b35] text-white font-semibold hover:bg-[#f77f00]"
            : isToday(day)
            ? "border-2 border-[#ff6b35] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-hover)]"
            : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
        )}
      >
        {day}
      </button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-4 bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]",
            !selectedDate && "text-[var(--color-text-muted)]",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayDate(selectedDate)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 border-2 border-[var(--color-border)] shadow-xl bg-[var(--color-surface)]" align="start">
        {/* Header */}
        <div className="px-3 py-3 border-b border-[var(--color-border)] bg-[var(--color-background)]">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 rounded-md hover:bg-[var(--color-hover)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-[var(--color-text-primary)]" />
            </button>
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">
              {monthNames[month]} {year}
            </div>
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded-md hover:bg-[var(--color-hover)] transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-[var(--color-text-primary)]" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="w-9 h-8 flex items-center justify-center text-xs font-medium text-[var(--color-text-secondary)]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>

        {/* Footer */}
        {selectedDate && (
          <div className="px-3 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-background)]">
            <div className="text-center">
              <div className="text-xs text-[var(--color-text-secondary)] mb-1">Selected Date</div>
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                {formatDisplayDate(selectedDate)}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
