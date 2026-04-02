"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useMessages } from "@/hooks/useMessages"
import { useInstances } from "@/hooks/useInstances"
import { useTemplates } from "@/hooks/useTemplates"
import { useContacts } from "@/hooks/useContacts"
import { formatRelativeDate } from "@/lib/format"
import { entriesToVariableMap, getCustomVariables, getCustomVariableKey, variableMapToEntries, type CustomVariableEntry } from "@/lib/templateEngine"
import type { SendMessagePayload, MessageType, Template } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Alert from "@/components/ui/Alert"
import CustomVariableBuilder from "@/components/ui/CustomVariableBuilder"
import { MessageTextarea } from "@/components/ui/MessageTextarea"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonTableRow } from "@/components/ui/Skeleton"
import { Message01Icon, Upload01Icon, Delete02Icon } from "hugeicons-react"
import { apiClient, ApiClientError } from "@usesendnow/api-client"

const STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "purple" | "error"> = {
  queued: "neutral",
  sent: "blue",
  delivered: "success",
  read: "purple",
  failed: "error",
}

const STATUS_LABEL: Record<string, string> = {
  queued: "En file",
  sent: "Envoyé",
  delivered: "Livré",
  read: "Lu",
  failed: "Échoué",
}

const STATUSES = ["queued", "sent", "delivered", "read", "failed"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

const ACCEPTED_MIME: Partial<Record<MessageType, string[]>> = {
  image: ["image/jpeg", "image/png", "image/webp"],
  audio: ["audio/mpeg", "audio/ogg", "audio/aac"],
  voice_note: ["audio/ogg", "audio/mpeg"],
}

const ACCEPTED_LABELS: Partial<Record<MessageType, string>> = {
  image: "JPEG, PNG, WEBP",
  audio: "MP3, OGG, AAC",
  voice_note: "OGG, MP3",
  document: "PDF, DOCX, XLSX, ZIP ou tout fichier",
}

const MEDIA_FIELD_LABEL: Partial<Record<MessageType, string>> = {
  image: "Image",
  audio: "Fichier audio",
  voice_note: "Message vocal",
  document: "Document",
}

const TYPE_LABEL: Record<string, string> = {
  text: "Texte",
  image: "Image",
  document: "Document",
}

const FILE_UPLOAD_TYPES: MessageType[] = ["image", "document"]

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`
}

type ComposeMode = "freeform" | "template"
type RecipientMode = "manual" | "contact"

export default function MessagesPage() {
  const router = useRouter()
  const [instanceFilter, setInstanceFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const { messages, loading, loadingMore, hasMore, loadMore, prependMessage } = useMessages({
    instanceId: instanceFilter || undefined,
    status: statusFilter || undefined,
  })
  const { instances } = useInstances()
  const { templates } = useTemplates()
  const { contacts } = useContacts()
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [composeMode, setComposeMode] = useState<ComposeMode>("freeform")
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("manual")
  const [sending, setSending] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [templatePreview, setTemplatePreview] = useState<string | null>(null)
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
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const connectedInstances = instances.filter((instance) => instance.status === "connected")
  const selectedTemplate = useMemo<Template | null>(
    () => templates.find((template) => template.id === sendForm.templateId) ?? null,
    [sendForm.templateId, templates]
  )
  const selectedTemplateCustomVars = useMemo(
    () => selectedTemplate ? getCustomVariables(selectedTemplate.variables) : [],
    [selectedTemplate]
  )

  const resetMediaState = () => {
    setMediaFile(null)
    setConverting(false)
    setMediaError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const resetModalState = () => {
    setSendForm({
      instanceId: "",
      to: "",
      type: "text",
      text: "",
      mediaUrl: "",
      scheduledAt: "",
      templateId: "",
      contactId: "",
    })
    setComposeMode("freeform")
    setRecipientMode("manual")
    setTemplateVariables([])
    setTemplatePreview(null)
    setPreviewError(null)
    resetMediaState()
  }

  const handleCloseModal = () => {
    setSendModalOpen(false)
    resetModalState()
  }

  const handleTypeChange = (type: MessageType) => {
    setSendForm((prev) => ({ ...prev, type, mediaUrl: "", text: "" }))
    resetMediaState()
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setMediaError(null)
    if (file.size > MAX_FILE_SIZE) {
      setMediaError("Fichier trop volumineux. Maximum 5 Mo.")
      event.target.value = ""
      return
    }

    const accepted = ACCEPTED_MIME[sendForm.type] ?? []
    if (accepted.length > 0 && !accepted.includes(file.type)) {
      setMediaError(`Format non supporté. Accepté : ${ACCEPTED_LABELS[sendForm.type] ?? ""}.`)
      event.target.value = ""
      return
    }

    setMediaFile(file)
    setConverting(true)
    try {
      const base64 = await fileToBase64(file)
      setSendForm((prev) => ({ ...prev, mediaUrl: base64 }))
    } catch {
      setMediaError("Impossible de lire le fichier. Réessayez.")
      setMediaFile(null)
    } finally {
      setConverting(false)
    }
  }

  const handleRemoveFile = () => {
    setSendForm((prev) => ({ ...prev, mediaUrl: "" }))
    resetMediaState()
  }

  const handleRefreshPreview = async () => {
    if (!selectedTemplate) return
    setPreviewLoading(true)
    setPreviewError(null)
    try {
      const data = await apiClient.templates.preview(selectedTemplate.id, {
        instanceId: sendForm.instanceId || undefined,
        contactId: sendForm.contactId || undefined,
        variables: entriesToVariableMap(templateVariables),
      })
      setTemplatePreview(data.rendered)
      if (!data.valid && data.missingVariables.length > 0) {
        setPreviewError(`Variables manquantes : ${data.missingVariables.join(", ")}`)
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TEMPLATE_INVALID") {
        setPreviewError("Le template sélectionné est invalide.")
      } else {
        setPreviewError("Impossible de générer l’aperçu du template.")
      }
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()
    if (composeMode === "freeform" && FILE_UPLOAD_TYPES.includes(sendForm.type) && !sendForm.mediaUrl) {
      setMediaError("Veuillez sélectionner un fichier.")
      return
    }

    setSending(true)
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

      const message = await apiClient.messages.send(payload)
      prependMessage(message)
      toast.success("Message en file d’attente")
      handleCloseModal()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "TEMPLATE_VARIABLES_MISSING") {
          toast.error("Certaines variables du template sont manquantes. Complétez le contact ou les variables custom.")
        } else if (err.code === "TEMPLATE_CONTEXT_UNAVAILABLE") {
          toast.error("Le contact ou l’instance sélectionné est indisponible pour le rendu.")
        } else if (err.code === "TEMPLATE_INVALID") {
          toast.error("Le template sélectionné est invalide.")
        } else if (err.code === "MONTHLY_OUTBOUND_QUOTA_EXCEEDED") {
          toast.error("Quota mensuel épuisé. Mettez à niveau votre plan.")
        } else if (err.code === "NOT_FOUND") {
          toast.error("Instance ou template introuvable.")
        } else {
          toast.error("Impossible d’envoyer le message.")
        }
      } else {
        toast.error("Impossible d’envoyer le message.")
      }
    } finally {
      setSending(false)
    }
  }

  const isFileUploadType = FILE_UPLOAD_TYPES.includes(sendForm.type)

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title="Messages"
        description="Tous les messages envoyés depuis vos instances"
        action={<Button variant="primary" onClick={() => setSendModalOpen(true)}>Envoyer un message</Button>}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={instanceFilter} onChange={(event) => setInstanceFilter(event.target.value)} className="w-48">
          <option value="">Toutes les instances</option>
          {instances.map((instance) => (
            <option key={instance.id} value={instance.id}>{instance.name}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-44">
          <option value="">Tous les statuts</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{STATUS_LABEL[status] ?? status}</option>
          ))}
        </Select>
      </div>

      <Card>
        {loading ? (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Destinataire", "Type", "Aperçu", "Statut", "Date"].map((header) => (
                      <th key={header} className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{[1, 2, 3, 4, 5].map((index) => <SkeletonTableRow key={index} cols={5} />)}</tbody>
              </table>
            </div>
            <div className="space-y-2 sm:hidden">
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center gap-3 rounded-xl border border-border p-3 animate-pulse">
                  <div className="h-5 w-16 rounded-full bg-bg-muted" />
                  <div className="h-4 flex-1 rounded bg-bg-muted" />
                  <div className="h-3 w-10 rounded bg-bg-muted" />
                </div>
              ))}
            </div>
          </>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<Message01Icon className="w-8 h-8" />}
            title="Aucun message trouvé"
            description={statusFilter || instanceFilter ? "Aucun message ne correspond à vos filtres." : "Aucun message envoyé pour l’instant."}
            ctaLabel="Envoyer un message"
            onCta={() => setSendModalOpen(true)}
          />
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Destinataire", "Type", "Aperçu", "Statut", "Date"].map((header) => (
                      <th key={header} className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr
                      key={message.id}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-bg-subtle"
                      onClick={() => router.push(`/messages/${message.id}`)}
                    >
                      <td className="py-3 pr-4 text-sm font-mono text-text">{message.to}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="neutral">{TYPE_LABEL[message.type] ?? message.type}</Badge>
                          {message.meta?.templateId && <Badge variant="warning">Template</Badge>}
                        </div>
                      </td>
                      <td className="max-w-xs py-3 pr-4 text-sm text-text-secondary">
                        <div className="truncate">{message.body ? message.body.slice(0, 50) : "[média]"}</div>
                        {message.meta?.templateId && (
                          <div className="mt-1 text-xs text-text-muted">Généré depuis un template</div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>{STATUS_LABEL[message.status] ?? message.status}</Badge>
                      </td>
                      <td className="whitespace-nowrap py-3 text-sm text-text-muted">{formatRelativeDate(message.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border sm:hidden">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => router.push(`/messages/${message.id}`)}
                  className="flex w-full items-start justify-between gap-3 py-3 text-left transition-colors hover:bg-bg-subtle"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>{STATUS_LABEL[message.status] ?? message.status}</Badge>
                      <Badge variant="neutral">{TYPE_LABEL[message.type] ?? message.type}</Badge>
                      {message.meta?.templateId && <Badge variant="warning">Template</Badge>}
                    </div>
                    <p className="truncate text-sm font-mono text-text">{message.to}</p>
                    {message.body && <p className="mt-0.5 truncate text-xs text-text-muted">{message.body.slice(0, 60)}</p>}
                  </div>
                  <span className="mt-0.5 shrink-0 text-xs text-text-muted">{formatRelativeDate(message.createdAt)}</span>
                </button>
              ))}
            </div>

            {hasMore && (
              <div className="pt-4 text-center">
                <Button variant="secondary" loading={loadingMore} onClick={loadMore}>Charger plus</Button>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={sendModalOpen} onClose={handleCloseModal} title="Envoyer un message" maxWidth="max-w-2xl">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="flex gap-1 rounded-xl bg-bg-muted p-1 w-fit">
            {([
              { value: "freeform", label: "Rédaction libre" },
              { value: "template", label: "Utiliser un template" },
            ] as const).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
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
            <Select label="Instance" value={sendForm.instanceId} onChange={(event) => setSendForm((prev) => ({ ...prev, instanceId: event.target.value }))} required>
              <option value="">Sélectionner une instance...</option>
              {connectedInstances.map((instance) => (
                <option key={instance.id} value={instance.id}>{instance.name}</option>
              ))}
            </Select>
            <div className="space-y-3">
              <p className="text-sm font-medium text-text-body">Destinataire</p>
              <div className="flex gap-1 rounded-xl bg-bg-muted p-1 w-fit">
                {([
                  { value: "manual", label: "Nouveau numéro" },
                  { value: "contact", label: "Contact enregistré" },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRecipientModeChange(option.value)}
                    className={[
                      "rounded-lg px-4 py-1.5 text-sm font-medium transition-all cursor-pointer",
                      recipientMode === option.value
                        ? "bg-bg border border-border text-text shadow-sm"
                        : "text-text-secondary hover:text-text",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {recipientMode === "contact" ? (
                <Select
                  label="Choisir un contact"
                  value={sendForm.contactId}
                  onChange={(event) => handleContactRecipientChange(event.target.value)}
                  required
                >
                  <option value="">Sélectionner un contact...</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>{contact.name} · {contact.phone}</option>
                  ))}
                </Select>
              ) : (
                <Input
                  label="Destinataire (numéro)"
                  type="tel"
                  value={sendForm.to}
                  onChange={(event) => setSendForm((prev) => ({ ...prev, to: event.target.value, contactId: "" }))}
                  placeholder="+22912345678"
                  required
                />
              )}
            </div>
          </div>

          {connectedInstances.length === 0 && <p className="text-xs text-warning">Aucune instance connectée disponible.</p>}
          {recipientMode === "contact" && contacts.length === 0 && (
            <p className="text-xs text-warning">Aucun contact enregistré disponible. Ajoutez un contact ou utilisez un nouveau numéro.</p>
          )}

          {composeMode === "template" ? (
            <>
              <Select label="Template" value={sendForm.templateId} onChange={(event) => handleTemplateChange(event.target.value)} required>
                <option value="">Sélectionner un template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </Select>

              {selectedTemplate && (
                <>
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

                  {selectedTemplateCustomVars.length > 0 && (
                    <CustomVariableBuilder
                      entries={templateVariables.length > 0 ? templateVariables : selectedTemplateCustomVars.map((variable) => ({ key: getCustomVariableKey(variable), value: "" }))}
                      onChange={setTemplateVariables}
                      hint="Renseignez uniquement les valeurs pour les variables custom.*"
                    />
                  )}

                  <div className="rounded-xl border border-border bg-bg-subtle p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-text-body">Aperçu du rendu</p>
                      <Button type="button" variant="secondary" size="sm" loading={previewLoading} onClick={handleRefreshPreview}>
                        Actualiser l’aperçu
                      </Button>
                    </div>
                    <div className="min-h-24 text-sm leading-6 text-text">
                      {templatePreview ?? <span className="text-text-muted">Aucun aperçu généré pour le moment.</span>}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <Select label="Type de message" value={sendForm.type} onChange={(event) => handleTypeChange(event.target.value as MessageType)}>
                {(["text", "image", "document"] as MessageType[]).map((type) => (
                  <option key={type} value={type}>{TYPE_LABEL[type] ?? type}</option>
                ))}
              </Select>

              {sendForm.type === "text" && (
                <div>
                  <MessageTextarea
                    label="Texte"
                    value={sendForm.text}
                    onChange={(value) => setSendForm((prev) => ({ ...prev, text: value }))}
                    placeholder="Votre message..."
                    rows={3}
                    maxLength={4096}
                  />
                  {sendForm.text.length === 0 && <input type="text" required className="sr-only" tabIndex={-1} aria-hidden="true" />}
                </div>
              )}

              {isFileUploadType && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-body">{MEDIA_FIELD_LABEL[sendForm.type]}</label>
                  <div className="rounded-xl border border-dashed border-border-strong bg-bg-subtle p-4">
                    {converting ? (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-sm text-text-secondary">Conversion en cours...</span>
                      </div>
                    ) : mediaFile && sendForm.mediaUrl ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text">{mediaFile.name}</p>
                          <p className="text-xs text-text-muted">{formatBytes(mediaFile.size)}</p>
                        </div>
                        <button type="button" onClick={handleRemoveFile} className="shrink-0 cursor-pointer p-1 text-text-muted transition-colors hover:text-error">
                          <Delete02Icon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center gap-1.5 py-2">
                        <Upload01Icon className="h-5 w-5 text-text-muted" />
                        <span className="text-sm font-medium text-primary-ink">Choisir un fichier</span>
                        <span className="text-center text-xs text-text-muted">{ACCEPTED_LABELS[sendForm.type]} · max 5 Mo</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept={ACCEPTED_MIME[sendForm.type]?.join(",") ?? undefined}
                          onChange={handleFileSelect}
                        />
                      </label>
                    )}
                  </div>
                  {mediaError && <p className="text-xs text-error">{mediaError}</p>}
                </div>
              )}

              {sendForm.type !== "text" && (
                <MessageTextarea
                  label="Légende (optionnel)"
                  value={sendForm.text}
                  onChange={(value) => setSendForm((prev) => ({ ...prev, text: value }))}
                  placeholder="Ajouter une légende..."
                  rows={2}
                  maxLength={1024}
                />
              )}

              <Input
                label="Planifier (optionnel)"
                type="datetime-local"
                value={sendForm.scheduledAt}
                onChange={(event) => setSendForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              />
            </>
          )}

          {previewError && <Alert variant="warning" message={previewError} onClose={() => setPreviewError(null)} />}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
            <Button type="submit" variant="primary" loading={sending || converting}>
              {composeMode === "template" ? "Envoyer le template" : sendForm.scheduledAt ? "Planifier" : "Envoyer"}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
