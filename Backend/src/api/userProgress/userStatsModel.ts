import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Activity Calendar Entry
 */
export interface IActivityEntry {
  date: Date;
  problemsSolved: number;
  problemsAttempted: number;
}

/**
 * User Stats interface for tracking overall progress and streaks
 */
export interface IUserStats extends Document {
  userId: Types.ObjectId;
  totalSolved: number;
  totalAttempted: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  solvedByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  solvedByPlatform: {
    leetcode: number;
    codeforces: number;
  };
  activityCalendar: IActivityEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Activity Entry Schema
 */
const ActivityEntrySchema = new Schema<IActivityEntry>(
  {
    date: { type: Date, required: true },
    problemsSolved: { type: Number, default: 0 },
    problemsAttempted: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * User Stats Schema
 */
const UserStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalSolved: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    solvedByDifficulty: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    solvedByPlatform: {
      leetcode: { type: Number, default: 0 },
      codeforces: { type: Number, default: 0 },
    },
    activityCalendar: [ActivityEntrySchema],
  },
  {
    timestamps: true,
  }
);

const UserStatsModel = mongoose.model<IUserStats>("UserStats", UserStatsSchema);

export default UserStatsModel;
