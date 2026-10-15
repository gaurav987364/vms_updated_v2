import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Submission interface for tracking individual code submissions
 */
export interface ISubmission {
  code: string;
  language: string;
  submittedAt: Date;
  status: "passed" | "failed" | "partial";
  testsPassed: number;
  testsTotal: number;
  executionTime?: number; // in milliseconds
  memoryUsed?: number; // in KB
  errorMessage?: string;
}

/**
 * User Progress interface for tracking problem-solving progress
 */
export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  status: "attempted" | "solved";
  submissions: ISubmission[];
  firstAttemptedAt: Date;
  firstSolvedAt?: Date;
  lastAttemptedAt: Date;
  attempts: number;
  timeSpent: number; // in seconds
  isFavorite: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Submission Schema
 */
const SubmissionSchema = new Schema<ISubmission>(
  {
    code: { type: String, required: true },
    language: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["passed", "failed", "partial"],
      required: true,
    },
    testsPassed: { type: Number, required: true },
    testsTotal: { type: Number, required: true },
    executionTime: { type: Number },
    memoryUsed: { type: Number },
    errorMessage: { type: String },
  },
  { _id: false }
);

/**
 * User Progress Schema
 */
const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["attempted", "solved"],
      default: "attempted",
      required: true,
    },
    submissions: [SubmissionSchema],
    firstAttemptedAt: { type: Date, default: Date.now },
    firstSolvedAt: { type: Date },
    lastAttemptedAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    isFavorite: { type: Boolean, default: false },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
UserProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, status: 1 });
UserProgressSchema.index({ userId: 1, lastAttemptedAt: -1 });

const UserProgressModel = mongoose.model<IUserProgress>(
  "UserProgress",
  UserProgressSchema
);

export default UserProgressModel;
