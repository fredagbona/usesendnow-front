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

export default function TemplateDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { copy } = usePortalLocale()
  const d = copy.templates.detail
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

  const typeLabel = (type: Template["type"]) =>
    (d.typeLabels as Record<string, string>)[type] ?? type

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
          setTemplateError(d.loadNotFound)
        } else {
          setTemplateError(d.loadFailed)
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
  }, [params.id, d.loadNotFound, d.loadFailed])

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
        setPreviewError(d.previewInvalid)
      } else {
        setPreviewError(d.previewFailed)
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
          title={d.errorPageTitle}
          description={d.errorPageDescription}
          action={
            <Button variant="ghost" onClick={() => router.push("/templates")}>
              <ArrowLeft01Icon className="h-4 w-4" />
              {d.back}
            </Button>
          }
        />
        <Alert variant="error" message={templateError ?? d.loadNotFound} />
      </motion.div>
    )
  }

  const headerDescription = `${d.metaPrefix} ${typeLabel(template.type).toLowerCase()} ${d.metaSeparator} ${d.metaModified} ${formatDate(template.updatedAt)}`

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title={template.name}
        description={headerDescription}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/templates")}>
              <ArrowLeft01Icon className="h-4 w-4" />
              {d.back}
            </Button>
            <Button variant="primary" loading={loadingPreview} onClick={refreshPreview}>
              {d.refreshPreview}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_420px]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral">{typeLabel(template.type)}</Badge>
              {template.type !== "text" && <Badge variant="warning">{d.badgeMedia}</Badge>}
              {template.mediaUrl && <Badge variant="blue">{d.badgeMediaUrl}</Badge>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-body">{d.contentTitle}</p>
              <div className="rounded-xl border border-border bg-bg-subtle p-4 text-sm leading-7 text-text">
                <HighlightedTemplateBody body={template.body} />
              </div>
            </div>

            {template.mediaUrl && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-body">{d.mediaUrlTitle}</p>
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
                <p className="text-sm font-semibold text-text-body">{d.backendTitle}</p>
                <p className="text-xs text-text-muted">{d.backendHint}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select label={d.instanceOptional} value={instanceId} onChange={(event) => setInstanceId(event.target.value)}>
                <option value="">{d.noneInstance}</option>
                {instances.map((instance) => (
                  <option key={instance.id} value={instance.id}>{instance.name}</option>
                ))}
              </Select>
              <Select label={d.contactOptional} value={contactId} onChange={(event) => setContactId(event.target.value)}>
                <option value="">{d.noneContact}</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>{contact.name} · {contact.phone}</option>
                ))}
              </Select>
            </div>

            {customVariables.length > 0 && (
              <CustomVariableBuilder
                entries={customEntries}
                onChange={setCustomEntries}
                hint={d.customVarsHint}
              />
            )}

            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-body">{d.generatedTitle}</p>
              <div className="min-h-52 rounded-xl border border-border bg-bg-subtle p-5 text-sm leading-7 text-text">
                {preview
                  ? (preview.rendered || <span className="text-text-muted">{d.noRendered}</span>)
                  : <span className="text-text-muted">{d.runPreviewHint}</span>}
              </div>

              {preview?.missingVariables.length ? (
                <Alert
                  variant="warning"
                  title={d.missingVariablesTitle}
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
          <TemplateVariableGuide variables={template.variables} title={copy.templates.variableGuide.detailPageTitle} />

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-text-body">{d.categorizationTitle}</p>
              <p className="mt-1 text-xs text-text-muted">{d.categorizationHint}</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{d.autoSection}</p>
                <p className="text-sm text-text-secondary">
                  {automaticVariables.length > 0 ? automaticVariables.join(", ") : d.noAutoVars}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{d.toProvideSection}</p>
                <p className="text-sm text-text-secondary">
                  {customVariables.length > 0 ? customVariables.join(", ") : d.noCustomVars}
                </p>
              </div>
              {preview && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{d.renderState}</p>
                  <p className="text-sm text-text-secondary">{preview.valid ? d.valid : d.invalid}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
