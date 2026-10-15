import { useState, useEffect } from "react";
import { Flame, Calendar, Target, Award } from "lucide-react";
import { getStudyPlans } from "@/services/api/studyPlanApi";

interface StudyStreakWidgetProps {
  className?: string;
}

const StudyStreakWidget = ({ className = "" }: StudyStreakWidgetProps) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalStudyDays, setTotalStudyDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStreaks();
  }, []);

  const calculateStreaks = async () => {
    try {
      setLoading(true);

      // Get study plans from last 6 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const plans = await getStudyPlans(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      if (!plans || plans.length === 0) {
        setLoading(false);
        return;
      }

      // Get unique dates with completed plans
      const completedDates = plans
        .filter((plan) => plan.isCompleted || plan.totalCompleted > 0)
        .map((plan) => new Date(plan.date).toISOString().split("T")[0])
        .sort();

      const uniqueDates = [...new Set(completedDates)];
      setTotalStudyDays(uniqueDates.length);

      // Calculate current streak
      let current = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];

        if (uniqueDates.includes(dateStr)) {
          current++;
        } else if (i > 0) {
          // Allow 1 day gap for today
          break;
        }
      }
      setCurrentStreak(current);

      // Calculate longest streak
      let longest = 0;
      let tempStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
          longest = Math.max(longest, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      setLongestStreak(Math.max(longest, current));
    } catch (error) {
      console.error("Error calculating streaks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakLevel = (streak: number): string => {
    if (streak >= 30) return "🔥 ON FIRE!";
    if (streak >= 14) return "🚀 Unstoppable";
    if (streak >= 7) return "⚡ Hot Streak";
    if (streak >= 3) return "🌟 Getting Started";
    return "💪 Keep Going";
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return "from-red-500 to-orange-500";
    if (streak >= 14) return "from-orange-500 to-yellow-500";
    if (streak >= 7) return "from-yellow-500 to-green-500";
    if (streak >= 3) return "from-green-500 to-blue-500";
    return "from-gray-500 to-gray-600";
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#ff6b35]/10 via-[var(--color-surface)] to-[#f77f00]/10 border-2 border-[var(--color-border)] rounded-xl p-5 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="text-[#ff6b35]" size={24} />
          <h3 className="font-bold text-[var(--color-text-primary)]">Study Streak</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-[#ff6b35]/20 text-[#ff6b35] rounded-full font-semibold">
          {getStreakLevel(currentStreak)}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]"></div>
        </div>
      ) : (
        <>
          {/* Current Streak - Large Display */}
          <div className="text-center py-6 mb-4 bg-gradient-to-br from-[var(--color-background)] to-transparent rounded-xl border border-[var(--color-border)]">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Flame
                className={`${
                  currentStreak > 0 ? "text-[#ff6b35] animate-pulse" : "text-gray-400"
                }`}
                size={40}
              />
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-[#ff6b35] to-[#f77f00] bg-clip-text text-transparent">
                  {currentStreak}
                </div>
              </div>
            </div>
            <div className="text-sm text-[var(--color-text-secondary)] font-medium">
              Day{currentStreak !== 1 ? "s" : ""} Streak
            </div>
            {currentStreak > 0 && (
              <div className="mt-2 text-xs text-[#ff6b35]">Don't break the chain! 🔗</div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Longest Streak */}
            <div className="bg-[var(--color-background)] rounded-lg p-3 border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} className="text-yellow-500" />
                <span className="text-xs text-[var(--color-text-secondary)]">Best</span>
              </div>
              <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                {longestStreak}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">days</div>
            </div>

            {/* Total Study Days */}
            <div className="bg-[var(--color-background)] rounded-lg p-3 border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-blue-500" />
                <span className="text-xs text-[var(--color-text-secondary)]">Total</span>
              </div>
              <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                {totalStudyDays}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">days</div>
            </div>
          </div>

          {/* Progress Bar */}
          {currentStreak > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-2">
                <span>Next milestone</span>
                <span className="font-semibold">
                  {currentStreak < 7
                    ? "7 days"
                    : currentStreak < 14
                    ? "14 days"
                    : currentStreak < 30
                    ? "30 days"
                    : "100 days"}
                </span>
              </div>
              <div className="w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getStreakColor(
                    currentStreak
                  )} transition-all duration-500 rounded-full`}
                  style={{
                    width: `${
                      currentStreak < 7
                        ? (currentStreak / 7) * 100
                        : currentStreak < 14
                        ? ((currentStreak - 7) / 7) * 100
                        : currentStreak < 30
                        ? ((currentStreak - 14) / 16) * 100
                        : ((currentStreak - 30) / 70) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Motivational Message */}
          {currentStreak === 0 && (
            <div className="mt-4 text-center text-xs text-[var(--color-text-secondary)] bg-[var(--color-background)] rounded-lg p-3 border border-[var(--color-border)]">
              <Target size={16} className="mx-auto mb-2 text-[#ff6b35]" />
              Start your streak today! Complete a study plan to begin. 💪
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudyStreakWidget;
