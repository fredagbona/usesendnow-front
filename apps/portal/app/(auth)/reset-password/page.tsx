"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import Alert from "@/components/ui/Alert"
import BrandMark from "@/components/shared/BrandMark"
import AuthTransition from "@/components/shared/AuthTransition"
import { EyeIcon, ViewOffIcon, Tick01Icon, Cancel01Icon } from "hugeicons-react"

const RESET_EMAIL_STORAGE_KEY = "msgflash-reset-email"

interface PasswordRule {
  label: string
  test: (value: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "8 caractères minimum", test: (value) => value.length >= 8 },
  { label: "Une majuscule", test: (value) => /[A-Z]/.test(value) },
  { label: "Une minuscule", test: (value) => /[a-z]/.test(value) },
  { label: "Un chiffre", test: (value) => /[0-9]/.test(value) },
  { label: "Un caractère spécial", test: (value) => /[^A-Za-z0-9]/.test(value) },
]

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length
  const barColor = passed <= 2 ? "bg-error" : passed <= 3 ? "bg-warning" : passed === 4 ? "bg-warning" : "bg-primary"

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, index) => (
          <div key={index} className={["flex-1 h-1 rounded-full transition-all duration-200", index < passed ? barColor : "bg-bg-muted"].join(" ")} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password)
          return (
            <li key={rule.label} className="flex items-center gap-1.5">
              {ok ? <Tick01Icon className="w-3 h-3 text-primary shrink-0" /> : <Cancel01Icon className="w-3 h-3 text-text-muted shrink-0" />}
              <span className={["text-xs transition-colors", ok ? "text-primary font-medium" : "text-text-muted"].join(" ")}>
                {rule.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ResetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordError = useMemo(() => {
    if (!password) return null
    return PASSWORD_RULES.every((rule) => rule.test(password))
      ? null
      : "Le mot de passe ne respecte pas les critères requis."
  }, [password])

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return null
    return password === confirmPassword ? null : "Les mots de passe ne correspondent pas."
  }, [password, confirmPassword])

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setValidating(false)
      return
    }

    const validateToken = async () => {
      setValidating(true)
      try {
        const data = await apiClient.auth.validateResetPasswordToken(token)
        setTokenValid(data.valid)
      } catch {
        setTokenValid(false)
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token || passwordError || confirmPasswordError || !password || !confirmPassword) return

    setError(null)
    setLoading(true)
    try {
      await apiClient.auth.resetPassword(token, password)
      setSuccess(true)
      const savedEmail = typeof window !== "undefined" ? localStorage.getItem(RESET_EMAIL_STORAGE_KEY) : null
      setTimeout(() => {
        const nextUrl = savedEmail ? `/login?email=${encodeURIComponent(savedEmail)}&reset=success` : "/login?reset=success"
        router.push(nextUrl)
      }, 1200)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "VALIDATION_ERROR") {
          setError("Le mot de passe est invalide ou trop court.")
        } else if (err.code === "BAD_REQUEST") {
          setTokenValid(false)
          setError("Ce lien de réinitialisation est invalide ou a expiré.")
        } else if (err.code === "UNAUTHORIZED") {
          setError("Impossible de réinitialiser le mot de passe pour ce compte.")
        } else {
          setError("Impossible de réinitialiser le mot de passe. Réessayez.")
        }
      } else {
        setError("Impossible de réinitialiser le mot de passe. Réessayez.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <>
        <AuthTransition
          title="Validation de votre lien de réinitialisation..."
          description="Nous vérifions que votre lien est encore valide."
        />
        <div className="w-full max-w-sm" />
      </>
    )
  }

  if (!token || !tokenValid) {
    return (
      <motion.div variants={fadeIn} initial={false} animate="visible" className="w-full max-w-sm">
        <div className="md:hidden mb-6 text-center">
          <div className="flex justify-center">
            <BrandMark textClassName="text-xl text-primary-ink" />
          </div>
        </div>
        <div className="rounded-none border border-border bg-bg p-6">
          <h2 className="text-2xl font-bold text-text">Ce lien de réinitialisation est invalide ou a expiré.</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Demandez un nouveau lien pour continuer.
          </p>
          <div className="mt-6">
            <Link href="/forgot-password" className="inline-flex text-sm font-semibold text-primary-ink hover:underline">
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {loading && (
        <AuthTransition
          title="Mise à jour du mot de passe"
          description="Nous appliquons votre nouveau mot de passe en toute sécurité."
        />
      )}

      <motion.div variants={fadeIn} initial={false} animate="visible" className="w-full max-w-sm">
        <div className="md:hidden mb-6 text-center">
          <div className="flex justify-center">
            <BrandMark textClassName="text-xl text-primary-ink" />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text">Définir un nouveau mot de passe</h2>
          <p className="mt-1 text-sm text-text-secondary">Choisissez un nouveau mot de passe pour votre compte.</p>
        </div>

        {success ? (
          <div className="space-y-3 rounded-none border border-border bg-bg p-5">
            <p className="text-sm font-medium text-text">Votre mot de passe a été mis à jour avec succès.</p>
            <p className="text-sm text-text-secondary">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full border border-border rounded-none px-3.5 py-2.5 pr-10 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-border-strong transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                >
                  {showPassword ? <ViewOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {passwordError && <p className="text-xs text-error-hover">{passwordError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full border border-border rounded-none px-3.5 py-2.5 pr-10 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-border-strong transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <ViewOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {confirmPasswordError && <p className="text-xs text-error-hover">{confirmPasswordError}</p>}
            </div>

            {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

            <button
              type="submit"
              disabled={loading || !!passwordError || !!confirmPasswordError}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none bg-primary text-black text-sm font-semibold uppercase tracking-[0.08em] hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#0A0A0A] shadow-[3px_3px_0px_0px_rgba(10,10,10,0.12)]"
            >
              {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        )}
      </motion.div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8 text-center">
            <div className="flex justify-center">
              <BrandMark textClassName="text-xl text-primary-ink" />
            </div>
          </div>
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-40 bg-bg-muted rounded-none" />
            <div className="h-4 w-56 bg-bg-muted rounded-none" />
            <div className="h-12 w-full bg-bg-muted rounded-none" />
            <div className="h-12 w-full bg-bg-muted rounded-none" />
          </div>
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  )
}

