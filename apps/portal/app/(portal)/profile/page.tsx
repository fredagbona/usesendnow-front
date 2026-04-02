"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { apiClient } from "@usesendnow/api-client"
import type { User } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { Mail01Icon, CreditCardIcon } from "hugeicons-react"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)


  // Form state — mirrors editable fields
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    apiClient.auth.me()
      .then((u) => {
        setUser(u)
        setFullName(u.fullName)
        setPhone(u.phone)
        setDisplayName(u.displayName ?? "")
      })
      .catch(() => toast.error("Impossible de charger le profil."))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Only send changed fields
    const payload: { fullName?: string; phone?: string; displayName?: string | null } = {}
    if (fullName.trim() !== user.fullName) payload.fullName = fullName.trim()
    if (phone.trim() !== user.phone) payload.phone = phone.trim()
    const trimmedDisplay = displayName.trim()
    const currentDisplay = user.displayName ?? ""
    if (trimmedDisplay !== currentDisplay) {
      payload.displayName = trimmedDisplay === "" ? null : trimmedDisplay
    }

    if (Object.keys(payload).length === 0) {
      toast.info("Aucune modification détectée.")
      return
    }

    setSaving(true)
    try {
      const updated = await apiClient.auth.updateMe(payload)
      setUser(updated)
      setFullName(updated.fullName)
      setPhone(updated.phone)
      setDisplayName(updated.displayName ?? "")
      toast.success("Profil mis à jour")
    } catch {
      toast.error("Impossible de mettre à jour le profil.")
    } finally {
      setSaving(false)
    }
  }



  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <div className="lg:col-span-2"><SkeletonCard /></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-text-secondary">Profil introuvable.</p>
      </div>
    )
  }

  const isDirty =
    fullName.trim() !== user.fullName ||
    phone.trim() !== user.phone ||
    (displayName.trim() || null) !== user.displayName

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title="Profil"
        description="Gérez vos informations personnelles"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left — Avatar + identity card */}
        <Card elevated className="flex flex-col items-center text-center gap-4 py-8 px-6">
          <Avatar
            avatarUrl={user.avatarUrl}
            fullName={user.fullName}
            alt={user.displayName ?? user.fullName}
            className="w-24 h-24 rounded-2xl bg-bg-muted ring-4 ring-primary/10 object-cover"
          />
          <div className="min-w-0 w-full">
            <h2 className="text-base font-semibold text-text truncate">
              {user.displayName ?? user.fullName}
            </h2>
            {user.displayName && user.displayName !== user.fullName && (
              <p className="text-sm text-text-secondary truncate mt-0.5">{user.fullName}</p>
            )}
          </div>

          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary-subtle rounded-xl border border-primary/20">
              <CreditCardIcon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-primary-text truncate">Plan {user.plan}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-bg-subtle rounded-xl border border-border">
              <Mail01Icon className="w-4 h-4 text-text-muted shrink-0" />
              <span className="text-xs text-text-secondary truncate">{user.email}</span>
            </div>
          </div>

        </Card>

        {/* Right — Editable form */}
        <Card elevated className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-text mb-5">Modifier le profil</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={1}
              maxLength={100}
            />
            <Input
              label="Nom d'affichage"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Laissez vide pour utiliser le nom complet"
              maxLength={60}
              hint="Affiché dans la barre latérale et les notifications"
            />
            <Input
              label="Téléphone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33612345678"
              required
            />

            {/* Read-only email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-body">Adresse e-mail</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-bg-subtle border border-border rounded-xl">
                <span className="text-sm text-text-muted flex-1">{user.email}</span>
                <span className="text-xs text-text-muted bg-bg border border-border px-2 py-0.5 rounded-md">
                  Non modifiable
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                disabled={!isDirty}
              >
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </motion.div>
  )
}
