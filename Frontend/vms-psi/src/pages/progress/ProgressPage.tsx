// src/pages/progress/ProgressPage.tsx

import { TrendingUp } from "lucide-react"

const ProgressPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            Progress Tracker
          </h1>
          <p className="text-base text-[var(--color-text-secondary)]">
            Analyze your performance and track your improvement
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#ff6b35] to-[#f77f00] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="text-white" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
            Progress Analytics Coming Soon!
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
            Visualize your learning journey with detailed stats, streak tracking, topic-wise progress,
            and performance insights.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProgressPage
