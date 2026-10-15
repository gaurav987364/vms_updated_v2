import { useState, useEffect } from "react";
import { BarChart3, Clock, CheckCircle2, TrendingUp, Calendar } from "lucide-react";
import { getStudyPlans } from "@/services/api/studyPlanApi";

interface StudyStatsWidgetProps {
  className?: string;
}

const StudyStatsWidget = ({ className = "" }: StudyStatsWidgetProps) => {
  const [stats, setStats] = useState({
    totalPlans: 0,
    completedPlans: 0,
    totalProblems: 0,
    solvedProblems: 0,
    totalHours: 0,
    thisWeek: 0,
    thisMonth: 0,
    completionRate: 0,
  });
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = async () => {
    try {
      setLoading(true);

      // Get study plans from last 3 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const plans = await getStudyPlans(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      if (!plans || plans.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate total stats
      const totalPlans = plans.length;
      const completedPlans = plans.filter((p) => p.isCompleted).length;
      const totalProblems = plans.reduce((sum, p) => sum + p.totalPlanned, 0);
      const solvedProblems = plans.reduce((sum, p) => sum + p.totalCompleted, 0);

      // Calculate total hours (estimate based on time ranges)
      let totalMinutes = 0;
      plans.forEach((plan) => {
        if (plan.startTime && plan.endTime) {
          const [startH, startM] = plan.startTime.split(":").map(Number);
          const [endH, endM] = plan.endTime.split(":").map(Number);
          const start = startH * 60 + startM;
          const end = endH * 60 + endM;
          totalMinutes += end - start;
        }
      });
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

      // This week count
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeek = plans.filter(
        (p) => new Date(p.date) >= oneWeekAgo && (p.isCompleted || p.totalCompleted > 0)
      ).length;

      // This month count
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const thisMonth = plans.filter(
        (p) => new Date(p.date) >= oneMonthAgo && (p.isCompleted || p.totalCompleted > 0)
      ).length;

      const completionRate = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

      setStats({
        totalPlans,
        completedPlans,
        totalProblems,
        solvedProblems,
        totalHours,
        thisWeek,
        thisMonth,
        completionRate,
      });

      // Calculate weekly chart data (last 7 days)
      const weekly = [0, 0, 0, 0, 0, 0, 0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      plans.forEach((plan) => {
        const planDate = new Date(plan.date);
        planDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - planDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays < 7 && (plan.isCompleted || plan.totalCompleted > 0)) {
          weekly[6 - diffDays] += plan.totalCompleted;
        }
      });

      setWeeklyData(weekly);
    } catch (error) {
      console.error("Error calculating stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxWeekly = Math.max(...weeklyData, 1);

  return (
    <div
      className={`bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl p-5 shadow-md ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-[#ff6b35]" size={24} />
          <h3 className="font-bold text-[var(--color-text-primary)]">Study Analytics</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
          <TrendingUp size={14} className="text-green-500" />
          <span>Last 3 months</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]"></div>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Total Hours */}
            <div className="bg-gradient-to-br from-[#ff6b35]/10 to-transparent rounded-lg p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-[#ff6b35]" />
                <span className="text-xs text-[var(--color-text-secondary)]">Total Hours</span>
              </div>
              <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                {stats.totalHours}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-1">hours studied</div>
            </div>

            {/* Completion Rate */}
            <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-lg p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-xs text-[var(--color-text-secondary)]">Success Rate</span>
              </div>
              <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                {stats.completionRate}%
              </div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                {stats.solvedProblems}/{stats.totalProblems} problems
              </div>
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="mb-5">
            <div className="text-xs text-[var(--color-text-secondary)] mb-3 flex items-center justify-between">
              <span>Last 7 Days Activity</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {weeklyData.reduce((a, b) => a + b, 0)} problems
              </span>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-24">
              {weeklyData.map((count, index) => {
                const height = maxWeekly > 0 ? (count / maxWeekly) * 100 : 0;
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const today = new Date();
                const dayIndex = (today.getDay() - 6 + index + 7) % 7;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-[var(--color-background)] rounded-t-lg relative overflow-hidden border border-[var(--color-border)]" style={{ height: "100%" }}>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-[#ff6b35] to-[#f77f00] transition-all duration-500 rounded-t-lg"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)] font-medium">
                      {dayNames[dayIndex][0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--color-border)]">
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {stats.thisWeek}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">This Week</div>
            </div>
            <div className="text-center border-x border-[var(--color-border)]">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {stats.thisMonth}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {stats.completedPlans}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">Completed</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudyStatsWidget;
