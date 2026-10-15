import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStudyPlanItem {
  problemId: Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface IReminder {
  enabled: boolean;
  reminderDate?: Date;
  reminderTime?: string; // Format: "HH:MM"
  sent: boolean;
}

export interface IStudyPlan extends Document {
  userId: Types.ObjectId;
  date: Date; // Study date (stored as start of day UTC)
  items: IStudyPlanItem[]; // Problems planned for this day
  goal?: string; // Daily goal/note (e.g., "Complete 5 array problems")
  title?: string; // Title for the study session
  description?: string; // Description of what to study
  startTime?: string; // Study start time (Format: "HH:MM")
  endTime?: string; // Study end time (Format: "HH:MM")
  reminder?: IReminder; // Reminder settings
  isCompleted: boolean; // Manual completion status
  totalPlanned: number;
  totalCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    items: [
      {
        problemId: {
          type: Schema.Types.ObjectId,
          ref: "Problem",
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    goal: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      reminderDate: {
        type: Date,
      },
      reminderTime: {
        type: String,
        trim: true,
      },
      sent: {
        type: Boolean,
        default: false,
      },
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    totalPlanned: {
      type: Number,
      default: 0,
    },
    totalCompleted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
studyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

// Update totals before saving
studyPlanSchema.pre("save", function () {
  this.totalPlanned = this.items.length;
  this.totalCompleted = this.items.filter((item) => item.completed).length;

  // Auto-complete if all problems are solved
  if (this.totalPlanned > 0 && this.totalCompleted === this.totalPlanned) {
    this.isCompleted = true;
  }
});

const StudyPlanModel = mongoose.model<IStudyPlan>("StudyPlan", studyPlanSchema);

export default StudyPlanModel;
