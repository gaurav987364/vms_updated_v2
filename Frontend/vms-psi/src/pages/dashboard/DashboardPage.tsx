/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/DashboardPage.tsx

import { useAuth } from "@/context/AuthContext"
import { authApi } from "@/services/api/authApi"
import { dashboardTiles } from "@/shared/tiles/TileConfig"
import { TileGrid } from "@/shared/tiles/TileGrid"
import { useState } from "react"

/**
 * DashboardPage
 * ------------------------------------------------------
 * Main dashboard page (protected route).
 * Displays welcome message and user info.
 * ------------------------------------------------------
 */
const DashboardPage = () => {
  const { user } = useAuth()
  const [testResult, setTestResult] = useState<string>("")

  // Test function to trigger token refresh
  const testTokenRefresh = async () => {
    try {
      setTestResult("⏳ Testing token refresh...")
      console.log("🧪 Testing token refresh by calling protected endpoint...")

      const response = await authApi.getAllSessions()

      setTestResult(`✅ Success! Got ${response.sessions.length} sessions`)
      console.log("✅ Token refresh test passed:", response)
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`)
      console.error("❌ Token refresh test failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Page Header */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1920px] mx-auto">
          {/* Welcome Section */}
          {/* <div className="mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">
              You are logged in as <span className="font-semibold capitalize">{user?.role || "User"}</span>
            </p>
          </div> */}

          {/* Tiles Grid */}
          <TileGrid tiles={dashboardTiles} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
