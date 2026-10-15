import axiosInstance from "./axiosInstance";

export interface StudyPlanItem {
  problemId: {
    _id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    link: string;
    topic?: string;
  };
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface Reminder {
  enabled: boolean;
  reminderDate?: string;
  reminderTime?: string; // Format: "HH:MM"
  sent: boolean;
}

export interface StudyPlan {
  _id: string;
  userId: string;
  date: string;
  items: StudyPlanItem[];
  goal?: string;
  title?: string;
  description?: string;
  startTime?: string; // Format: "HH:MM"
  endTime?: string; // Format: "HH:MM"
  reminder?: Reminder;
  isCompleted: boolean;
  totalPlanned: number;
  totalCompleted: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get study plans for a date range
 */
export const getStudyPlans = async (
  startDate: string,
  endDate: string
): Promise<StudyPlan[]> => {
  const response = await axiosInstance.get("/study-plans", {
    params: { startDate, endDate },
  });
  return response.data.data;
};

/**
 * Get study plan for a specific date
 */
export const getStudyPlanByDate = async (date: string): Promise<StudyPlan | null> => {
  const response = await axiosInstance.get(`/study-plans/${date}`);
  return response.data.data;
};

/**
 * Create or update study plan
 */
export const upsertStudyPlan = async (
  date: string,
  problemIds: string[],
  goal?: string,
  title?: string,
  description?: string,
  startTime?: string,
  endTime?: string,
  reminder?: Partial<Reminder>
): Promise<StudyPlan> => {
  const response = await axiosInstance.post("/study-plans", {
    date,
    problemIds,
    goal,
    title,
    description,
    startTime,
    endTime,
    reminder,
  });
  return response.data.data;
};

/**
 * Add problems to existing study plan
 */
export const addProblemsToStudyPlan = async (
  date: string,
  problemIds: string[]
): Promise<StudyPlan> => {
  const response = await axiosInstance.post("/study-plans/add-problems", {
    date,
    problemIds,
  });
  return response.data.data;
};

/**
 * Mark problem as completed/uncompleted
 */
export const markProblemCompleted = async (
  date: string,
  problemId: string,
  completed: boolean,
  notes?: string
): Promise<StudyPlan> => {
  const response = await axiosInstance.patch("/study-plans/mark-completed", {
    date,
    problemId,
    completed,
    notes,
  });
  return response.data.data;
};

/**
 * Delete study plan
 */
export const deleteStudyPlan = async (date: string): Promise<void> => {
  await axiosInstance.delete(`/study-plans/${date}`);
};

/**
 * Remove problem from study plan
 */
export const removeProblemFromStudyPlan = async (
  date: string,
  problemId: string
): Promise<StudyPlan> => {
  const response = await axiosInstance.delete(`/study-plans/${date}/problems/${problemId}`);
  return response.data.data;
};

/**
 * Toggle study plan completion status
 */
export const toggleCompletionStatus = async (
  date: string,
  isCompleted: boolean
): Promise<StudyPlan> => {
  const response = await axiosInstance.patch(`/study-plans/${date}/toggle-completion`, {
    isCompleted,
  });
  return response.data.data;
};
