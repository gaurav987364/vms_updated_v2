"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const problemSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// Indexes for efficient querying
problemSchema.index({ tags: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ platform: 1 });
problemSchema.index({ rating: 1 });
problemSchema.index({ topic: 1, order: 1 });
problemSchema.index({ topic: 1, subtopic: 1, order: 1 });
const ProblemModel = mongoose_1.default.model("Problem", problemSchema);
exports.default = ProblemModel;
