// src/pages/ErrorPage.tsx

import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom"

/**
 * ErrorPage
 * ------------------------------------------------------
 * Error boundary fallback page.
 * Catches runtime errors in route components.
 * ------------------------------------------------------
 */
const ErrorPage = () => {
  const error = useRouteError()

  let errorMessage: string
  let errorStatus: number | undefined

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "An error occurred"
    errorStatus = error.status
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = "An unexpected error occurred"
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-12 h-12 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Status */}
        {errorStatus && (
          <h1 className="text-6xl font-bold text-[var(--color-text-primary)] mb-4">
            {errorStatus}
          </h1>
        )}

        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-8">{errorMessage}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg transition-colors cursor-pointer"
          >
            Reload Page
          </button>
          <Link
            to="/"
            className="px-6 py-3 border-2 border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Developer Info */}
        {import.meta.env.DEV && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              Error Details (Dev Mode)
            </summary>
            <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
              {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default ErrorPage
