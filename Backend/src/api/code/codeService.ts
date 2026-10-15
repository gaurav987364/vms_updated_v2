import SubmissionModel from "./codeModel";
import ProblemModel from "../problems/problemModel";
import { executeCodeWithJudge0, isJudge0Configured } from "./judge0Service";

/**
 * Clean input/output strings from LeetCode format
 * Handles escaped quotes and other formatting issues
 */
const cleanTestCaseString = (str: string): string => {
  let cleaned = str.trim();

  // Remove surrounding quotes if they exist (handles "\"babad\"" -> "babad")
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }

  // Unescape internal quotes
  cleaned = cleaned.replace(/\\"/g, '"').replace(/\\'/g, "'");

  return cleaned;
};

/**
 * Execute JavaScript code safely with timeout
 */
const executeJavaScript = async (code: string, input: string, timeout: number = 5000): Promise<{ output: string; error?: string; runtime: number }> => {
  const startTime = Date.now();

  try {
    // Simple execution for JavaScript (Free tier)
    // In production, use Judge0 API or similar service

    // Prepare the code with input
    const wrappedCode = `
      const input = ${JSON.stringify(input)};
      ${code}
    `;

    // Execute with timeout
    const result = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Time Limit Exceeded"));
      }, timeout);

      try {
        // Capture console.log output
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => {
            logs.push(args.map(arg => String(arg)).join(" "));
          },
        };

        // Execute code
        const func = new Function("console", wrappedCode);
        func(mockConsole);

        clearTimeout(timer);
        resolve(logs.join("\n") || "");
      } catch (error: any) {
        clearTimeout(timer);
        reject(error);
      }
    });

    const runtime = Date.now() - startTime;
    return { output: result.trim(), runtime };
  } catch (error: any) {
    const runtime = Date.now() - startTime;
    return {
      output: "",
      error: error.message || "Runtime Error",
      runtime
    };
  }
};

/**
 * Execute code for other languages (Mock for free tier)
 */
const executeMockLanguage = async (language: string, code: string, input: string): Promise<{ output: string; error?: string; runtime: number }> => {
  // Mock execution for non-JavaScript languages in free tier
  // In production, integrate with Judge0 or similar service

  return {
    output: "Mock output for " + language,
    error: "Language execution not implemented in free tier. Upgrade to Pro for full language support.",
    runtime: Math.floor(Math.random() * 100) + 50,
  };
};

/**
 * Run code against test cases
 */
export const runCodeService = async (data: {
  problemId: string;
  code: string;
  language: string;
  testCases: Array<{ input: string; expectedOutput: string }>;
}) => {
  const { problemId, code, language, testCases } = data;

  const results = [];

  // Check if Judge0 is configured
  const useJudge0 = isJudge0Configured();

  for (const testCase of testCases) {
    // Clean input and expected output (handles LeetCode escaped quotes)
    const cleanedInput = cleanTestCaseString(testCase.input);
    const cleanedExpected = cleanTestCaseString(testCase.expectedOutput);

    let executionResult;

    if (useJudge0) {
      // Use Judge0 for real execution
      executionResult = await executeCodeWithJudge0(
        code,
        language,
        cleanedInput,
        cleanedExpected
      );
    } else {
      // Fallback to mock execution
      if (language === "javascript") {
        executionResult = await executeJavaScript(code, cleanedInput);
      } else {
        executionResult = await executeMockLanguage(language, code, cleanedInput);
      }
    }

    // Check if expected output is a placeholder (LeetCode API limitation)
    const isPlaceholder =
      cleanedExpected === "Manual verification needed" ||
      cleanedExpected === "See problem description" ||
      cleanedExpected.includes("Test case");

    let passed: boolean;
    if (isPlaceholder) {
      // If no real expected output, mark as passed if code runs without error
      passed = !executionResult.error;
    } else {
      // Real expected output - compare strictly
      passed = !executionResult.error &&
               executionResult.output.trim() === cleanedExpected.trim();
    }

    results.push({
      passed,
      output: executionResult.output,
      expected: isPlaceholder ? `(Output: ${executionResult.output})` : cleanedExpected,
      error: executionResult.error,
      runtime: executionResult.runtime,
    });
  }

  return results;
};

/**
 * Submit code for full evaluation
 */
export const submitCodeService = async (
  userId: string,
  data: {
    problemId: string;
    code: string;
    language: string;
  }
) => {
  const { problemId, code, language } = data;

  // Fetch problem with all test cases
  const problem = await ProblemModel.findById(problemId);
  if (!problem) {
    throw new Error("Problem not found");
  }

  // Use actual test cases from problem (including hidden ones for submit)
  const testCases = problem.testCases.length > 0
    ? problem.testCases
    : [
        { input: "sample input", expectedOutput: "Manual verification needed", isHidden: false }
      ];

  // Run code against all test cases
  let passedTests = 0;
  let totalRuntime = 0;
  let hasError = false;
  let errorMessage = "";

  for (const testCase of testCases) {
    // Clean input and expected output (handles LeetCode escaped quotes)
    const cleanedInput = cleanTestCaseString(testCase.input);
    const cleanedExpected = cleanTestCaseString(testCase.expectedOutput);

    let executionResult;

    if (language === "javascript") {
      executionResult = await executeJavaScript(code, cleanedInput);
    } else {
      executionResult = await executeMockLanguage(language, code, cleanedInput);
    }

    if (executionResult.error) {
      hasError = true;
      errorMessage = executionResult.error;
      break;
    }

    // Check if expected output is a placeholder
    const isPlaceholder =
      cleanedExpected === "Manual verification needed" ||
      cleanedExpected === "See problem description" ||
      cleanedExpected.includes("Test case");

    let passed: boolean;
    if (isPlaceholder) {
      // No real expected output - mark as passed if code runs without error
      passed = !executionResult.error;
    } else {
      // Real expected output - compare strictly
      passed = executionResult.output.trim() === cleanedExpected.trim();
    }

    if (passed) passedTests++;

    totalRuntime += executionResult.runtime || 0;
  }

  const accepted = passedTests === testCases.length && !hasError;
  const status = hasError
    ? "runtime_error"
    : accepted
    ? "accepted"
    : "wrong_answer";

  // Save submission
  const submission = await SubmissionModel.create({
    userId,
    problemId,
    code,
    language,
    status,
    passedTests,
    totalTests: testCases.length,
    runtime: totalRuntime,
    memory: Math.floor(Math.random() * 10000) + 5000, // Mock memory usage
    error: hasError ? errorMessage : undefined,
  });

  return {
    accepted,
    passedTests,
    totalTests: testCases.length,
    runtime: totalRuntime,
    memory: submission.memory || 0,
    error: hasError ? errorMessage : undefined,
  };
};

/**
 * Get user submissions for a problem
 */
export const getUserSubmissionsService = async (userId: string, problemId: string) => {
  const submissions = await SubmissionModel.find({
    userId,
    problemId,
  })
    .sort({ submittedAt: -1 })
    .limit(10)
    .select("-code -__v")
    .lean();

  return submissions;
};

/**
 * Get user's solved problems
 */
export const getUserSolvedProblemsService = async (userId: string) => {
  const solvedSubmissions = await SubmissionModel.find({
    userId,
    status: "accepted",
  })
    .distinct("problemId");

  return solvedSubmissions;
};
