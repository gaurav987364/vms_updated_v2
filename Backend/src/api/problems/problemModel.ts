import mongoose, { Document, Schema } from "mongoose";

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface IProblem extends Document {
  problemId: string; // Unique identifier (e.g., "CF-1234A")
  platform: string; // "codeforces", "leetcode", etc.
  title: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[]; // ["Array", "Dynamic Programming", etc.]
  link: string;
  testCases: ITestCase[]; // Test cases for code execution
  testCasesVerified?: boolean; // Whether test cases have been manually verified
  acceptance?: number; // Acceptance rate percentage
  totalSubmissions?: number;
  totalAccepted?: number;
  rating?: number; // Codeforces rating
  contestId?: number;
  index?: string; // Problem index in contest (A, B, C, etc.)
  // DSA Sheet Organization
  topic?: string; // Main topic (e.g., "Arrays", "Trees", "Dynamic Programming")
  subtopic?: string; // Subtopic within topic (e.g., "Two Pointers", "Sliding Window")
  order?: number; // Display order within topic
  // Learning Resources
  youtubeLink?: string; // YouTube tutorial link
  articleLink?: string; // Article/theory reference link
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>(
  {
    problemId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["codeforces", "leetcode", "custom"],
      default: "codeforces",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    link: {
      type: String,
      required: true,
    },
    testCases: {
      type: [{
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      }],
      default: [],
    },
    testCasesVerified: {
      type: Boolean,
      default: false,
    },
    acceptance: {
      type: Number,
      min: 0,
      max: 100,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    totalAccepted: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
    },
    contestId: {
      type: Number,
    },
    index: {
      type: String,
    },
    // DSA Sheet Organization
    topic: {
      type: String,
      trim: true,
    },
    subtopic: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    // Learning Resources
    youtubeLink: {
      type: String,
      trim: true,
    },
    articleLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
problemSchema.index({ tags: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ platform: 1 });
problemSchema.index({ rating: 1 });
problemSchema.index({ topic: 1, order: 1 });
problemSchema.index({ topic: 1, subtopic: 1, order: 1 });

const ProblemModel = mongoose.model<IProblem>("Problem", problemSchema);

export default ProblemModel;
