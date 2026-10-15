import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-[var(--color-surface)]", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-base font-semibold text-[var(--color-text-primary)]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-transparent p-0 inline-flex items-center justify-center rounded-md hover:bg-[var(--color-hover)] transition-all border border-[var(--color-border)] text-[var(--color-text-primary)]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 mt-2",
        head_row: "flex mb-1",
        head_cell:
          "text-[var(--color-text-secondary)] rounded-md w-10 font-semibold text-xs uppercase",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          "h-10 w-10 p-0 font-normal text-[var(--color-text-primary)] inline-flex items-center justify-center rounded-md hover:bg-[var(--color-hover)] transition-all border border-transparent m-0.5"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#ff6b35] text-white font-semibold hover:bg-[#f77f00] hover:text-white focus:bg-[#ff6b35] focus:text-white border-[#ff6b35]",
        day_today: "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-2 border-[#ff6b35] font-semibold",
        day_outside:
          "text-[var(--color-text-muted)] opacity-40 aria-selected:bg-[#ff6b35]/20 aria-selected:text-[var(--color-text-muted)] aria-selected:opacity-50",
        day_disabled: "text-[var(--color-text-muted)] opacity-30 hover:bg-transparent cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-[#ff6b35]/10 aria-selected:text-[var(--color-text-primary)]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
