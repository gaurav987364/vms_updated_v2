import axiosInstance from "./axiosInstance";

export interface Problem {
  _id: string;
  problemId: string;
  title: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  link: string;
  platform: string;
  topic?: string;
  subtopic?: string;
  order?: number;
  youtubeLink?: string;
  articleLink?: string;
  testCases?: any[];
  acceptance?: number;
  rating?: number;
}

export interface GetProblemsParams {
  page?: number;
  limit?: number;
  difficulty?: string;
  platform?: string;
  tags?: string;
  sortBy?: string;
}

export interface GetProblemsResponse {
  data: Problem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Get paginated list of problems
 */
export const getProblems = async (params: GetProblemsParams = {}): Promise<GetProblemsResponse> => {
  const response = await axiosInstance.get("/problems", { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};

/**
 * Get a single problem by ID
 */
export const getProblemById = async (id: string): Promise<Problem> => {
  const response = await axiosInstance.get(`/problems/${id}`);
  return response.data.data;
};

/**
 * Search problems
 */
export const searchProblems = async (query: string): Promise<Problem[]> => {
  const response = await axiosInstance.get("/problems/search", {
    params: { q: query },
  });
  return response.data.data;
};
