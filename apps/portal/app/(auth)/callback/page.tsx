"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setToken } from "@/lib/auth"
import AuthTransition from "@/components/shared/AuthTransition"

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
    <AuthTransition
      title="Connexion à msgflash"
      description="Nous validons votre identité et ouvrons votre espace en toute sécurité."
    />
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthTransition
          title="Connexion à msgflash"
          description="Nous validons votre identité et ouvrons votre espace en toute sécurité."
        />
      }
    >
      <CallbackHandler />
    </Suspense>
  )
}
