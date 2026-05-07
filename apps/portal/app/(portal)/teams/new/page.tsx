"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { CreateTeamInviteInput, SubscriptionResponse } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"

function teamErr(code: string, t: { errors: Record<string, string> }): string {
  return t.errors[code] ?? t.errors.UNKNOWN
}

export default function TeamCreatePage() {
  const { copy } = usePortalLocale()
  const t = copy.teams
  const router = useRouter()
  const [name, setName] = useState("")
  const [invites, setInvites] = useState<CreateTeamInviteInput[]>([{ email: "", role: "collaborator" }])
  const [planCode, setPlanCode] = useState<string>("free")
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const sub: SubscriptionResponse = await apiClient.billing.getSubscription()
        const code = sub.subscription?.plan?.code ?? "free"
        if (!cancelled) setPlanCode(code.toLowerCase())
      } catch {
        if (!cancelled) setPlanCode("free")
      } finally {
        if (!cancelled) setLoadingPlan(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const canCreate = planCode === "pro" || planCode === "plus"

  const addRow = () => setInvites((rows) => [...rows, { email: "", role: "collaborator" }])
  const removeRow = (index: number) => setInvites((rows) => rows.filter((_, i) => i !== index))
  const updateRow = (index: number, patch: Partial<CreateTeamInviteInput>) => {
    setInvites((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  const submit = async () => {
    setError(null)
    const cleaned = invites.map((r) => ({ ...r, email: r.email.trim() })).filter((r) => r.email.length > 0)
    if (!name.trim() || cleaned.length === 0) {
      setError(t.minInvites)
      return
    }
    setSubmitting(true)
    try {
      const team = await apiClient.teams.create({ name: name.trim(), invites: cleaned })
      router.replace(`/teams/${team.id}`)
    } catch (err) {
      const code = err instanceof ApiClientError ? err.code : "UNKNOWN"
      setError(teamErr(code, t))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingPlan) {
    return <p className="text-sm text-text-secondary">{copy.common.loading}</p>
  }

  if (!canCreate) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-[#111827] tracking-tight">{t.createTitle}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{t.createDescription}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-[#25D366]/30 bg-[#F0FDF4] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text">{t.upgradeTitle}</p>
            <p className="text-sm text-text-secondary mt-1 max-w-xl">{t.upgradeBody}</p>
          </div>
          <Link href="/billing">
            <Button variant="primary">{t.upgradeCta}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#111827] tracking-tight">{t.createTitle}</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{t.createDescription}</p>
      </div>
      <Card>
        <div className="space-y-4">
          <Input label={t.teamName} value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <p className="text-sm font-medium text-text mb-2">{t.invitesSection}</p>
            <div className="space-y-3">
              {invites.map((row, index) => (
                <div key={index} className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[200px] flex-1">
                    <Input
                      label={t.email}
                      type="email"
                      value={row.email}
                      onChange={(e) => updateRow(index, { email: e.target.value })}
                    />
                  </div>
                  <div className="w-40">
                    <label className="block text-xs font-medium text-text-secondary mb-1">{t.role}</label>
                    <select
                      className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm text-[#111827]"
                      value={row.role}
                      onChange={(e) =>
                        updateRow(index, { role: e.target.value as CreateTeamInviteInput["role"] })
                      }
                    >
                      <option value="admin">{t.roleAdmin}</option>
                      <option value="collaborator">{t.roleCollaborator}</option>
                    </select>
                  </div>
                  {invites.length > 1 ? (
                    <Button variant="ghost" type="button" onClick={() => removeRow(index)}>
                      {t.removeRow}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
            <Button variant="secondary" type="button" className="mt-2" onClick={addRow}>
              {t.addInviteRow}
            </Button>
          </div>
          {error ? <p className="text-sm text-error-hover">{error}</p> : null}
          <div className="flex gap-2 pt-2">
            <Link href="/teams">
              <Button variant="secondary" type="button">
                {copy.common.back}
              </Button>
            </Link>
            <Button variant="primary" type="button" loading={submitting} onClick={() => void submit()}>
              {t.submitCreate}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
