"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { apiClient as api, ApiClientError } from "@usesendnow/api-client"
import type { Template, TemplatePreviewResponse } from "@usesendnow/types"
import { fadeIn } from "@/lib/animations"
import { entriesToVariableMap, getAutomaticVariables, getCustomVariables, variableMapToEntries, type CustomVariableEntry } from "@/lib/templateEngine"
import { useInstances } from "@/hooks/useInstances"
import { useContacts } from "@/hooks/useContacts"
import { formatDate } from "@/lib/format"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Select from "@/components/ui/Select"
import Alert from "@/components/ui/Alert"
import CustomVariableBuilder from "@/components/ui/CustomVariableBuilder"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { ArrowLeft01Icon, File01Icon } from "hugeicons-react"
import { HighlightedTemplateBody } from "@/components/templates/HighlightedTemplateBody"
import { TemplateVariableGuide } from "@/components/templates/TemplateVariableGuide"

const TYPE_LABEL: Record<Template["type"], string> = {
  text: "Texte",
  image: "Image",
  video: "Vidéo",
  audio: "Audio",
  document: "Document",
}

export default function TemplateDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { instances } = useInstances()
  const { contacts } = useContacts()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(true)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [instanceId, setInstanceId] = useState("")
  const [contactId, setContactId] = useState("")
  const [customEntries, setCustomEntries] = useState<CustomVariableEntry[]>([])
  const [preview, setPreview] = useState<TemplatePreviewResponse | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadTemplate = async () => {
      setLoadingTemplate(true)
      setTemplateError(null)
      try {
        const data = await api.templates.get(params.id)
        if (!active) return
        setTemplate(data)
        setCustomEntries(variableMapToEntries(undefined, data.variables))
      } catch (error) {
        if (!active) return
        if (error instanceof ApiClientError && error.code === "NOT_FOUND") {
          setTemplateError("Template introuvable.")
        } else {
          setTemplateError("Impossible de charger le template.")
        }
      } finally {
        if (active) {
          setLoadingTemplate(false)
        }
      }
    }

    loadTemplate()

    return () => {
      active = false
    }
  }, [params.id])

  const automaticVariables = useMemo(
    () => getAutomaticVariables(template?.variables ?? []),
    [template?.variables]
  )
  const customVariables = useMemo(
    () => getCustomVariables(template?.variables ?? []),
    [template?.variables]
  )

  const refreshPreview = async () => {
    if (!template) return

    setLoadingPreview(true)
    setPreviewError(null)
    try {
      const data = await api.templates.preview(template.id, {
        instanceId: instanceId || undefined,
        contactId: contactId || undefined,
        variables: entriesToVariableMap(customEntries),
      })
      setPreview(data)
    } catch (error) {
      if (error instanceof ApiClientError && error.code === "TEMPLATE_INVALID") {
        setPreviewError("Ce template contient des placeholders invalides ou une configuration média incomplète.")
      } else {
        setPreviewError("Impossible de générer l’aperçu.")
      }
    } finally {
      setLoadingPreview(false)
    }
  }

  if (loadingTemplate) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
        <SkeletonCard />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </motion.div>
    )
  }

  if (!template) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
        <PageHeader
          title="Aperçu du template"
          description="Détail du template"
          action={
            <Button variant="ghost" onClick={() => router.push("/templates")}>
              <ArrowLeft01Icon className="h-4 w-4" />
              Retour
            </Button>
          }
        />
        <Alert variant="error" message={templateError ?? "Template introuvable."} />
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title={template.name}
        description={`Template ${TYPE_LABEL[template.type].toLowerCase()} · Modifié le ${formatDate(template.updatedAt)}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/templates")}>
              <ArrowLeft01Icon className="h-4 w-4" />
              Retour
            </Button>
            <Button variant="primary" loading={loadingPreview} onClick={refreshPreview}>
              Actualiser l’aperçu
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_420px]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral">{TYPE_LABEL[template.type]}</Badge>
              {template.type !== "text" && <Badge variant="warning">Média</Badge>}
              {template.mediaUrl && <Badge variant="blue">Media URL fournie</Badge>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-body">Contenu du template</p>
              <div className="rounded-xl border border-border bg-bg-subtle p-4 text-sm leading-7 text-text">
                <HighlightedTemplateBody body={template.body} />
              </div>
            </div>

            {template.mediaUrl && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-body">Media URL</p>
                <div className="rounded-xl border border-border bg-bg-subtle p-4 text-sm text-text-secondary break-all">
                  {template.mediaUrl}
                </div>
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <File01Icon className="h-5 w-5 text-primary-ink" />
              <div>
                <p className="text-sm font-semibold text-text-body">Rendu backend</p>
                <p className="text-xs text-text-muted">Prévisualisez le rendu réel du template avec un contact, une instance et des variables custom.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Instance (optionnel)" value={instanceId} onChange={(event) => setInstanceId(event.target.value)}>
                <option value="">Aucune</option>
                {instances.map((instance) => (
                  <option key={instance.id} value={instance.id}>{instance.name}</option>
                ))}
              </Select>
              <Select label="Contact (optionnel)" value={contactId} onChange={(event) => setContactId(event.target.value)}>
                <option value="">Aucun</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>{contact.name} · {contact.phone}</option>
                ))}
              </Select>
            </div>

            {customVariables.length > 0 && (
              <CustomVariableBuilder
                entries={customEntries}
                onChange={setCustomEntries}
                hint="Saisissez uniquement les variables custom.* demandées par le template."
              />
            )}

            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-body">Rendu généré</p>
              <div className="min-h-52 rounded-xl border border-border bg-bg-subtle p-5 text-sm leading-7 text-text">
                {preview
                  ? (preview.rendered || <span className="text-text-muted">Aucun rendu</span>)
                  : <span className="text-text-muted">Lancez un aperçu pour voir le rendu backend du template.</span>}
              </div>

              {preview?.missingVariables.length ? (
                <Alert
                  variant="warning"
                  title="Variables manquantes"
                  message={preview.missingVariables.join(", ")}
                />
              ) : null}

              {previewError && (
                <Alert variant="error" message={previewError} onClose={() => setPreviewError(null)} />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <TemplateVariableGuide variables={template.variables} title="Variables du template" />

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-text-body">Catégorisation</p>
              <p className="mt-1 text-xs text-text-muted">Vue synthétique des variables calculées par l’API.</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">Automatiques</p>
                <p className="text-sm text-text-secondary">
                  {automaticVariables.length > 0 ? automaticVariables.join(", ") : "Aucune variable automatique."}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">À fournir</p>
                <p className="text-sm text-text-secondary">
                  {customVariables.length > 0 ? customVariables.join(", ") : "Aucune variable custom.*."}
                </p>
              </div>
              {preview && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">État du rendu</p>
                  <p className="text-sm text-text-secondary">{preview.valid ? "Valide" : "Invalide"}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
