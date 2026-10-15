import mongoose, { Document, Schema } from "mongoose";

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: string;
  code: string;
  language: string;
  status: "pending" | "accepted" | "wrong_answer" | "runtime_error" | "time_limit_exceeded";
  passedTests: number;
  totalTests: number;
  runtime?: number;
  memory?: number;
  error?: string;
  submittedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problemId: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript", "python", "cpp", "java", "typescript", "go"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "wrong_answer", "runtime_error", "time_limit_exceeded"],
      default: "pending",
    },
    passedTests: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      required: true,
    },
    runtime: {
      type: Number,
    },
    memory: {
      type: Number,
    },
    error: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
submissionSchema.index({ userId: 1, problemId: 1, status: 1 });
submissionSchema.index({ submittedAt: -1 });

const SubmissionModel = mongoose.model<ISubmission>("Submission", submissionSchema);

export default SubmissionModel;
