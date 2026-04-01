"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type PortalTheme = "light" | "dark"

interface ThemeContextValue {
  theme: PortalTheme
  setTheme: (theme: PortalTheme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = "msgflash-portal-theme"

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: PortalTheme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<PortalTheme>(() => {
    if (typeof window === "undefined") return "light"
    const current = document.documentElement.dataset.theme
    return current === "dark" ? "dark" : "light"
  })

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((current) => current === "dark" ? "light" : "dark"),
  }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function usePortalTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("usePortalTheme must be used within ThemeProvider")
  }
  return context
}
