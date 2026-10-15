import axios from "axios";

// Judge0 API Configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";

// Language ID mappings for Judge0
export const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // JavaScript (Node.js 12.14.0)
  python: 71,     // Python (3.8.1)
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
  typescript: 74, // TypeScript (3.7.4)
  go: 60,         // Go (1.13.5)
  c: 50,          // C (GCC 9.2.0)
  csharp: 51,     // C# (Mono 6.6.0.161)
  ruby: 72,       // Ruby (2.7.0)
  rust: 73,       // Rust (1.40.0)
};

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: string;
  memory_limit?: number;
}

interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
}

/**
 * Check if Judge0 is configured
 */
export const isJudge0Configured = (): boolean => {
  return !!(JUDGE0_API_KEY && JUDGE0_API_URL);
};

/**
 * Submit code to Judge0 for execution
 */
export const submitToJudge0 = async (
  code: string,
  languageId: number,
  input: string = "",
  expectedOutput?: string
): Promise<string> => {
  try {
    if (!isJudge0Configured()) {
      throw new Error("Judge0 API is not configured. Please set JUDGE0_API_KEY in .env");
    }

    const submission: Judge0Submission = {
      source_code: Buffer.from(code).toString("base64"),
      language_id: languageId,
      stdin: Buffer.from(input).toString("base64"),
    };

    if (expectedOutput) {
      submission.expected_output = Buffer.from(expectedOutput).toString("base64");
    }

    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`,
      submission,
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": JUDGE0_API_HOST,
        },
        params: {
          base64_encoded: "true",
          wait: "true", // Wait for execution to complete
        },
      }
    );

    return response.data.token;
  } catch (error: any) {
    console.error("Error submitting to Judge0:", error.response?.data || error.message);
    throw new Error("Failed to submit code for execution");
  }
};

/**
 * Get submission result from Judge0
 */
export const getSubmissionResult = async (token: string): Promise<Judge0Result> => {
  try {
    const response = await axios.get(
      `${JUDGE0_API_URL}/submissions/${token}`,
      {
        headers: {
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": JUDGE0_API_HOST,
        },
        params: {
          base64_encoded: "true",
        },
      }
    );

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
  } catch (error: any) {
    console.error("Error getting Judge0 result:", error.response?.data || error.message);
    throw new Error("Failed to get execution result");
  }
};

/**
 * Execute code with Judge0 (submit and wait for result)
 */
export const executeCodeWithJudge0 = async (
  code: string,
  language: string,
  input: string = "",
  expectedOutput?: string
): Promise<{
  output: string;
  error?: string;
  runtime: number;
  memory: number;
  status: string;
}> => {
  try {
    const languageId = LANGUAGE_IDS[language];

    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Submit code
    const token = await submitToJudge0(code, languageId, input, expectedOutput);

    // Wait a bit for execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get result
    const result = await getSubmissionResult(token);

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
    } else if (statusId === 6) {
      // Compilation Error
      error = result.compile_output || result.stderr || "Compilation failed";
    } else if (statusId >= 7 && statusId <= 12) {
      // Runtime Error
      error = result.stderr || result.message || "Runtime error occurred";
    } else if (statusId === 4) {
      // Wrong Answer
      output = result.stdout || "";
      error = "Wrong Answer";
    } else if (statusId === 5) {
      // Time Limit Exceeded
      error = "Time Limit Exceeded";
    } else {
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
  } catch (error: any) {
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

/**
 * Get available Judge0 languages
 */
export const getAvailableLanguages = async () => {
  try {
    const response = await axios.get(`${JUDGE0_API_URL}/languages`, {
      headers: {
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": JUDGE0_API_HOST,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error getting Judge0 languages:", error.message);
    throw new Error("Failed to get available languages");
  }
};
