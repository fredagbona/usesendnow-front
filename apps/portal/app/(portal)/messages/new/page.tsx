"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/lib/toast"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { MessageType, SendMessagePayload, Template, UploadedMedia, InstanceHealth } from "@usesendnow/types"
import { useContacts } from "@/hooks/useContacts"
import { useInstances } from "@/hooks/useInstances"
import { useTemplates } from "@/hooks/useTemplates"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { entriesToVariableMap, getCustomVariables, getCustomVariableKey, variableMapToEntries, type CustomVariableEntry } from "@/lib/templateEngine"
import { ACCEPTED_MIME, ACCEPTED_LABELS, FILE_LIMITS, FILE_UPLOAD_TYPES, GLOBAL_MAX_FILE_SIZE, formatBytes } from "@/lib/messageComposer"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Alert from "@/components/ui/Alert"
import CustomVariableBuilder from "@/components/ui/CustomVariableBuilder"
import { MessageTextarea } from "@/components/ui/MessageTextarea"
import { MediaUploadPanel } from "@/components/messages/MediaUploadPanel"
import { RecipientSelector, type RecipientMode } from "@/components/messages/RecipientSelector"
import { SendStatusPanel } from "@/components/messages/SendStatusPanel"
import { VoiceRecorderPanel } from "@/components/messages/VoiceRecorderPanel"
import WarmupWarningModal from "@/components/shared/WarmupWarningModal"
import { shouldShowWarmupWarningBeforeSend } from "@/lib/warmupGate"

type ComposeMode = "freeform" | "template"

export default function NewMessagePage() {
  const router = useRouter()
  const { copy } = usePortalLocale()
  const messageTypes = copy.messages.detail.types
  const m = copy.messages.compose
  const cList = copy.campaigns.list
  const { instances } = useInstances()
  const { templates } = useTemplates()
  const { contacts } = useContacts()
  const connectedInstances = instances.filter((instance) => instance.status === "connected")
  const [composeMode, setComposeMode] = useState<ComposeMode>("freeform")
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("manual")
  const [sending, setSending] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [templatePreview, setTemplatePreview] = useState<string | null>(null)
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaNotice, setMediaNotice] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState(copy.messages.description)
  const [warmupModalOpen, setWarmupModalOpen] = useState(false)
  const [warmupHealth, setWarmupHealth] = useState<InstanceHealth | null>(null)
  const warmupBypassRef = useRef(false)
  const [sendForm, setSendForm] = useState({
    instanceId: "",
    to: "",
    type: "text" as MessageType,
    text: "",
    mediaUrl: "",
    scheduledAt: "",
    templateId: "",
    contactId: "",
  })
  const [templateVariables, setTemplateVariables] = useState<CustomVariableEntry[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedMediaRef = useRef<UploadedMedia | null>(null)
  const shouldCleanupMediaRef = useRef(false)

  const selectedTemplate = useMemo<Template | null>(
    () => templates.find((template) => template.id === sendForm.templateId) ?? null,
    [sendForm.templateId, templates],
  )
  const selectedTemplateCustomVars = useMemo(
    () => (selectedTemplate ? getCustomVariables(selectedTemplate.variables) : []),
    [selectedTemplate],
  )

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

  const handleRecipientModeChange = (mode: RecipientMode) => {
    setRecipientMode(mode)
    if (mode === "manual") {
      setSendForm((prev) => ({ ...prev, contactId: "" }))
      return
    }

    setSendForm((prev) => ({
      ...prev,
      to: "",
      contactId: "",
    }))
  }

  const handleContactRecipientChange = (contactId: string) => {
    const contact = contacts.find((item) => item.id === contactId)
    setSendForm((prev) => ({
      ...prev,
      contactId,
      to: contact?.phone ?? "",
    }))
  }

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId) ?? null
    setSendForm((prev) => ({
      ...prev,
      templateId,
      type: template?.type ?? "text",
      text: "",
      mediaUrl: template?.mediaUrl ?? "",
    }))
    setTemplateVariables(variableMapToEntries(undefined, template?.variables))
    setTemplatePreview(null)
    setPreviewError(null)
  }

  const handleTypeChange = (type: MessageType) => {
    if (type === sendForm.type) return
    releaseUploadedMedia()
    resetMediaState()
    setSendForm((prev) => ({ ...prev, type, mediaUrl: "", text: "" }))
    setStatusMessage(copy.messages.typeUpdated)
  }

  const uploadMediaFile = async (file: File, nextType?: MessageType) => {
    setMediaError(null)
    setMediaNotice(null)

    const targetType = nextType ?? sendForm.type
    const maxSize = FILE_LIMITS[targetType] ?? GLOBAL_MAX_FILE_SIZE
    if (file.size > GLOBAL_MAX_FILE_SIZE || file.size > maxSize) {
      setMediaError(
        targetType === "voice_note"
          ? cList.mediaVoiceTooLong
          : `${cList.mediaFileTooLargePrefix} ${formatBytes(maxSize, copy.common.bytesMegabyte)}.`,
      )
      return
    }

    const accepted = ACCEPTED_MIME[targetType] ?? []
    if (accepted.length > 0 && !accepted.includes(file.type)) {
      setMediaError(`${cList.formatUnsupportedPrefix} ${ACCEPTED_LABELS[targetType] ?? ""}.`)
      return
    }

    if (uploadedMediaRef.current) {
      void apiClient.media.delete(uploadedMediaRef.current.id).catch(() => {})
      setMediaNotice(cList.mediaReplaceNotice)
    }

    shouldCleanupMediaRef.current = true
    setUploading(true)
    setUploadProgress(0)
    setStatusMessage(copy.messages.uploadInProgress)

    try {
      const media = await apiClient.media.upload(file, setUploadProgress)
      setUploadedMedia(media)
      setSendForm((prev) => ({
        ...prev,
        type: nextType ?? (media.suggestedMessageType === "voice_note" && prev.type === "audio" ? "voice_note" : prev.type),
        mediaUrl: media.url,
      }))
      setStatusMessage(copy.messages.uploadQueued)
      if (media.suggestedMessageType === "voice_note" && targetType === "audio") {
        setMediaNotice(m.voiceSuggestedNotice)
      }
      toast.success(copy.messages.uploadSuccess)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "MEDIA_FILE_MISSING") {
          setMediaError(m.noFileSelected)
        } else if (err.code === "MEDIA_TYPE_NOT_ALLOWED") {
          setMediaError(cList.mediaTypeNotAllowed)
        } else if (err.code === "MEDIA_TOO_LARGE") {
          setMediaError(cList.mediaTooLarge)
        } else if (err.code === "MEDIA_UPLOAD_NOT_CONFIGURED") {
          setMediaError(m.mediaUploadUnavailable)
        } else {
          setMediaError(cList.mediaUploadFailed)
        }
      } else {
        setMediaError(cList.mediaUploadFailed)
      }
      setStatusMessage(m.uploadFailedStatusLine)
      setUploadedMedia(null)
      setSendForm((prev) => ({ ...prev, mediaUrl: "" }))
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
    setSendForm((prev) => ({ ...prev, mediaUrl: "" }))
    resetMediaState()
    setStatusMessage(copy.messages.mediaRemoved)
  }

  const handleRefreshPreview = async () => {
    if (!selectedTemplate) return
    setPreviewLoading(true)
    setPreviewError(null)
    setStatusMessage(copy.messages.templatePreviewLoading)
    try {
      const data = await apiClient.templates.preview(selectedTemplate.id, {
        instanceId: sendForm.instanceId || undefined,
        contactId: sendForm.contactId || undefined,
        variables: entriesToVariableMap(templateVariables),
      })
      setTemplatePreview(data.rendered)
      if (!data.valid && data.missingVariables.length > 0) {
        setPreviewError(m.missingVarsPreview.replace("{{vars}}", data.missingVariables.join(", ")))
      }
      setStatusMessage(copy.messages.templatePreview)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TEMPLATE_INVALID") {
        setPreviewError(m.templateInvalidShort)
      } else {
        setPreviewError(copy.messages.templatePreviewError)
      }
      setStatusMessage(m.previewFailedStatusLine)
    } finally {
      setPreviewLoading(false)
    }
  }

  const runSend = async () => {
    setSending(true)
    setStatusMessage(sendForm.scheduledAt ? copy.messages.scheduling : copy.messages.sending)

    try {
      const payload: SendMessagePayload = composeMode === "template"
        ? {
            instanceId: sendForm.instanceId,
            to: sendForm.to,
            templateId: sendForm.templateId,
            contactId: sendForm.contactId || undefined,
            variables: entriesToVariableMap(templateVariables),
          }
        : {
            instanceId: sendForm.instanceId,
            to: sendForm.to,
            type: sendForm.type,
            ...(sendForm.type === "text"
              ? { text: sendForm.text }
              : {
                  mediaUrl: sendForm.mediaUrl,
                  ...(sendForm.text ? { text: sendForm.text } : {}),
                }),
            ...(sendForm.scheduledAt ? { scheduledAt: sendForm.scheduledAt } : {}),
          }

      await apiClient.messages.send(payload)
      shouldCleanupMediaRef.current = false
      toast.success(sendForm.scheduledAt ? copy.messages.scheduledSuccess : copy.messages.queuedSuccess)
      router.push("/messages")
      router.refresh()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "TEMPLATE_VARIABLES_MISSING") {
          toast.error(m.sendErrorTemplateVars)
        } else if (err.code === "TEMPLATE_CONTEXT_UNAVAILABLE") {
          toast.error(m.sendErrorTemplateContext)
        } else if (err.code === "TEMPLATE_INVALID") {
          toast.error(m.sendErrorTemplateInvalid)
        } else if (err.code === "MONTHLY_OUTBOUND_QUOTA_EXCEEDED") {
          toast.error(m.sendErrorQuota)
        } else if (err.code === "NOT_FOUND") {
          toast.error(m.sendErrorNotFound)
        } else if (err.code === "VALIDATION_ERROR") {
          toast.error(m.sendErrorValidation)
        } else if (err.code === "UNSUPPORTED_FEATURE") {
          toast.error(m.sendErrorUnsupportedFeature)
        } else {
          toast.error(m.sendErrorGeneric)
        }
      } else {
        toast.error(m.sendErrorGeneric)
      }
      setStatusMessage(m.sendFailedStatusLine)
    } finally {
      setSending(false)
      warmupBypassRef.current = false
    }
  }

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()

    if (composeMode === "freeform" && FILE_UPLOAD_TYPES.includes(sendForm.type) && !sendForm.mediaUrl) {
      setMediaError(m.noFileSelected)
      return
    }

    if (composeMode === "freeform" && sendForm.scheduledAt && uploadedMedia) {
      const scheduledAt = new Date(sendForm.scheduledAt)
      const expiresAt = new Date(uploadedMedia.expiresAt)
      if (scheduledAt.getTime() > expiresAt.getTime()) {
        setMediaError(m.schedulePastExpiryError)
        return
      }
    }

    if (!warmupBypassRef.current && sendForm.instanceId) {
      try {
        const health = await apiClient.instances.getHealth(sendForm.instanceId)
        if (shouldShowWarmupWarningBeforeSend(health)) {
          setWarmupHealth(health)
          setWarmupModalOpen(true)
          return
        }
      } catch {
        /* optional */
      }
    }

    await runSend()
  }

  const handleWarmupModalClose = () => {
    setWarmupModalOpen(false)
    setWarmupHealth(null)
  }

  const handleWarmupContinue = () => {
    setWarmupModalOpen(false)
    setWarmupHealth(null)
    warmupBypassRef.current = true
    void runSend()
  }

  const isFileUploadType = FILE_UPLOAD_TYPES.includes(sendForm.type)

  return (
    <div className="space-y-8">
      <PageHeader
        title={copy.messages.title}
        description={copy.messages.description}
        action={<Button variant="secondary" onClick={() => router.push("/messages")}>{copy.messages.sendBack}</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
        <form onSubmit={handleSend} className="space-y-6">
          <Card className="space-y-5">
            <div className="flex gap-1 rounded-xl bg-bg-muted p-1 w-fit">
                {([
                { value: "freeform", label: copy.messages.draft },
                { value: "template", label: copy.messages.template },
              ] as const).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    if (composeMode === "freeform" && tab.value === "template") {
                      releaseUploadedMedia()
                      resetMediaState()
                      setSendForm((prev) => ({ ...prev, mediaUrl: "", text: "", type: "text" }))
                    }
                    setComposeMode(tab.value)
                    setPreviewError(null)
                    setTemplatePreview(null)
                  }}
                  className={[
                    "rounded-lg px-4 py-1.5 text-sm font-medium transition-all cursor-pointer",
                    composeMode === tab.value ? "bg-bg border border-border text-text shadow-sm" : "text-text-secondary hover:text-text",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select label={copy.messages.instance} value={sendForm.instanceId} onChange={(event) => setSendForm((prev) => ({ ...prev, instanceId: event.target.value }))} required>
                <option value="">{copy.messages.selectInstance}</option>
                {connectedInstances.map((instance) => (
                  <option key={instance.id} value={instance.id}>{instance.name}</option>
                ))}
              </Select>

              <RecipientSelector
                recipientMode={recipientMode}
                onRecipientModeChange={handleRecipientModeChange}
                to={sendForm.to}
                contactId={sendForm.contactId}
                contacts={contacts}
                onToChange={(value) => setSendForm((prev) => ({ ...prev, to: value, contactId: "" }))}
                onContactChange={handleContactRecipientChange}
              />
            </div>

            {connectedInstances.length === 0 && <p className="text-xs text-warning">{copy.messages.noInstance}</p>}
          </Card>

          {composeMode === "template" ? (
            <Card className="space-y-5">
              <Select label={copy.messages.detail.template} value={sendForm.templateId} onChange={(event) => handleTemplateChange(event.target.value)} required>
                <option value="">{copy.messages.selectTemplate}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </Select>

              {selectedTemplate && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-text-body">{copy.messages.variables}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTemplate.variables.map((variable) => (
                        <span key={variable} className="rounded-full border border-border bg-bg-subtle px-3 py-1 text-xs text-text-secondary">
                          {variable.startsWith("custom.")
                            ? `${variable}${m.variableBadgeCustomSuffix}`
                            : `${variable}${m.variableBadgeContextSuffix}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedTemplateCustomVars.length > 0 && (
                    <CustomVariableBuilder
                      entries={templateVariables.length > 0 ? templateVariables : selectedTemplateCustomVars.map((variable) => ({ key: getCustomVariableKey(variable), value: "" }))}
                      onChange={setTemplateVariables}
                      hint={m.customVariablesBuilderHint}
                    />
                  )}

                  <div className="rounded-xl border border-border bg-bg-subtle p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-text-body">{m.renderPreviewTitle}</p>
                      <Button type="button" variant="secondary" size="sm" loading={previewLoading} onClick={handleRefreshPreview}>
                        {m.refreshPreview}
                      </Button>
                    </div>
                    <div className="min-h-24 text-sm leading-6 text-text">
                      {templatePreview ?? <span className="text-text-muted">{m.previewEmpty}</span>}
                    </div>
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card className="space-y-5">
              <Select label={copy.messages.directComposeTypeLabel} value={sendForm.type} onChange={(event) => handleTypeChange(event.target.value as MessageType)}>
                {(["text", "image", "video", "document", "audio", "voice_note"] as MessageType[]).map((type) => (
                  <option key={type} value={type}>{messageTypes[type as keyof typeof messageTypes] ?? type}</option>
                ))}
              </Select>

              {sendForm.type === "text" ? (
                <div>
                  <MessageTextarea
                    label={m.freeformTextLabel}
                    value={sendForm.text}
                    onChange={(value) => setSendForm((prev) => ({ ...prev, text: value }))}
                    placeholder={m.freeformTextPlaceholder}
                    rows={4}
                    maxLength={4096}
                  />
                  {sendForm.text.length === 0 && <input type="text" required className="sr-only" tabIndex={-1} aria-hidden="true" />}
                </div>
              ) : (
                <>
                  {isFileUploadType && (
                    sendForm.type === "voice_note" ? (
              <VoiceRecorderPanel
                uploading={uploading}
                hasUploadedVoiceNote={!!uploadedMedia && sendForm.type === "voice_note" && !!sendForm.mediaUrl}
                onUpload={(file) => uploadMediaFile(file, "voice_note")}
                onResetUploadState={() => {
                  releaseUploadedMedia()
                  setSendForm((prev) => ({ ...prev, mediaUrl: "" }))
                          resetMediaState()
                          setStatusMessage(m.voiceResetReady)
                        }}
                        uploadError={mediaError}
                        uploadNotice={mediaNotice}
                      />
                    ) : (
                      <MediaUploadPanel
                        type={sendForm.type}
                        uploading={uploading}
                        uploadProgress={uploadProgress}
                        uploadedMedia={uploadedMedia}
                        mediaNotice={mediaNotice}
                        mediaError={mediaError}
                        scheduledAt={sendForm.scheduledAt}
                        fileInputRef={fileInputRef}
                        onFileChange={handleFileSelect}
                        onRemove={handleRemoveFile}
                      />
                    )
                  )}

                  {sendForm.type !== "voice_note" && (
                    <MessageTextarea
                      label={m.freeformCaptionLabel}
                      value={sendForm.text}
                      onChange={(value) => setSendForm((prev) => ({ ...prev, text: value }))}
                      placeholder={m.freeformCaptionPlaceholder}
                      rows={3}
                      maxLength={1024}
                    />
                  )}
                </>
              )}

              <Input
                label={m.scheduleOptionalLabel}
                type="datetime-local"
                value={sendForm.scheduledAt}
                onChange={(event) => setSendForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              />
            </Card>
          )}

          {previewError && <Alert variant="warning" message={previewError} onClose={() => setPreviewError(null)} />}

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/messages")}>{m.cancel}</Button>
            <Button type="submit" variant="primary" loading={sending || uploading}>
              {composeMode === "template"
                ? m.submitTemplate
                : sendForm.scheduledAt
                  ? m.submitSchedule
                  : m.submitSend}
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <SendStatusPanel
            uploadProgress={uploading ? uploadProgress : uploadedMedia ? 100 : 0}
            uploadStatus={
              uploading ? m.uploadBadgeInProgress : uploadedMedia ? m.uploadBadgeDone : m.uploadBadgeIdle
            }
            sendStatus={statusMessage}
            mediaExpiresAt={uploadedMedia?.expiresAt ?? null}
          />

          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{m.bestPracticesKicker}</p>
              <h3 className="mt-2 text-lg font-semibold uppercase text-text">{m.bestPracticesTitle}</h3>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-text-secondary">
              <li>{m.bestPractice1}</li>
              <li>{m.bestPractice2}</li>
              <li>{m.bestPractice3}</li>
              <li>{m.bestPractice4}</li>
              <li>{m.bestPractice5}</li>
            </ul>
          </Card>
        </div>
      </div>

      <WarmupWarningModal
        open={warmupModalOpen}
        health={warmupHealth}
        onClose={handleWarmupModalClose}
        onContinue={handleWarmupContinue}
      />
    </div>
  )
}
