"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { getToken, setToken } from "@/lib/auth"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { EyeIcon, ViewOffIcon } from "hugeicons-react"
import Alert from "@/components/ui/Alert"
import BrandMark from "@/components/shared/BrandMark"
import AuthTransition from "@/components/shared/AuthTransition"

/* ─── Login form ──────────────────────────────────────────────────────────── */

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (getToken()) router.replace("/dashboard")
    if (searchParams.get("error") === "oauth_failed") {
      toast.error("Connexion Google échouée. Réessayez.")
    }
    const resetEmail = searchParams.get("email")
    if (resetEmail) {
      setEmail(resetEmail)
    } else if (typeof window !== "undefined") {
      const storedResetEmail = localStorage.getItem("msgflash-reset-email")
      if (storedResetEmail) {
        setEmail(storedResetEmail)
      }
    }
    if (searchParams.get("reset") === "success") {
      toast.success("Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.")
    }
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiClient.auth.login(email, password)
      setToken(data.token)
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "UNAUTHORIZED") {
          setError("Email ou mot de passe incorrect.")
        } else if (err.code === "VALIDATION_ERROR") {
          setError("Vérifiez votre email et mot de passe.")
        } else {
          setError("Erreur de connexion. Réessayez.")
        }
      } else {
        setError("Erreur de connexion. Réessayez.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleOAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/auth/google`
  }

  return (
    <>
      {loading && (
        <AuthTransition
          title="Connexion en cours"
          description="Nous sécurisons votre session et préparons votre console msgflash."
        />
      )}
      <motion.div
        variants={fadeIn}
        initial={false}
        animate="visible"
        className="w-full max-w-sm"
      >
        {/* Mobile logo */}
        <div className="md:hidden mb-8 text-center">
          <div className="flex justify-center">
            <BrandMark textClassName="text-xl text-primary-ink" />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text">Bon retour</h2>
          <p className="text-sm text-text-secondary mt-1">Accédez à votre console de pilotage</p>
        </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleOAuth}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-none border border-border-strong bg-bg text-sm font-medium text-text hover:bg-primary-subtle transition-colors shadow-[3px_3px_0px_0px_rgba(10,10,10,0.12)]"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuer avec Google
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted uppercase tracking-widest">ou par email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
            Adresse email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@entreprise.com"
            required
            autoComplete="email"
          className="w-full border border-border rounded-none px-3.5 py-2.5 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-border-strong transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              Mot de passe
            </label>
        <Link href="/forgot-password" className="text-xs text-primary-ink font-medium hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full border border-border rounded-none px-3.5 py-2.5 pr-10 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-border-strong transition-all"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              {showPassword ? <ViewOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none bg-primary text-black text-sm font-semibold uppercase tracking-[0.08em] hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#0A0A0A] shadow-[3px_3px_0px_0px_rgba(10,10,10,0.12)]"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connexion...
            </>
          ) : "Se connecter"}
        </button>
      </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Nouveau sur la plateforme ?{" "}
          <Link href="/signup" className="text-primary-ink font-semibold hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </motion.div>
    </>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function LoginPage() {
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
            <div className="h-12 w-full bg-bg-muted rounded-none" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
