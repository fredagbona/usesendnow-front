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
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
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
  const { locale } = usePortalLocale()
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
          setTemplateError(locale === "fr" ? "Template introuvable." : "Template not found.")
        } else {
          setTemplateError(locale === "fr" ? "Impossible de charger le template." : "Unable to load the template.")
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
          setPreviewError(locale === "fr" ? "Ce template contient des placeholders invalides ou une configuration média incomplète." : "This template contains invalid placeholders or an incomplete media setup.")
        } else {
          setPreviewError(locale === "fr" ? "Impossible de générer l’aperçu." : "Unable to generate the preview.")
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
          title={locale === "fr" ? "Aperçu du template" : "Template preview"}
          description={locale === "fr" ? "Détail du template" : "Template details"}
          action={
            <Button variant="ghost" onClick={() => router.push("/templates")}>
              <ArrowLeft01Icon className="h-4 w-4" />
              {locale === "fr" ? "Retour" : "Back"}
            </Button>
          }
        />
        <Alert variant="error" message={templateError ?? (locale === "fr" ? "Template introuvable." : "Template not found.")} />
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
              {locale === "fr" ? "Retour" : "Back"}
            </Button>
            <Button variant="primary" loading={loadingPreview} onClick={refreshPreview}>
              {locale === "fr" ? "Actualiser l’aperçu" : "Refresh preview"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_420px]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral">{TYPE_LABEL[template.type]}</Badge>
              {template.type !== "text" && <Badge variant="warning">{locale === "fr" ? "Média" : "Media"}</Badge>}
              {template.mediaUrl && <Badge variant="blue">{locale === "fr" ? "Media URL fournie" : "Media URL provided"}</Badge>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-body">{locale === "fr" ? "Contenu du template" : "Template content"}</p>
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
                <p className="text-sm font-semibold text-text-body">{locale === "fr" ? "Rendu backend" : "Backend rendering"}</p>
                <p className="text-xs text-text-muted">{locale === "fr" ? "Prévisualisez le rendu réel du template avec un contact, une instance et des variables custom." : "Preview the actual template rendering with a contact, an instance and custom variables."}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select label={locale === "fr" ? "Instance (optionnel)" : "Instance (optional)"} value={instanceId} onChange={(event) => setInstanceId(event.target.value)}>
                <option value="">{locale === "fr" ? "Aucune" : "None"}</option>
                {instances.map((instance) => (
                  <option key={instance.id} value={instance.id}>{instance.name}</option>
                ))}
              </Select>
              <Select label={locale === "fr" ? "Contact (optionnel)" : "Contact (optional)"} value={contactId} onChange={(event) => setContactId(event.target.value)}>
                <option value="">{locale === "fr" ? "Aucun" : "None"}</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>{contact.name} · {contact.phone}</option>
                ))}
              </Select>
            </div>

            {customVariables.length > 0 && (
              <CustomVariableBuilder
                entries={customEntries}
                onChange={setCustomEntries}
                hint={locale === "fr" ? "Saisissez uniquement les variables custom.* demandées par le template." : "Enter only the custom.* variables required by the template."}
              />
            )}

            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-body">{locale === "fr" ? "Rendu généré" : "Generated rendering"}</p>
              <div className="min-h-52 rounded-xl border border-border bg-bg-subtle p-5 text-sm leading-7 text-text">
                {preview
                  ? (preview.rendered || <span className="text-text-muted">{locale === "fr" ? "Aucun rendu" : "No rendering yet"}</span>)
                  : <span className="text-text-muted">{locale === "fr" ? "Lancez un aperçu pour voir le rendu backend du template." : "Run a preview to see the backend rendering of the template."}</span>}
              </div>

              {preview?.missingVariables.length ? (
                <Alert
                  variant="warning"
                  title={locale === "fr" ? "Variables manquantes" : "Missing variables"}
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
          <TemplateVariableGuide variables={template.variables} title={locale === "fr" ? "Variables du template" : "Template variables"} />

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-text-body">{locale === "fr" ? "Catégorisation" : "Categorization"}</p>
              <p className="mt-1 text-xs text-text-muted">{locale === "fr" ? "Vue synthétique des variables calculées par l’API." : "Summary view of the variables computed by the API."}</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{locale === "fr" ? "Automatiques" : "Automatic"}</p>
                <p className="text-sm text-text-secondary">
                  {automaticVariables.length > 0 ? automaticVariables.join(", ") : (locale === "fr" ? "Aucune variable automatique." : "No automatic variables.")}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{locale === "fr" ? "À fournir" : "To provide"}</p>
                <p className="text-sm text-text-secondary">
                  {customVariables.length > 0 ? customVariables.join(", ") : (locale === "fr" ? "Aucune variable custom.*." : "No custom.* variables.")}
                </p>
              </div>
              {preview && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{locale === "fr" ? "État du rendu" : "Rendering state"}</p>
                  <p className="text-sm text-text-secondary">{preview.valid ? (locale === "fr" ? "Valide" : "Valid") : (locale === "fr" ? "Invalide" : "Invalid")}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
