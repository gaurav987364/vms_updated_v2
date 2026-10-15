/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/practice/PracticePage.tsx

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import { useTheme } from "@/context/ThemeContext"
import {
  Play,
  Send,
  ChevronLeft,
  Check,
  X,
  Loader2,
  Code2,
  FileText,
  Terminal,
  BookOpen,
  Lock,
  Unlock,
  Settings,
  Maximize2,
  Minimize2,
  ExternalLink,
  Star,
  Circle,
  CheckCircle2,
} from "lucide-react"
import { fetchProblemById, runCode, submitCode } from "./helpers/practiceApi"
import type { Problem, TestCase, ExecutionResult, SubmissionResult } from "./helpers/practiceApi"
import { submitCodeProgress, getProblemProgress } from "@/services/api/progressApi"
import type { UserProgress } from "@/services/api/progressApi"

/**
 * PracticePage - Full coding environment
 * ------------------------------------------------------
 * Features:
 * - Problem description panel (left)
 * - Code editor with Monaco (right)
 * - Multiple language support
 * - Test case execution
 * - Code submission
 * - Results display
 * - Free/Pro tier support
 * ------------------------------------------------------
 */
const PracticePage = () => {
  const { problemId } = useParams<{ problemId: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()

  // Problem data
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editor state
  const [language, setLanguage] = useState<string>("javascript")
  const [code, setCode] = useState<string>("")
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Execution state
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<ExecutionResult[]>([])
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<"testcases" | "output" | "submission">("testcases")
  const [activeTestCase, setActiveTestCase] = useState<number>(0)

  // Progress tracking state
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [timeSpent, setTimeSpent] = useState<number>(0) // in seconds
  const [startTime] = useState<number>(Date.now())

  // Language configuration
  const languageOptions = [
    { value: "javascript", label: "JavaScript", free: true },
    { value: "python", label: "Python", free: true },
    { value: "cpp", label: "C++", free: true },
    { value: "java", label: "Java", free: false },
    { value: "typescript", label: "TypeScript", free: false },
    { value: "go", label: "Go", free: false },
  ]

  // Default code templates
  const codeTemplates: Record<string, string> = {
    javascript: `// Write your solution here
function solve(input) {
  // Your code here

}

// Test your solution (input variable is automatically provided)
console.log(solve(input));`,
    python: `# Write your solution here
def solve(input):
    # Your code here
    pass

# Test your solution (input variable is automatically provided)
print(solve(input))`,
    cpp: `#include <iostream>
using namespace std;

// Write your solution here
int main() {
    // Your code here

    return 0;
}`,
    java: `public class Solution {
    // Write your solution here
    public static void main(String[] args) {
        // Your code here

    }
}`,
    typescript: `// Write your solution here
function solve(): any {
    // Your code here

}

// Test your solution
console.log(solve());`,
    go: `package main

import "fmt"

// Write your solution here
func main() {
    // Your code here

}`,
  }

  // Scroll to top on mount or problem change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [problemId])

  // Load problem data and progress
  useEffect(() => {
    const loadProblem = async () => {
      if (!problemId) {
        setError("Invalid problem ID")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await fetchProblemById(problemId)
        setProblem(data)

        // Set initial code template
        setCode(codeTemplates[language])

        // Load user progress for this problem
        const userProgress = await getProblemProgress(problemId)
        if (userProgress) {
          setProgress(userProgress)
          // Load last submitted code if available
          if (userProgress.submissions.length > 0) {
            const lastSubmission = userProgress.submissions[userProgress.submissions.length - 1]
            setCode(lastSubmission.code)
            setLanguage(lastSubmission.language)
          }
        }
      } catch (err: any) {
        console.error("Error loading problem:", err)
        setError(err.message || "Failed to load problem")
      } finally {
        setLoading(false)
      }
    }

    loadProblem()
  }, [problemId])

  // Track time spent (update every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setTimeSpent(elapsed)
    }, 30000)

    return () => clearInterval(interval)
  }, [startTime])

  // Update code template when language changes
  const handleLanguageChange = (newLanguage: string) => {
    const langOption = languageOptions.find(opt => opt.value === newLanguage)
    if (!langOption?.free) {
      // Show upgrade prompt for pro features
      alert("This language is available in Pro tier. Upgrade to unlock!")
      return
    }

    setLanguage(newLanguage)
    setCode(codeTemplates[newLanguage])
  }

  // Run code against test cases
  const handleRunCode = async () => {
    if (!problem) return

    try {
      setIsRunning(true)
      setActiveTab("output")
      setTestResults([])

      const result = await runCode({
        problemId: problem._id,
        code,
        language,
        testCases: problem.testCases.slice(0, 3), // Free tier: 3 test cases
      })

      setTestResults(result)
    } catch (err: any) {
      console.error("Error running code:", err)
      setError(err.message || "Failed to run code")
    } finally {
      setIsRunning(false)
    }
  }

  // Submit code for evaluation
  const handleSubmit = async () => {
    if (!problem) return

    try {
      setIsSubmitting(true)
      setActiveTab("submission")
      setSubmissionResult(null)

      const result = await submitCode({
        problemId: problem._id,
        code,
        language,
      })

      setSubmissionResult(result)

      // Track progress after submission
      try {
        const currentTimeSpent = Math.floor((Date.now() - startTime) / 1000)
        const status = result.passedTests === result.totalTests ? "passed" : result.passedTests > 0 ? "partial" : "failed"

        console.log("📊 Tracking progress:", {
          problemId: problem._id,
          status,
          testsPassed: result.passedTests,
          testsTotal: result.totalTests,
          willMarkAsSolved: status === "passed" && result.passedTests === result.totalTests
        })

        const updatedProgress = await submitCodeProgress({
          problemId: problem._id,
          code,
          language,
          status,
          testsPassed: result.passedTests,
          testsTotal: result.totalTests,
          timeSpent: currentTimeSpent,
          executionTime: result.runtime,
          memoryUsed: result.memory,
        })

        console.log("✅ Progress updated:", updatedProgress.status)
        setProgress(updatedProgress)

        // Show success message if solved
        if (updatedProgress.status === "solved") {
          console.log("🎉 Problem marked as SOLVED!")
        }
      } catch (progressErr: any) {
        console.error("Error tracking progress:", progressErr)
        // Don't fail the submission if progress tracking fails
      }
    } catch (err: any) {
      console.error("Error submitting code:", err)
      setError(err.message || "Failed to submit code")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-[var(--color-text-secondary)]">Loading problem...</p>
        </div>
      </div>
    )
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full text-center">
          <X className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Problem</h2>
          <p className="text-[var(--color-text-secondary)] mb-4">{error || "Problem not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#f77f00] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex flex-col bg-[var(--color-background)] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[#ff6b35] transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="h-6 w-px bg-[var(--color-border)]" />
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">{problem.title}</h1>
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
              problem.difficulty === "Easy"
                ? "bg-green-500/10 text-green-500"
                : problem.difficulty === "Medium"
                ? "bg-yellow-500/10 text-yellow-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-primary)] cursor-pointer hover:border-[#ff6b35]/50 transition-colors"
          >
            {languageOptions.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label} {!lang.free && "🔒"}
              </option>
            ))}
          </select>

          {/* Settings Button */}
          <button
            className="p-2 text-[var(--color-text-secondary)] hover:text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded-lg transition-all"
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded-lg transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-[var(--color-border)] flex flex-col">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#ff6b35]/10 text-[#ff6b35] rounded-lg text-sm font-medium">
              <FileText size={16} />
              <span>Description</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)] rounded-lg text-sm font-medium transition-colors">
              <BookOpen size={16} />
              <span>Solutions</span>
              <Lock size={12} />
            </button>
          </div>

          {/* Problem Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">{problem.title}</h2>

            {/* View on Platform Button */}
            <a
              href={problem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#f77f00] hover:shadow-lg hover:shadow-[#ff6b35]/30 text-white rounded-lg font-medium mb-6 transition-all"
            >
              <ExternalLink size={18} />
              <span>View on {problem.platform === 'leetcode' ? 'LeetCode' : 'Codeforces'}</span>
            </a>

            {/* Problem Description */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
              {problem.description ? (
                <div
                  className="text-[var(--color-text-secondary)] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}
                />
              ) : (
                <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-[#ff6b35] mb-2">📝 Problem Statement</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                    This is a <strong className="text-[var(--color-text-primary)]">{problem.difficulty}</strong> level problem
                    from {problem.platform === 'leetcode' ? 'LeetCode' : 'Codeforces'}. Click the button above to read the complete problem statement,
                    constraints, and examples.
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    💡 Tip: After reading the problem, come back here to write and test your solution in the code editor.
                  </p>
                </div>
              )}
            </div>

            {/* Problem Info */}
            {problem.rating && (
              <div className="mb-6 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1">Rating</p>
                    <p className="text-lg font-bold text-[#ff6b35]">{problem.rating}</p>
                  </div>
                  {problem.totalAccepted && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1">Solved By</p>
                      <p className="text-lg font-bold text-[var(--color-text-primary)]">{problem.totalAccepted.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1">Contest</p>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">{problem.contestId}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {problem.tags && problem.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-md text-xs font-medium text-[#ff6b35]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Test Cases Preview */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                  Sample Test Cases
                </h3>
                <span className="text-xs text-[var(--color-text-secondary)] italic">
                  View actual test cases on Codeforces
                </span>
              </div>
              {problem.testCases.slice(0, 2).map((testCase, idx) => (
                <div key={idx} className="mb-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-2">
                    Example {idx + 1}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Input:</p>
                      <pre className="p-2 bg-[var(--color-background)] rounded text-xs text-[var(--color-text-primary)] font-mono">
                        {testCase.input}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Output:</p>
                      <pre className="p-2 bg-[var(--color-background)] rounded text-xs text-[var(--color-text-primary)] font-mono">
                        {testCase.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme={theme === "dark" ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Bottom Panel - Test Cases & Output */}
          <div className="h-64 border-t border-[var(--color-border)] flex flex-col">
            {/* Tabs */}
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("testcases")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "testcases"
                      ? "bg-[#ff6b35]/10 text-[#ff6b35]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)]"
                  }`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setActiveTab("output")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "output"
                      ? "bg-[#ff6b35]/10 text-[#ff6b35]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)]"
                  }`}
                >
                  Output
                </button>
                <button
                  onClick={() => setActiveTab("submission")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "submission"
                      ? "bg-[#ff6b35]/10 text-[#ff6b35]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)]"
                  }`}
                >
                  Submission
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || !code.trim()}
                  className="flex items-center gap-2 px-4 py-1.5 bg-[var(--color-background)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#ff6b35]/50 rounded-lg text-sm font-medium text-[var(--color-text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Run</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !code.trim()}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#ff6b35] to-[#f77f00] hover:shadow-lg hover:shadow-[#ff6b35]/30 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Test Cases Tab */}
              {activeTab === "testcases" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    {problem.testCases.slice(0, 3).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCase(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activeTestCase === idx
                            ? "bg-[#ff6b35] text-white"
                            : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#ff6b35]/50"
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>
                  {problem.testCases[activeTestCase] && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Input:</p>
                        <pre className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] font-mono overflow-x-auto">
                          {problem.testCases[activeTestCase].input}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Expected Output:</p>
                        <pre className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] font-mono overflow-x-auto">
                          {problem.testCases[activeTestCase].expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Output Tab */}
              {activeTab === "output" && (
                <div className="space-y-3">
                  {testResults.length === 0 ? (
                    <div className="text-center py-8">
                      <Terminal className="mx-auto mb-3 text-[var(--color-text-secondary)]" size={32} />
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Run your code to see the output
                      </p>
                    </div>
                  ) : (
                    testResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          result.passed
                            ? "bg-green-500/5 border-green-500/30"
                            : "bg-red-500/5 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                            Test Case {idx + 1}
                          </span>
                          {result.passed ? (
                            <div className="flex items-center gap-1 text-green-500">
                              <Check size={16} />
                              <span className="text-xs font-semibold">Passed</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500">
                              <X size={16} />
                              <span className="text-xs font-semibold">Failed</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Output:</p>
                            <pre className="p-2 bg-[var(--color-background)] rounded text-xs font-mono">
                              {result.output}
                            </pre>
                          </div>
                          {!result.passed && (
                            <div>
                              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Expected:</p>
                              <pre className="p-2 bg-[var(--color-background)] rounded text-xs font-mono">
                                {result.expected}
                              </pre>
                            </div>
                          )}
                          {result.error && (
                            <div>
                              <p className="text-xs font-medium text-red-500 mb-1">Error:</p>
                              <pre className="p-2 bg-red-500/10 rounded text-xs font-mono text-red-500">
                                {result.error}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Submission Tab */}
              {activeTab === "submission" && (
                <div>
                  {submissionResult ? (
                    <div className="space-y-4">
                      <div
                        className={`p-6 rounded-xl border-2 ${
                          submissionResult.accepted
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {submissionResult.accepted ? (
                            <>
                              <Check className="text-green-500" size={32} />
                              <div>
                                <h3 className="text-lg font-bold text-green-500">Accepted!</h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                  All test cases passed
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <X className="text-red-500" size={32} />
                              <div>
                                <h3 className="text-lg font-bold text-red-500">Wrong Answer</h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                  {submissionResult.passedTests}/{submissionResult.totalTests} test cases passed
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                              Runtime
                            </p>
                            <p className="text-sm font-bold text-[var(--color-text-primary)]">
                              {submissionResult.runtime} ms
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                              Memory
                            </p>
                            <p className="text-sm font-bold text-[var(--color-text-primary)]">
                              {submissionResult.memory} KB
                            </p>
                          </div>
                        </div>
                      </div>
                      {submissionResult.accepted && (
                        <div className="text-center">
                          <button
                            onClick={() => navigate("/dashboard")}
                            className="px-6 py-2 bg-gradient-to-r from-[#ff6b35] to-[#f77f00] text-white rounded-lg hover:shadow-lg hover:shadow-[#ff6b35]/30 transition-all"
                          >
                            Continue to Dashboard
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Code2 className="mx-auto mb-3 text-[var(--color-text-secondary)]" size={32} />
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Submit your code to see results
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticePage
