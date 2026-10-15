import axiosInstance from "./axiosInstance";

// Types
export interface Submission {
  code: string;
  language: string;
  submittedAt: string;
  status: "passed" | "failed" | "partial";
  testsPassed: number;
  testsTotal: number;
  executionTime?: number;
  memoryUsed?: number;
  errorMessage?: string;
}

export interface UserProgress {
  _id: string;
  userId: string;
  problemId: string;
  status: "attempted" | "solved";
  submissions: Submission[];
  firstAttemptedAt: string;
  firstSolvedAt?: string;
  lastAttemptedAt: string;
  attempts: number;
  timeSpent: number;
  isFavorite: boolean;
  notes?: string;
  problem?: any;
}

export interface UserStats {
  _id: string;
  userId: string;
  totalSolved: number;
  totalAttempted: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  solvedByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  solvedByPlatform: {
    leetcode: number;
    codeforces: number;
  };
  activityCalendar: Array<{
    date: string;
    problemsSolved: number;
    problemsAttempted: number;
  }>;
}

/**
 * Submit code and track progress
 */
export const submitCodeProgress = async (data: {
  problemId: string;
  code: string;
  language: string;
  status: "passed" | "failed" | "partial";
  testsPassed: number;
  testsTotal: number;
  timeSpent?: number;
  executionTime?: number;
  memoryUsed?: number;
  errorMessage?: string;
}): Promise<UserProgress> => {
  try {
    const response = await axiosInstance.post("/progress/submit", data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error submitting code progress:", error.message);
    throw new Error(error.response?.data?.message || "Failed to submit code progress");
  }
};

/**
 * Get user progress for all problems
 */
export const getUserProgress = async (params?: {
  status?: "attempted" | "solved" | "all";
  difficulty?: "Easy" | "Medium" | "Hard";
  platform?: "leetcode" | "codeforces";
  page?: number;
  limit?: number;
  sortBy?: "recent" | "oldest" | "difficulty" | "attempts";
}): Promise<{
  progress: UserProgress[];
  pagination: any;
}> => {
  try {
    const response = await axiosInstance.get("/progress", { params });
    return {
      progress: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error: any) {
    console.error("Error fetching user progress:", error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch user progress");
  }
};

/**
 * Get user statistics and streak
 */
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await axiosInstance.get("/progress/stats");
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching user stats:", error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch user stats");
  }
};

/**
 * Get progress for a specific problem
 */
export const getProblemProgress = async (problemId: string): Promise<UserProgress | null> => {
  try {
    const response = await axiosInstance.get(`/progress/${problemId}`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching problem progress:", error.message);
    return null;
  }
};

/**
 * Toggle favorite status for a problem
 */
export const toggleFavorite = async (problemId: string): Promise<UserProgress> => {
  try {
    const response = await axiosInstance.post("/progress/favorite", { problemId });
    return response.data.data;
  } catch (error: any) {
    console.error("Error toggling favorite:", error.message);
    throw new Error(error.response?.data?.message || "Failed to toggle favorite");
  }
};

/**
 * Update notes for a problem
 */
export const updateProblemNotes = async (
  problemId: string,
  notes: string
): Promise<UserProgress> => {
  try {
    const response = await axiosInstance.post("/progress/notes", { problemId, notes });
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating notes:", error.message);
    throw new Error(error.response?.data?.message || "Failed to update notes");
  }
};
