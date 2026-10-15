import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  Trash2,
  ArrowLeft,
  Search,
  Clock,
  Bell,
  BellOff,
  Eye,
  CheckCircle2,
  Code2,
  ExternalLink,
} from "lucide-react";
import {
  getStudyPlans,
  getStudyPlanByDate,
  upsertStudyPlan,
  markProblemCompleted,
  deleteStudyPlan,
  removeProblemFromStudyPlan,
  toggleCompletionStatus,
  type StudyPlan,
  type Reminder,
} from "@/services/api/studyPlanApi";
import { getProblems, type Problem } from "@/services/api/problemsApi";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { getUserProgress } from "@/services/api/progressApi";
import Confetti from "@/components/effects/Confetti";

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studyPlans, setStudyPlans] = useState<Map<string, StudyPlan>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());

  // Reminder states
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  // Problems
  const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Celebration
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadStudyPlans();
  }, [currentDate]);

  // Sync with user progress when returning to the page (from code editor)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && selectedPlan && showDetailModal) {
        // User returned to the page, re-sync
        syncWithUserProgress(selectedPlan);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [selectedPlan, showDetailModal]);

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

  const loadProblems = async () => {
    try {
      const response = await getProblems({
        page: 1,
        limit: 100,
        platform: "leetcode"
      });
      setAvailableProblems(response.data || []);
    } catch (error) {
      console.error("Error loading problems:", error);
      setAvailableProblems([]);
    }
  };

  const handleDateClick = async (date: Date) => {
    setSelectedDate(date);
    const dateKey = date.toISOString().split("T")[0];
    const existingPlan = studyPlans.get(dateKey);

    if (existingPlan) {
      // Show detail modal for existing plan
      setSelectedPlan(existingPlan);
      setShowDetailModal(true);
      // Sync with user progress to auto-mark solved problems
      syncWithUserProgress(existingPlan);
    } else {
      // Show create modal for new plan
      resetForm();
      setShowCreateModal(true);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setSelectedProblems(new Set());
    setReminderEnabled(false);
    setReminderDate("");
    setReminderTime("");
  };

  const handleCreateStudyPlan = async () => {
    if (!selectedDate || selectedProblems.size === 0) {
      alert("Please select at least one problem");
      return;
    }

    try {
      const dateKey = selectedDate.toISOString().split("T")[0];
      const problemIds = Array.from(selectedProblems);

      const reminder: Partial<Reminder> | undefined = reminderEnabled
        ? {
            enabled: true,
            reminderDate: reminderDate,
            reminderTime: reminderTime,
            sent: false,
          }
        : undefined;

      const updatedPlan = await upsertStudyPlan(
        dateKey,
        problemIds,
        undefined, // goal
        title,
        description,
        startTime,
        endTime,
        reminder
      );

      setStudyPlans((prev) => new Map(prev).set(dateKey, updatedPlan));
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating study plan:", error);
      alert("Failed to create study plan");
    }
  };

  const handleToggleCompletion = async (plan: StudyPlan) => {
    try {
      const dateKey = new Date(plan.date).toISOString().split("T")[0];
      const wasCompleted = plan.isCompleted;
      const updatedPlan = await toggleCompletionStatus(dateKey, !plan.isCompleted);
      setStudyPlans((prev) => new Map(prev).set(dateKey, updatedPlan));
      if (selectedPlan?._id === plan._id) {
        setSelectedPlan(updatedPlan);
      }

      // Trigger confetti when marking as complete (not when undoing)
      if (!wasCompleted && updatedPlan.isCompleted) {
        setShowConfetti(true);
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  const handleToggleProblemCompleted = async (problemId: string, completed: boolean) => {
    if (!selectedDate || !selectedPlan) return;
    try {
      const dateKey = selectedDate.toISOString().split("T")[0];
      const updatedPlan = await markProblemCompleted(dateKey, problemId, completed);
      setSelectedPlan(updatedPlan);
      setStudyPlans((prev) => new Map(prev).set(dateKey, updatedPlan));
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedDate) return;
    if (!confirm("Are you sure you want to delete this study plan?")) return;

    try {
      const dateKey = selectedDate.toISOString().split("T")[0];
      await deleteStudyPlan(dateKey);
      setSelectedPlan(null);
      setShowDetailModal(false);
      setStudyPlans((prev) => {
        const newMap = new Map(prev);
        newMap.delete(dateKey);
        return newMap;
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  // Sync study plan with user progress
  const syncWithUserProgress = async (plan: StudyPlan) => {
    try {
      const { progress } = await getUserProgress({ status: "solved" });
      const solvedProblemIds = new Set(progress.map((p) => p.problemId));

      let hasChanges = false;

      // Check each problem in the plan
      for (const item of plan.items) {
        const isSolved = solvedProblemIds.has(item.problemId._id);
        if (isSolved && !item.completed) {
          // Problem is solved in progress but not marked in study plan
          await markProblemCompleted(
            new Date(plan.date).toISOString().split("T")[0],
            item.problemId._id,
            true
          );
          hasChanges = true;
        }
      }

      // Reload the plan if there were changes
      if (hasChanges) {
        const dateKey = new Date(plan.date).toISOString().split("T")[0];
        const updatedPlan = await getStudyPlanByDate(dateKey);
        if (updatedPlan) {
          setSelectedPlan(updatedPlan);
          setStudyPlans((prev) => new Map(prev).set(dateKey, updatedPlan));
        }
      }
    } catch (error) {
      console.error("Error syncing with user progress:", error);
    }
  };

  const toggleProblemSelection = (problemId: string) => {
    setSelectedProblems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(problemId)) {
        newSet.delete(problemId);
      } else {
        newSet.add(problemId);
      }
      return newSet;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const getDayStatus = (date: Date | null) => {
    if (!date) return null;
    const dateKey = date.toISOString().split("T")[0];
    const plan = studyPlans.get(dateKey);
    if (!plan) return null;

    if (plan.isCompleted) return "completed";
    if (plan.totalPlanned === 0) return null;
    const progress = (plan.totalCompleted / plan.totalPlanned) * 100;
    if (progress === 100) return "completed";
    if (progress > 0) return "in-progress";
    return "planned";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500";
      case "Medium": return "text-yellow-500";
      case "Hard": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const filteredProblems = (availableProblems || []).filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--color-hover)] rounded-lg transition-all">
              <ArrowLeft size={24} className="text-[var(--color-text-primary)]" />
            </button>
            <div className="p-3 bg-gradient-to-br from-[#ff6b35] to-[#f77f00] rounded-xl">
              <CalendarIcon className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">Study Planner</h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Schedule & track your DSA journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Month Navigation */}
        <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl p-6 mb-6 shadow-md">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 hover:bg-[var(--color-hover)] rounded-lg transition-all border border-[var(--color-border)]">
              <ChevronLeft size={24} className="text-[var(--color-text-primary)]" />
            </button>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{monthName} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-[var(--color-hover)] rounded-lg transition-all border border-[var(--color-border)]">
              <ChevronRight size={24} className="text-[var(--color-text-primary)]" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl p-4 mb-6 shadow-md">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded border border-green-600"></div><span className="text-sm text-[var(--color-text-secondary)]">Completed</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded border border-yellow-600"></div><span className="text-sm text-[var(--color-text-secondary)]">In Progress</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded border border-blue-600"></div><span className="text-sm text-[var(--color-text-secondary)]">Planned</span></div>
            <div className="flex items-center gap-2"><Bell size={16} className="text-[#ff6b35]" /><span className="text-sm text-[var(--color-text-secondary)]">Has Reminder</span></div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-[var(--color-text-secondary)] py-2 border-b-2 border-[var(--color-border)]">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
              const status = getDayStatus(date);
              const dateKey = date.toISOString().split("T")[0];
              const plan = studyPlans.get(dateKey);
              const hasReminder = plan?.reminder?.enabled;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square p-2 rounded-lg border-2 transition-all hover:scale-105 relative ${
                    isToday(date) ? "border-[#ff6b35] shadow-lg shadow-[#ff6b35]/20" : "border-[var(--color-border)]"
                  } ${status === "completed" ? "bg-green-500/20 border-green-500/50" : ""} ${
                    status === "in-progress" ? "bg-yellow-500/20 border-yellow-500/50" : ""
                  } ${status === "planned" ? "bg-blue-500/20 border-blue-500/50" : ""} ${
                    !status ? "hover:bg-[var(--color-hover)] hover:border-[#ff6b35]/50" : ""
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div className="text-sm font-semibold text-[var(--color-text-primary)] flex items-start justify-between">
                      <span>{date.getDate()}</span>
                      {hasReminder && <Bell size={12} className="text-[#ff6b35]" />}
                    </div>
                    {plan && (
                      <div className="mt-auto">
                        {plan.title && (
                          <div className="text-xs text-[var(--color-text-primary)] font-medium truncate">
                            {plan.title}
                          </div>
                        )}
                        <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                          {plan.totalCompleted}/{plan.totalPlanned}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Study Plan Modal */}
      {showCreateModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Create Study Plan - {selectedDate.toLocaleDateString()}
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[var(--color-hover)] rounded-lg">
                  <X size={20} className="text-[var(--color-text-primary)]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Array Problems Practice"
                    className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6b35]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will you focus on in this session?"
                    rows={3}
                    className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6b35] resize-none"
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      <Clock size={16} className="inline mr-1" />
                      Start Time
                    </label>
                    <TimePicker
                      value={startTime}
                      onChange={setStartTime}
                      placeholder="Select start time"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      <Clock size={16} className="inline mr-1" />
                      End Time
                    </label>
                    <TimePicker
                      value={endTime}
                      onChange={setEndTime}
                      placeholder="Select end time"
                    />
                  </div>
                </div>

                {/* Reminder Toggle */}
                <div className="p-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bell size={20} className="text-[#ff6b35]" />
                      <span className="font-medium text-[var(--color-text-primary)]">Set Reminder</span>
                    </div>
                    <button
                      onClick={() => setShowReminderModal(true)}
                      className="px-4 py-2 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all text-sm"
                    >
                      Configure
                    </button>
                  </div>
                  {reminderEnabled && (
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      Reminder set for {reminderDate} at {reminderTime}
                    </div>
                  )}
                </div>

                {/* Select Problems */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                      Select Problems <span className="text-red-500">*</span>
                    </label>
                    <button
                      onClick={() => {
                        loadProblems();
                        setShowAddProblemModal(true);
                      }}
                      className="px-4 py-2 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all text-sm flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Browse Problems
                    </button>
                  </div>

                  {selectedProblems.size > 0 ? (
                    <div className="space-y-2 mt-3">
                      {Array.from(selectedProblems).map((problemId) => {
                        const problem = availableProblems.find(p => p._id === problemId);
                        if (!problem) return null;
                        return (
                          <div key={problemId} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]">
                            <Check className="text-green-500" size={16} />
                            <div className="flex-1">
                              <div className="text-[var(--color-text-primary)] font-medium">{problem.title}</div>
                              <div className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</div>
                            </div>
                            <button
                              onClick={() => toggleProblemSelection(problemId)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                            >
                              <X size={16} className="text-red-500" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                      <p className="text-[var(--color-text-secondary)]">No problems selected. Click "Browse Problems" to add.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--color-border)] flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-hover)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStudyPlan}
                disabled={selectedProblems.size === 0 || !title}
                className="flex-1 px-4 py-2 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Study Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Problems Modal */}
      {showAddProblemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Select Problems</h3>
                <button onClick={() => setShowAddProblemModal(false)} className="p-2 hover:bg-[var(--color-hover)] rounded-lg">
                  <X size={20} className="text-[var(--color-text-primary)]" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" size={20} />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6b35]"
                />
              </div>
              {selectedProblems.size > 0 && (
                <div className="mt-3 text-sm text-[var(--color-text-secondary)]">
                  {selectedProblems.size} problem(s) selected
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {filteredProblems && filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => {
                  const isSelected = selectedProblems.has(problem._id);
                  return (
                    <button
                      key={problem._id}
                      onClick={() => toggleProblemSelection(problem._id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        isSelected
                          ? "border-[#ff6b35] bg-[#ff6b35]/10"
                          : "border-[var(--color-border)] hover:bg-[var(--color-hover)]"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected ? "bg-[#ff6b35] border-[#ff6b35]" : "border-gray-600"
                      }`}>
                        {isSelected && <Check className="text-white" size={14} strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <div className="text-[var(--color-text-primary)] font-medium">{problem.title}</div>
                        <div className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-secondary)]">No problems found</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowAddProblemModal(false)}
                className="w-full px-4 py-2 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all"
              >
                Done ({selectedProblems.size} selected)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Setup Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="text-[#ff6b35]" size={24} />
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Set Reminder</h3>
                </div>
                <button onClick={() => setShowReminderModal(false)} className="p-2 hover:bg-[var(--color-hover)] rounded-lg">
                  <X size={20} className="text-[var(--color-text-primary)]" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg">
                <span className="text-[var(--color-text-primary)] font-medium">Enable Reminder</span>
                <button
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    reminderEnabled ? "bg-[#ff6b35]" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      reminderEnabled ? "translate-x-7" : ""
                    }`}
                  />
                </button>
              </div>

              {reminderEnabled && (
                <>
                  {/* Reminder Date */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Reminder Date
                    </label>
                    <DatePicker
                      value={reminderDate}
                      onChange={setReminderDate}
                      placeholder="Select reminder date"
                    />
                  </div>

                  {/* Reminder Time */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Reminder Time
                    </label>
                    <TimePicker
                      value={reminderTime}
                      onChange={setReminderTime}
                      placeholder="Select reminder time"
                    />
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      📧 You'll receive an email reminder at the specified time before your study session.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowReminderModal(false)}
                className="w-full px-4 py-2 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all"
              >
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {showDetailModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                      {selectedPlan.title || "Study Session"}
                    </h3>
                    {selectedPlan.reminder?.enabled && (
                      <div className="flex items-center gap-1 text-[#ff6b35] text-sm">
                        <Bell size={16} />
                        <span>Reminder Set</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {new Date(selectedPlan.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-[var(--color-hover)] rounded-lg"
                >
                  <X size={20} className="text-[var(--color-text-primary)]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Description */}
              {selectedPlan.description && (
                <div className="mb-6 p-4 bg-[var(--color-background)] rounded-lg">
                  <p className="text-[var(--color-text-secondary)]">{selectedPlan.description}</p>
                </div>
              )}

              {/* Time Range */}
              {(selectedPlan.startTime || selectedPlan.endTime) && (
                <div className="mb-6 flex items-center gap-2 text-[var(--color-text-primary)]">
                  <Clock size={18} className="text-[#ff6b35]" />
                  <span>
                    {selectedPlan.startTime && selectedPlan.endTime
                      ? `${selectedPlan.startTime} - ${selectedPlan.endTime}`
                      : selectedPlan.startTime || selectedPlan.endTime}
                  </span>
                </div>
              )}

              {/* Completion Status */}
              <div className="mb-6 p-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={24}
                      className={selectedPlan.isCompleted ? "text-green-500" : "text-gray-500"}
                    />
                    <div>
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {selectedPlan.isCompleted ? "Completed" : "Mark as Complete"}
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        {selectedPlan.totalCompleted}/{selectedPlan.totalPlanned} problems solved
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleCompletion(selectedPlan)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedPlan.isCompleted
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {selectedPlan.isCompleted ? "Undo" : "Complete"}
                  </button>
                </div>
              </div>

              {/* Problems List */}
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Problems ({selectedPlan.items.length})</h4>
                <div className="space-y-3">
                  {selectedPlan.items.map((item) => (
                    <div
                      key={item.problemId._id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-all"
                    >
                      <button
                        onClick={() => handleToggleProblemCompleted(item.problemId._id, !item.completed)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          item.completed ? "bg-green-500 border-green-500" : "border-gray-600 hover:border-[#ff6b35]"
                        }`}
                      >
                        {item.completed && <Check className="text-white" size={16} strokeWidth={3} />}
                      </button>
                      <div className="flex-1">
                        <div className={`text-[var(--color-text-primary)] font-medium ${item.completed ? "line-through opacity-60" : ""}`}>
                          {item.problemId.title}
                        </div>
                        <div className={`text-xs ${getDifficultyColor(item.problemId.difficulty)}`}>
                          {item.problemId.difficulty}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/practice/${item.problemId._id}`)}
                          className="px-3 py-1 text-sm bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all flex items-center gap-1"
                        >
                          <Code2 size={14} />
                          Editor
                        </button>
                        <a
                          href={item.problemId.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-1"
                        >
                          <ExternalLink size={14} />
                          LeetCode
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--color-border)] flex gap-3">
              <button
                onClick={handleDeletePlan}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Plan
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confetti Celebration */}
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
};

export default CalendarPage;
