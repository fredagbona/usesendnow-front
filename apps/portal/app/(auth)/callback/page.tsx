"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setToken } from "@/lib/auth"
import AuthTransition from "@/components/shared/AuthTransition"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

function CallbackHandler() {
  const { copy } = usePortalLocale()
  const callbackCopy = copy.auth.callback
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
    <AuthTransition
      title={callbackCopy.title}
      description={callbackCopy.description}
    />
  )
}

export default function AuthCallbackPage() {
  const { copy } = usePortalLocale()
  const callbackCopy = copy.auth.callback
  return (
    <Suspense
      fallback={
        <AuthTransition
          title={callbackCopy.title}
          description={callbackCopy.description}
        />
      }
    >
      <CallbackHandler />
    </Suspense>
  )
}
