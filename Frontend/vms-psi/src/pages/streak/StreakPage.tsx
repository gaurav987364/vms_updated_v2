// src/pages/streak/StreakPage.tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getUserStats } from "@/services/api/progressApi"
import type { UserStats } from "@/services/api/progressApi"
import { ChevronLeft, Flame, Trophy, TrendingUp, Award, Target, Zap } from "lucide-react"

/**
 * GitHub-style Activity Calendar Page (Horizontal Layout)
 * Shows contribution-style grid with problem solving activity
 */
const StreakPage = () => {
  const navigate = useNavigate()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getUserStats()
        setUserStats(data)
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  // Generate last 365 days
  const generateLast365Days = () => {
    const days = []
    const today = new Date()
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
  }

  const last365Days = generateLast365Days()

  // Get activity for a specific date
  const getActivityForDate = (date: Date) => {
    if (!userStats) return { problemsSolved: 0, problemsAttempted: 0 }

    const dateStr = date.toISOString().split('T')[0]
    const activity = userStats.activityCalendar.find(a =>
      a.date.startsWith(dateStr)
    )
    return activity || { problemsSolved: 0, problemsAttempted: 0 }
  }

  // Get color intensity based on problems solved
  const getColorIntensity = (count: number) => {
    if (count === 0) return "bg-gray-700/30 border border-gray-600/50 hover:border-gray-500/70"
    if (count === 1) return "bg-[#ff6b35]/30 border border-[#ff6b35]/40 shadow-sm shadow-[#ff6b35]/20"
    if (count === 2) return "bg-[#ff6b35]/50 border border-[#ff6b35]/60 shadow-sm shadow-[#ff6b35]/30"
    if (count <= 4) return "bg-[#ff6b35]/70 border border-[#ff6b35]/80 shadow-md shadow-[#ff6b35]/40"
    return "bg-[#ff6b35] border border-[#f77f00] shadow-md shadow-[#ff6b35]/50"
  }

  // Group days by week (rows = days of week, columns = weeks)
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  last365Days.forEach((date, idx) => {
    if (idx === 0) {
      // Fill empty cells at the start of first week
      const dayOfWeek = date.getDay()
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null as any)
      }
    }

    currentWeek.push(date)

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length > 0) {
    // Fill remaining empty cells
    while (currentWeek.length < 7) {
      currentWeek.push(null as any)
    }
    weeks.push(currentWeek)
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 text-[#ff6b35] animate-pulse mx-auto mb-4" />
          <p className="text-lg text-[var(--color-text-secondary)]">Loading your streak...</p>
        </div>
      </div>
    )
  }

  const totalContributions = last365Days.reduce((sum, date) => {
    const activity = getActivityForDate(date)
    return sum + activity.problemsSolved
  }, 0)

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-[var(--color-hover)] rounded-lg transition-all hover:scale-105"
              >
                <ChevronLeft className="text-[var(--color-text-primary)]" size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#ff6b35] to-[#f77f00] rounded-xl">
                  <Flame className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    Coding Activity
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                    {totalContributions} contributions in the last year
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Streak */}
          <div className="bg-gradient-to-br from-[#ff6b35]/10 to-[#f77f00]/10 border border-[#ff6b35]/20 rounded-xl p-4 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#ff6b35]/20 rounded-lg">
                <Flame className="text-[#ff6b35]" size={20} />
              </div>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Current Streak</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] ml-11">
              {userStats?.currentStreak || 0}
              <span className="text-base font-normal text-[var(--color-text-secondary)] ml-1">days</span>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="bg-gradient-to-br from-[#f77f00]/10 to-[#fcbf49]/10 border border-[#f77f00]/20 rounded-xl p-4 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#f77f00]/20 rounded-lg">
                <Trophy className="text-[#f77f00]" size={20} />
              </div>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Best Streak</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] ml-11">
              {userStats?.longestStreak || 0}
              <span className="text-base font-normal text-[var(--color-text-secondary)] ml-1">days</span>
            </div>
          </div>

          {/* Total Solved */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="text-green-500" size={20} />
              </div>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Total Solved</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] ml-11">
              {userStats?.totalSolved || 0}
            </div>
          </div>

          {/* Total Attempted */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="text-blue-500" size={20} />
              </div>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Attempted</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] ml-11">
              {userStats?.totalAttempted || 0}
            </div>
          </div>
        </div>

        {/* Activity Calendar - HORIZONTAL */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="text-[var(--color-text-primary)]" size={24} />
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Contribution Graph
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Your daily coding activity over the past year
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--color-text-secondary)] font-medium">
              <span>Less</span>
              <div className="flex gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-gray-700/30 border border-gray-600/50"></div>
                <div className="w-3.5 h-3.5 rounded bg-[#ff6b35]/30 border border-[#ff6b35]/40"></div>
                <div className="w-3.5 h-3.5 rounded bg-[#ff6b35]/50 border border-[#ff6b35]/60"></div>
                <div className="w-3.5 h-3.5 rounded bg-[#ff6b35]/70 border border-[#ff6b35]/80"></div>
                <div className="w-3.5 h-3.5 rounded bg-[#ff6b35] border border-[#f77f00]"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Horizontal Calendar Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="inline-flex flex-col gap-1 min-w-max">
              {/* Month labels on top */}
              <div className="flex gap-[3px] pl-[41px] mb-2">
                {weeks.map((week, weekIdx) => {
                  const firstDay = week.find(d => d !== null)
                  const showMonth = weekIdx === 0 || firstDay?.getDate() === 1 || (weekIdx > 0 && firstDay?.getMonth() !== weeks[weekIdx - 1].find(d => d !== null)?.getMonth())
                  return (
                    <div key={weekIdx} className="w-[13px] text-[10px] text-[var(--color-text-secondary)] font-semibold">
                      {showMonth ? months[firstDay?.getMonth() || 0].substring(0, 3) : ""}
                    </div>
                  )
                })}
              </div>

              {/* Grid: 7 rows (days), N columns (weeks) */}
              {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
                <div key={dayOfWeek} className="flex gap-[3px]">
                  {/* Day label on left - Show ALL day names */}
                  <div className="w-9 text-[10px] text-[var(--color-text-secondary)] flex items-center justify-end pr-2 font-semibold">
                    {dayNames[dayOfWeek]}
                  </div>

                  {/* Cells for this day across all weeks */}
                  {weeks.map((week, weekIdx) => {
                    const date = week[dayOfWeek]

                    if (!date) {
                      return <div key={weekIdx} className="w-[13px] h-[13px]"></div>
                    }

                    const activity = getActivityForDate(date)
                    const dateStr = date.toISOString().split('T')[0]
                    const isSelected = selectedDate === dateStr
                    const isToday = dateStr === new Date().toISOString().split('T')[0]

                    return (
                      <div
                        key={weekIdx}
                        className={`w-[13px] h-[13px] rounded cursor-pointer transition-all hover:scale-110 hover:ring-2 hover:ring-[#ff6b35] hover:z-10 relative ${getColorIntensity(activity.problemsSolved)} ${isSelected ? 'ring-2 ring-[#ff6b35] scale-110 z-10' : ''} ${isToday ? 'ring-2 ring-[#f77f00]' : ''}`}
                        title={`${date.toLocaleDateString()}: ${activity.problemsSolved} solved`}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      ></div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Legend */}
          <div className="flex sm:hidden items-center gap-3 text-xs text-[var(--color-text-secondary)] mt-4 justify-center font-medium">
            <span>Less</span>
            <div className="flex gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-gray-700/30 border border-gray-600/50"></div>
              <div className="w-3.5 h-3.5 rounded bg-[#ff6b35]/30 border border-[#ff6b35]/40"></div>
              <div className="w-3.5 h-3.5 rounded bg-[#ff6b35]/50 border border-[#ff6b35]/60"></div>
              <div className="w-3.5 h-3.5 rounded bg-[#ff6b35]/70 border border-[#ff6b35]/80"></div>
              <div className="w-3.5 h-3.5 rounded bg-[#ff6b35] border border-[#f77f00]"></div>
            </div>
            <span>More</span>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-gradient-to-r from-[#ff6b35]/5 to-[#f77f00]/5 rounded-lg border border-[#ff6b35]/20 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {(() => {
                    const activity = userStats?.activityCalendar.find(a => a.date.startsWith(selectedDate))
                    return activity && activity.problemsSolved > 0 ? (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="text-2xl">✅</span>
                          <span className="font-bold text-green-500">{activity.problemsSolved}</span>
                          <span className="text-[var(--color-text-secondary)]">solved</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-2xl">🔄</span>
                          <span className="font-bold text-blue-500">{activity.problemsAttempted}</span>
                          <span className="text-[var(--color-text-secondary)]">attempted</span>
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--color-text-secondary)]">No activity on this day</p>
                    )
                  })()}
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StreakPage
