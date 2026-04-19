"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getLandingMessages, normalizeLandingLocale, type LandingLocale } from "./landing-i18n-data"

const LandingLocaleContext = createContext<{
  locale: LandingLocale
  setLocale: (locale: LandingLocale) => void
  messages: ReturnType<typeof getLandingMessages>
} | null>(null)

export function LandingLocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: LandingLocale
  children: ReactNode
}) {
  const [locale, setLocaleState] = useState<LandingLocale>(initialLocale)
  const router = useRouter()

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("msgflash-landing-locale")
      if (stored === "fr" || stored === "en") {
        setLocaleState(stored)
        return
      }
      const detected = normalizeLandingLocale(window.navigator.language)
      setLocaleState(detected)
    } catch {
      setLocaleState(initialLocale)
    }
  }, [initialLocale])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (nextLocale: LandingLocale) => {
    setLocaleState(nextLocale)
    try {
      window.localStorage.setItem("msgflash-landing-locale", nextLocale)
      document.cookie = `msgflash-landing-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    } catch {}
    router.refresh()
  }

  const messages = useMemo(() => getLandingMessages(locale), [locale])

  return <LandingLocaleContext.Provider value={{ locale, setLocale, messages }}>{children}</LandingLocaleContext.Provider>
}

export function useLandingI18n() {
  const context = useContext(LandingLocaleContext)
  if (!context) throw new Error("useLandingI18n must be used within LandingLocaleProvider")
  return context
}
