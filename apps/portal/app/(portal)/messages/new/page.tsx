"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/lib/toast"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { MessageType, SendMessagePayload, Template, UploadedMedia } from "@usesendnow/types"
import { useContacts } from "@/hooks/useContacts"
import { useInstances } from "@/hooks/useInstances"
import { useTemplates } from "@/hooks/useTemplates"
import { entriesToVariableMap, getCustomVariables, getCustomVariableKey, variableMapToEntries, type CustomVariableEntry } from "@/lib/templateEngine"
import { ACCEPTED_MIME, ACCEPTED_LABELS, FILE_LIMITS, FILE_UPLOAD_TYPES, GLOBAL_MAX_FILE_SIZE, TYPE_LABEL, formatBytes } from "@/lib/messageComposer"
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

type ComposeMode = "freeform" | "template"

export default function NewMessagePage() {
  const router = useRouter()
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
  const [statusMessage, setStatusMessage] = useState("Prêt à composer un message.")
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
    setStatusMessage("Type de message mis à jour.")
  }

  const uploadMediaFile = async (file: File, nextType?: MessageType) => {
    setMediaError(null)
    setMediaNotice(null)

    const targetType = nextType ?? sendForm.type
    const maxSize = FILE_LIMITS[targetType] ?? GLOBAL_MAX_FILE_SIZE
    if (file.size > GLOBAL_MAX_FILE_SIZE || file.size > maxSize) {
      setMediaError(targetType === "voice_note"
        ? "La note vocale est trop longue. Limitez-vous à 15 minutes."
        : `Fichier trop volumineux. Maximum ${formatBytes(maxSize)}.`)
      return
    }

    const accepted = ACCEPTED_MIME[targetType] ?? []
    if (accepted.length > 0 && !accepted.includes(file.type)) {
      setMediaError(`Format non supporté. Accepté : ${ACCEPTED_LABELS[targetType] ?? ""}.`)
      return
    }

    if (uploadedMediaRef.current) {
      void apiClient.media.delete(uploadedMediaRef.current.id).catch(() => {})
      setMediaNotice("Le précédent fichier temporaire sera remplacé par le nouveau.")
    }

    shouldCleanupMediaRef.current = true
    setUploading(true)
    setUploadProgress(0)
    setStatusMessage("Upload du média en cours...")

    try {
      const media = await apiClient.media.upload(file, setUploadProgress)
      setUploadedMedia(media)
      setSendForm((prev) => ({
        ...prev,
        type: nextType ?? (media.suggestedMessageType === "voice_note" && prev.type === "audio" ? "voice_note" : prev.type),
        mediaUrl: media.url,
      }))
      setStatusMessage("Média prêt. Vous pouvez relire puis envoyer.")
      if (media.suggestedMessageType === "voice_note" && targetType === "audio") {
        setMediaNotice("Le fichier ressemble à une note vocale. Le type a été prérempli en conséquence.")
      }
      toast.success("Fichier uploadé avec succès.")
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "MEDIA_FILE_MISSING") {
          setMediaError("Aucun fichier sélectionné.")
        } else if (err.code === "MEDIA_TYPE_NOT_ALLOWED") {
          setMediaError("Ce format de fichier n’est pas supporté.")
        } else if (err.code === "MEDIA_TOO_LARGE") {
          setMediaError("Le fichier dépasse la taille maximale autorisée.")
        } else if (err.code === "MEDIA_UPLOAD_NOT_CONFIGURED") {
          setMediaError("L’upload média n’est pas disponible pour le moment.")
        } else {
          setMediaError("L’upload du fichier a échoué. Réessayez.")
        }
      } else {
        setMediaError("L’upload du fichier a échoué. Réessayez.")
      }
      setStatusMessage("Échec de l’upload média.")
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
    setStatusMessage("Média supprimé. Vous pouvez en choisir un autre.")
  }

  const handleRefreshPreview = async () => {
    if (!selectedTemplate) return
    setPreviewLoading(true)
    setPreviewError(null)
    setStatusMessage("Génération de l’aperçu du template...")
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
      setStatusMessage("Aperçu du template actualisé.")
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TEMPLATE_INVALID") {
        setPreviewError("Le template sélectionné est invalide.")
      } else {
        setPreviewError("Impossible de générer l’aperçu du template.")
      }
      setStatusMessage("Impossible de générer l’aperçu.")
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()

    if (composeMode === "freeform" && FILE_UPLOAD_TYPES.includes(sendForm.type) && !sendForm.mediaUrl) {
      setMediaError("Aucun fichier sélectionné.")
      return
    }

    if (composeMode === "freeform" && sendForm.scheduledAt && uploadedMedia) {
      const scheduledAt = new Date(sendForm.scheduledAt)
      const expiresAt = new Date(uploadedMedia.expiresAt)
      if (scheduledAt.getTime() > expiresAt.getTime()) {
        setMediaError("Le média doit rester valide jusqu’à l’envoi. Si la date prévue dépasse l’expiration, l’envoi peut échouer.")
        return
      }
    }

    setSending(true)
    setStatusMessage(sendForm.scheduledAt ? "Programmation du message..." : "Envoi du message...")

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
      toast.success(sendForm.scheduledAt ? "Message programmé avec succès." : "Message envoyé avec succès.")
      router.push("/messages")
      router.refresh()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "TEMPLATE_VARIABLES_MISSING") {
          toast.error("Certaines variables du template sont manquantes.")
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
      setStatusMessage("Échec de l’envoi. Corrigez les champs puis réessayez.")
    } finally {
      setSending(false)
    }
  }

  const isFileUploadType = FILE_UPLOAD_TYPES.includes(sendForm.type)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nouveau message"
        description="Envoyez immédiatement ou programmez un message avec suivi d’upload et statut d’action."
        action={<Button variant="secondary" onClick={() => router.push("/messages")}>Retour aux messages</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
        <form onSubmit={handleSend} className="space-y-6">
          <Card className="space-y-5">
            <div className="flex gap-1 rounded-xl bg-bg-muted p-1 w-fit">
              {([
                { value: "freeform", label: "Rédaction libre" },
                { value: "template", label: "Utiliser un template" },
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
              <Select label="Instance" value={sendForm.instanceId} onChange={(event) => setSendForm((prev) => ({ ...prev, instanceId: event.target.value }))} required>
                <option value="">Sélectionner une instance...</option>
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

            {connectedInstances.length === 0 && <p className="text-xs text-warning">Aucune instance connectée disponible.</p>}
          </Card>

          {composeMode === "template" ? (
            <Card className="space-y-5">
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
                        <span key={variable} className="rounded-full border border-border bg-bg-subtle px-3 py-1 text-xs text-text-secondary">
                          {variable.startsWith("custom.") ? `${variable} · à saisir` : `${variable} · contexte`}
                        </span>
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
            </Card>
          ) : (
            <Card className="space-y-5">
              <Select label="Type de message" value={sendForm.type} onChange={(event) => handleTypeChange(event.target.value as MessageType)}>
                {(["text", "image", "video", "document", "audio", "voice_note"] as MessageType[]).map((type) => (
                  <option key={type} value={type}>{TYPE_LABEL[type] ?? type}</option>
                ))}
              </Select>

              {sendForm.type === "text" ? (
                <div>
                  <MessageTextarea
                    label="Texte"
                    value={sendForm.text}
                    onChange={(value) => setSendForm((prev) => ({ ...prev, text: value }))}
                    placeholder="Votre message..."
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
                        onUpload={(file) => uploadMediaFile(file, "voice_note")}
                        onResetUploadState={() => {
                          releaseUploadedMedia()
                          setSendForm((prev) => ({ ...prev, mediaUrl: "" }))
                          resetMediaState()
                          setStatusMessage("Prêt à enregistrer une nouvelle note vocale.")
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
                      label="Légende (optionnel)"
                      value={sendForm.text}
                      onChange={(value) => setSendForm((prev) => ({ ...prev, text: value }))}
                      placeholder="Ajouter une légende ou un contexte..."
                      rows={3}
                      maxLength={1024}
                    />
                  )}
                </>
              )}

              <Input
                label="Planifier (optionnel)"
                type="datetime-local"
                value={sendForm.scheduledAt}
                onChange={(event) => setSendForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              />
            </Card>
          )}

          {previewError && <Alert variant="warning" message={previewError} onClose={() => setPreviewError(null)} />}

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/messages")}>Annuler</Button>
            <Button type="submit" variant="primary" loading={sending || uploading}>
              {composeMode === "template" ? "Envoyer le template" : sendForm.scheduledAt ? "Planifier le message" : "Envoyer le message"}
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <SendStatusPanel
            uploadProgress={uploading ? uploadProgress : uploadedMedia ? 100 : 0}
            uploadStatus={uploading ? "En cours" : uploadedMedia ? "Terminé" : "En attente"}
            sendStatus={statusMessage}
            mediaExpiresAt={uploadedMedia?.expiresAt ?? null}
          />

          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Bonnes pratiques</p>
              <h3 className="mt-2 text-lg font-semibold uppercase text-text">Avant l’envoi</h3>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-text-secondary">
              <li>Vérifiez que l’instance est bien connectée avant de lancer l’envoi.</li>
              <li>Pour un média temporaire, gardez une date planifiée avant son expiration.</li>
              <li>Les liens médias sont publics. Évitez les documents sensibles.</li>
              <li>Une note vocale peut être envoyée comme `audio` ou `note vocale` selon votre besoin.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
