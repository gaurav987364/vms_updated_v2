// src/pages/UnauthorizedPage.tsx

import { Link } from "react-router-dom"
import { ShieldX } from "lucide-react"

/**
 * UnauthorizedPage (403)
 * ------------------------------------------------------
 * Displayed when user tries to access a resource they don't have permission for.
 * ------------------------------------------------------
 */
const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-[var(--color-warning)]/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldX className="w-12 h-12 text-[var(--color-warning)]" />
          </div>
        </div>

        {/* Status */}
        <h1 className="text-6xl font-bold text-[var(--color-text-primary)] mb-4">
          403
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
          Access Denied
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-8">
          You don't have permission to access this page. Contact your administrator if you believe this is a mistake.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/common/dashboard"
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
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

export default UnauthorizedPage
