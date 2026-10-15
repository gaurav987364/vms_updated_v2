import axiosInstance from "./axiosInstance";

export interface Problem {
  _id: string;
  problemId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  order: number;
  link: string;
  youtubeLink?: string;
  articleLink?: string;
  tags: string[];
  status?: "solved" | "attempted" | null;
}

export interface Subtopic {
  name: string;
  problems: Problem[];
  totalProblems: number;
  solvedProblems: number;
}

export interface Topic {
  name: string;
  subtopics: Subtopic[];
  totalProblems: number;
  solvedProblems: number;
}

/**
 * Get all topics with hierarchy and progress
 */
export const getTopics = async (): Promise<Topic[]> => {
  const response = await axiosInstance.get("/topics");
  return response.data.data;
};

/**
 * Get problems by topic
 */
export const getProblemsByTopic = async (topic: string): Promise<Problem[]> => {
  const response = await axiosInstance.get(`/topics/${encodeURIComponent(topic)}`);
  return response.data.data;
};
