"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { portalCopy } from "@/lib/portal-copy"
import {
  detectPortalLocaleFromCookie,
  detectPortalLocaleFromNavigator,
  PORTAL_LOCALE_COOKIE,
  type PortalLocale,
} from "@/lib/portal-locale"

interface PortalLocaleContextValue {
  locale: PortalLocale
  copy: (typeof portalCopy)[PortalLocale]
  setLocale: (locale: PortalLocale) => void
  toggleLocale: () => void
}

const PortalLocaleContext = createContext<PortalLocaleContextValue | null>(null)

function persistLocale(locale: PortalLocale) {
  document.cookie = `${PORTAL_LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`
  window.localStorage.setItem(PORTAL_LOCALE_COOKIE, locale)
  document.documentElement.lang = locale
}

export function PortalLocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale: PortalLocale
}) {
  const [locale, setLocaleState] = useState<PortalLocale>(initialLocale)

  useEffect(() => {
    const stored = window.localStorage.getItem(PORTAL_LOCALE_COOKIE)
    const cookie = detectPortalLocaleFromCookie(stored)
    const browser = detectPortalLocaleFromNavigator(window.navigator.language)
    const nextLocale = cookie ?? browser ?? initialLocale
    setLocaleState(nextLocale)
    persistLocale(nextLocale)
  }, [initialLocale])

  const value = useMemo<PortalLocaleContextValue>(() => ({
    locale,
    copy: portalCopy[locale],
    setLocale: (nextLocale: PortalLocale) => {
      setLocaleState(nextLocale)
      persistLocale(nextLocale)
    },
    toggleLocale: () => {
      const nextLocale = locale === "fr" ? "en" : "fr"
      setLocaleState(nextLocale)
      persistLocale(nextLocale)
    },
  }), [locale])

  return (
    <PortalLocaleContext.Provider value={value}>
      {children}
    </PortalLocaleContext.Provider>
  )
}

export function usePortalLocale() {
  const context = useContext(PortalLocaleContext)
  if (!context) {
    throw new Error("usePortalLocale must be used within PortalLocaleProvider")
  }
  return context
}

