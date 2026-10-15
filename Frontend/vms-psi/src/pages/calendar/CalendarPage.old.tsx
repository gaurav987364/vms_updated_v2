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
} from "lucide-react";
import {
  getStudyPlans,
  getStudyPlanByDate,
  addProblemsToStudyPlan,
  markProblemCompleted,
  deleteStudyPlan,
  removeProblemFromStudyPlan,
  type StudyPlan,
} from "@/services/api/studyPlanApi";
import { getProblems, type Problem } from "@/services/api/problemsApi";

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studyPlans, setStudyPlans] = useState<Map<string, StudyPlan>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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
    try {
      const plan = await getStudyPlanByDate(dateKey);
      setSelectedPlan(plan || null);
    } catch (error) {
      console.error("Error loading study plan for date:", error);
      setSelectedPlan(null);
    }
  };

  const handleAddProblems = async (problemIds: string[]) => {
    if (!selectedDate) return;
    try {
      const dateKey = selectedDate.toISOString().split("T")[0];
      const updatedPlan = await addProblemsToStudyPlan(dateKey, problemIds);
      setSelectedPlan(updatedPlan);
      setStudyPlans((prev) => new Map(prev).set(dateKey, updatedPlan));
      setShowAddProblemModal(false);
    } catch (error) {
      console.error("Error adding problems:", error);
    }
  };

  const handleToggleCompleted = async (problemId: string, completed: boolean) => {
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

  const handleRemoveProblem = async (problemId: string) => {
    if (!selectedDate) return;
    try {
      const dateKey = selectedDate.toISOString().split("T")[0];
      const updatedPlan = await removeProblemFromStudyPlan(dateKey, problemId);
      setSelectedPlan(updatedPlan);
      setStudyPlans((prev) => new Map(prev).set(dateKey, updatedPlan));
    } catch (error) {
      console.error("Error removing problem:", error);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedDate) return;
    try {
      const dateKey = selectedDate.toISOString().split("T")[0];
      await deleteStudyPlan(dateKey);
      setSelectedPlan(null);
      setSelectedDate(null);
      setStudyPlans((prev) => {
        const newMap = new Map(prev);
        newMap.delete(dateKey);
        return newMap;
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
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
    if (!plan || plan.totalPlanned === 0) return null;
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
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Plan DSA preparation • Schedule problems • Track progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 hover:bg-[var(--color-hover)] rounded-lg transition-all">
              <ChevronLeft size={24} className="text-[var(--color-text-primary)]" />
            </button>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{monthName} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-[var(--color-hover)] rounded-lg transition-all">
              <ChevronRight size={24} className="text-[var(--color-text-primary)]" />
            </button>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div><span className="text-sm text-[var(--color-text-secondary)]">Completed</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded"></div><span className="text-sm text-[var(--color-text-secondary)]">In Progress</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded"></div><span className="text-sm text-[var(--color-text-secondary)]">Planned</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#ff6b35] rounded"></div><span className="text-sm text-[var(--color-text-secondary)]">Today</span></div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-[var(--color-text-secondary)] py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
              const status = getDayStatus(date);
              const dateKey = date.toISOString().split("T")[0];
              const plan = studyPlans.get(dateKey);
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square p-2 rounded-lg border-2 transition-all hover:scale-105 ${isToday(date) ? "border-[#ff6b35]" : "border-transparent"} ${status === "completed" ? "bg-green-500/20" : ""} ${status === "in-progress" ? "bg-yellow-500/20" : ""} ${status === "planned" ? "bg-blue-500/20" : ""} ${!status ? "hover:bg-[var(--color-hover)]" : ""}`}
                >
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{date.getDate()}</div>
                  {plan && <div className="text-xs text-[var(--color-text-secondary)] mt-1">{plan.totalCompleted}/{plan.totalPlanned}</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </h3>
                <button onClick={() => { setSelectedDate(null); setSelectedPlan(null); }} className="p-2 hover:bg-[var(--color-hover)] rounded-lg">
                  <X size={20} className="text-[var(--color-text-primary)]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedPlan && selectedPlan.items && selectedPlan.items.length > 0 ? (
                <div className="space-y-3">
                  {selectedPlan.items.map((item) => (
                    <div key={item.problemId._id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-hover)]">
                      <button onClick={() => handleToggleCompleted(item.problemId._id, !item.completed)} className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${item.completed ? "bg-green-500 border-green-500" : "border-gray-600 hover:border-[#ff6b35]"}`}>
                        {item.completed && <Check className="text-white" size={16} strokeWidth={3} />}
                      </button>
                      <div className="flex-1">
                        <div className="text-[var(--color-text-primary)] font-medium">{item.problemId.title}</div>
                        <div className={`text-xs ${getDifficultyColor(item.problemId.difficulty)}`}>{item.problemId.difficulty}</div>
                      </div>
                      <button onClick={() => handleRemoveProblem(item.problemId._id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-all">
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8"><p className="text-[var(--color-text-secondary)]">No problems scheduled for this day</p></div>
              )}
            </div>

            <div className="p-6 border-t border-[var(--color-border)] flex gap-3">
              <button onClick={() => { setShowAddProblemModal(true); loadProblems(); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all">
                <Plus size={20} />Add Problems
              </button>
              {selectedPlan && <button onClick={handleDeletePlan} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-all">Delete Plan</button>}
            </div>
          </div>
        </div>
      )}

      {showAddProblemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Add Problems</h3>
                <button onClick={() => setShowAddProblemModal(false)} className="p-2 hover:bg-[var(--color-hover)] rounded-lg"><X size={20} /></button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" size={20} />
                <input type="text" placeholder="Search problems..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {filteredProblems && filteredProblems.length > 0 ? filteredProblems.map((problem) => (
                <button key={problem._id} onClick={() => handleAddProblems([problem._id])} className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-hover)] text-left">
                  <div className="flex-1">
                    <div className="text-[var(--color-text-primary)] font-medium">{problem.title}</div>
                    <div className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</div>
                  </div>
                  <Plus size={20} className="text-[#ff6b35]" />
                </button>
              )) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-secondary)]">No problems found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
