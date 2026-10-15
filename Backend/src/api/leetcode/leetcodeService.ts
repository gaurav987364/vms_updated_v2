import axios from "axios";
import ProblemModel from "../problems/problemModel";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

interface LeetCodeProblem {
  questionId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  exampleTestcases: string;
  topicTags: Array<{ name: string }>;
  codeSnippets: Array<{ lang: string; langSlug: string; code: string }>;
  sampleTestCase: string;
}

/**
 * Fetch all LeetCode problems list
 */
export const fetchLeetCodeProblemsList = async () => {
  try {
    const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          total: totalNum
          questions: data {
            questionId
            title
            titleSlug
            difficulty
            topicTags {
              name
            }
            acRate
            likes
            dislikes
          }
        }
      }
    `;

    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query,
        variables: {
          categorySlug: "",
          limit: 100, // Fetch 100 problems at a time
          skip: 0,
          filters: {},
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    return response.data.data.problemsetQuestionList;
  } catch (error: any) {
    console.error("Error fetching LeetCode problems list:", error.message);
    throw new Error("Failed to fetch LeetCode problems");
  }
};

/**
 * Fetch single LeetCode problem with full details
 */
export const fetchLeetCodeProblemDetails = async (
  titleSlug: string
): Promise<LeetCodeProblem> => {
  try {
    const query = `
      query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          titleSlug
          content
          difficulty
          exampleTestcases
          topicTags {
            name
          }
          codeSnippets {
            lang
            langSlug
            code
          }
          sampleTestCase
        }
      }
    `;

    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query,
        variables: { titleSlug },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.question;
  } catch (error: any) {
    console.error(`Error fetching LeetCode problem ${titleSlug}:`, error.message);
    throw new Error(`Failed to fetch problem: ${titleSlug}`);
  }
};

/**
 * Map LeetCode difficulty to our difficulty system
 */
const mapDifficulty = (difficulty: string): "Easy" | "Medium" | "Hard" => {
  const normalized = difficulty.toLowerCase();
  if (normalized === "easy") return "Easy";
  if (normalized === "medium") return "Medium";
  return "Hard";
};

/**
 * Parse LeetCode test cases
 * Note: LeetCode API provides limited test case data via exampleTestcases
 * For production, you need to manually extract examples from problem description HTML
 */
const parseTestCases = (exampleTestcases: string, sampleTestCase: string) => {
  const testCases = [];

  // Clean and parse test cases (remove surrounding quotes if present)
  const cleanInput = (input: string) => {
    let cleaned = input.trim();
    // Remove surrounding quotes if they exist
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    return cleaned;
  };

  // Parse example test cases (usually provided as lines)
  if (exampleTestcases) {
    const lines = exampleTestcases.split("\n").filter((line) => line.trim());

    // LeetCode provides only inputs in exampleTestcases, NOT outputs
    // We'll store them as test cases but mark that outputs need manual verification
    for (let i = 0; i < lines.length; i++) {
      testCases.push({
        input: cleanInput(lines[i]),
        expectedOutput: "Manual verification needed", // LeetCode API doesn't provide outputs
        isHidden: false,
      });
    }
  }

  // Add sample test case if available
  if (sampleTestCase && testCases.length === 0) {
    testCases.push({
      input: cleanInput(sampleTestCase),
      expectedOutput: "Manual verification needed",
      isHidden: false,
    });
  }

  // Only return valid test cases (no placeholder "Test case 2" garbage)
  return testCases.filter(tc => tc.input && tc.input !== "");
};

/**
 * Sync LeetCode problems to database
 */
export const syncLeetCodeProblemsService = async (limit: number = 100) => {
  try {
    console.log(`🔄 Starting sync of ${limit} LeetCode problems...`);

    // Fetch problems list
    const problemsList = await fetchLeetCodeProblemsList();
    const problemsToSync = problemsList.questions.slice(0, limit);

    let syncedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const problem of problemsToSync) {
      try {
        // Check if problem already exists
        const exists = await ProblemModel.exists({
          problemId: `LC-${problem.questionId}`,
        });

        if (exists) {
          skippedCount++;
          console.log(`⏭️  Skipped: ${problem.title} (already exists)`);
          continue;
        }

        // Fetch full problem details
        console.log(`📥 Fetching: ${problem.title}...`);
        const details = await fetchLeetCodeProblemDetails(problem.titleSlug);

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

        // Parse test cases
        const testCases = parseTestCases(
          details.exampleTestcases,
          details.sampleTestCase
        );

        // Create problem document
        await ProblemModel.create({
          problemId: `LC-${problem.questionId}`,
          platform: "leetcode",
          title: details.title,
          description: details.content, // Full HTML description
          difficulty: mapDifficulty(details.difficulty),
          tags: details.topicTags.map((tag) => tag.name),
          link: `https://leetcode.com/problems/${details.titleSlug}/`,
          testCases,
          acceptance: parseFloat(problem.acRate) || 0,
          totalSubmissions: 0,
          totalAccepted: problem.likes || 0,
          rating: problem.likes || 0,
        });

        syncedCount++;
        console.log(`✅ Synced: ${problem.title}`);
      } catch (error: any) {
        errors.push(`${problem.title}: ${error.message}`);
        console.error(`❌ Error syncing ${problem.title}:`, error.message);
      }
    }

    console.log(`\n✅ Sync complete!`);
    console.log(`   Synced: ${syncedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Errors: ${errors.length}`);

    return {
      message: "LeetCode problems synced successfully",
      synced: syncedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      total: problemsToSync.length,
    };
  } catch (error: any) {
    console.error("Error syncing LeetCode problems:", error.message);
    throw new Error("Failed to sync LeetCode problems");
  }
};

/**
 * Get LeetCode problem by slug
 */
export const getLeetCodeProblemBySlug = async (titleSlug: string) => {
  try {
    const details = await fetchLeetCodeProblemDetails(titleSlug);
    return details;
  } catch (error: any) {
    console.error("Error getting LeetCode problem:", error.message);
    throw new Error("Failed to get LeetCode problem");
  }
};
