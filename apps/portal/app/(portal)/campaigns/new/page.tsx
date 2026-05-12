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
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { Campaign, SubscriptionResponse, CreateCampaignPayload, MessageType, UploadedMedia, RepeatType, SafetyAssessment, InstanceHealth } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import CustomVariableBuilder from "@/components/ui/CustomVariableBuilder"
import PlanGateBanner from "@/components/ui/PlanGateBanner"
import CampaignSafetyHints from "@/components/campaigns/CampaignSafetyHints"
import { MediaUploadPanel } from "@/components/messages/MediaUploadPanel"
import { VoiceRecorderPanel } from "@/components/messages/VoiceRecorderPanel"
import WarmupWarningModal from "@/components/shared/WarmupWarningModal"
import { shouldShowWarmupWarningBeforeSend } from "@/lib/warmupGate"
import { ACCEPTED_LABELS, ACCEPTED_MIME, FILE_LIMITS, FILE_UPLOAD_TYPES, GLOBAL_MAX_FILE_SIZE, formatBytes } from "@/lib/messageComposer"
import { Megaphone01Icon, ArrowLeft01Icon, InformationCircleIcon } from "hugeicons-react"

export default function NewCampaignPage() {
  const router = useRouter()
  const { copy, locale } = usePortalLocale()
  const np = copy.campaigns.newPage
  const list = copy.campaigns.list
  const dRepeat = copy.campaigns.detail.repeat
  const messageTypes = copy.messages.detail.types
  const { prependCampaign } = useCampaigns()
  const { contacts } = useContacts()
  const { instances } = useInstances()
  const { templates } = useTemplates()
  const { groups } = useContactGroups()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const [creating, setCreating] = useState(false)
  const [customVariables, setCustomVariables] = useState<CustomVariableEntry[]>([])
  const [contentMode, setContentMode] = useState<"template" | "direct">("template")
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaNotice, setMediaNotice] = useState<string | null>(null)
  const [safetyHints, setSafetyHints] = useState<SafetyAssessment | null>(null)
  const [warmupModalOpen, setWarmupModalOpen] = useState(false)
  const [warmupHealth, setWarmupHealth] = useState<InstanceHealth | null>(null)
  const warmupBypassRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedMediaRef = useRef<UploadedMedia | null>(null)
  const shouldCleanupMediaRef = useRef(false)

  // Reset safety hints on unmount (navigation away from page)
  useEffect(() => {
    return () => {
      setSafetyHints(null)
    }
  }, [])

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

  const selectedTemplate = templates.find((t) => t.id === form.templateId) ?? null
  const contextVariables = selectedTemplate ? getContextVariables(selectedTemplate.variables) : []
  const requiredCustomVariables = selectedTemplate ? getCustomVariables(selectedTemplate.variables) : []
  const availableTags = useMemo(
    () =>
      Array.from(new Set(contacts.flatMap((c) => c.tags).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, locale === "fr" ? "fr" : "en"),
      ),
    [contacts, locale],
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
    if (fileInputRef.current) fileInputRef.current.value = ""
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
      setMediaError(
        targetType === "voice_note"
          ? list.mediaVoiceTooLong
          : `${list.mediaFileTooLargePrefix} ${formatBytes(maxSize, copy.common.bytesMegabyte)}.`,
      )
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
        if (err.code === "MEDIA_TYPE_NOT_ALLOWED") setMediaError(list.mediaTypeNotAllowed)
        else if (err.code === "MEDIA_TOO_LARGE") setMediaError(list.mediaTooLarge)
        else setMediaError(list.mediaUploadFailed)
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

  const handleDirectTypeChange = (type: Extract<MessageType, "text" | "image" | "video" | "audio" | "document" | "voice_note">) => {
    if (type === form.directType) return
    releaseUploadedMedia()
    resetMediaState()
    setForm((prev) => ({ ...prev, directType: type, directMediaUrl: "", directBody: "" }))
  }

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId) ?? null
    setForm((prev) => ({ ...prev, templateId }))
    setCustomVariables(
      template
        ? getCustomVariables(template.variables).map((v) => ({ key: getCustomVariableKey(v), value: "" }))
        : []
    )
  }

  useEffect(() => {
    apiClient.billing.getSubscription()
      .then((sub) => {
        setSubscription(sub)
        const hasCampaigns = sub?.subscription?.plan?.features?.campaigns ?? false
        if (!hasCampaigns) setPlanBlocked(true)
      })
      .catch(() => setPlanBlocked(true))
  }, [])

  const runCreate = async () => {
    setCreating(true)
    try {
      const schedule = form.schedule ? new Date(form.schedule).toISOString() : new Date().toISOString()
      const repeat: RepeatType = form.repeat !== "none" ? form.repeat : "none"

      let payload: CreateCampaignPayload

      if (contentMode === "template") {
        payload = {
          name: form.name.trim(),
          instanceId: form.instanceId,
          templateId: form.templateId,
          schedule: form.schedule ? new Date(form.schedule).toISOString() : new Date().toISOString(),
          repeat,
          variables: entriesToVariableMap(customVariables),
          recipients: {
            type: form.recipientType,
            value: form.recipientType === "explicit" ? form.explicit : form.recipientType === "tags" ? form.tags : undefined,
            groupId: form.recipientType === "group" ? form.groupId : undefined,
          },
        }
      } else {
        payload = {
          name: form.name.trim(),
          instanceId: form.instanceId,
          type: form.directType,
          body: form.directType === "text" ? form.directBody.trim() : undefined,
          mediaUrl: isDirectMediaType ? form.directMediaUrl : undefined,
          schedule: form.schedule ? new Date(form.schedule).toISOString() : new Date().toISOString(),
          repeat,
          recipients: {
            type: form.recipientType,
            value: form.recipientType === "explicit" ? form.explicit : form.recipientType === "tags" ? form.tags : undefined,
            groupId: form.recipientType === "group" ? form.groupId : undefined,
          },
        }
      }

      const campaign = await apiClient.campaigns.create(payload)
      prependCampaign(campaign)

      const safetyData = (campaign as Campaign & { safety?: SafetyAssessment }).safety
      if (safetyData && safetyData.decision === "warn") {
        setSafetyHints(safetyData)
        toast.success(copy.campaigns.createdWarmup)
      } else {
        toast.success(copy.campaigns.created)
      }

      router.push("/campaigns")
      router.refresh()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "CAMPAIGNS_NOT_AVAILABLE_ON_PLAN") {
          toast.error(np.errorCampaignsNotOnPlan)
        } else if (err.code === "MONTHLY_OUTBOUND_QUOTA_EXCEEDED") {
          toast.error(np.errorQuotaExceeded)
        } else if (err.code === "NOT_FOUND") {
          toast.error(np.errorNotFound)
        } else if (err.code === "VALIDATION_ERROR") {
          toast.error(np.errorValidation)
        } else {
          toast.error(np.errorGeneric)
        }
      } else {
        toast.error(np.errorGeneric)
      }
    } finally {
      setCreating(false)
      warmupBypassRef.current = false
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreateCampaign) return

    if (!warmupBypassRef.current && form.instanceId) {
      try {
        const health = await apiClient.instances.getHealth(form.instanceId)
        if (shouldShowWarmupWarningBeforeSend(health)) {
          setWarmupHealth(health)
          setWarmupModalOpen(true)
          return
        }
      } catch {
        /* health optional: proceed */
      }
    }

    await runCreate()
  }

  const handleWarmupModalClose = () => {
    setWarmupModalOpen(false)
    setWarmupHealth(null)
  }

  const handleWarmupContinue = () => {
    setWarmupModalOpen(false)
    setWarmupHealth(null)
    warmupBypassRef.current = true
    void runCreate()
  }

  if (planBlocked) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
        <PageHeader
          title={copy.campaigns.title}
          description={copy.campaigns.description}
          action={<Button variant="secondary" onClick={() => router.push("/campaigns")}>{copy.campaigns.back}</Button>}
        />
        <PlanGateBanner message={list.planGateMessage} />
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-6xl">
      <PageHeader
        title={copy.campaigns.title}
        description={copy.campaigns.description}
        action={<Button variant="secondary" onClick={() => router.push("/campaigns")}>{copy.campaigns.back}</Button>}
      />

      <form onSubmit={handleCreate} className="space-y-6">
        {/* General info + Recipients side by side on desktop */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* General info */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone01Icon className="w-5 h-5 text-text-secondary" />
              <h3 className="text-base font-medium text-text">{copy.campaigns.general}</h3>
            </div>

            <Input
              label={np.campaignNameLabel}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={np.campaignNamePlaceholder}
              required
              autoFocus
            />

            <Select label={np.instanceLabel} value={form.instanceId} onChange={(e) => setForm((prev) => ({ ...prev, instanceId: e.target.value }))} required>
              <option value="">{np.instancePlaceholder}</option>
              {instances.filter((i) => i.status === "connected").map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </Select>

            <Input
              label={np.scheduleLabel}
              type="datetime-local"
              value={form.schedule}
              onChange={(e) => setForm((prev) => ({ ...prev, schedule: e.target.value }))}
              required
            />

            <Select label={np.repeatLabel} value={form.repeat} onChange={(e) => setForm((prev) => ({ ...prev, repeat: e.target.value as "none" | "daily" | "weekly" }))}>
              <option value="none">{dRepeat.none}</option>
              <option value="daily">{dRepeat.daily}</option>
              <option value="weekly">{dRepeat.weekly}</option>
            </Select>
          </Card>

          {/* Recipients */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone01Icon className="w-5 h-5 text-text-secondary" />
              <h3 className="text-base font-medium text-text">{copy.campaigns.recipients}</h3>
            </div>

            <Select
              label={np.recipientTypeLabel}
              value={form.recipientType}
              onChange={(e) => setForm((prev) => ({ ...prev, recipientType: e.target.value as "all" | "tags" | "explicit" | "group" }))}
            >
              <option value="all">{np.recipientTypeAll}</option>
              <option value="tags">{np.recipientTypeTags}</option>
              <option value="explicit">{np.recipientTypeExplicit}</option>
              <option value="group">{np.recipientTypeGroup}</option>
            </Select>

            {form.recipientType === "tags" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-body">{np.tagsLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.length === 0 ? (
                    <p className="text-xs text-text-muted">{np.noTagsAvailable}</p>
                  ) : (
                    availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleRecipientValue("tags", tag)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          form.tags.includes(tag) ? "bg-primary-subtle border-primary text-primary-text" : "bg-bg-subtle border-border text-text-secondary hover:border-border-strong"
                        }`}
                      >
                        {tag}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {form.recipientType === "explicit" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-body">{np.explicitContactsLabel}</label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {contacts.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm text-text-body">
                      <input
                        type="checkbox"
                        checked={form.explicit.includes(c.id)}
                        onChange={() => toggleRecipientValue("explicit", c.id)}
                        className="h-4 w-4 rounded border-border-strong accent-primary"
                      />
                      {c.name} ({c.phone})
                    </label>
                  ))}
                </div>
              </div>
            )}

            {form.recipientType === "group" && (
              <Select
                label={np.groupLabel}
                value={form.groupId}
                onChange={(e) => setForm((prev) => ({ ...prev, groupId: e.target.value }))}
                required={form.recipientType === "group"}
              >
                <option value="">{np.groupPlaceholder}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </Select>
            )}
          </Card>
        </div>

        {/* Content */}
        <Card className="space-y-4">
          <div className="flex gap-1 p-1 bg-bg-muted rounded-xl w-fit">
            {([
                { value: "template", label: copy.campaigns.contentTemplate },
                { value: "direct", label: copy.campaigns.contentDirect },
            ] as const).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setContentMode(tab.value)
                  if (tab.value === "direct") {
                    releaseUploadedMedia()
                    resetMediaState()
                  }
                }}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                  contentMode === tab.value ? "bg-bg border border-border text-text shadow-sm" : "text-text-secondary hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {contentMode === "template" ? (
            <div className="space-y-4">
              <Select label={np.templateLabel} value={form.templateId} onChange={(e) => handleTemplateChange(e.target.value)} required>
                <option value="">{np.templatePlaceholder}</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>

              {selectedTemplate && (
                <>
                  {contextVariables.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-text-body">{np.contextVariablesLabel}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {contextVariables.map((key) => (
                          <span key={key} className="rounded-full border border-border bg-bg-subtle px-3 py-1 text-xs text-text-secondary">{key}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {requiredCustomVariables.length > 0 && (
                    <CustomVariableBuilder
                      entries={customVariables.length > 0 ? customVariables : requiredCustomVariables.map((v) => ({ key: getCustomVariableKey(v), value: "" }))}
                      onChange={setCustomVariables}
                    />
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Select label={np.messageTypeLabel} value={form.directType} onChange={(e) => handleDirectTypeChange(e.target.value as typeof form.directType)}>
                {(["text", "image", "video", "document", "audio", "voice_note"] as typeof form.directType[]).map((t) => (
                  <option key={t} value={t}>{messageTypes[t as keyof typeof messageTypes] ?? t}</option>
                ))}
              </Select>

              {form.directType === "text" ? (
                <Textarea
                  label={np.messageLabel}
                  value={form.directBody}
                  onChange={(e) => setForm((prev) => ({ ...prev, directBody: e.target.value }))}
                  placeholder={np.messagePlaceholder}
                  rows={5}
                  required
                  maxLength={4096}
                />
              ) : (
                <>
                  {form.directType === "voice_note" ? (
                    <VoiceRecorderPanel
                      uploading={uploading}
                      hasUploadedVoiceNote={!!uploadedMedia}
                      onUpload={(file) => uploadMediaFile(file, "voice_note")}
                      onResetUploadState={() => { releaseUploadedMedia(); setForm((prev) => ({ ...prev, directMediaUrl: "" })); resetMediaState() }}
                      uploadError={mediaError}
                      uploadNotice={mediaNotice}
                    />
                  ) : (
                    <MediaUploadPanel
                      type={form.directType}
                      uploading={uploading}
                      uploadProgress={uploadProgress}
                      uploadedMedia={uploadedMedia}
                      mediaNotice={mediaNotice}
                      mediaError={mediaError}
                      scheduledAt={form.schedule}
                      fileInputRef={fileInputRef}
                      onFileChange={handleFileSelect}
                      onRemove={handleRemoveFile}
                    />
                  )}

                  {form.directType !== "voice_note" && (
                    <Textarea
                      label={np.captionLabel}
                      value={form.directBody}
                      onChange={(e) => setForm((prev) => ({ ...prev, directBody: e.target.value }))}
                      placeholder={np.captionPlaceholder}
                      rows={3}
                      maxLength={1024}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </Card>

        {/* Submit */}
        {safetyHints && (
          <CampaignSafetyHints safety={safetyHints} />
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            {!canCreateCampaign && (
              <span className="flex items-center gap-1.5">
                <InformationCircleIcon className="w-4 h-4" />
                {np.fillRequiredHint}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/campaigns")}>{np.cancel}</Button>
            <Button type="submit" variant="primary" loading={creating} disabled={!canCreateCampaign}>{copy.campaigns.create}</Button>
          </div>
        </div>
      </form>

      <WarmupWarningModal
        open={warmupModalOpen}
        health={warmupHealth}
        onClose={handleWarmupModalClose}
        onContinue={handleWarmupContinue}
      />
    </motion.div>
  )
}
