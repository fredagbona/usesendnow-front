"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { entriesToVariableMap, getContextVariables, getCustomVariables, getCustomVariableKey, type CustomVariableEntry } from "@/lib/templateEngine"
import { useCampaigns } from "@/hooks/useCampaigns"
import { useInstances } from "@/hooks/useInstances"
import { useTemplates } from "@/hooks/useTemplates"
import { useContactGroups } from "@/hooks/useContactGroups"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { Campaign, SubscriptionResponse, CreateCampaignPayload } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import CustomVariableBuilder from "@/components/ui/CustomVariableBuilder"
import PlanGateBanner from "@/components/ui/PlanGateBanner"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonTableRow } from "@/components/ui/Skeleton"
import { Megaphone01Icon } from "hugeicons-react"

const STATUS_VARIANT: Record<string, "neutral" | "yellow" | "blue" | "orange" | "success" | "error" | "purple"> = {
  draft:        "neutral",
  scheduled:    "yellow",
  running:      "blue",
  paused:       "orange",
  paused_quota: "orange",
  paused_plan:  "orange",
  completed:    "success",
  failed:       "error",
  cancelled:    "neutral",
}

const STATUS_LABEL: Record<string, string> = {
  draft:        "Brouillon",
  scheduled:    "Planifié",
  running:      "En cours",
  paused:       "En pause",
  paused_quota: "En pause (quota)",
  paused_plan:  "En pause (plan)",
  completed:    "Terminé",
  failed:       "Échoué",
  cancelled:    "Annulée",
}

// Which actions are available per status (list view shows abbreviated actions)
function canPause(status: string) { return ["scheduled", "running"].includes(status) }
function canResume(status: string) { return ["paused", "paused_quota", "paused_plan"].includes(status) }
function canCancel(status: string) { return ["scheduled", "running", "paused", "paused_quota", "paused_plan"].includes(status) }
function canDelete(status: string) { return ["scheduled", "running", "paused", "paused_quota", "paused_plan", "cancelled", "completed", "failed"].includes(status) }

function getCampaignTotal(campaign: Campaign) {
  return campaign.stats.planned
    ?? campaign.stats.queued
    + campaign.stats.sent
    + campaign.stats.failed
    + (campaign.stats.cancelled ?? 0)
}

export default function CampaignsPage() {
  const router = useRouter()
  const { campaigns, loading, prependCampaign, updateCampaignStatus, removeCampaign } = useCampaigns()
  const { instances } = useInstances()
  const { templates } = useTemplates()
  const { groups } = useContactGroups()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [cancelTarget, setCancelTarget] = useState<{ id: string; name: string } | null>(null)
  const [creating, setCreating] = useState(false)
  const [pausing, setPausing] = useState<string | null>(null)
  const [resuming, setResuming] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [customVariables, setCustomVariables] = useState<CustomVariableEntry[]>([])

  const [form, setForm] = useState<{
    name: string
    instanceId: string
    templateId: string
    recipientType: "all" | "tags" | "explicit" | "group"
    tags: string
    explicit: string
    groupId: string
    schedule: string
    repeat: "none" | "daily" | "weekly"
  }>({
    name: "",
    instanceId: "",
    templateId: "",
    recipientType: "all",
    tags: "",
    explicit: "",
    groupId: "",
    schedule: "",
    repeat: "none",
  })

  const selectedTemplate = templates.find((template) => template.id === form.templateId) ?? null
  const contextVariables = selectedTemplate ? getContextVariables(selectedTemplate.variables) : []
  const requiredCustomVariables = selectedTemplate ? getCustomVariables(selectedTemplate.variables) : []

  useEffect(() => {
    apiClient.billing
      .getSubscription()
      .then((sub) => {
        setSubscription(sub)
        if (
          !sub?.subscription?.plan?.features?.campaigns &&
          !sub?.subscription?.plan?.canUseCampaigns
        ) {
          setPlanBlocked(true)
        }
      })
      .catch(() => {})
  }, [])

  const connectedInstances = instances.filter((i) => i.status === "connected")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const payload: CreateCampaignPayload = {
        name: form.name,
        instanceId: form.instanceId,
        templateId: form.templateId || undefined,
        variables: form.templateId ? entriesToVariableMap(customVariables) : undefined,
        schedule: new Date(form.schedule).toISOString(),
        repeat: form.repeat,
        recipients: {
          type: form.recipientType,
          ...(form.recipientType === "tags"
            ? { value: form.tags.split(",").map((t) => t.trim()).filter(Boolean) }
            : {}),
          ...(form.recipientType === "explicit"
            ? { value: form.explicit.split(",").map((t) => t.trim()).filter(Boolean) }
            : {}),
          ...(form.recipientType === "group"
            ? { groupId: form.groupId }
            : {}),
        },
      }
      const campaign = await apiClient.campaigns.create(payload)
      prependCampaign(campaign)
      toast.success("Campagne planifiée")
      setCreateModalOpen(false)
      setCustomVariables([])
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "CAMPAIGNS_NOT_AVAILABLE_ON_PLAN") {
          setPlanBlocked(true)
          setCreateModalOpen(false)
        } else if (err.code === "MONTHLY_OUTBOUND_QUOTA_EXCEEDED") {
          toast.error("Quota mensuel épuisé.")
        } else if (err.code === "NOT_FOUND") {
          toast.error("Instance introuvable.")
        } else {
          toast.error("Impossible de créer la campagne.")
        }
      }
      } finally {
      setCreating(false)
    }
  }

  const handlePause = async (id: string) => {
    setPausing(id)
    try {
      await apiClient.campaigns.pause(id)
      updateCampaignStatus(id, "paused")
      toast.success("Campagne mise en pause")
    } catch {
      toast.error("Impossible de mettre en pause.")
    } finally {
      setPausing(null)
    }
  }

  const handleResume = async (id: string) => {
    setResuming(id)
    try {
      await apiClient.campaigns.resume(id)
      updateCampaignStatus(id, "running")
      toast.success("Campagne reprise")
    } catch {
      toast.error("Impossible de reprendre la campagne.")
    } finally {
      setResuming(null)
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(cancelTarget.id)
    try {
      await apiClient.campaigns.cancel(cancelTarget.id)
      updateCampaignStatus(cancelTarget.id, "cancelled")
      toast.success("Campagne annulée")
      setCancelTarget(null)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "BAD_REQUEST") {
        toast.error("La campagne est déjà terminée ou annulée.")
      } else {
        toast.error("Impossible d'annuler la campagne.")
      }
    } finally {
      setCancelling(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
    try {
      await apiClient.campaigns.delete(deleteTarget.id)
      removeCampaign(deleteTarget.id)
      toast.success("Campagne supprimée")
      setDeleteTarget(null)
    } catch {
      toast.error("Impossible de supprimer la campagne.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title="Campagnes"
        description="Envois en masse WhatsApp"
        action={
          !planBlocked && (
            <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
              Nouvelle campagne
            </Button>
          )
        }
      />

      {planBlocked && (
        <div className="mb-6">
          <PlanGateBanner message="Les campagnes ne sont pas disponibles sur votre plan actuel. Mettez à niveau pour envoyer des messages en masse." />
        </div>
      )}

      {!planBlocked && (
        <Card>
          {loading ? (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Nom", "Statut", "Progression", "Planification", ""].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{[1, 2, 3].map((i) => <SkeletonTableRow key={i} cols={5} />)}</tbody>
                </table>
              </div>
              <div className="sm:hidden space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border animate-pulse">
                    <div className="flex-1 h-4 bg-bg-muted rounded" />
                    <div className="h-5 w-16 bg-bg-muted rounded-full" />
                  </div>
                ))}
              </div>
            </>
          ) : campaigns.length === 0 ? (
            <EmptyState
              icon={<Megaphone01Icon className="w-8 h-8" />}
              title="Aucune campagne pour l'instant"
              description="Créez votre première campagne."
              ctaLabel="Nouvelle campagne"
              onCta={() => setCreateModalOpen(true)}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Nom", "Statut", "Progression", "Planification", ""].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => router.push(`/campaigns/${camp.id}`)}
                              className="text-sm font-medium text-text hover:text-primary-ink hover:underline"
                            >
                              {camp.name}
                            </button>
                            {camp.templateId && <Badge variant="warning">Template</Badge>}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={STATUS_VARIANT[camp.status] ?? "neutral"} pulse={camp.status === "running"}>
                            {STATUS_LABEL[camp.status] ?? camp.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-sm text-text-secondary whitespace-nowrap">
                          {camp.stats.sent} / {getCampaignTotal(camp)}
                        </td>
                        <td className="py-3 pr-4 text-sm text-text-secondary whitespace-nowrap">{formatDate(camp.schedule)}</td>
                        <td className="py-3">
                          <CampaignRowActions
                            campaign={camp}
                            pausing={pausing === camp.id}
                            resuming={resuming === camp.id}
                            cancelling={cancelling === camp.id}
                            deleting={deleting === camp.id}
                            onPause={() => handlePause(camp.id)}
                            onResume={() => handleResume(camp.id)}
                            onCancel={() => setCancelTarget({ id: camp.id, name: camp.name })}
                            onDelete={() => setDeleteTarget({ id: camp.id, name: camp.name })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-border">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="py-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => router.push(`/campaigns/${camp.id}`)}
                          className="text-sm font-semibold text-text hover:text-primary-ink text-left"
                        >
                          {camp.name}
                        </button>
                        {camp.templateId && <Badge variant="warning">Template</Badge>}
                      </div>
                      <Badge variant={STATUS_VARIANT[camp.status] ?? "neutral"} pulse={camp.status === "running"}>
                        {STATUS_LABEL[camp.status] ?? camp.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mb-2">
                      {camp.stats.sent} / {getCampaignTotal(camp)} · {formatDate(camp.schedule)}
                    </p>
                    <CampaignRowActions
                      campaign={camp}
                      pausing={pausing === camp.id}
                      resuming={resuming === camp.id}
                      cancelling={cancelling === camp.id}
                      deleting={deleting === camp.id}
                      onPause={() => handlePause(camp.id)}
                      onResume={() => handleResume(camp.id)}
                      onCancel={() => setCancelTarget({ id: camp.id, name: camp.name })}
                      onDelete={() => setDeleteTarget({ id: camp.id, name: camp.name })}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Create modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Nouvelle campagne" maxWidth="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nom de la campagne"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            autoFocus
          />
          <Select
            label="Instance"
            value={form.instanceId}
            onChange={(e) => setForm((p) => ({ ...p, instanceId: e.target.value }))}
            required
          >
            <option value="">Sélectionner une instance...</option>
            {connectedInstances.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </Select>
          <Select
            label="Modèle (optionnel)"
            value={form.templateId}
            onChange={(e) => {
              const templateId = e.target.value
              setForm((p) => ({ ...p, templateId }))
              const template = templates.find((item) => item.id === templateId)
              setCustomVariables(
                template
                  ? getCustomVariables(template.variables).map((variable) => ({
                      key: getCustomVariableKey(variable),
                      value: "",
                    }))
                  : []
              )
            }}
          >
            <option value="">Sans modèle</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          {selectedTemplate && (
            <div className="space-y-3 rounded-xl border border-border bg-bg-subtle p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-body">Variables du template</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.variables.map((variable) => (
                    <Badge key={variable} variant={variable.startsWith("custom.") ? "warning" : "blue"}>
                      {variable.startsWith("custom.") ? `${variable} · à saisir` : `${variable} · contexte`}
                    </Badge>
                  ))}
                </div>
              </div>

              {contextVariables.length > 0 && (
                <p className="text-xs text-text-muted">
                  Résolues automatiquement: {contextVariables.join(", ")}
                </p>
              )}

              {requiredCustomVariables.length > 0 && (
                <CustomVariableBuilder
                  entries={customVariables}
                  onChange={setCustomVariables}
                  hint="Renseignez les valeurs des variables custom.* qui seront injectées pour chaque rendu."
                />
              )}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-text-body mb-2">Destinataires</p>
            <div className="flex flex-wrap gap-4 mb-2">
              {([
                { value: "all", label: "Tous" },
                { value: "tags", label: "Tags" },
                { value: "group", label: "Groupe" },
                { value: "explicit", label: "Explicite" },
              ] as const).map(({ value, label }) => (
                <label key={value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="recipientType"
                    value={value}
                    checked={form.recipientType === value}
                    onChange={() => setForm((p) => ({ ...p, recipientType: value }))}
                    className="accent-primary"
                  />
                  <span className="text-sm text-text-body">{label}</span>
                </label>
              ))}
            </div>
            {form.recipientType === "tags" && (
              <Input
                placeholder="vip, newsletter"
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                hint="Séparés par des virgules"
              />
            )}
            {form.recipientType === "group" && (
              groups.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  Aucun groupe disponible.{" "}
                  <a href="/contacts/groups" className="text-primary-ink hover:text-text hover:underline">
                    Créer un groupe →
                  </a>
                </p>
              ) : (
                <select
                  value={form.groupId}
                  onChange={(e) => setForm((p) => ({ ...p, groupId: e.target.value }))}
                  required
                  className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Sélectionner un groupe…</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name} ({g.contactCount} contacts)</option>
                  ))}
                </select>
              )
            )}
            {form.recipientType === "explicit" && (
              <Input
                placeholder="id_contact1, id_contact2"
                value={form.explicit}
                onChange={(e) => setForm((p) => ({ ...p, explicit: e.target.value }))}
                hint="IDs de contacts séparés par des virgules"
              />
            )}
          </div>
          <Input
            label="Planification"
            type="datetime-local"
            value={form.schedule}
            onChange={(e) => setForm((p) => ({ ...p, schedule: e.target.value }))}
            required
          />
          <Select
            label="Répétition"
            value={form.repeat}
            onChange={(e) => setForm((p) => ({ ...p, repeat: e.target.value as "none" | "daily" | "weekly" }))}
          >
            <option value="none">Aucune répétition</option>
            <option value="daily">Quotidienne</option>
            <option value="weekly">Hebdomadaire</option>
          </Select>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>Annuler</Button>
            <Button type="submit" variant="primary" loading={creating}>Créer la campagne</Button>
          </div>
        </form>
      </Modal>

      {/* Cancel confirmation */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Annuler la campagne">
        {cancelTarget && (
          <>
            <p className="text-sm text-text-body mb-2">
              Annuler <strong className="text-text">{cancelTarget.name}</strong> ?
            </p>
            <p className="text-sm text-text-secondary mb-6">
              Les messages encore en file seront marqués comme annulés. Les messages déjà partis ou déjà en cours d&apos;envoi ne seront pas rappelés.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCancelTarget(null)}>Retour</Button>
              <Button variant="danger" loading={!!cancelling} onClick={handleCancel}>Annuler la campagne</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Supprimer la campagne">
        {deleteTarget && (
          <>
            <p className="text-sm text-text-body mb-6">
              Supprimer <strong className="text-text">{deleteTarget.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
              <Button variant="danger" loading={!!deleting} onClick={handleDelete}>Supprimer</Button>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  )
}

function CampaignRowActions({
  campaign,
  pausing,
  resuming,
  cancelling,
  deleting,
  onPause,
  onResume,
  onCancel,
  onDelete,
}: {
  campaign: Campaign
  pausing: boolean
  resuming: boolean
  cancelling: boolean
  deleting: boolean
  onPause: () => void
  onResume: () => void
  onCancel: () => void
  onDelete: () => void
}) {
  const s = campaign.status
  return (
    <div className="flex items-center gap-2">
      {canPause(s) && (
        <Button size="sm" variant="secondary" loading={pausing} onClick={onPause}>
          Pause
        </Button>
      )}
      {canResume(s) && (
        <Button size="sm" variant="primary" loading={resuming} onClick={onResume}>
          Reprendre
        </Button>
      )}
      {canCancel(s) && (
        <Button size="sm" variant="danger" loading={cancelling} onClick={onCancel}>
          Annuler
        </Button>
      )}
      {canDelete(s) && (
        <Button size="sm" variant="ghost" loading={deleting} onClick={onDelete}>
          Supprimer
        </Button>
      )}
    </div>
  )
}
