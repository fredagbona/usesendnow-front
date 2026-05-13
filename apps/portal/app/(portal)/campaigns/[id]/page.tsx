"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useCampaign } from "@/hooks/useCampaigns"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import { formatDate, formatDateTime } from "@/lib/format"
import type { Campaign, CampaignDetailStats, CampaignMessage } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Alert from "@/components/ui/Alert"
import { SkeletonCard, SkeletonTableRow } from "@/components/ui/Skeleton"
import { ArrowLeft01Icon, AlertDiamondIcon, CreditCardIcon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

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

const MESSAGE_STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "purple" | "error" | "orange"> = {
  queued: "neutral",
  sent: "blue",
  delivered: "success",
  read: "purple",
  failed: "error",
  cancelled: "orange",
}

const MESSAGE_FILTER_VALUES = ["all", "queued", "sent", "delivered", "read", "failed", "cancelled"] as const
type MessageFilterValue = (typeof MESSAGE_FILTER_VALUES)[number]

function canPause(status: string) {
  return ["scheduled", "running"].includes(status)
}

function canResume(status: string) {
  return ["paused", "paused_quota", "paused_plan"].includes(status)
}

function canCancel(status: string) {
  return ["scheduled", "running", "paused", "paused_quota", "paused_plan"].includes(status)
}

/** Progress fill color aligned with campaign status (badge semantics). */
function campaignProgressBarFillClass(status: string, progressPercent: number): string {
  if (status === "failed") return "bg-error"
  if (status === "cancelled") return "bg-text-muted"
  if (status === "completed" || progressPercent >= 100) return "bg-success"
  if (status === "paused" || status === "paused_quota" || status === "paused_plan") return "bg-[#EA580C]"
  if (status === "scheduled") return "bg-[#D97706]"
  if (status === "running") return "bg-[#3B82F6]"
  if (status === "draft") return "bg-text-muted"
  return "bg-primary-ink"
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

function StatBox({
  label,
  value,
  colorClass,
  numberLocale,
}: {
  label: string
  value: number
  colorClass?: string
  numberLocale: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-subtle p-4">
      <p className={`text-2xl font-bold tracking-tight text-text ${colorClass ?? ""}`}>{value.toLocaleString(numberLocale)}</p>
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

function TimelineRow({
  label,
  value,
  dateLocale,
}: {
  label: string
  value: string | null | undefined
  dateLocale: string
}) {
  if (!value) return null

  return (
    <div className="flex items-start justify-between gap-3 border-b border-bg-muted py-3 last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm text-text tabular-nums">{formatDateTime(value, dateLocale)}</span>
    </div>
  )
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const { copy, locale } = usePortalLocale()
  const list = copy.campaigns.list
  const d = copy.campaigns.detail
  const messageTypes = copy.messages.detail.types
  const numberLocale = locale === "fr" ? "fr-FR" : "en-US"
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
  const [messageFilter, setMessageFilter] = useState<MessageFilterValue>("all")
  const [pausing, setPausing] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  const messageFilterOptions = useMemo(
    () =>
      MESSAGE_FILTER_VALUES.map((value) => ({
        value,
        label: d.messageFilters[value as keyof typeof d.messageFilters],
      })),
    [d]
  )

  const messageStatusLabel = (status: string) =>
    (d.messageStatus as Record<string, string>)[status] ?? status

  const campaignStatusLabel = (s: string) => (list.status as Record<string, string>)[s] ?? s
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
      setMessagesError(d.messagesLoadFailed)
      if (!append) {
        setMessages([])
        setMessagesCursor(null)
        setHasMoreMessages(false)
      }
    } finally {
      messagesInFlightRef.current = false
      setter(false)
    }
  }, [id, messageFilter, d.messagesLoadFailed])

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
      toast.success(list.paused)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "BAD_REQUEST") {
        toast.error(d.toastPauseNotAllowed)
      } else {
        toast.error(list.pauseFailed)
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
      toast.success(list.resumed)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "BAD_REQUEST") {
        toast.error(d.toastResumeNotAllowed)
      } else {
        toast.error(list.resumeFailed)
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
      toast.success(list.cancelled)
      setCancelModalOpen(false)
      fetchMessages()
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "BAD_REQUEST") {
        toast.error(d.toastCancelAlreadyDone)
      } else {
        toast.error(list.cancelFailed)
      }
    } finally {
      setCancelling(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiClient.campaigns.delete(id)
      toast.success(list.deleted)
      router.push("/campaigns")
    } catch {
      toast.error(list.deleteFailed)
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
    if (campaign.recipients.type === "explicit") {
      const count = campaign.recipients.value?.length ?? 0
      return d.explicitRecipientCount.replace("{{count}}", String(count))
    }
    if (campaign.recipients.type === "group") return campaign.recipients.groupId ?? "—"
    return d.recipients[campaign.recipients.type as keyof typeof d.recipients] ?? campaign.recipients.type
  }, [campaign, d])

  const contentModeLabel = useMemo(
    () => (campaign?.templateId ? d.metaTemplate : d.metaDirect),
    [campaign?.templateId, d.metaTemplate, d.metaDirect]
  )

  const messageTableHeaders = [
    d.tableContact,
    d.tablePhone,
    d.tableStatus,
    d.tableError,
    d.tableCreated,
    d.tableUpdated,
    d.tablePreview,
  ]

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
        <Alert variant="error" message={d.notFound} />
        <Button variant="secondary" onClick={() => router.push("/campaigns")}>
          {copy.campaigns.back}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title={campaign.name}
        description={d.pageDescription}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[status] ?? "neutral"} pulse={status === "running"}>
              {campaignStatusLabel(status)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => router.push("/campaigns")}>
              <ArrowLeft01Icon className="mr-1 h-4 w-4" />
              {list.back}
            </Button>
          </div>
        }
      />

      {status === "paused_quota" && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning-subtle p-4">
          <AlertDiamondIcon className="h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-text">{d.quotaPausedTitle}</p>
            <p className="mt-0.5 text-sm text-text-secondary">
              {d.quotaPausedBody}
            </p>
          </div>
        </div>
      )}

      {status === "paused_plan" && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning-subtle p-4">
          <CreditCardIcon className="h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-text">{d.planPausedTitle}</p>
            <p className="mt-0.5 text-sm text-text-secondary">
              {d.planPausedBody}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => router.push("/billing")} className="ml-auto shrink-0">
            {copy.topnav.upgrade}
          </Button>
        </div>
      )}

      <Card>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-text">{d.overviewTitle}</h2>
          {total === 0 ? (
            <p className="mt-1 text-xs text-text-muted">{d.overviewNotStarted}</p>
          ) : null}
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-bg-muted">
            <div
              className={["h-full rounded-full transition-all", campaignProgressBarFillClass(status, progressPercent)].join(" ")}
              style={{ width: `${Math.min(total > 0 ? progressPercent : 0, 100)}%` }}
            />
          </div>
          {total > 0 ? (
            <span className="shrink-0 text-sm font-semibold tabular-nums text-text">{Math.min(progressPercent, 100)}%</span>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          <StatBox numberLocale={numberLocale} label={d.stats.planned} value={stats?.stats.planned ?? total} />
          <StatBox numberLocale={numberLocale} label={d.stats.queued} value={stats?.stats.queued ?? campaign.stats.queued} colorClass="text-text-muted" />
          <StatBox numberLocale={numberLocale} label={d.stats.sent} value={stats?.stats.sent ?? campaign.stats.sent} colorClass="text-info" />
          <StatBox numberLocale={numberLocale} label={d.stats.failed} value={stats?.stats.failed ?? campaign.stats.failed} colorClass="text-error" />
          <StatBox numberLocale={numberLocale} label={d.stats.cancelled} value={stats?.stats.cancelled ?? campaign.stats.cancelled ?? 0} colorClass="text-warning-text" />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-text">{d.metadataTitle}</h2>
          <MetaRow label={d.metaInstance} value={<span className="font-mono text-xs">{campaign.instanceId}</span>} />
          <MetaRow label={d.metaContentMode} value={contentModeLabel} />
          {campaign.templateId && (
            <MetaRow
              label={d.metaModel}
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
              <MetaRow
                label={d.metaType}
                value={
                  messageTypes[campaign.type as keyof typeof messageTypes] ?? campaign.type ?? "—"
                }
              />
              {campaign.body && <MetaRow label={d.metaMessage} value={<span className="whitespace-pre-wrap">{campaign.body}</span>} />}
              {campaign.mediaUrl && (
                <MetaRow
                  label={d.metaMedia}
                  value={
                    <a href={campaign.mediaUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-ink hover:text-text hover:underline break-all">
                      {campaign.mediaUrl}
                    </a>
                  }
                />
              )}
            </>
          )}
          <MetaRow label={d.metaSchedule} value={formatDate(campaign.schedule)} />
          <MetaRow label={d.metaRepeat} value={d.repeat[campaign.repeat as keyof typeof d.repeat] ?? campaign.repeat} />
          <MetaRow label={d.metaRecipients} value={recipientValue} />
          <MetaRow label={d.metaCreatedAt} value={formatDate(campaign.createdAt)} />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-text">{d.timelineTitle}</h2>
          <TimelineRow dateLocale={numberLocale} label={d.timelineScheduledFor} value={timeline?.scheduledFor ?? campaign.schedule} />
          <TimelineRow dateLocale={numberLocale} label={d.timelineProcessingStarted} value={timeline?.processingStartedAt ?? campaign.stats.processingStartedAt} />
          <TimelineRow dateLocale={numberLocale} label={d.timelineLastEnqueued} value={timeline?.lastEnqueuedAt ?? campaign.stats.lastEnqueuedAt} />
          <TimelineRow dateLocale={numberLocale} label={d.timelineLastActivity} value={timeline?.lastActivityAt ?? stats?.startedAt} />
          <TimelineRow dateLocale={numberLocale} label={d.timelineCompleted} value={timeline?.completedAt ?? campaign.stats.completedAt} />
          <TimelineRow dateLocale={numberLocale} label={d.timelineCancelled} value={timeline?.cancelledAt ?? campaign.stats.cancelledAt} />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text">{d.messagesTitle}</h2>
            <p className="mt-1 text-xs text-text-muted">{d.messagesSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {messageFilterOptions.map((filter) => (
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
              {d.refresh}
            </Button>
          </div>
        </div>

        {messagesError && <Alert variant="error" message={messagesError} onClose={() => setMessagesError(null)} />}

        {messagesLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {messageTableHeaders.map((header) => (
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
          <p className="text-sm text-text-secondary">{d.noMessagesForFilter}</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {messageTableHeaders.map((header) => (
                      <th key={header} className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 text-sm text-text">{message.contactName || d.contactUnknown}</td>
                      <td className="py-3 pr-4 font-mono text-sm text-text-secondary">{message.to}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={MESSAGE_STATUS_VARIANT[message.status] ?? "neutral"}>
                          {messageStatusLabel(message.status)}
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
                      <p className="text-sm font-medium text-text">{message.contactName || d.contactUnknown}</p>
                      <p className="font-mono text-xs text-text-muted">{message.to}</p>
                    </div>
                    <Badge variant={MESSAGE_STATUS_VARIANT[message.status] ?? "neutral"}>
                      {messageStatusLabel(message.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary">{message.body || "—"}</p>
                  {message.error && <p className="mt-2 text-xs text-error">{message.error}</p>}
                  <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                    <span>{d.mobileCreatedPrefix} {formatDate(message.createdAt)}</span>
                    <span>{d.mobileUpdatedPrefix} {formatDate(message.updatedAt)}</span>
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
                  {d.loadMore}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        {canShowPause && (
          <Button variant="secondary" loading={pausing} onClick={handlePause}>
            {d.pauseCta}
          </Button>
        )}
        {canShowResume && (
          <Button variant="primary" loading={resuming} onClick={handleResume}>
            {d.resumeCta}
          </Button>
        )}
        {canShowCancel && (
          <Button variant="danger" onClick={() => setCancelModalOpen(true)}>
            {d.cancelCta}
          </Button>
        )}
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          {list.delete}
        </Button>
      </div>

      <Modal open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title={list.cancelModalTitle}>
        <p className="mb-2 text-sm text-text-body">
          {list.cancelModalLead} <strong className="text-text">{campaign.name}</strong> ?
        </p>
        <p className="mb-6 text-sm text-text-secondary">
          {list.cancelModalBody}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>{list.back}</Button>
          <Button variant="danger" loading={cancelling} onClick={handleCancel}>{list.cancelModalTitle}</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title={list.deleteModalTitle}>
        <p className="mb-6 text-sm text-text-body">
          {list.deleteModalBodyPrefix} <strong className="text-text">{campaign.name}</strong>
          {list.deleteModalBodySuffix}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>{list.cancel}</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>{list.delete}</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
