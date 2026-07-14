import { RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { NetworkProvider } from "@/context/NetworkContext"
import { router } from "./routes/Approutes"
import { AlertProvider } from "./context/AlertContext"
import { OfflineIndicator, OfflineOverlay } from "@/components/common/OfflineIndicator"
import { useEffect } from "react"
import { setupOfflineInterceptor } from "./services/api/offlineInterceptor"

// Create QueryClient with production-ready defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed requests twice
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
})

function App() {
  useEffect(() => {
    setupOfflineInterceptor()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NetworkProvider>
          <AlertProvider>
            <AuthProvider>
              <OfflineIndicator />
              <OfflineOverlay />
              <RouterProvider router={router} />
            </AuthProvider>
          </AlertProvider>
        </NetworkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App;