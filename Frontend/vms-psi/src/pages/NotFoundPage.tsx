// src/pages/NotFoundPage.tsx

import { Link } from "react-router-dom"

/**
 * NotFoundPage (404)
 * ------------------------------------------------------
 * Displayed when user navigates to a route that doesn't exist.
 * ------------------------------------------------------
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-[var(--color-primary)] opacity-20">
            404
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
          Page Not Found
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg  transition-colors"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border-2 border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface)] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
