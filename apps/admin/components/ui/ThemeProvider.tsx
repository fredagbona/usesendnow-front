"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type AdminTheme = "light" | "dark"

interface AdminThemeContextValue {
  theme: AdminTheme
  toggleTheme: () => void
}

const STORAGE_KEY = "msgflash-admin-theme"
const AdminThemeContext = createContext<AdminThemeContextValue | null>(null)

function applyTheme(theme: AdminTheme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>(() => {
    if (typeof window === "undefined") return "light"
    const current = window.localStorage.getItem(STORAGE_KEY)
    return current === "dark" ? "dark" : "light"
  })

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<AdminThemeContextValue>(() => ({
    theme,
    toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
  }), [theme])

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext)
  if (!context) throw new Error("useAdminTheme must be used within AdminThemeProvider")
  return context
}
