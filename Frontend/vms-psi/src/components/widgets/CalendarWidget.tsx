import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { getStudyPlans, type StudyPlan } from "@/services/api/studyPlanApi";

interface CalendarWidgetProps {
  className?: string;
}

const CalendarWidget = ({ className = "" }: CalendarWidgetProps) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studyPlans, setStudyPlans] = useState<Map<string, StudyPlan>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    loadStudyPlans();
  }, [currentDate]);

  const loadStudyPlans = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const plans = await getStudyPlans(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      const plansMap = new Map<string, StudyPlan>();
      if (plans && Array.isArray(plans)) {
        plans.forEach((plan) => {
          const dateKey = new Date(plan.date).toISOString().split("T")[0];
          plansMap.set(dateKey, plan);
        });
      }
      setStudyPlans(plansMap);
    } catch (error) {
      console.error("Error loading study plans:", error);
      setStudyPlans(new Map());
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const hasPlan = (date: Date | null): boolean => {
    if (!date) return false;
    const dateKey = date.toISOString().split("T")[0];
    return studyPlans.has(dateKey);
  };

  const getPlan = (date: Date | null): StudyPlan | undefined => {
    if (!date) return undefined;
    const dateKey = date.toISOString().split("T")[0];
    return studyPlans.get(dateKey);
  };

  const getPlanStatus = (plan: StudyPlan): "completed" | "in-progress" | "planned" => {
    if (plan.isCompleted) return "completed";
    if (plan.totalCompleted > 0) return "in-progress";
    return "planned";
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    navigate("/calendar");
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });
  const year = currentDate.getFullYear();

  return (
    <div className={`bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl p-4 shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-[#ff6b35]" />
          <h3 className="font-semibold text-[var(--color-text-primary)]">Calendar</h3>
        </div>
        <button
          onClick={() => navigate("/calendar")}
          className="text-xs text-[#ff6b35] hover:text-[#f77f00] transition-colors flex items-center gap-1"
        >
          <BookOpen size={14} />
          View All
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-[var(--color-hover)] rounded transition-all"
          disabled={loading}
        >
          <ChevronLeft size={18} className="text-[var(--color-text-primary)]" />
        </button>
        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
          {monthName} {year}
        </div>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-[var(--color-hover)] rounded transition-all"
          disabled={loading}
        >
          <ChevronRight size={18} className="text-[var(--color-text-primary)]" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-[var(--color-text-secondary)] py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateKey = date.toISOString().split("T")[0];
            const plan = getPlan(date);
            const status = plan ? getPlanStatus(plan) : null;
            const today = isToday(date);
            const hasStudyPlan = hasPlan(date);

            return (
              <div key={dateKey} className="relative group">
                <button
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoveredDate(dateKey)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`
                    aspect-square w-full rounded-md text-xs font-medium transition-all flex items-center justify-center relative
                    ${today ? "border-2 border-[#ff6b35]" : "border border-transparent"}
                    ${status === "completed" ? "bg-green-500/20 text-green-600 dark:text-green-400" : ""}
                    ${status === "in-progress" ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" : ""}
                    ${status === "planned" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : ""}
                    ${!hasStudyPlan ? "text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]" : ""}
                    ${hasStudyPlan ? "cursor-pointer hover:scale-110" : "cursor-pointer"}
                  `}
                >
                  {date.getDate()}
                  {hasStudyPlan && (
                    <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#ff6b35]" />
                  )}
                </button>

                {/* Tooltip on Hover */}
                {hoveredDate === dateKey && plan && (
                  <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1.5 bg-[var(--color-surface)] border-2 border-[#ff6b35] rounded-lg shadow-xl min-w-[150px] pointer-events-none">
                    <div className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                      {plan.title || "Study Session"}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {plan.totalCompleted}/{plan.totalPlanned} completed
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-2 h-2 rotate-45 bg-[var(--color-surface)] border-r-2 border-b-2 border-[#ff6b35]" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-[var(--color-text-secondary)]">Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-[var(--color-text-secondary)]">Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-[var(--color-text-secondary)]">Planned</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
