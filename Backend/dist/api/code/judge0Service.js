"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableLanguages = exports.executeCodeWithJudge0 = exports.getSubmissionResult = exports.submitToJudge0 = exports.isJudge0Configured = exports.LANGUAGE_IDS = void 0;
const axios_1 = __importDefault(require("axios"));
// Judge0 API Configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
// Language ID mappings for Judge0
exports.LANGUAGE_IDS = {
    javascript: 63, // JavaScript (Node.js 12.14.0)
    python: 71, // Python (3.8.1)
    cpp: 54, // C++ (GCC 9.2.0)
    java: 62, // Java (OpenJDK 13.0.1)
    typescript: 74, // TypeScript (3.7.4)
    go: 60, // Go (1.13.5)
    c: 50, // C (GCC 9.2.0)
    csharp: 51, // C# (Mono 6.6.0.161)
    ruby: 72, // Ruby (2.7.0)
    rust: 73, // Rust (1.40.0)
};
/**
 * Check if Judge0 is configured
 */
const isJudge0Configured = () => {
    return !!(JUDGE0_API_KEY && JUDGE0_API_URL);
};
exports.isJudge0Configured = isJudge0Configured;
/**
 * Submit code to Judge0 for execution
 */
const submitToJudge0 = async (code, languageId, input = "", expectedOutput) => {
    try {
        if (!(0, exports.isJudge0Configured)()) {
            throw new Error("Judge0 API is not configured. Please set JUDGE0_API_KEY in .env");
        }
        const submission = {
            source_code: Buffer.from(code).toString("base64"),
            language_id: languageId,
            stdin: Buffer.from(input).toString("base64"),
        };
        if (expectedOutput) {
            submission.expected_output = Buffer.from(expectedOutput).toString("base64");
        }
        const response = await axios_1.default.post(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, submission, {
            headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": JUDGE0_API_KEY,
                "X-RapidAPI-Host": JUDGE0_API_HOST,
            },
            params: {
                base64_encoded: "true",
                wait: "true", // Wait for execution to complete
            },
        });
        return response.data.token;
    }
    catch (error) {
        console.error("Error submitting to Judge0:", error.response?.data || error.message);
        throw new Error("Failed to submit code for execution");
    }
};
exports.submitToJudge0 = submitToJudge0;
/**
 * Get submission result from Judge0
 */
const getSubmissionResult = async (token) => {
    try {
        const response = await axios_1.default.get(`${JUDGE0_API_URL}/submissions/${token}`, {
            headers: {
                "X-RapidAPI-Key": JUDGE0_API_KEY,
                "X-RapidAPI-Host": JUDGE0_API_HOST,
            },
            params: {
                base64_encoded: "true",
            },
        });
        const result = response.data;
        // Decode base64 outputs
        if (result.stdout) {
            result.stdout = Buffer.from(result.stdout, "base64").toString("utf-8");
        }
        if (result.stderr) {
            result.stderr = Buffer.from(result.stderr, "base64").toString("utf-8");
        }
        if (result.compile_output) {
            result.compile_output = Buffer.from(result.compile_output, "base64").toString("utf-8");
        }
        if (result.message) {
            result.message = Buffer.from(result.message, "base64").toString("utf-8");
        }
        return result;
    }
    catch (error) {
        console.error("Error getting Judge0 result:", error.response?.data || error.message);
        throw new Error("Failed to get execution result");
    }
};
exports.getSubmissionResult = getSubmissionResult;
/**
 * Execute code with Judge0 (submit and wait for result)
 */
const executeCodeWithJudge0 = async (code, language, input = "", expectedOutput) => {
    try {
        const languageId = exports.LANGUAGE_IDS[language];
        if (!languageId) {
            throw new Error(`Unsupported language: ${language}`);
        }
        // Submit code
        const token = await (0, exports.submitToJudge0)(code, languageId, input, expectedOutput);
        // Wait a bit for execution
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Get result
        const result = await (0, exports.getSubmissionResult)(token);
        // Parse result
        const statusId = result.status.id;
        const statusDescription = result.status.description;
        let output = "";
        let error = undefined;
        // Status IDs:
        // 3 = Accepted
        // 4 = Wrong Answer
        // 5 = Time Limit Exceeded
        // 6 = Compilation Error
        // 7-12 = Runtime Errors
        // 13 = Internal Error
        // 14 = Exec Format Error
        if (statusId === 3) {
            // Accepted
            output = result.stdout || "";
        }
        else if (statusId === 6) {
            // Compilation Error
            error = result.compile_output || result.stderr || "Compilation failed";
        }
        else if (statusId >= 7 && statusId <= 12) {
            // Runtime Error
            error = result.stderr || result.message || "Runtime error occurred";
        }
        else if (statusId === 4) {
            // Wrong Answer
            output = result.stdout || "";
            error = "Wrong Answer";
        }
        else if (statusId === 5) {
            // Time Limit Exceeded
            error = "Time Limit Exceeded";
        }
        else {
            // Other errors
            error = result.stderr || result.message || statusDescription;
        }
        return {
            output: output.trim(),
            error,
            runtime: parseFloat(result.time) * 1000 || 0, // Convert to ms
            memory: result.memory || 0,
            status: statusDescription,
        };
    }
    catch (error) {
        console.error("Error executing code with Judge0:", error.message);
        return {
            output: "",
            error: error.message || "Execution failed",
            runtime: 0,
            memory: 0,
            status: "Error",
        };
    }
};
exports.executeCodeWithJudge0 = executeCodeWithJudge0;
/**
 * Get available Judge0 languages
 */
const getAvailableLanguages = async () => {
    try {
        const response = await axios_1.default.get(`${JUDGE0_API_URL}/languages`, {
            headers: {
                "X-RapidAPI-Key": JUDGE0_API_KEY,
                "X-RapidAPI-Host": JUDGE0_API_HOST,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error getting Judge0 languages:", error.message);
        throw new Error("Failed to get available languages");
    }
};
exports.getAvailableLanguages = getAvailableLanguages;
