"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import BrandMark from "@/components/shared/BrandMark"
import Alert from "@/components/ui/Alert"

const RESET_EMAIL_STORAGE_KEY = "msgflash-reset-email"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFieldError(null)
    setError(null)
    setLoading(true)

    try {
      await apiClient.auth.forgotPassword(email)
      if (typeof window !== "undefined") {
        localStorage.setItem(RESET_EMAIL_STORAGE_KEY, email)
      }
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "VALIDATION_ERROR") {
        setFieldError("Veuillez saisir une adresse email valide.")
      } else {
        setError("Impossible d’envoyer la demande pour le moment. Réessayez.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={fadeIn} initial={false} animate="visible" className="w-full max-w-sm">
      <div className="md:hidden mb-6 text-center">
        <div className="flex justify-center">
          <BrandMark textClassName="text-xl text-primary-ink" />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text">Mot de passe oublié ?</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Saisissez l'adresse e-mail associée à votre compte. Si elle existe, nous vous enverrons un lien de réinitialisation.
        </p>
      </div>

      {success ? (
        <div className="space-y-4 rounded-none border border-border bg-bg p-5">
          <p className="text-sm font-medium text-text">
            Si un compte existe pour cet e-mail, un lien de réinitialisation a été envoyé.
          </p>
          <div className="space-y-1 text-sm text-text-secondary">
            <p>Vérifiez votre boîte de réception et votre dossier spam.</p>
            <p>Le lien de réinitialisation expire dans 60 minutes.</p>
          </div>
          <Link href="/login" className="inline-flex text-sm font-semibold text-primary-ink hover:underline">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nom@entreprise.com"
              required
              autoComplete="email"
              className="w-full border border-border rounded-none px-3.5 py-2.5 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-border-strong transition-all"
            />
            {fieldError && <p className="text-xs text-error-hover">{fieldError}</p>}
          </div>

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none bg-primary text-black text-sm font-semibold uppercase tracking-[0.08em] hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#0A0A0A] shadow-[3px_3px_0px_0px_rgba(10,10,10,0.12)]"
          >
            {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
          </button>

          <p className="text-center text-sm text-text-secondary">
            <Link href="/login" className="font-semibold text-primary-ink hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </form>
      )}
    </motion.div>
  )
}

