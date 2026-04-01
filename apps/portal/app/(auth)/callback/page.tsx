"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setToken } from "@/lib/auth"

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (token) {
      setToken(token)
      router.replace("/dashboard")
    } else if (error === "oauth_failed") {
      router.replace("/login?error=oauth_failed")
    } else {
      router.replace("/login")
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-bg-subtle flex items-center justify-center">
      <div className="text-center space-y-4">
        <svg
          className="w-8 h-8 animate-spin text-primary mx-auto"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-text-secondary">Connexion à msgflash…</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-subtle flex items-center justify-center">
          <div className="text-center space-y-4">
            <svg className="w-8 h-8 animate-spin text-primary mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-text-secondary">Connexion à msgflash…</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  )
}
