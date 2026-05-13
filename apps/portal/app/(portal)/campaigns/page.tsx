"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { entriesToVariableMap, getContextVariables, getCustomVariables, getCustomVariableKey, type CustomVariableEntry } from "@/lib/templateEngine"
import { useCampaigns } from "@/hooks/useCampaigns"
import { useContacts } from "@/hooks/useContacts"
import { useInstances } from "@/hooks/useInstances"
import { useTemplates } from "@/hooks/useTemplates"
import { useContactGroups } from "@/hooks/useContactGroups"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { Campaign, SubscriptionResponse, CreateCampaignPayload, MessageType, UploadedMedia } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import CustomVariableBuilder from "@/components/ui/CustomVariableBuilder"
import PlanGateBanner from "@/components/ui/PlanGateBanner"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonTableRow } from "@/components/ui/Skeleton"
import { MediaUploadPanel } from "@/components/messages/MediaUploadPanel"
import { VoiceRecorderPanel } from "@/components/messages/VoiceRecorderPanel"
import { ACCEPTED_LABELS, ACCEPTED_MIME, FILE_LIMITS, FILE_UPLOAD_TYPES, GLOBAL_MAX_FILE_SIZE, formatBytes } from "@/lib/messageComposer"
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
  const { copy, locale } = usePortalLocale()
  const list = copy.campaigns.list
  const { campaigns, loading, prependCampaign, updateCampaignStatus, removeCampaign } = useCampaigns()
  const { contacts } = useContacts()
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
  const [contentMode, setContentMode] = useState<"template" | "direct">("template")
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaNotice, setMediaNotice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedMediaRef = useRef<UploadedMedia | null>(null)
  const shouldCleanupMediaRef = useRef(false)

  const [form, setForm] = useState<{
    name: string
    instanceId: string
    templateId: string
    recipientType: "all" | "tags" | "explicit" | "group"
    tags: string[]
    explicit: string[]
    groupId: string
    schedule: string
    repeat: "none" | "daily" | "weekly"
    directType: Extract<MessageType, "text" | "image" | "video" | "audio" | "document" | "voice_note">
    directBody: string
    directMediaUrl: string
  }>({
    name: "",
    instanceId: "",
    templateId: "",
    recipientType: "all",
    tags: [],
    explicit: [],
    groupId: "",
    schedule: "",
    repeat: "none",
    directType: "text",
    directBody: "",
    directMediaUrl: "",
  })

  const selectedTemplate = templates.find((template) => template.id === form.templateId) ?? null
  const contextVariables = selectedTemplate ? getContextVariables(selectedTemplate.variables) : []
  const requiredCustomVariables = selectedTemplate ? getCustomVariables(selectedTemplate.variables) : []
  const tagSortLocale = locale === "fr" ? "fr" : "en"
  const availableTags = useMemo(
    () =>
      Array.from(new Set(contacts.flatMap((contact) => contact.tags).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, tagSortLocale)
      ),
    [contacts, tagSortLocale]
  )
  const isDirectMediaType = FILE_UPLOAD_TYPES.includes(form.directType)
  const recipientsValid =
    form.recipientType === "all"
      || (form.recipientType === "tags" && form.tags.length > 0)
      || (form.recipientType === "explicit" && form.explicit.length > 0)
      || (form.recipientType === "group" && Boolean(form.groupId))
  const contentValid =
    contentMode === "template"
      ? Boolean(form.templateId)
      : form.directType === "text"
        ? form.directBody.trim().length > 0
        : Boolean(form.directMediaUrl)
  const canCreateCampaign =
    form.name.trim().length > 0
    && Boolean(form.instanceId)
    && Boolean(form.schedule)
    && recipientsValid
    && contentValid

  const toggleRecipientValue = (field: "tags" | "explicit", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }))
  }

  useEffect(() => {
    uploadedMediaRef.current = uploadedMedia
  }, [uploadedMedia])

  useEffect(() => {
    return () => {
      if (!shouldCleanupMediaRef.current || !uploadedMediaRef.current) return
      void apiClient.media.delete(uploadedMediaRef.current.id).catch(() => {})
    }
  }, [])

  const resetMediaState = () => {
    setUploadedMedia(null)
    setUploading(false)
    setUploadProgress(0)
    setMediaError(null)
    setMediaNotice(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const releaseUploadedMedia = () => {
    if (!uploadedMediaRef.current) return
    void apiClient.media.delete(uploadedMediaRef.current.id).catch(() => {})
    shouldCleanupMediaRef.current = false
  }

  const uploadMediaFile = async (
    file: File,
    nextType?: Extract<MessageType, "text" | "image" | "video" | "audio" | "document" | "voice_note">
  ) => {
    const targetType = nextType ?? form.directType
    const maxSize = FILE_LIMITS[targetType] ?? GLOBAL_MAX_FILE_SIZE
    setMediaError(null)
    setMediaNotice(null)

    if (file.size > GLOBAL_MAX_FILE_SIZE || file.size > maxSize) {
      setMediaError(targetType === "voice_note"
        ? list.mediaVoiceTooLong
        : `${list.mediaFileTooLargePrefix} ${formatBytes(maxSize, copy.common.bytesMegabyte)}.`)
      return
    }

    const accepted = ACCEPTED_MIME[targetType] ?? []
    if (accepted.length > 0 && !accepted.includes(file.type)) {
      setMediaError(`${list.formatUnsupportedPrefix} ${ACCEPTED_LABELS[targetType] ?? ""}.`)
      return
    }

    if (uploadedMediaRef.current) {
      void apiClient.media.delete(uploadedMediaRef.current.id).catch(() => {})
      setMediaNotice(list.mediaReplaceNotice)
    }

    shouldCleanupMediaRef.current = true
    setUploading(true)
    setUploadProgress(0)

    try {
      const media = await apiClient.media.upload(file, setUploadProgress)
      setUploadedMedia(media)
      setForm((prev) => ({
        ...prev,
        directType: nextType ?? (media.suggestedMessageType === "voice_note" && prev.directType === "audio" ? "voice_note" : prev.directType),
        directMediaUrl: media.url,
      }))
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "MEDIA_TYPE_NOT_ALLOWED") {
          setMediaError(list.mediaTypeNotAllowed)
        } else if (err.code === "MEDIA_TOO_LARGE") {
          setMediaError(list.mediaTooLarge)
        } else {
          setMediaError(list.mediaUploadFailed)
        }
      } else {
        setMediaError(list.mediaUploadFailed)
      }
      setUploadedMedia(null)
      setForm((prev) => ({ ...prev, directMediaUrl: "" }))
      shouldCleanupMediaRef.current = false
      throw err
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await uploadMediaFile(file)
    } finally {
      event.target.value = ""
    }
  }

  const handleRemoveFile = () => {
    releaseUploadedMedia()
    setForm((prev) => ({ ...prev, directMediaUrl: "" }))
    resetMediaState()
  }

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
    if (!canCreateCampaign) return
    setCreating(true)
    try {
      const payload: CreateCampaignPayload = {
        name: form.name,
        instanceId: form.instanceId,
        schedule: new Date(form.schedule).toISOString(),
        repeat: form.repeat,
        recipients: {
          type: form.recipientType,
          ...(form.recipientType === "tags"
            ? { value: form.tags }
            : {}),
          ...(form.recipientType === "explicit"
            ? { value: form.explicit }
            : {}),
          ...(form.recipientType === "group"
            ? { groupId: form.groupId }
            : {}),
        },
        ...(contentMode === "template"
          ? {
              templateId: form.templateId || undefined,
              variables: form.templateId ? entriesToVariableMap(customVariables) : undefined,
            }
          : {
              type: form.directType,
              ...(form.directType === "text"
                ? { body: form.directBody.trim() }
                : {
                    mediaUrl: form.directMediaUrl,
                    body: form.directBody.trim(),
                  }),
            }),
      }
      const campaign = await apiClient.campaigns.create(payload)
      prependCampaign(campaign)
      toast.success(list.scheduled)
      setCreateModalOpen(false)
      setCustomVariables([])
      releaseUploadedMedia()
      resetMediaState()
      setContentMode("template")
      setForm({
        name: "",
        instanceId: "",
        templateId: "",
        recipientType: "all",
        tags: [],
        explicit: [],
        groupId: "",
        schedule: "",
        repeat: "none",
        directType: "text",
        directBody: "",
        directMediaUrl: "",
      })
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "CAMPAIGNS_NOT_AVAILABLE_ON_PLAN") {
          setPlanBlocked(true)
          setCreateModalOpen(false)
        } else if (err.code === "MONTHLY_OUTBOUND_QUOTA_EXCEEDED") {
          toast.error(list.monthlyQuota)
        } else if (err.code === "NOT_FOUND") {
          toast.error(list.instanceMissing)
        } else if (err.code === "VALIDATION_ERROR") {
          toast.error(list.invalidContent)
        } else {
          toast.error(list.createFailed)
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
      toast.success(list.paused)
    } catch {
      toast.error(list.pauseFailed)
    } finally {
      setPausing(null)
    }
  }

  const handleResume = async (id: string) => {
    setResuming(id)
    try {
      const response = await apiClient.campaigns.resume(id)
      updateCampaignStatus(id, "running")

      // Check for safety warnings
      const safetyData = (response as any)?.safety
      if (safetyData && safetyData.decision === "warn") {
        toast.success(list.resumedWarmup)
      } else {
        toast.success(list.resumed)
      }
    } catch {
      toast.error(list.resumeFailed)
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
      toast.success(list.cancelled)
      setCancelTarget(null)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "BAD_REQUEST") {
        toast.error(list.alreadyFinishedToast)
      } else {
        toast.error(list.cancelFailed)
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
      toast.success(list.deleted)
      setDeleteTarget(null)
    } catch {
      toast.error(list.deleteFailed)
    } finally {
      setDeleting(null)
    }
  }

  const tableHeaders = [list.tableName, list.tableStatus, list.tableProgress, list.tableSchedule, list.tableActions]
  const statusLabel = (status: string) =>
    (list.status as Record<string, string>)[status] ?? status
  const rowActionLabels = {
    pause: list.pause,
    resume: list.resume,
    cancel: list.cancel,
    delete: list.delete,
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title={list.title}
        description={list.description}
        action={
          !planBlocked && (
            <Button variant="primary" onClick={() => router.push("/campaigns/new")}>
              {list.newCta}
            </Button>
          )
        }
      />

      {planBlocked && (
        <div className="mb-6">
          <PlanGateBanner message={list.planGateMessage} />
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
                      {tableHeaders.map((h) => (
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
              title={list.emptyTitle}
              description={list.emptyDescription}
              ctaLabel={list.newCta}
              onCta={() => router.push("/campaigns/new")}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {tableHeaders.map((h) => (
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
                            {camp.templateId && <Badge variant="warning">{list.template}</Badge>}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={STATUS_VARIANT[camp.status] ?? "neutral"} pulse={camp.status === "running"}>
                            {statusLabel(camp.status)}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-sm text-text-secondary whitespace-nowrap">
                          {camp.stats.sent} / {getCampaignTotal(camp)}
                        </td>
                        <td className="py-3 pr-4 text-sm text-text-secondary whitespace-nowrap">{formatDate(camp.schedule)}</td>
                        <td className="py-3">
                          <CampaignRowActions
                            campaign={camp}
                            labels={rowActionLabels}
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
                        {camp.templateId && <Badge variant="warning">{list.template}</Badge>}
                      </div>
                      <Badge variant={STATUS_VARIANT[camp.status] ?? "neutral"} pulse={camp.status === "running"}>
                        {statusLabel(camp.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mb-2">
                      {camp.stats.sent} / {getCampaignTotal(camp)} · {formatDate(camp.schedule)}
                    </p>
                    <CampaignRowActions
                      campaign={camp}
                      labels={rowActionLabels}
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

      {/* Cancel confirmation */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title={list.cancelModalTitle}>
        {cancelTarget && (
          <>
            <p className="text-sm text-text-body mb-2">
              {list.cancelModalLead} <strong className="text-text">{cancelTarget.name}</strong> ?
            </p>
            <p className="text-sm text-text-secondary mb-6">
              {list.cancelModalBody}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCancelTarget(null)}>{list.back}</Button>
              <Button variant="danger" loading={!!cancelling} onClick={handleCancel}>{list.cancelModalTitle}</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={list.deleteModalTitle}>
        {deleteTarget && (
          <>
            <p className="text-sm text-text-body mb-6">
              {list.deleteModalBodyPrefix} <strong className="text-text">{deleteTarget.name}</strong>
              {list.deleteModalBodySuffix}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>{list.back}</Button>
              <Button variant="danger" loading={!!deleting} onClick={handleDelete}>{list.delete}</Button>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  )
}

function CampaignRowActions({
  campaign,
  labels,
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
  labels: { pause: string; resume: string; cancel: string; delete: string }
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
          {labels.pause}
        </Button>
      )}
      {canResume(s) && (
        <Button size="sm" variant="primary" loading={resuming} onClick={onResume}>
          {labels.resume}
        </Button>
      )}
      {canCancel(s) && (
        <Button size="sm" variant="danger" loading={cancelling} onClick={onCancel}>
          {labels.cancel}
        </Button>
      )}
      {canDelete(s) && (
        <Button size="sm" variant="ghost" loading={deleting} onClick={onDelete}>
          {labels.delete}
        </Button>
      )}
    </div>
  )
}
