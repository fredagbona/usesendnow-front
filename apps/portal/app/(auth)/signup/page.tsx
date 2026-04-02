"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { getToken, setToken } from "@/lib/auth"
import { portalBrand } from "@/lib/brand"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { EyeIcon, ViewOffIcon, Tick01Icon, Cancel01Icon } from "hugeicons-react"
import Alert from "@/components/ui/Alert"
import BrandMark from "@/components/shared/BrandMark"
import AuthTransition from "@/components/shared/AuthTransition"

/* ─── Password rules ──────────────────────────────────────────────────────── */

interface PasswordRule { label: string; test: (v: string) => boolean }

const PASSWORD_RULES: PasswordRule[] = [
  { label: "8 caractères minimum", test: (v) => v.length >= 8 },
  { label: "Une majuscule",         test: (v) => /[A-Z]/.test(v) },
  { label: "Une minuscule",         test: (v) => /[a-z]/.test(v) },
  { label: "Un chiffre",            test: (v) => /[0-9]/.test(v) },
  { label: "Un caractère spécial",  test: (v) => /[^A-Za-z0-9]/.test(v) },
]

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
  const barColor = passed <= 2 ? "bg-error" : passed <= 3 ? "bg-warning" : passed === 4 ? "bg-warning" : "bg-primary"
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <div key={i} className={["flex-1 h-1 rounded-full transition-all duration-200", i < passed ? barColor : "bg-bg-muted"].join(" ")} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password)
          return (
            <li key={rule.label} className="flex items-center gap-1.5">
              {ok
                ? <Tick01Icon className="w-3 h-3 text-primary shrink-0" />
                : <Cancel01Icon className="w-3 h-3 text-text-muted shrink-0" />}
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

/* ─── Signup form ─────────────────────────────────────────────────────────── */

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (getToken()) router.replace("/dashboard")
  }, [router])

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(form.password))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRulesPassed || !termsAccepted) return
    setError(null)
    setLoading(true)
    try {
      const data = await apiClient.auth.signup(form.fullName, form.email, form.phone, form.password)
      setToken(data.token)
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "CONFLICT") setError("Un compte avec cet email existe déjà.")
        else if (err.code === "VALIDATION_ERROR") setError("Vérifiez vos informations et réessayez.")
        else setError("Erreur de connexion. Réessayez.")
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

  const inputClass =
    "w-full border border-border rounded-none px-3.5 py-2.5 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-border-strong transition-all"

  return (
    <>
      {loading && (
        <AuthTransition
          title="Création du compte"
          description="Nous préparons votre espace msgflash et finalisons votre inscription."
        />
      )}
      <motion.div variants={fadeIn} initial={false} animate="visible" className="w-full max-w-sm">
        <div className="md:hidden mb-6 text-center">
          <div className="flex justify-center">
            <BrandMark textClassName="text-xl text-primary-ink" />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text">Créer un compte</h2>
          <p className="text-sm text-text-secondary mt-1">Commencez à expédier vos messages en production.</p>
        </div>

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
        S&apos;inscrire avec Google
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted uppercase tracking-widest">ou par email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Nom complet</label>
          <input type="text" value={form.fullName} onChange={handleChange("fullName")} placeholder="Jean Dupont" required minLength={2} autoComplete="name" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Email professionnel</label>
          <input type="email" value={form.email} onChange={handleChange("email")} placeholder="nom@entreprise.com" required autoComplete="email" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Téléphone</label>
          <input type="tel" value={form.phone} onChange={handleChange("phone")} placeholder="+33612345678" required autoComplete="tel" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Mot de passe</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange("password")} placeholder="••••••••" required autoComplete="new-password" className={inputClass + " pr-10"} />
            <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
              {showPassword ? <ViewOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 rounded-none border-border-strong accent-primary cursor-pointer" />
          <span className="text-xs text-text-secondary leading-snug">
            J&apos;accepte les{" "}
            <Link href={`${portalBrand.siteUrl}/conditions-utilisation`} className="text-primary-ink font-medium hover:underline" target="_blank" rel="noreferrer">Conditions d&apos;utilisation</Link>
            {" "}et la{" "}
            <Link href={`${portalBrand.siteUrl}/politique-confidentialite`} className="text-primary-ink font-medium hover:underline" target="_blank" rel="noreferrer">Politique de confidentialité</Link>
          </span>
        </label>

        {error && (
          <Alert variant="error" message={error} onClose={() => setError(null)}>
            {error.includes("existe déjà") && (
              <Link href="/login" className="underline font-medium mt-0.5 inline-block">Se connecter →</Link>
            )}
          </Alert>
        )}

        <button
          type="submit"
          disabled={loading || (form.password.length > 0 && !allRulesPassed) || !termsAccepted}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none bg-primary text-black text-sm font-semibold uppercase tracking-wide hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-[#0A0A0A] shadow-[3px_3px_0px_0px_rgba(10,10,10,0.12)]"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Création...
            </>
          ) : "Créer mon compte"}
        </button>
      </form>

        <p className="text-center text-sm text-text-secondary mt-5">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary-ink font-semibold hover:underline">Se connecter</Link>
        </p>
      </motion.div>
    </>
  )
}
