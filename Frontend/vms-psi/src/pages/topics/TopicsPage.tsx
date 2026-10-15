import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTopics, type Topic } from "@/services/api/topicsApi";
import {
  BookOpen, ChevronDown, ChevronRight, Check,
  ExternalLink, Video, FileText, Code, ArrowLeft
} from "lucide-react";

const TopicsPage = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await getTopics();
      setTopics(data);
      // Expand first topic by default
      if (data.length > 0) {
        setExpandedTopics(new Set([data[0].name]));
      }
    } catch (error) {
      console.error("Error loading topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicName: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicName)) {
        newSet.delete(topicName);
      } else {
        newSet.add(topicName);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-500 border-green-500/30";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "Hard": return "bg-red-500/10 text-red-500 border-red-500/30";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-[#ff6b35] animate-pulse mx-auto mb-4" />
          <p className="text-lg text-[var(--color-text-secondary)]">Loading DSA Sheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[var(--color-hover)] rounded-lg transition-all hover:scale-105"
              title="Go Back"
            >
              <ArrowLeft className="text-[var(--color-text-primary)]" size={24} />
            </button>
            <div className="p-3 bg-gradient-to-br from-[#ff6b35] to-[#f77f00] rounded-xl">
              <BookOpen className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                DSA Practice Sheet
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Complete structured learning path • Track your progress • Master DSA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {topics.map((topic, topicIndex) => {
            const isExpanded = expandedTopics.has(topic.name);
            const progress = topic.totalProblems > 0
              ? Math.round((topic.solvedProblems / topic.totalProblems) * 100)
              : 0;

            return (
              <div
                key={topic.name}
                className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl overflow-hidden shadow-lg"
              >
                {/* Topic Header */}
                <div className="bg-gradient-to-r from-[#ff6b35]/5 to-[#f77f00]/5 border-b border-[var(--color-border)]">
                  <button
                    onClick={() => toggleTopic(topic.name)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-[var(--color-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ff6b35] text-white font-bold text-lg">
                        {topicIndex + 1}
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                          {topic.name}
                          <span className="text-sm font-normal text-[var(--color-text-secondary)]">
                            ({topic.solvedProblems}/{topic.totalProblems})
                          </span>
                        </h2>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-2">
                            <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#ff6b35] to-[#f77f00] transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                              {progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <div className="text-lg font-bold text-green-500">
                          {topic.solvedProblems} Solved
                        </div>
                        <div className="text-sm text-[var(--color-text-secondary)]">
                          {topic.totalProblems} Total
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="text-[var(--color-text-secondary)]" size={24} />
                      ) : (
                        <ChevronRight className="text-[var(--color-text-secondary)]" size={24} />
                      )}
                    </div>
                  </button>
                </div>

                {/* Subtopics & Problems */}
                {isExpanded && (
                  <div className="p-6">
                    {topic.subtopics.map((subtopic) => (
                      <div key={subtopic.name} className="mb-8 last:mb-0">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-border)]">
                          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                            {subtopic.name}
                          </h3>
                          <span className="text-sm text-[var(--color-text-secondary)]">
                            {subtopic.solvedProblems}/{subtopic.totalProblems} Completed
                          </span>
                        </div>

                        {/* Problems Table */}
                        <div className="space-y-2">
                          {subtopic.problems.map((problem, index) => (
                            <div
                              key={problem._id}
                              className={`
                                flex items-center gap-4 p-4 rounded-lg border transition-all
                                ${problem.status === "solved"
                                  ? "bg-green-500/5 border-green-500/30 hover:bg-green-500/10"
                                  : problem.status === "attempted"
                                  ? "bg-yellow-500/5 border-yellow-500/30 hover:bg-yellow-500/10"
                                  : "bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-hover)]"
                                }
                              `}
                            >
                              {/* Checkbox */}
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-[var(--color-text-secondary)] w-8">
                                  {index + 1}.
                                </span>
                                <div
                                  className={`
                                    w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all
                                    ${problem.status === "solved"
                                      ? "bg-green-500 border-green-500"
                                      : problem.status === "attempted"
                                      ? "bg-yellow-500/20 border-yellow-500"
                                      : "border-gray-600 hover:border-[#ff6b35]"
                                    }
                                  `}
                                  onClick={() => navigate(`/practice/${problem._id}`)}
                                >
                                  {problem.status === "solved" && (
                                    <Check className="text-white" size={16} strokeWidth={3} />
                                  )}
                                </div>
                              </div>

                              {/* Problem Title */}
                              <button
                                onClick={() => navigate(`/practice/${problem._id}`)}
                                className="flex-1 text-left group"
                              >
                                <span className="text-[var(--color-text-primary)] group-hover:text-[#ff6b35] transition-colors font-medium">
                                  {problem.title}
                                </span>
                              </button>

                              {/* Difficulty */}
                              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>

                              {/* Links */}
                              <div className="flex items-center gap-2">
                                {problem.youtubeLink && (
                                  <a
                                    href={problem.youtubeLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all group"
                                    title="Video Tutorial"
                                  >
                                    <Video className="text-red-500 group-hover:scale-110 transition-transform" size={18} />
                                  </a>
                                )}
                                {problem.articleLink && (
                                  <a
                                    href={problem.articleLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group"
                                    title="Read Article"
                                  >
                                    <FileText className="text-blue-500 group-hover:scale-110 transition-transform" size={18} />
                                  </a>
                                )}
                                <a
                                  href={problem.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 hover:bg-[#ff6b35]/20 rounded-lg transition-all group"
                                  title="Solve on Platform"
                                >
                                  <ExternalLink className="text-[#ff6b35] group-hover:scale-110 transition-transform" size={18} />
                                </a>
                                <button
                                  onClick={() => navigate(`/practice/${problem._id}`)}
                                  className="p-2 hover:bg-green-500/20 rounded-lg transition-all group"
                                  title="Practice Here"
                                >
                                  <Code className="text-green-500 group-hover:scale-110 transition-transform" size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopicsPage;
