import { useEffect, useState } from "react";
import { Code2, Target, TrendingUp, BookOpen, Award, Zap } from "lucide-react";

// Rotating features
const features = [
  {
    icon: Target,
    title: "Track Your Progress",
    description: "Monitor your journey through 450+ DSA problems",
    highlight: "450+ Problems",
  },
  {
    icon: TrendingUp,
    title: "Master Algorithms",
    description: "From Arrays to Dynamic Programming",
    highlight: "20+ Topics",
  },
  {
    icon: BookOpen,
    title: "Learn & Practice",
    description: "Curated resources for every problem",
    highlight: "Video Tutorials",
  },
  {
    icon: Award,
    title: "Build Streaks",
    description: "Stay consistent with daily challenges",
    highlight: "Daily Goals",
  },
  {
    icon: Zap,
    title: "Schedule Smart",
    description: "Plan your study sessions with calendar",
    highlight: "Calendar View",
  },
];

// Rotating stats
const stats = [
  { number: "450+", label: "DSA Problems" },
  { number: "20+", label: "Topics Covered" },
  { number: "100%", label: "Free Forever" },
];

// Rotating action words
const actionWords = [
  "Master",
  "Learn",
  "Practice",
  "Conquer",
  "Solve",
  "Achieve",
];

export function AnimatedHero() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentAction, setCurrentAction] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // Rotate features every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for action words
  useEffect(() => {
    const currentWord = actionWords[currentAction];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
          setTypingSpeed(150);
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
          setTypingSpeed(100);
        } else {
          setIsDeleting(false);
          setCurrentAction((prev) => (prev + 1) % actionWords.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentAction, typingSpeed]);

  const CurrentIcon = features[currentFeature].icon;

  return (
    <div className="h-screen flex flex-col justify-center p-6 md:p-8 lg:p-12 xl:p-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#ff6b35]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#f77f00]/10 rounded-full blur-3xl animate-float-delayed" />

      {/* Main content */}
      <div className="relative z-10 space-y-6">
        {/* Logo section */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#ff6b35]/10 to-[#f77f00]/10 rounded-full border border-[#ff6b35]/20">
            <Code2 className="text-[#ff6b35]" size={18} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              DSA Sheet Tracker
            </span>
          </div>

          {/* Animated main heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            <span className="text-gray-900 dark:text-white">
              {displayText}
            </span>
            <span className="inline-block w-1 h-8 md:h-10 lg:h-12 xl:h-14 bg-[#ff6b35] ml-1 animate-pulse" />
            <br />
            <span className="bg-gradient-to-r from-[#ff6b35] to-[#f77f00] bg-clip-text text-transparent">
              Data Structures
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">& Algorithms</span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-xl">
            Your complete companion for mastering DSA. Track progress, schedule
            practice, and ace your coding interviews.
          </p>
        </div>

        {/* Animated feature card */}
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-zinc-800/50 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/10">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#ff6b35] to-[#f77f00] rounded-lg flex items-center justify-center">
              <CurrentIcon className="text-white" size={20} />
            </div>
            <div className="space-y-1 min-h-[60px]">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {features[currentFeature].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {features[currentFeature].description}
              </p>
              <div className="inline-block mt-1 px-2.5 py-0.5 bg-[#ff6b35]/10 rounded-full">
                <span className="text-xs font-medium text-[#ff6b35]">
                  {features[currentFeature].highlight}
                </span>
              </div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-3 justify-center">
            {features.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentFeature
                    ? "w-6 bg-gradient-to-r from-[#ff6b35] to-[#f77f00]"
                    : "w-1 bg-gray-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-3 bg-gradient-to-br from-white/60 to-white/30 dark:from-zinc-900/60 dark:to-zinc-900/30 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-zinc-800/50"
            >
              <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#ff6b35] to-[#f77f00] bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Infinite scrolling badges */}
        <div className="relative overflow-hidden py-3 -mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16">
          <div className="flex animate-scroll-left whitespace-nowrap">
            {[
              "Arrays",
              "Linked Lists",
              "Stacks",
              "Trees",
              "Graphs",
              "DP",
              "Sorting",
              "Searching",
              "Arrays",
              "Linked Lists",
              "Stacks",
              "Trees",
              "Graphs",
              "DP",
            ].map((topic, i) => (
              <span
                key={i}
                className="inline-block mx-1.5 px-3 py-1.5 bg-gradient-to-r from-[#ff6b35]/10 to-[#f77f00]/10 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-[#ff6b35]/20"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
