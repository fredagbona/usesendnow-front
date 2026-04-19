"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { apiClient } from "@usesendnow/api-client"
import BrandMark from "@/components/shared/BrandMark"
import AuthTransition from "@/components/shared/AuthTransition"
import Alert from "@/components/ui/Alert"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

const VERIFICATION_EMAIL_STORAGE_KEY = "msgflash-verification-email"

type VerificationState =
  | "loading"
  | "success"
  | "already_verified"
  | "expired"
  | "used"
  | "invalid"
  | "error"

function VerifyEmailContent() {
  const { copy } = usePortalLocale()
  const verifyCopy = copy.auth.verifyEmail
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [state, setState] = useState<VerificationState>("loading")
  const [resending, setResending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [noticeVariant, setNoticeVariant] = useState<"success" | "error">("success")
  const [storedEmail, setStoredEmail] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStoredEmail(localStorage.getItem(VERIFICATION_EMAIL_STORAGE_KEY))
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setState("invalid")
      return
    }

    let cancelled = false

    const runVerification = async () => {
      try {
        const validation = await apiClient.auth.validateVerifyEmailToken(token)

        if (cancelled) return

        if (!validation.valid) {
          setState(validation.status === "valid" ? "invalid" : validation.status)
          return
        }

        const result = await apiClient.auth.verifyEmail(token)
        if (cancelled) return

        setState(result.alreadyVerified ? "already_verified" : "success")
      } catch {
        if (!cancelled) {
          setState("error")
        }
      }
    }

    runVerification()

    return () => {
      cancelled = true
    }
  }, [token])

  const handleResend = async () => {
    if (!storedEmail) return
    setResending(true)
    setNotice(null)
    try {
      await apiClient.auth.resendVerification(storedEmail)
      setNotice(verifyCopy.resendSuccess)
      setNoticeVariant("success")
    } catch {
      setNotice(verifyCopy.resendFailed)
      setNoticeVariant("error")
    } finally {
      setResending(false)
    }
  }

  const view = useMemo(() => {
    switch (state) {
      case "success":
        return {
          title: verifyCopy.states.successTitle,
          description: verifyCopy.states.successDescription,
        }
      case "already_verified":
        return {
          title: verifyCopy.states.alreadyVerifiedTitle,
          description: verifyCopy.states.alreadyVerifiedDescription,
        }
      case "expired":
        return {
          title: verifyCopy.states.expiredTitle,
          description: verifyCopy.states.expiredDescription,
        }
      case "used":
        return {
          title: verifyCopy.states.usedTitle,
          description: verifyCopy.states.usedDescription,
        }
      case "invalid":
        return {
          title: verifyCopy.states.invalidTitle,
          description: verifyCopy.states.invalidDescription,
        }
      default:
        return {
          title: verifyCopy.states.errorTitle,
          description: verifyCopy.states.errorDescription,
        }
    }
  }, [state, verifyCopy.states])

  if (state === "loading") {
    return (
      <>
        <AuthTransition
          title={verifyCopy.loadingTitle}
          description={verifyCopy.loadingDescription}
        />
        <div className="w-full max-w-sm" />
      </>
    )
  }

  const canResend = (state === "expired" || state === "used" || state === "invalid" || state === "error") && !!storedEmail

  return (
    <motion.div variants={fadeIn} initial={false} animate="visible" className="w-full max-w-sm">
      <div className="md:hidden mb-6 text-center">
        <div className="flex justify-center">
          <BrandMark textClassName="text-xl text-primary-ink" />
        </div>
      </div>

      <div className="rounded-none border border-border bg-bg p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-text">{view.title}</h2>
          <p className="mt-2 text-sm text-text-secondary">{view.description}</p>
        </div>

        {notice && (
          <Alert
            variant={noticeVariant}
            message={notice}
            onClose={() => setNotice(null)}
          />
        )}

        <div className="space-y-3">
          {canResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none border border-border-strong bg-bg text-sm font-medium text-text hover:bg-primary-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(10,10,10,0.12)]"
            >
              {resending ? verifyCopy.resending : verifyCopy.resend}
            </button>
          )}

          <Link
            href={storedEmail ? `/login?email=${encodeURIComponent(storedEmail)}` : "/login"}
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-none bg-primary text-black text-sm font-semibold uppercase tracking-wide hover:bg-primary-hover transition-colors border border-[#0A0A0A] shadow-[3px_3px_0px_0px_rgba(10,10,10,0.12)]"
          >
            {verifyCopy.goToLogin}
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function VerifyEmailPage() {
  const { copy } = usePortalLocale()
  const verifyCopy = copy.auth.verifyEmail
  return (
    <Suspense
      fallback={
        <AuthTransition
          title={verifyCopy.loadingTitle}
          description={verifyCopy.loadingDescription}
        />
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
