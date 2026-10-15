/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/DashboardPage.tsx

import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { fetchTopics, fetchProblemsByTopic, fetchProblemStats, fetchProblems } from "./helpers/dashboardApi"
import type { Topic, Problem } from "./helpers/dashboardApi"
import { getUserStats, getUserProgress } from "@/services/api/progressApi"
import type { UserStats } from "@/services/api/progressApi"
import CalendarWidget from "@/components/widgets/CalendarWidget"
import StudyStreakWidget from "@/components/widgets/StudyStreakWidget"
import StudyStatsWidget from "@/components/widgets/StudyStatsWidget"
import {
  Code2,
  Star,
  Lock,
  Unlock,
  ChevronRight,
  ChevronLeft,
  Target,
  Flame,
  Trophy,
  Calendar as CalendarIcon,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  ExternalLink,
  X
} from "lucide-react"

/**
 * DashboardPage
 * ------------------------------------------------------
 * Main dashboard with 4-section layout:
 * Left (Collapsible) - Icon widget bar (icons only when collapsed)
 * Middle (50%) - Banner + Main area
 * Right (25%) - Difficulty stats + Calendar
 * Fully responsive for all screen sizes
 * ------------------------------------------------------
 */
const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false)

  // Auto-collapse on mobile/tablet
  const [isMobile, setIsMobile] = useState(false)

  // Main section states
  const [searchQuery, setSearchQuery] = useState("")
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  // Filter and Sort states (with localStorage persistence)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard" | "">(() => {
    return (localStorage.getItem("dashboard-difficulty") as "Easy" | "Medium" | "Hard" | "") || ""
  })
  const [selectedPlatform, setSelectedPlatform] = useState<"leetcode" | "codeforces" | "">(() => {
    return (localStorage.getItem("dashboard-platform") as "leetcode" | "codeforces" | "") || "leetcode"
  })
  const [sortBy, setSortBy] = useState<"newest" | "rating" | "acceptance">(() => {
    return (localStorage.getItem("dashboard-sortBy") as "newest" | "rating" | "acceptance") || "newest"
  })

  // Questions section states
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({})
  const [solvedProblems, setSolvedProblems] = useState<string[]>([])
  const [starredProblems, setStarredProblems] = useState<string[]>([])

  // API data states
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicsLoading, setTopicsLoading] = useState(true)
  const [topicsError, setTopicsError] = useState<string | null>(null)
  const [problemsByTopic, setProblemsByTopic] = useState<{ [key: string]: Problem[] }>({})
  const [problemsLoading, setProblemsLoading] = useState<{ [key: string]: boolean }>({})
  const [totalProblemsByTopic, setTotalProblemsByTopic] = useState<{ [key: string]: number }>({})

  // Stats data
  const [stats, setStats] = useState({
    solved: 0,
    total: 0,
    starred: 0,
    free: 0,
    pro: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Difficulty data
  const [difficulty, setDifficulty] = useState({
    easy: { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard: { solved: 0, total: 0 },
  })

  // User stats (real progress data)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userStatsLoading, setUserStatsLoading] = useState(true)

  // Refresh key to trigger data reload
  const [refreshKey, setRefreshKey] = useState(0)

  const toggleTopic = (topicName: string) => {
    // Toggle selection
    setSelectedTopics(prev =>
      prev.includes(topicName)
        ? prev.filter(t => t !== topicName)
        : [...prev, topicName]
    )

    // Expand the topic and scroll to it
    setExpandedTopic(topicName)

    // Load problems if not already loaded
    if (!problemsByTopic[topicName]) {
      const page = currentPage[topicName] || 1
      setCurrentPage({ ...currentPage, [topicName]: page })
      loadProblemsForTopic(topicName, page)
    }

    // Scroll to the topic section after a short delay to allow rendering
    setTimeout(() => {
      const topicElement = topicRefsMap.current.get(topicName)
      if (topicElement) {
        topicElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Show only first 10 topics when collapsed
  const displayedTopics = isTopicsExpanded ? topics : topics.slice(0, 10)

  // Helper functions
  const toggleTopicExpansion = (topicName: string) => {
    const isExpanding = expandedTopic !== topicName
    setExpandedTopic(isExpanding ? topicName : null)

    // Load problems if expanding and not already loaded
    if (isExpanding && !problemsByTopic[topicName]) {
      const page = currentPage[topicName] || 1
      setCurrentPage({ ...currentPage, [topicName]: page })
      loadProblemsForTopic(topicName, page)
    }
  }

  // Handle page change for a topic
  const handlePageChange = (topicName: string, newPage: number) => {
    setCurrentPage({ ...currentPage, [topicName]: newPage })
    loadProblemsForTopic(topicName, newPage)
  }

  const toggleSolved = (problemId: string) => {
    setSolvedProblems(prev =>
      prev.includes(problemId) ? prev.filter(id => id !== problemId) : [...prev, problemId]
    )
  }

  const toggleStarred = async (problemId: string) => {
    try {
      // Optimistic update
      setStarredProblems(prev =>
        prev.includes(problemId) ? prev.filter(id => id !== problemId) : [...prev, problemId]
      )

      // Call API
      const { toggleFavorite } = await import("@/services/api/progressApi")
      await toggleFavorite(problemId)

      // Update starred count
      setStats(prev => ({
        ...prev,
        starred: starredProblems.includes(problemId) ? prev.starred - 1 : prev.starred + 1
      }))
    } catch (error: any) {
      // Revert on error
      setStarredProblems(prev =>
        prev.includes(problemId) ? prev.filter(id => id !== problemId) : [...prev, problemId]
      )
    }
  }

  const getQuestionsForTopic = (topicName: string): Problem[] => {
    return problemsByTopic[topicName] || []
  }

  const getProgressForTopic = (topicName: string, totalCount: number) => {
    const questions = getQuestionsForTopic(topicName)
    const solved = questions.filter(q => solvedProblems.includes(q._id)).length
    return {
      solved,
      total: totalCount,
      percentage: totalCount > 0 ? (solved / totalCount) * 100 : 0
    }
  }

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      if (mobile) {
        setIsWidgetExpanded(false) // Force collapse on smaller screens
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch topics on component mount and when platform filter changes
  useEffect(() => {
    const loadTopics = async () => {
      try {
        setTopicsLoading(true)
        setTopicsError(null)
        // Fetch topics based on selected platform (undefined = all platforms)
        const data = await fetchTopics(selectedPlatform || undefined)
        setTopics(data)
      } catch (error: any) {
        setTopicsError(error.message || "Failed to load topics")
      } finally {
        setTopicsLoading(false)
      }
    }

    loadTopics()
  }, [selectedPlatform])

  // Fetch problem statistics on component mount and when platform filter changes
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true)
        const data = await fetchProblemStats(selectedPlatform || undefined)

        // Calculate difficulty breakdown
        const easyCount = data.byDifficulty.find((d: any) => d._id === "Easy")?.count || 0
        const mediumCount = data.byDifficulty.find((d: any) => d._id === "Medium")?.count || 0
        const hardCount = data.byDifficulty.find((d: any) => d._id === "Hard")?.count || 0

        setStats({
          solved: 0, // Will be tracked from user progress
          total: data.total,
          starred: 0, // Will be tracked from user favorites
          free: easyCount + mediumCount, // Easy + Medium as "free"
          pro: hardCount, // Hard problems as "pro"
        })

        // Update difficulty state
        setDifficulty({
          easy: { solved: 0, total: easyCount },
          medium: { solved: 0, total: mediumCount },
          hard: { solved: 0, total: hardCount },
        })
      } catch (error: any) {
        // Failed to load stats
      } finally {
        setStatsLoading(false)
      }
    }

    loadStats()
  }, [selectedPlatform])

  // Fetch user stats (real progress data)
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setUserStatsLoading(true)
        const data = await getUserStats()
        setUserStats(data)

        // Update dashboard stats with real user data
        setStats(prev => ({
          ...prev,
          solved: data.totalSolved,
          starred: 0, // Will track favorites separately
        }))

        // Update difficulty breakdown with real solved counts
        setDifficulty(prev => ({
          easy: { solved: data.solvedByDifficulty.easy, total: prev.easy.total },
          medium: { solved: data.solvedByDifficulty.medium, total: prev.medium.total },
          hard: { solved: data.solvedByDifficulty.hard, total: prev.hard.total },
        }))
      } catch (error: any) {
        // Continue with default values if stats loading fails
      } finally {
        setUserStatsLoading(false)
      }
    }

    loadUserStats()
  }, [refreshKey])

  // Load solved and starred problems from user progress (with pagination)
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        let allProgress: any[] = []
        let page = 1
        let hasMore = true

        // Load all progress with pagination (max 100 per request)
        while (hasMore && page <= 10) { // Safety limit: max 10 pages (1000 items)
          const { progress, pagination } = await getUserProgress({
            status: "all",
            limit: 100,
            page
          })

          allProgress = [...allProgress, ...progress]
          hasMore = pagination.hasNext
          page++
        }

        // Extract solved problem IDs
        const solved = allProgress
          .filter(p => p.status === "solved")
          .map(p => p.problemId)

        setSolvedProblems(solved)

        // Extract starred problem IDs
        const starred = allProgress
          .filter(p => p.isFavorite)
          .map(p => p.problemId)
        setStarredProblems(starred)

        // Update starred count in stats
        setStats(prev => ({ ...prev, starred: starred.length }))
      } catch (error: any) {
        // Failed to load user progress
      }
    }

    loadUserProgress()
  }, [refreshKey])

  // Auto-refresh data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefreshKey(prev => prev + 1)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshKey])

  // Fetch problems when a topic is expanded with filters
  const loadProblemsForTopic = async (topicName: string, page: number = 1) => {
    try {
      setProblemsLoading({ ...problemsLoading, [topicName]: true })

      // Build filter params
      const filters: any = {
        tags: topicName,
        page,
        limit: 10,
      }

      // Add difficulty filter if selected
      if (selectedDifficulty) {
        filters.difficulty = selectedDifficulty
      }

      // Add platform filter if selected
      if (selectedPlatform) {
        filters.platform = selectedPlatform
      }

      // Add search query if present
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim()
      }

      // Add sort parameter
      if (sortBy) {
        filters.sortBy = sortBy
      }

      const response = await fetchProblems(filters)

      setProblemsByTopic({
        ...problemsByTopic,
        [topicName]: response.data,
      })

      setTotalProblemsByTopic({
        ...totalProblemsByTopic,
        [topicName]: response.pagination.total,
      })
    } catch (error: any) {
      // Failed to load problems
    } finally {
      setProblemsLoading({ ...problemsLoading, [topicName]: false })
    }
  }

  const quickLinks = [
    { icon: Target, label: "Problems", color: "#ff6b35", path: null },
    { icon: Flame, label: "Streak", color: "#f77f00", path: "/streak" },
    { icon: Trophy, label: "Achievements", color: "#ff6b35", path: null },
    { icon: CalendarIcon, label: "Schedule", color: "#f77f00", path: "/calendar" },
  ]

  // Refs for dropdowns and topic sections
  const filterRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const topicRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())

  // Persist filters to localStorage
  useEffect(() => {
    localStorage.setItem("dashboard-difficulty", selectedDifficulty)
  }, [selectedDifficulty])

  useEffect(() => {
    localStorage.setItem("dashboard-platform", selectedPlatform)
  }, [selectedPlatform])

  useEffect(() => {
    localStorage.setItem("dashboard-sortBy", sortBy)
  }, [sortBy])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterModal(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return
    }

    // If a topic is already expanded, reload it with search query
    if (expandedTopic) {
      const page = currentPage[expandedTopic] || 1
      loadProblemsForTopic(expandedTopic, page)
    } else {
      // If no topic expanded, expand the first topic and search
      if (topics.length > 0) {
        const firstTopic = topics[0].name
        setExpandedTopic(firstTopic)
        setCurrentPage({ ...currentPage, [firstTopic]: 1 })
        loadProblemsForTopic(firstTopic, 1)

        // Scroll to the topic
        setTimeout(() => {
          const topicElement = topicRefsMap.current.get(firstTopic)
          if (topicElement) {
            topicElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }
  }

  // Handle filter change
  const handleFilterChange = (difficulty: "Easy" | "Medium" | "Hard" | "") => {
    setSelectedDifficulty(difficulty)
    setShowFilterModal(false)
    // Reload current expanded topic if any
    if (expandedTopic) {
      const page = currentPage[expandedTopic] || 1
      loadProblemsForTopic(expandedTopic, page)
    }
  }

  // Handle platform change
  const handlePlatformChange = (platform: "leetcode" | "codeforces" | "") => {
    setSelectedPlatform(platform)
    // Close expanded topics when platform changes (topics list will change)
    setExpandedTopic(null)
    setProblemsByTopic({})
    setCurrentPage({})
  }

  // Handle sort change
  const handleSortChange = (sort: "newest" | "rating" | "acceptance") => {
    setSortBy(sort)
    setShowSortModal(false)
    // Reload current expanded topic if any
    if (expandedTopic) {
      const page = currentPage[expandedTopic] || 1
      loadProblemsForTopic(expandedTopic, page)
    }
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedDifficulty("")
    setSelectedPlatform("")
    setSearchQuery("")
    setShowFilterModal(false)
    // Reload current expanded topic if any
    if (expandedTopic) {
      const page = currentPage[expandedTopic] || 1
      loadProblemsForTopic(expandedTopic, page)
    }
  }

  // Auto-reload when filters or sort change and a topic is expanded
  useEffect(() => {
    if (expandedTopic) {
      // Reset to page 1 when filters or sort change
      setCurrentPage({ ...currentPage, [expandedTopic]: 1 })
      loadProblemsForTopic(expandedTopic, 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty, selectedPlatform, sortBy])

  const getPercentage = (solved: number, total: number) => {
    return total > 0 ? Math.round((solved / total) * 100) : 0
  }

  // Calculate needle angle based on difficulty distribution
  const calculateNeedleAngle = () => {
    const easyPercent = getPercentage(difficulty.easy.solved, difficulty.easy.total)
    const mediumPercent = getPercentage(difficulty.medium.solved, difficulty.medium.total)
    const hardPercent = getPercentage(difficulty.hard.solved, difficulty.hard.total)

    // Weighted average: if more hard problems solved, needle points more to red
    // Range: -90deg (left/easy) to 90deg (right/hard)
    const totalSolved = difficulty.easy.solved + difficulty.medium.solved + difficulty.hard.solved

    if (totalSolved === 0) {
      return 0 // Center position when nothing is solved
    }

    // Weight by difficulty: easy = -90 to -30, medium = -30 to 30, hard = 30 to 90
    const easyWeight = difficulty.easy.solved * -60
    const mediumWeight = difficulty.medium.solved * 0
    const hardWeight = difficulty.hard.solved * 60

    const angle = (easyWeight + mediumWeight + hardWeight) / totalSolved
    return Math.max(-90, Math.min(90, angle))
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-3 py-4 md:px-4 md:py-5 lg:px-6 lg:py-6">
      {/* Responsive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] xl:grid-cols-[auto_1fr_auto] gap-4 lg:gap-5 xl:gap-6 w-full">

        {/* LEFT SIDEBAR - Collapsible Icon Widget Bar (Hidden on mobile, collapsed on tablet) */}
        <aside
          className={`hidden md:block transition-all duration-500 ease-in-out space-y-3 sm:space-y-4 ${
            isWidgetExpanded && !isMobile ? "w-64 xl:w-72" : "w-16 lg:w-20"
          }`}
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 sm:p-4 relative overflow-hidden">
            {/* Expand/Collapse Toggle - Only visible on desktop */}
            {!isMobile && (
              <button
                onClick={() => setIsWidgetExpanded(!isWidgetExpanded)}
                className="absolute -right-2 lg:-right-3 top-3 lg:top-4 w-6 h-6 lg:w-7 lg:h-7 bg-gradient-to-br from-[#ff6b35] to-[#f77f00] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-10"
                title={isWidgetExpanded ? "Collapse" : "Expand"}
              >
                <div className={`transition-transform duration-300 ${isWidgetExpanded ? "rotate-0" : "rotate-180"}`}>
                  <ChevronLeft size={14} />
                </div>
              </button>
            )}

            {/* Header - Fade in/out */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                isWidgetExpanded
                  ? "opacity-100 max-h-10 mb-3"
                  : "opacity-0 max-h-0 mb-0"
              }`}
            >
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide whitespace-nowrap">
                Quick Access
              </h3>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              {quickLinks.map((link, index) => {
                const Icon = link.icon

                return (
                  <button
                    key={link.label}
                    onClick={() => link.path && navigate(link.path)}
                    style={{
                      transitionDelay: `${index * 50}ms`
                    }}
                    className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg border border-transparent hover:border-[#ff6b35]/30 hover:bg-[#ff6b35]/5 transition-all duration-300 group relative ${
                      !isWidgetExpanded ? "justify-center" : ""
                    } ${link.path ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                    title={!isWidgetExpanded ? link.label : ""}
                    disabled={!link.path}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isWidgetExpanded ? "scale-100" : "scale-110"
                      }`}
                      style={{ backgroundColor: `${link.color}20` }}
                    >
                      <Icon size={16} className="sm:w-[18px] sm:h-[18px]" style={{ color: link.color }} />
                    </div>

                    {/* Label and Arrow - Smooth slide in/out */}
                    <div
                      className={`flex items-center gap-2 flex-1 overflow-hidden transition-all duration-500 ${
                        isWidgetExpanded
                          ? "opacity-100 max-w-full translate-x-0"
                          : "opacity-0 max-w-0 -translate-x-4"
                      }`}
                    >
                      <span className="flex-1 text-left text-xs sm:text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[#ff6b35] whitespace-nowrap">
                        {link.label}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-gray-400 group-hover:text-[#ff6b35] group-hover:translate-x-1 transition-all duration-300"
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* User Stats Widget - Smooth fade in/out */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isWidgetExpanded
                ? "opacity-100 max-h-48 translate-y-0"
                : "opacity-0 max-h-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="bg-gradient-to-br from-[#ff6b35]/10 to-[#f77f00]/10 border border-[#ff6b35]/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#f77f00] flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
                    {user?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">
                      {userStats?.totalSolved || 0} solved
                    </p>
                    {userStats && userStats.currentStreak > 0 && (
                      <>
                        <span className="text-[var(--color-text-secondary)]">•</span>
                        <p className="text-[10px] sm:text-xs font-semibold text-[#f77f00]">
                          🔥 {userStats.currentStreak} day{userStats.currentStreak > 1 ? 's' : ''}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {userStats && (
                <div className="mt-2 pt-2 border-t border-[#ff6b35]/20">
                  <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">
                    Longest Streak: <span className="font-bold text-[var(--color-text-primary)]">{userStats.longestStreak} days</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MIDDLE + RIGHT: Combined on mobile/tablet, separate on desktop */}
        <div className="lg:col-span-1 xl:col-span-2 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 lg:gap-5">

          {/* MIDDLE SECTION - Main content area */}
          <main className="w-full space-y-4 sm:space-y-5 min-w-0">

          {/* BANNER AREA - DSA Tracker All Stats */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 sm:p-5 md:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 sm:gap-5 lg:gap-6">

              {/* LEFT: Text Content */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#f77f00] flex items-center justify-center shadow-lg shadow-[#ff6b35]/20">
                    <Code2 size={24} className="sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)] bg-gradient-to-r from-[#ff6b35] to-[#f77f00] bg-clip-text text-transparent">
                      DSA Tracker All
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
                      Complete DSA problem collection
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-secondary)] ml-0 sm:ml-[60px] leading-relaxed">
                  Track your progress across <span className="font-semibold text-[var(--color-text-primary)]">{stats.total} problems</span>.
                  Master data structures and algorithms.
                </p>
              </div>

              {/* RIGHT: Stats Cards Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto lg:min-w-[340px] xl:min-w-[380px]">

                {/* Solved */}
                <div className="group bg-[var(--color-background)] hover:bg-[#ff6b35]/5 border border-[var(--color-border)] hover:border-[#ff6b35]/30 rounded-lg p-2.5 sm:p-3 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                      Solved
                    </p>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#ff6b35]/10 group-hover:bg-[#ff6b35]/20 flex items-center justify-center transition-all">
                      <Code2 size={12} className="sm:w-[14px] sm:h-[14px] text-[#ff6b35]" />
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                    {stats.solved}
                    <span className="text-xs sm:text-sm text-[var(--color-text-secondary)]">/{stats.total}</span>
                  </p>
                  <div className="h-1 bg-[var(--color-border)] rounded-full overflow-hidden mt-1.5 sm:mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff6b35] to-[#f77f00] transition-all duration-700"
                      style={{ width: `${(stats.solved / stats.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Starred */}
                <div className="group bg-[var(--color-background)] hover:bg-yellow-500/5 border border-[var(--color-border)] hover:border-yellow-500/30 rounded-lg p-2.5 sm:p-3 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                      Starred
                    </p>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 flex items-center justify-center transition-all">
                      <Star size={12} className="sm:w-[14px] sm:h-[14px] text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                    {stats.starred}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)] mt-1.5 sm:mt-2">
                    Favorites
                  </p>
                </div>

                {/* Free */}
                <div className="group bg-[var(--color-background)] hover:bg-green-500/5 border border-[var(--color-border)] hover:border-green-500/30 rounded-lg p-2.5 sm:p-3 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                      Free
                    </p>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 flex items-center justify-center transition-all">
                      <Unlock size={12} className="sm:w-[14px] sm:h-[14px] text-green-500" />
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                    {stats.free}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)] mt-1.5 sm:mt-2">
                    Free access
                  </p>
                </div>

                {/* Pro */}
                <div className="group bg-[var(--color-background)] hover:bg-purple-500/5 border border-[var(--color-border)] hover:border-purple-500/30 rounded-lg p-2.5 sm:p-3 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                      Pro
                    </p>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 flex items-center justify-center transition-all">
                      <Lock size={12} className="sm:w-[14px] sm:h-[14px] text-purple-500" />
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                    {stats.pro}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)] mt-1.5 sm:mt-2">
                    Premium
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* MAIN AREA - Problems Section */}
          <div className="space-y-4">

            {/* Search Bar and Actions Row */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" size={18} />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch()
                      }
                    }}
                    className="w-full pl-10 pr-24 py-2.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 focus:border-[#ff6b35] transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          if (expandedTopic) {
                            loadProblemsForTopic(expandedTopic, currentPage[expandedTopic] || 1)
                          }
                        }}
                        className="p-1 text-[var(--color-text-secondary)] hover:text-red-500 cursor-pointer rounded"
                        title="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {searchQuery && (
                      <button
                        onClick={handleSearch}
                        className="px-2 py-1 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded text-xs font-medium transition-all"
                        title="Search"
                      >
                        Go
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Filter Button */}
                  <div className="relative" ref={filterRef}>
                    <button
                      onClick={() => setShowFilterModal(!showFilterModal)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-[var(--color-background)] hover:bg-[#ff6b35]/10 border hover:border-[#ff6b35]/50 rounded-lg text-sm font-medium text-[var(--color-text-primary)] transition-all duration-200 cursor-pointer ${
                        (selectedDifficulty || selectedPlatform) ? 'border-[#ff6b35] bg-[#ff6b35]/5' : 'border-[var(--color-border)]'
                      }`}
                      title="Filter"
                    >
                      <Filter size={16} />
                      <span className="hidden sm:inline">Filter</span>
                      {(selectedDifficulty || selectedPlatform) && (
                        <span className="w-2 h-2 rounded-full bg-[#ff6b35]"></span>
                      )}
                    </button>

                    {/* Filter Dropdown */}
                    {showFilterModal && (
                      <div className="absolute top-full mt-2 right-0 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 p-3 animate-fade-in">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Filters</h4>
                          <button
                            onClick={handleClearFilters}
                            className="text-xs text-[#ff6b35] hover:underline cursor-pointer"
                          >
                            Clear All
                          </button>
                        </div>

                        {/* Platform Filter */}
                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Platform</h5>
                          <div className="space-y-2">
                            <button
                              onClick={() => handlePlatformChange("")}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                selectedPlatform === ""
                                  ? 'bg-[#ff6b35]/10 text-[#ff6b35] font-medium'
                                  : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                              }`}
                            >
                              All Platforms
                            </button>
                            <button
                              onClick={() => handlePlatformChange("leetcode")}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                selectedPlatform === "leetcode"
                                  ? 'bg-[#ff6b35]/10 text-[#ff6b35] font-medium'
                                  : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                              }`}
                            >
                              LeetCode
                            </button>
                            <button
                              onClick={() => handlePlatformChange("codeforces")}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                selectedPlatform === "codeforces"
                                  ? 'bg-[#ff6b35]/10 text-[#ff6b35] font-medium'
                                  : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                              }`}
                            >
                              Codeforces
                            </button>
                          </div>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                          <h5 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Difficulty</h5>
                          <div className="space-y-2">
                            <button
                              onClick={() => handleFilterChange("")}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                selectedDifficulty === ""
                                  ? 'bg-[#ff6b35]/10 text-[#ff6b35] font-medium'
                                  : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                              }`}
                            >
                              All Difficulties
                            </button>
                            <button
                              onClick={() => handleFilterChange("Easy")}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                selectedDifficulty === "Easy"
                                  ? 'bg-green-500/10 text-green-500 font-medium'
                                  : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                              }`}
                            >
                              Easy
                            </button>
                            <button
                              onClick={() => handleFilterChange("Medium")}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                selectedDifficulty === "Medium"
                                  ? 'bg-yellow-500/10 text-yellow-500 font-medium'
                                  : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                              }`}
                            >
                              Medium
                            </button>
                            <button
                              onClick={() => handleFilterChange("Hard")}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                selectedDifficulty === "Hard"
                                  ? 'bg-red-500/10 text-red-500 font-medium'
                                  : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                              }`}
                            >
                              Hard
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort Button */}
                  <div className="relative" ref={sortRef}>
                    <button
                      onClick={() => setShowSortModal(!showSortModal)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-[var(--color-background)] hover:bg-[#ff6b35]/10 border hover:border-[#ff6b35]/50 rounded-lg text-sm font-medium text-[var(--color-text-primary)] transition-all duration-200 cursor-pointer ${
                        sortBy !== "newest" ? 'border-[#ff6b35] bg-[#ff6b35]/5' : 'border-[var(--color-border)]'
                      }`}
                      title="Sort"
                    >
                      <ArrowUpDown size={16} />
                      <span className="hidden sm:inline">Sort</span>
                      {sortBy !== "newest" && (
                        <span className="w-2 h-2 rounded-full bg-[#ff6b35]"></span>
                      )}
                    </button>

                    {/* Sort Dropdown */}
                    {showSortModal && (
                      <div className="absolute top-full mt-2 right-0 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 p-3 animate-fade-in">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Sort By</h4>
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleSortChange("newest")}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                              sortBy === "newest"
                                ? 'bg-[#ff6b35]/10 text-[#ff6b35] font-medium'
                                : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                            }`}
                          >
                            Newest First
                          </button>
                          <button
                            onClick={() => handleSortChange("rating")}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                              sortBy === "rating"
                                ? 'bg-[#ff6b35]/10 text-[#ff6b35] font-medium'
                                : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                            }`}
                          >
                            Highest Rating
                          </button>
                          <button
                            onClick={() => handleSortChange("acceptance")}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                              sortBy === "acceptance"
                                ? 'bg-[#ff6b35]/10 text-[#ff6b35] font-medium'
                                  : 'hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                            }`}
                          >
                            Highest Acceptance
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete Button (For selected items) */}
                  {solvedProblems.length > 0 && (
                    <button
                      onClick={() => setSolvedProblems([])}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-[var(--color-background)] hover:bg-red-500/10 border border-[var(--color-border)] hover:border-red-500/50 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:text-red-500 transition-all duration-200 cursor-pointer"
                      title="Clear solved"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchQuery || selectedDifficulty || selectedPlatform || sortBy !== "newest") && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[var(--color-text-secondary)]">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-md text-xs text-[#ff6b35]">
                      Search: "{searchQuery}"
                      <button onClick={() => {
                        setSearchQuery("")
                        if (expandedTopic) loadProblemsForTopic(expandedTopic, currentPage[expandedTopic] || 1)
                      }} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedPlatform && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-md text-xs text-[#ff6b35]">
                      Platform: {selectedPlatform === "leetcode" ? "LeetCode" : "Codeforces"}
                      <button onClick={() => handlePlatformChange("")} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedDifficulty && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                      selectedDifficulty === "Easy" ? "bg-green-500/10 border border-green-500/30 text-green-500" :
                      selectedDifficulty === "Medium" ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-500" :
                      "bg-red-500/10 border border-red-500/30 text-red-500"
                    }`}>
                      Difficulty: {selectedDifficulty}
                      <button onClick={() => handleFilterChange("")} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {sortBy !== "newest" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-md text-xs text-[#ff6b35]">
                      Sort: {sortBy === "rating" ? "Highest Rating" : "Highest Acceptance"}
                      <button onClick={() => handleSortChange("newest")} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Topics Section - Expandable */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-gradient-to-br from-[#ff6b35]/5 to-transparent border-b border-[var(--color-border)]">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
                    Topics
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {selectedTopics.length > 0 ? `${selectedTopics.length} selected` : "Select topics to filter problems"}
                  </p>
                </div>
                <button
                  onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 border border-[#ff6b35]/20 rounded-lg text-xs sm:text-sm font-medium text-[#ff6b35] transition-all cursor-pointer"
                >
                  {isTopicsExpanded ? (
                    <>
                      <span>Show Less</span>
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      <span>Show All ({topics.length})</span>
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Topics Chips */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap gap-2">
                  {displayedTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.name)
                    return (
                      <button
                        key={topic.name}
                        onClick={() => toggleTopic(topic.name)}
                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-[#ff6b35] to-[#f77f00] text-white shadow-md shadow-[#ff6b35]/30"
                            : "bg-[var(--color-background)] hover:bg-[#ff6b35]/10 border border-[var(--color-border)] hover:border-[#ff6b35]/50 text-[var(--color-text-primary)]"
                        }`}
                      >
                        <span>{topic.name}</span>
                        <span
                          className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[var(--color-border)] text-[var(--color-text-secondary)] group-hover:bg-[#ff6b35]/20 group-hover:text-[#ff6b35]"
                          }`}
                        >
                          {topic.count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Show More/Less indicator when collapsed */}
                {!isTopicsExpanded && topics.length > 10 && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-secondary)] text-center">
                      +{topics.length - 10} more topics available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Questions List - Expandable by Topics (Infinite Scroll Container) */}
            <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1 scroll-smooth">
              {topicsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Loading topics...</p>
                  </div>
                </div>
              ) : topicsError ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                  <p className="text-red-500 font-medium">{topicsError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : topics.length === 0 ? (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
                  <Code2 className="mx-auto mb-3 text-[var(--color-text-secondary)]" size={48} />
                  <p className="text-[var(--color-text-secondary)]">No topics found. Please sync problems from backend.</p>
                </div>
              ) : (
                topics.map((topic) => {
                  const isExpanded = expandedTopic === topic.name
                  const progress = getProgressForTopic(topic.name, topic.count)
                  const questions = getQuestionsForTopic(topic.name)
                  const isLoading = problemsLoading[topic.name]
                  const page = currentPage[topic.name] || 1
                  const totalProblems = totalProblemsByTopic[topic.name] || topic.count
                  const totalPages = Math.ceil(totalProblems / 10)

                return (
                  <div
                    key={topic.name}
                    ref={(el) => {
                      if (el) {
                        topicRefsMap.current.set(topic.name, el)
                      } else {
                        topicRefsMap.current.delete(topic.name)
                      }
                    }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                  >
                    {/* Topic Header Row - Collapsible */}
                    <button
                      onClick={() => toggleTopicExpansion(topic.name)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between hover:bg-[#ff6b35]/5 transition-colors cursor-pointer"
                    >
                      {/* Left: Topic Name & Expand Icon */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`transition-transform duration-300 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        >
                          <ChevronRight size={20} className="text-[#ff6b35]" />
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">
                          {topic.name}
                        </h4>
                      </div>

                      {/* Right: Progress Bar & Count */}
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block w-32 md:w-40">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                              {progress.solved}/{progress.total}
                            </span>
                            <span className="text-xs font-bold text-[#ff6b35]">
                              {progress.percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-[var(--color-border)]">
                            <div
                              className="h-full bg-gradient-to-r from-[#ff6b35] to-[#f77f00] transition-all duration-500 shadow-sm"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm px-2.5 py-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md font-medium text-[var(--color-text-primary)]">
                          {topic.count}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Content - Questions Table */}
                    {isExpanded && (
                      <div className="border-t border-[var(--color-border)] animate-fade-in">
                        {/* Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            {/* Table Header */}
                            <thead className="bg-gradient-to-r from-[#ff6b35]/5 to-transparent">
                              <tr>
                                <th className="px-3 sm:px-4 py-3 text-left">
                                  <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                                    Status
                                  </span>
                                </th>
                                <th className="px-3 sm:px-4 py-3 text-left">
                                  <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                                    Star
                                  </span>
                                </th>
                                <th className="px-3 sm:px-4 py-3 text-left">
                                  <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                                    Problem
                                  </span>
                                </th>
                                <th className="px-3 sm:px-4 py-3 text-left">
                                  <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                                    Difficulty
                                  </span>
                                </th>
                                <th className="px-3 sm:px-4 py-3 text-center">
                                  <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                                    Solution
                                  </span>
                                </th>
                              </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                              {isLoading ? (
                                <tr>
                                  <td colSpan={5} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                      <div className="w-10 h-10 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin mb-3"></div>
                                      <p className="text-sm text-[var(--color-text-secondary)]">Loading problems...</p>
                                    </div>
                                  </td>
                                </tr>
                              ) : questions.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-4 py-12 text-center">
                                    <p className="text-sm text-[var(--color-text-secondary)]">No problems found for this topic.</p>
                                  </td>
                                </tr>
                              ) : (
                                questions.map((question, idx) => {
                                  const isSolved = solvedProblems.includes(question._id)
                                  const isStarred = starredProblems.includes(question._id)

                                  return (
                                    <tr
                                      key={question._id}
                                      className={`border-t border-[var(--color-border)] hover:bg-[#ff6b35]/5 transition-colors ${
                                        idx % 2 === 0 ? "" : "bg-[var(--color-background)]/30"
                                      }`}
                                    >
                                      {/* Status */}
                                      <td className="px-3 sm:px-4 py-3">
                                        <button
                                          onClick={() => toggleSolved(question._id)}
                                          className="transition-all hover:scale-110 cursor-pointer"
                                        >
                                          {isSolved ? (
                                            <CheckCircle2
                                              size={20}
                                              className="text-green-500 fill-green-500"
                                            />
                                          ) : (
                                            <Circle size={20} className="text-[var(--color-text-secondary)]" />
                                          )}
                                        </button>
                                      </td>

                                      {/* Star */}
                                      <td className="px-3 sm:px-4 py-3">
                                        <button
                                          onClick={() => toggleStarred(question._id)}
                                          className="transition-all hover:scale-110 cursor-pointer"
                                        >
                                          <Star
                                            size={18}
                                            className={`${
                                              isStarred
                                                ? "text-yellow-500 fill-yellow-500"
                                                : "text-[var(--color-text-secondary)]"
                                            }`}
                                          />
                                        </button>
                                      </td>

                                      {/* Problem */}
                                      <td className="px-3 sm:px-4 py-3">
                                        <button
                                          onClick={() => navigate(`/practice/${question._id}`)}
                                          className="text-sm sm:text-base font-medium text-[var(--color-text-primary)] hover:text-[#ff6b35] transition-colors text-left cursor-pointer"
                                        >
                                          {question.title}
                                        </button>
                                      </td>

                                      {/* Difficulty */}
                                      <td className="px-3 sm:px-4 py-3">
                                        <span
                                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                                            question.difficulty === "Easy"
                                              ? "bg-green-500/10 text-green-500"
                                              : question.difficulty === "Medium"
                                              ? "bg-yellow-500/10 text-yellow-500"
                                              : "bg-red-500/10 text-red-500"
                                          }`}
                                        >
                                          {question.difficulty}
                                        </span>
                                      </td>

                                      {/* Solution */}
                                      <td className="px-3 sm:px-4 py-3 text-center">
                                        <a
                                          href={question.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 border border-[#ff6b35]/30 rounded-lg text-xs font-medium text-[#ff6b35] transition-all"
                                        >
                                          <span>View</span>
                                          <ExternalLink size={12} />
                                        </a>
                                      </td>
                                    </tr>
                                  )
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {!isLoading && totalPages > 1 && (
                          <div className="px-4 py-3 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-background)]/50">
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                              Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, totalProblems)} of {totalProblems}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePageChange(topic.name, Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-primary)] hover:bg-[#ff6b35]/10 hover:border-[#ff6b35]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                              >
                                Previous
                              </button>
                              <span className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                                {page} / {totalPages}
                              </span>
                              <button
                                onClick={() => handlePageChange(topic.name, Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-primary)] hover:bg-[#ff6b35]/10 hover:border-[#ff6b35]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
                })
              )}
            </div>

          </div>
        </main>

          {/* RIGHT SIDEBAR - Stacks below on mobile/tablet, side-by-side on desktop */}
          <aside className="w-full xl:w-64 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">

          {/* Difficulty Breakdown with Gauge */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-br from-[#ff6b35]/5 to-transparent px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--color-border)]">
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
                Difficulty Progress
              </h3>
              <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] mt-0.5">
                Track your problem-solving journey
              </p>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-5">
              {/* Gauge Speedometer - Centered */}
              <div className="relative w-full max-w-[180px] mx-auto mb-6">
                <svg
                  viewBox="0 0 200 120"
                  className="w-full h-auto"
                  style={{ overflow: "visible" }}
                >
                  {/* Background glow effect */}
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#4ade80" />
                    </linearGradient>
                    <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#facc15" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>

                  {/* Background Semi-Circle Track */}
                  <path
                    d="M 30,100 A 70,70 0 0,1 170,100"
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    opacity="0.2"
                  />

                  {/* Green Arc (Easy) - Left section (180° to 120°) */}
                  <path
                    d="M 30,100 A 70,70 0 0,1 65,38"
                    fill="none"
                    stroke="url(#greenGrad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    opacity="0.9"
                  />

                  {/* Yellow Arc (Medium) - Middle section (120° to 60°) */}
                  <path
                    d="M 65,38 A 70,70 0 0,1 135,38"
                    fill="none"
                    stroke="url(#yellowGrad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    opacity="0.9"
                  />

                  {/* Red Arc (Hard) - Right section (60° to 0°) */}
                  <path
                    d="M 135,38 A 70,70 0 0,1 170,100"
                    fill="none"
                    stroke="url(#redGrad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    opacity="0.9"
                  />

                  {/* Needle */}
                  <g
                    style={{
                      transform: `rotate(${calculateNeedleAngle()}deg)`,
                      transformOrigin: "100px 100px",
                      transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    {/* Needle shadow */}
                    <line
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="42"
                      stroke="#000"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.15"
                      transform="translate(1.5, 1.5)"
                    />
                    {/* Needle line with gradient */}
                    <line
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="42"
                      stroke="#ff6b35"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Needle tip */}
                    <circle cx="100" cy="42" r="3.5" fill="#ff6b35" />
                  </g>

                  {/* Center dot */}
                  <circle cx="100" cy="100" r="7" fill="var(--color-surface)" />
                  <circle cx="100" cy="100" r="4" fill="#ff6b35" />
                  <circle cx="100" cy="100" r="2" fill="#fff" opacity="0.8" />
                </svg>

                {/* Center Total Display */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                    {difficulty.easy.solved + difficulty.medium.solved + difficulty.hard.solved}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold mt-0.5">
                    Total Solved
                  </p>
                </div>
              </div>

              {/* Difficulty List - Enhanced */}
              <div className="space-y-2">
                {/* Easy */}
                <div className="group flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-green-500/5 to-transparent hover:from-green-500/10 transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-500/20 group-hover:ring-4 transition-all" />
                    <span className="text-xs sm:text-sm font-semibold text-green-500">Easy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                        {difficulty.easy.solved}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">/</span>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">
                        {difficulty.easy.total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medium */}
                <div className="group flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-yellow-500/5 to-transparent hover:from-yellow-500/10 transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-yellow-500/20 group-hover:ring-4 transition-all" />
                    <span className="text-xs sm:text-sm font-semibold text-yellow-500">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                        {difficulty.medium.solved}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">/</span>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">
                        {difficulty.medium.total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hard */}
                <div className="group flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-red-500/5 to-transparent hover:from-red-500/10 transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/20 group-hover:ring-4 transition-all" />
                    <span className="text-xs sm:text-sm font-semibold text-red-500">Hard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                        {difficulty.hard.solved}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">/</span>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">
                        {difficulty.hard.total}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Study Streak Widget */}
          <StudyStreakWidget />

          {/* Study Stats Widget */}
          <StudyStatsWidget />

          {/* Calendar Widget */}
          <CalendarWidget />
        </aside>

        </div>
        {/* End of combined middle+right wrapper */}

      </div>
    </div>
  )
}

export default DashboardPage
