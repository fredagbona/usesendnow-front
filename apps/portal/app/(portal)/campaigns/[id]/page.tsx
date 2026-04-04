"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useCampaign } from "@/hooks/useCampaigns"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { Campaign, CampaignDetailStats, CampaignMessage } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Alert from "@/components/ui/Alert"
import { SkeletonCard, SkeletonTableRow } from "@/components/ui/Skeleton"
import { ArrowLeft01Icon, AlertDiamondIcon, CreditCardIcon } from "hugeicons-react"
import { TYPE_LABEL } from "@/lib/messageComposer"

const STATUS_VARIANT: Record<string, "neutral" | "yellow" | "blue" | "orange" | "success" | "error" | "purple"> = {
  draft: "neutral",
  scheduled: "yellow",
  running: "blue",
  paused: "orange",
  paused_quota: "orange",
  paused_plan: "orange",
  completed: "success",
  failed: "error",
  cancelled: "neutral",
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifié",
  running: "En cours",
  paused: "En pause",
  paused_quota: "En pause (quota)",
  paused_plan: "En pause (plan)",
  completed: "Terminée",
  failed: "Échouée",
  cancelled: "Annulée",
}

const REPEAT_LABEL: Record<string, string> = {
  none: "Aucune",
  daily: "Quotidienne",
  weekly: "Hebdomadaire",
}

const RECIPIENT_LABEL: Record<string, string> = {
  all: "Tous les contacts",
  tags: "Par tags",
  explicit: "Sélection explicite",
  group: "Groupe",
}

const MESSAGE_STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "purple" | "error" | "orange"> = {
  queued: "neutral",
  sent: "blue",
  delivered: "success",
  read: "purple",
  failed: "error",
  cancelled: "orange",
}

const MESSAGE_STATUS_LABEL: Record<string, string> = {
  queued: "En file",
  sent: "Envoyé",
  delivered: "Livré",
  read: "Lu",
  failed: "Échoué",
  cancelled: "Annulé",
}

const MESSAGE_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "queued", label: "En file" },
  { value: "sent", label: "Envoyés" },
  { value: "delivered", label: "Livrés" },
  { value: "read", label: "Lus" },
  { value: "failed", label: "Échoués" },
  { value: "cancelled", label: "Annulés" },
] as const

function canPause(status: string) {
  return ["scheduled", "running"].includes(status)
}

function canResume(status: string) {
  return ["paused", "paused_quota", "paused_plan"].includes(status)
}

function canCancel(status: string) {
  return ["scheduled", "running", "paused", "paused_quota", "paused_plan"].includes(status)
}

function getCampaignTotal(campaign: Campaign | null, stats: CampaignDetailStats | null) {
  if (stats?.stats.total != null) return stats.stats.total
  if (!campaign) return 0

  return campaign.stats.planned
    ?? campaign.stats.queued
    + campaign.stats.sent
    + campaign.stats.failed
    + (campaign.stats.cancelled ?? 0)
}

function StatBox({ label, value, colorClass }: { label: string; value: number; colorClass?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-subtle p-4">
      <p className={`text-2xl font-bold tracking-tight text-text ${colorClass ?? ""}`}>{value.toLocaleString("fr-FR")}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-b border-bg-muted py-3 last:border-0">
      <span className="w-36 shrink-0 text-sm text-text-secondary">{label}</span>
      <div className="flex-1 text-sm text-text">{value}</div>
    </div>
  )
}

function TimelineRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null

  return (
    <div className="flex items-start justify-between gap-3 border-b border-bg-muted py-3 last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm text-text">{formatDate(value)}</span>
    </div>
  )
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { campaign, loading: campaignLoading, error, updateStatus } = useCampaign(id)
  const [stats, setStats] = useState<CampaignDetailStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [messages, setMessages] = useState<CampaignMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [moreMessagesLoading, setMoreMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [messageFilter, setMessageFilter] = useState<(typeof MESSAGE_FILTERS)[number]["value"]>("all")
  const [pausing, setPausing] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const statsInFlightRef = useRef(false)
  const messagesInFlightRef = useRef(false)
  const statusRef = useRef<string | null>(null)

  useEffect(() => {
    statusRef.current = campaign?.status ?? null
  }, [campaign?.status])

  const fetchStats = useCallback(async () => {
    if (statsInFlightRef.current) return

    statsInFlightRef.current = true
    try {
      const data = await apiClient.campaigns.getStats(id)
      setStats(data)
      if (data.status && data.status !== statusRef.current) {
        updateStatus(data.status)
      }
    } catch {
      // stats are non-blocking once page is loaded
    } finally {
      statsInFlightRef.current = false
      setStatsLoading(false)
    }
  }, [id, updateStatus])

  const fetchMessages = useCallback(async (cursor?: string | null, append = false) => {
    if (messagesInFlightRef.current) return

    messagesInFlightRef.current = true
    const setter = append ? setMoreMessagesLoading : setMessagesLoading
    setter(true)
    if (!append) {
      setMessagesError(null)
    }

    try {
      const data = await apiClient.campaigns.getMessages(id, {
        limit: 20,
        cursor: cursor || undefined,
        status: messageFilter === "all" ? undefined : messageFilter,
      })

      setMessages((prev) => append ? [...prev, ...data.messages] : data.messages)
      setMessagesCursor(data.nextCursor)
      setHasMoreMessages(data.hasMore)
    } catch {
      setMessagesError("Impossible de charger les messages de campagne.")
      if (!append) {
        setMessages([])
        setMessagesCursor(null)
        setHasMoreMessages(false)
      }
    } finally {
      messagesInFlightRef.current = false
      setter(false)
    }
  }, [id, messageFilter])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (campaign?.status !== "running") return

    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [campaign?.status, fetchStats])

  const handlePause = async () => {
    setPausing(true)
    try {
      await apiClient.campaigns.pause(id)
      updateStatus("paused")
      toast.success("Campagne mise en pause")
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "BAD_REQUEST") {
        toast.error("Cette campagne ne peut plus être mise en pause.")
      } else {
        toast.error("Impossible de mettre en pause.")
      }
    } finally {
      setPausing(false)
    }
  }

  const handleResume = async () => {
    setResuming(true)
    try {
      await apiClient.campaigns.resume(id)
      updateStatus("running")
      toast.success("Campagne reprise")
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "BAD_REQUEST") {
        toast.error("Cette campagne ne peut plus être reprise.")
      } else {
        toast.error("Impossible de reprendre la campagne.")
      }
    } finally {
      setResuming(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const updated = await apiClient.campaigns.cancel(id)
      updateStatus(updated.status)
      setStats((prev) => prev ? { ...prev, status: updated.status } : prev)
      toast.success("Campagne annulée")
      setCancelModalOpen(false)
      fetchMessages()
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "BAD_REQUEST") {
        toast.error("Cette campagne est déjà terminée.")
      } else {
        toast.error("Impossible d'annuler la campagne.")
      }
    } finally {
      setCancelling(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiClient.campaigns.delete(id)
      toast.success("Campagne supprimée")
      router.push("/campaigns")
    } catch {
      toast.error("Impossible de supprimer la campagne.")
      setDeleting(false)
    }
  }

  const total = getCampaignTotal(campaign, stats)
  const progressPercent = stats?.progressPercent ?? 0
  const status = campaign?.status ?? stats?.status ?? "draft"
  const canShowPause = canPause(status)
  const canShowResume = canResume(status)
  const canShowCancel = canCancel(status)

  const timeline = stats?.timeline
  const recipientValue = useMemo(() => {
    if (!campaign) return "—"
    if (campaign.recipients.type === "tags") return campaign.recipients.value?.join(", ") || "—"
    if (campaign.recipients.type === "explicit") return `${campaign.recipients.value?.length ?? 0} contacts`
    if (campaign.recipients.type === "group") return campaign.recipients.groupId ?? "—"
    return RECIPIENT_LABEL[campaign.recipients.type] ?? campaign.recipients.type
  }, [campaign])
  const contentModeLabel = campaign?.templateId ? "Template" : "Message direct"

  if (campaignLoading || statsLoading) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </motion.div>
    )
  }

  if (error || !campaign) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
        <Alert variant="error" message="Campagne introuvable." />
        <Button variant="secondary" onClick={() => router.push("/campaigns")}>
          Retour aux campagnes
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title={campaign.name}
        description="Suivi détaillé de l’exécution de la campagne"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[status] ?? "neutral"} pulse={status === "running"}>
              {STATUS_LABEL[status] ?? status}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => router.push("/campaigns")}>
              <ArrowLeft01Icon className="mr-1 h-4 w-4" />
              Retour
            </Button>
          </div>
        }
      />

      {status === "paused_quota" && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning-subtle p-4">
          <AlertDiamondIcon className="h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-text">Campagne suspendue à cause du quota mensuel</p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Reprenez la campagne après rechargement du quota ou après mise à niveau de votre plan.
            </p>
          </div>
        </div>
      )}

      {status === "paused_plan" && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning-subtle p-4">
          <CreditCardIcon className="h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-text">Campagne suspendue car la fonctionnalité n’est plus disponible sur ce plan</p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Mettez à niveau le plan pour reprendre la campagne.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => router.push("/billing")} className="ml-auto shrink-0">
            Mettre à niveau
          </Button>
        </div>
      )}

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">Vue d’ensemble</h2>
            <p className="mt-1 text-xs text-text-muted">
              {total === 0 ? "La campagne n’a pas encore démarré." : `${progressPercent}% terminé`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-text">{progressPercent}%</p>
            <p className="text-xs text-text-muted">{Math.min(progressPercent, 100)}% de progression</p>
          </div>
        </div>

        <div className="mb-5 h-2 w-full rounded-full bg-bg-muted">
          <div
            className={[
              "h-2 rounded-full transition-all",
              status === "completed" || progressPercent >= 100 ? "bg-success" : "bg-primary-ink",
            ].join(" ")}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <StatBox label="Planifiés" value={stats?.stats.planned ?? total} />
          <StatBox label="En file" value={stats?.stats.queued ?? campaign.stats.queued} colorClass="text-text-muted" />
          <StatBox label="Envoyés" value={stats?.stats.sent ?? campaign.stats.sent} colorClass="text-info" />
          <StatBox label="Livrés" value={stats?.stats.delivered ?? campaign.stats.delivered} colorClass="text-success" />
          <StatBox label="Lus" value={stats?.stats.read ?? campaign.stats.read ?? 0} colorClass="text-purple" />
          <StatBox label="Échoués" value={stats?.stats.failed ?? campaign.stats.failed} colorClass="text-error" />
          <StatBox label="Annulés" value={stats?.stats.cancelled ?? campaign.stats.cancelled ?? 0} colorClass="text-warning-text" />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-text">Métadonnées</h2>
          <MetaRow label="Instance" value={<span className="font-mono text-xs">{campaign.instanceId}</span>} />
          <MetaRow label="Mode de contenu" value={contentModeLabel} />
          {campaign.templateId && (
            <MetaRow
              label="Modèle"
              value={
                <button
                  onClick={() => router.push(`/templates/${campaign.templateId}`)}
                  className="text-sm text-primary-ink hover:text-text hover:underline"
                >
                  {campaign.templateId}
                </button>
              }
            />
          )}
          {!campaign.templateId && (
            <>
              <MetaRow label="Type" value={TYPE_LABEL[campaign.type ?? "text"] ?? campaign.type ?? "—"} />
              {campaign.body && <MetaRow label="Message" value={<span className="whitespace-pre-wrap">{campaign.body}</span>} />}
              {campaign.mediaUrl && (
                <MetaRow
                  label="Média"
                  value={
                    <a href={campaign.mediaUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-ink hover:text-text hover:underline break-all">
                      {campaign.mediaUrl}
                    </a>
                  }
                />
              )}
            </>
          )}
          <MetaRow label="Planification" value={formatDate(campaign.schedule)} />
          <MetaRow label="Répétition" value={REPEAT_LABEL[campaign.repeat] ?? campaign.repeat} />
          <MetaRow label="Destinataires" value={recipientValue} />
          <MetaRow label="Créée le" value={formatDate(campaign.createdAt)} />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-text">Chronologie</h2>
          <TimelineRow label="Prévue pour" value={timeline?.scheduledFor ?? campaign.schedule} />
          <TimelineRow label="Traitement démarré" value={timeline?.processingStartedAt ?? campaign.stats.processingStartedAt} />
          <TimelineRow label="Dernière mise en file" value={timeline?.lastEnqueuedAt ?? campaign.stats.lastEnqueuedAt} />
          <TimelineRow label="Dernière activité" value={timeline?.lastActivityAt ?? stats?.startedAt} />
          <TimelineRow label="Terminée le" value={timeline?.completedAt ?? campaign.stats.completedAt} />
          <TimelineRow label="Annulée le" value={timeline?.cancelledAt ?? campaign.stats.cancelledAt} />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text">Messages de campagne</h2>
            <p className="mt-1 text-xs text-text-muted">Suivi des destinataires, statuts réels et éventuelles erreurs.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {MESSAGE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setMessageFilter(filter.value)}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  messageFilter === filter.value
                    ? "border-primary bg-primary-subtle text-primary-ink"
                    : "border-border bg-bg text-text-secondary hover:text-text",
                ].join(" ")}
              >
                {filter.label}
              </button>
            ))}
            <Button variant="secondary" size="sm" onClick={() => fetchMessages()}>
              Rafraîchir
            </Button>
          </div>
        </div>

        {messagesError && <Alert variant="error" message={messagesError} onClose={() => setMessagesError(null)} />}

        {messagesLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Contact", "Téléphone", "Statut", "Erreur", "Créé", "Mis à jour", "Aperçu"].map((header) => (
                    <th key={header} className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((index) => <SkeletonTableRow key={index} cols={7} />)}
              </tbody>
            </table>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-text-secondary">Aucun message pour ce filtre.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Contact", "Téléphone", "Statut", "Erreur", "Créé", "Mis à jour", "Aperçu"].map((header) => (
                      <th key={header} className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 text-sm text-text">{message.contactName || "Contact inconnu"}</td>
                      <td className="py-3 pr-4 font-mono text-sm text-text-secondary">{message.to}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={MESSAGE_STATUS_VARIANT[message.status] ?? "neutral"}>
                          {MESSAGE_STATUS_LABEL[message.status] ?? message.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-secondary">{message.error || "—"}</td>
                      <td className="py-3 pr-4 text-sm text-text-secondary whitespace-nowrap">{formatDate(message.createdAt)}</td>
                      <td className="py-3 pr-4 text-sm text-text-secondary whitespace-nowrap">{formatDate(message.updatedAt)}</td>
                      <td className="py-3 text-sm text-text-secondary">
                        <span className="line-clamp-2">{message.body || "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {messages.map((message) => (
                <div key={message.id} className="rounded-2xl border border-border p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text">{message.contactName || "Contact inconnu"}</p>
                      <p className="font-mono text-xs text-text-muted">{message.to}</p>
                    </div>
                    <Badge variant={MESSAGE_STATUS_VARIANT[message.status] ?? "neutral"}>
                      {MESSAGE_STATUS_LABEL[message.status] ?? message.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary">{message.body || "—"}</p>
                  {message.error && <p className="mt-2 text-xs text-error">{message.error}</p>}
                  <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                    <span>Créé: {formatDate(message.createdAt)}</span>
                    <span>MAJ: {formatDate(message.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {hasMoreMessages && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="secondary"
                  loading={moreMessagesLoading}
                  onClick={() => fetchMessages(messagesCursor, true)}
                >
                  Charger plus
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        {canShowPause && (
          <Button variant="secondary" loading={pausing} onClick={handlePause}>
            Mettre en pause
          </Button>
        )}
        {canShowResume && (
          <Button variant="primary" loading={resuming} onClick={handleResume}>
            Reprendre la campagne
          </Button>
        )}
        {canShowCancel && (
          <Button variant="danger" onClick={() => setCancelModalOpen(true)}>
            Annuler la campagne
          </Button>
        )}
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          Supprimer
        </Button>
      </div>

      <Modal open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Annuler la campagne">
        <p className="mb-2 text-sm text-text-body">
          Annuler <strong className="text-text">{campaign.name}</strong> ?
        </p>
        <p className="mb-6 text-sm text-text-secondary">
          Les messages encore en file seront marqués comme annulés. Les messages déjà partis ou en cours d&apos;envoi ne seront pas rappelés.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>Retour</Button>
          <Button variant="danger" loading={cancelling} onClick={handleCancel}>Annuler la campagne</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Supprimer la campagne">
        <p className="mb-6 text-sm text-text-body">
          Supprimer <strong className="text-text">{campaign.name}</strong> ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Supprimer</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
