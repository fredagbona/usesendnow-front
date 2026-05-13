"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { parseTemplateVariables } from "@/lib/templateEngine"
import type { TemplateType, MessageType, UploadedMedia } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import Alert from "@/components/ui/Alert"
import Badge from "@/components/ui/Badge"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { useManagedTemporaryMedia } from "@/hooks/useManagedTemporaryMedia"
import { MediaUploadPanel } from "@/components/messages/MediaUploadPanel"
import {
  ArrowLeft01Icon,
  File01Icon,
  InformationCircleIcon,
  UserIcon,
  BubbleChatIcon,
  Settings02Icon,
  Megaphone01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
} from "hugeicons-react"

const TEMPLATE_TYPES: TemplateType[] = ["text", "image", "video", "audio", "document"]

const AUTO_VARIABLE_BLOCKS = [
  {
    namespace: "contact.*",
    descKey: "contact" as const,
    icon: BubbleChatIcon,
    fields: ["contact.name", "contact.firstName", "contact.phone", "contact.tags", "contact.meta.*"],
  },
  {
    namespace: "user.*",
    descKey: "user" as const,
    icon: UserIcon,
    fields: ["user.fullName", "user.email", "user.phone"],
  },
  {
    namespace: "instance.*",
    descKey: "instance" as const,
    icon: Settings02Icon,
    fields: ["instance.name"],
  },
] as const

const EXAMPLE_KEYS = ["followup", "order", "notice"] as const

export default function NewTemplatePage() {
  const { copy } = usePortalLocale()
  const h = copy.hooks
  const list = copy.campaigns.list
  const t = copy.templates
  const tNew = t.new
  const typeLabels = t.detail.typeLabels
  const router = useRouter()
  const [name, setName] = useState("")
  const [type, setType] = useState<TemplateType>("text")
  const [body, setBody] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const messageMediaType = type as MessageType

  const onUploadSuccess = useCallback((media: UploadedMedia) => {
    setMediaUrl(media.url)
  }, [])

  const onClearMedia = useCallback(() => {
    setMediaUrl("")
  }, [])

  const {
    uploadedMedia,
    uploading,
    uploadProgress,
    mediaError,
    mediaNotice,
    fileInputRef,
    handleFileSelect,
    handleRemoveFile,
    resetMediaState,
    releaseUploadedMedia,
    shouldCleanupMediaRef,
  } = useManagedTemporaryMedia({
    mediaType: messageMediaType,
    listCopy: list,
    bytesMegabyte: copy.common.bytesMegabyte,
    onUploadSuccess,
    onClear: onClearMedia,
    onTeamAccessDenied: () => toast.error(h.teamAccessDenied),
  })

  const isFirstTypeEffect = useRef(true)

  useEffect(() => {
    if (isFirstTypeEffect.current) {
      isFirstTypeEffect.current = false
      return
    }
    releaseUploadedMedia()
    resetMediaState()
    setMediaUrl("")
  }, [type, releaseUploadedMedia, resetMediaState])

  const detectedVariables = useMemo(() => parseTemplateVariables(body), [body])
  const requiresMedia = type !== "text"

  const customVars = useMemo(() => detectedVariables.filter((v) => v.startsWith("custom.")), [detectedVariables])
  const contextVars = useMemo(
    () => detectedVariables.filter((v) => v.startsWith("contact.") || v.startsWith("user.") || v.startsWith("instance.")),
    [detectedVariables],
  )

  const canSubmit =
    name.trim().length > 0 &&
    (type === "text" ? body.trim().length > 0 : true) &&
    (requiresMedia ? mediaUrl.trim().length > 0 : true)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.templates.create({
        name: name.trim(),
        type,
        body: body.trim() || null,
        mediaUrl: type === "text" ? null : mediaUrl.trim() || null,
      })
      shouldCleanupMediaRef.current = false
      toast.success(tNew.created)
      router.push(`/templates/${response.id}`)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TEMPLATE_INVALID") {
        setError(tNew.invalid)
      } else if (err instanceof ApiClientError && err.code === "VALIDATION_ERROR") {
        setError(tNew.requiredFields)
      } else if (err instanceof ApiClientError && err.code === "MEDIA_URL_EXPIRED") {
        setError(tNew.mediaUrlExpired)
      } else {
        setError(tNew.saveFailed)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="@container/template-new mx-auto w-full max-w-7xl space-y-6"
    >
      <PageHeader
        title={tNew.title}
        description={tNew.description}
        action={
          <Button variant="secondary" onClick={() => router.push("/templates")}>
            <ArrowLeft01Icon className="w-4 h-4 mr-1.5" />
            {tNew.back}
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid w-full grid-cols-1 gap-6 @lg/template-new:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] @lg/template-new:items-start">
          {/* Left: champs du template uniquement */}
          <div className="min-w-0 space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <File01Icon className="w-5 h-5 text-text-secondary" />
                <h3 className="text-base font-medium text-text">{tNew.infoTitle}</h3>
              </div>

              <Input
                label={tNew.templateName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tNew.templateNamePlaceholder}
                required
                autoFocus
              />

              <Select label={t.type} value={type} onChange={(e) => setType(e.target.value as TemplateType)}>
                {TEMPLATE_TYPES.map((templateType) => (
                  <option key={templateType} value={templateType}>
                    {typeLabels[templateType]}
                  </option>
                ))}
              </Select>

              {requiresMedia && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-text-body">{tNew.mediaSectionTitle}</p>
                  <MediaUploadPanel
                    type={messageMediaType}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    uploadedMedia={uploadedMedia}
                    mediaNotice={mediaNotice}
                    mediaError={mediaError}
                    scheduledAt=""
                    panelContext="template"
                    existingRemoteMediaUrl={null}
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileSelect}
                    onRemove={handleRemoveFile}
                  />
                  {!uploadedMedia && (
                    <Input
                      label={tNew.externalUrlOptional}
                      hint={tNew.externalUrlHint}
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder={t.mediaUrlPlaceholder}
                    />
                  )}
                </div>
              )}
            </Card>

            <Card className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-text mb-1">{tNew.bodyTitle}</h3>
                <p className="text-xs text-text-secondary mb-3">{tNew.bodyDescription}</p>
              </div>

              <Textarea
                label={requiresMedia ? t.bodyOptional : t.body}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required={!requiresMedia}
                rows={8}
                placeholder={tNew.bodyPlaceholder}
              />

              {detectedVariables.length === 0 && body.length > 0 && (
                <p className="text-xs text-text-muted">{tNew.noVariablesDetected}</p>
              )}
            </Card>
          </div>

          {/* Right: exemples + syntaxe + détection (réagit à la largeur du conteneur, pas au viewport seul) */}
          <div className="min-w-0 space-y-6 @lg/template-new:sticky @lg/template-new:top-24 @lg/template-new:max-h-[calc(100vh-6rem)] @lg/template-new:overflow-y-auto">
            <Card>
              <button
                type="button"
                onClick={() => setShowExamples((v) => !v)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <BubbleChatIcon className="h-5 w-5 text-text-secondary" />
                  <h3 className="text-sm font-semibold text-text">{tNew.examplesTitle}</h3>
                </div>
                <span className="text-xs text-text-secondary">{showExamples ? tNew.hide : tNew.show}</span>
              </button>

              {showExamples && (
                <div className="mt-4 space-y-3">
                  {EXAMPLE_KEYS.map((key) => {
                    const label = tNew.examples[key]
                    const bodyText = tNew.examplesBodies[key]
                    const isCopied = copied === bodyText
                    return (
                      <div key={key} className="rounded-xl border border-border bg-bg-subtle p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs font-medium text-text">{label}</p>
                          <button
                            type="button"
                            onClick={() => handleCopy(bodyText)}
                            className="inline-flex items-center gap-1 text-xs text-text-secondary transition-colors hover:text-primary"
                          >
                            {isCopied ? (
                              <>
                                <CheckmarkCircle01Icon className="h-3.5 w-3.5 text-primary" /> {tNew.copied}
                              </>
                            ) : (
                              <>
                                <Copy01Icon className="h-3.5 w-3.5" /> {tNew.copy}
                              </>
                            )}
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-relaxed text-text-secondary">
                          {bodyText}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card className="space-y-4 border-primary/20 bg-primary-subtle">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-text">{tNew.variableSyntax}</h3>
              </div>
              <p className="text-sm text-text-secondary">{tNew.variableSyntaxDescription}</p>

              <div className="grid grid-cols-1 gap-3">
                {AUTO_VARIABLE_BLOCKS.map(({ namespace, icon: Icon, fields, descKey }) => (
                  <div key={namespace} className="rounded-xl border border-border bg-bg p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-text-secondary" />
                      <code className="text-xs font-mono font-bold text-text">{namespace}</code>
                    </div>
                    <p className="mb-2 text-xs text-text-muted">{tNew.autoVariables[descKey]}</p>
                    <div className="flex flex-wrap gap-1">
                      {fields.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            setBody((prev) => prev + (prev.length > 0 && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "") + `{{${f}}}`)
                          }}
                          className="rounded border border-border bg-bg-subtle px-1.5 py-0.5 font-mono text-[10px] transition-colors hover:border-primary hover:text-primary"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-bg p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Megaphone01Icon className="h-4 w-4 text-text-secondary" />
                  <code className="text-xs font-mono font-bold text-text">custom.*</code>
                  <span className="text-xs text-text-muted">— {tNew.customVariables}</span>
                </div>
                <p className="text-xs text-text-secondary">{tNew.customVariablesDescription}</p>
              </div>
            </Card>

            {detectedVariables.length > 0 && (
              <Card className="space-y-3">
                <div className="flex items-center gap-2">
                  <InformationCircleIcon className="h-4 w-4 text-text-secondary" />
                  <p className="text-sm font-medium text-text-body">
                    {tNew.variablesDetected} ({detectedVariables.length})
                  </p>
                </div>

                {contextVars.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-text-secondary">
                      <CheckmarkCircle01Icon className="mr-1 inline h-3.5 w-3.5" />
                      {tNew.autoResolved}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {contextVars.map((v) => (
                        <Badge key={v} variant="neutral">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {customVars.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-text-secondary">
                      <Megaphone01Icon className="mr-1 inline h-3.5 w-3.5" />
                      {tNew.toProvideOnSend}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {customVars.map((v) => (
                        <Badge key={v} variant="warning">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {!canSubmit && <p className="text-sm text-text-secondary">{tNew.submitHint}</p>}
          <div className="flex gap-3 sm:ml-auto">
            <Button type="button" variant="secondary" onClick={() => router.push("/templates")}>
              {tNew.cancel}
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={!canSubmit}>
              {tNew.create}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  )
}
