import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Export Types
export type TestCase = {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
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
  testCases: TestCase[];
  acceptance?: number;
  totalSubmissions?: number;
  totalAccepted?: number;
  rating?: number;
  contestId?: number;
  index?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExecutionResult = {
  passed: boolean;
  output: string;
  expected: string;
  error?: string;
  runtime?: number;
}

export type SubmissionResult = {
  accepted: boolean;
  passedTests: number;
  totalTests: number;
  runtime: number;
  memory: number;
  error?: string;
}

export type RunCodeRequest = {
  problemId: string;
  code: string;
  language: string;
  testCases: TestCase[];
}

export type SubmitCodeRequest = {
  problemId: string;
  code: string;
  language: string;
}

// API Functions

/**
 * Fetch a single problem by ID
 */
export const fetchProblemById = async (problemId: string): Promise<Problem> => {
  try {
    const response = await axios.get<{ message: string; data: Problem }>(
      `${API_BASE_URL}/problems/${problemId}`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching problem:", error.message);
    throw new Error("Failed to fetch problem details");
  }
};

/**
 * Run code against test cases
 */
export const runCode = async (request: RunCodeRequest): Promise<ExecutionResult[]> => {
  try {
    const response = await axios.post<{ message: string; data: ExecutionResult[] }>(
      `${API_BASE_URL}/code/run`,
      request,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error running code:", error.message);
    throw new Error("Failed to execute code");
  }
};

/**
 * Submit code for full evaluation
 */
export const submitCode = async (request: SubmitCodeRequest): Promise<SubmissionResult> => {
  try {
    const response = await axios.post<{ message: string; data: SubmissionResult }>(
      `${API_BASE_URL}/code/submit`,
      request,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error submitting code:", error.message);
    throw new Error("Failed to submit code");
  }
};

/**
 * Get user submissions for a problem
 */
export const getUserSubmissions = async (problemId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/code/submissions/${problemId}`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching submissions:", error.message);
    throw new Error("Failed to fetch user submissions");
  }
};
