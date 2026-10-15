import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Export Types
export type Topic = {
  name: string;
  count: number;
}

export type Problem = {
  _id: string;
  problemId: string;
  platform: string;
  title: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  link: string;
  acceptance?: number;
  totalSubmissions?: number;
  totalAccepted?: number;
  rating?: number;
  contestId?: number;
  index?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ProblemsResponse = {
  message: string;
  data: Problem[];
  pagination: PaginationInfo;
}

export type TopicsResponse = {
  message: string;
  data: Topic[];
  count: number;
}

export type ProblemStatsResponse = {
  message: string;
  data: {
    total: number;
    byDifficulty: Array<{ _id: string; count: number }>;
    byPlatform: Array<{ _id: string; count: number }>;
  };
}

export type SyncProblemsResponse = {
  message: string;
  data: {
    count: number;
    synced: boolean;
  };
}

// API Functions

/**
 * Fetch all topics/tags with problem counts
 */
export const fetchTopics = async (platform?: string): Promise<Topic[]> => {
  try {
    const params = platform ? { platform } : {};
    const response = await axios.get<TopicsResponse>(`${API_BASE_URL}/problems/topics`, {
      params,
    });
    return response.data.data;
  } catch (error: any) {
    // Error fetching topics
    throw new Error("Failed to fetch topics");
  }
};

/**
 * Fetch problems with filters and pagination
 */
export const fetchProblems = async (filters: {
  page?: number;
  limit?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  tags?: string; // Comma-separated
  search?: string;
  platform?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: "newest" | "rating" | "acceptance";
}): Promise<ProblemsResponse> => {
  try {
    const response = await axios.get<ProblemsResponse>(`${API_BASE_URL}/problems`, {
      params: filters,
    });
    return response.data;
  } catch (error: any) {
    // Error fetching problems
    throw new Error("Failed to fetch problems");
  }
};

/**
 * Fetch problems by specific topic
 */
export const fetchProblemsByTopic = async (
  topic: string,
  page: number = 1,
  limit: number = 10
): Promise<ProblemsResponse> => {
  try {
    const response = await axios.get<ProblemsResponse>(`${API_BASE_URL}/problems`, {
      params: {
        tags: topic,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error: any) {
    // Error fetching problems for topic
    throw new Error(`Failed to fetch problems for topic: ${topic}`);
  }
};

/**
 * Fetch problem statistics
 */
export const fetchProblemStats = async (platform?: string): Promise<ProblemStatsResponse["data"]> => {
  try {
    const params = platform ? { platform } : {};
    const response = await axios.get<ProblemStatsResponse>(`${API_BASE_URL}/problems/stats`, {
      params,
    });
    return response.data.data;
  } catch (error: any) {
    // Error fetching problem stats
    throw new Error("Failed to fetch problem statistics");
  }
};

/**
 * Sync problems from Codeforces API (Admin only)
 */
export const syncProblems = async (force: boolean = false): Promise<SyncProblemsResponse["data"]> => {
  try {
    const response = await axios.post<SyncProblemsResponse>(`${API_BASE_URL}/problems/sync`, {
      force,
    });
    return response.data.data;
  } catch (error: any) {
    // Error syncing problems
    throw new Error("Failed to sync problems from Codeforces");
  }
};
