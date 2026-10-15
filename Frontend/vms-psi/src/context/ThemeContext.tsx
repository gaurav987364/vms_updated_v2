/* eslint-disable react-refresh/only-export-components */
// src/store/ThemeContext.tsx

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "dsa-sheet-theme"

/**
 * ThemeProvider
 * ------------------------------------------------------
 * Controls light/dark theme app-wide using Orange/White/Black color scheme.
 * - Light theme: White background with orange accents
 * - Dark theme: Black background with orange accents
 * - Reads saved preference from localStorage on load
 * - Applies it via data-theme attribute on <html>, which
 *   styleConfig.css uses to swap CSS variable values
 * - Persists user's choice so it survives page refresh
 * ------------------------------------------------------
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved as Theme) || "light"
  })

  // Whenever theme changes, reflect it on <html data-theme="..."> and save it
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Always use this hook instead of useContext(ThemeContext) directly
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}