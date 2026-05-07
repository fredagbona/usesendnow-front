"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { apiClient as api, ApiClientError } from "@usesendnow/api-client"
import type { Template, TemplateType } from "@usesendnow/types"
import { fadeIn } from "@/lib/animations"
import { parseTemplateVariables } from "@/lib/templateEngine"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import Alert from "@/components/ui/Alert"
import Badge from "@/components/ui/Badge"
import { TemplateVariableGuide } from "@/components/templates/TemplateVariableGuide"
import { HighlightedTemplateBody } from "@/components/templates/HighlightedTemplateBody"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { toast } from "@/lib/toast"
import { ArrowLeft01Icon, File01Icon, InformationCircleIcon } from "hugeicons-react"

const TEMPLATE_TYPES: TemplateType[] = ["text", "image", "video", "audio", "document"]

export default function TemplateEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { copy } = usePortalLocale()
  const t = copy.templates
  const d = t.detail
  const tNew = t.new

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [type, setType] = useState<TemplateType>("text")
  const [body, setBody] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await api.templates.get(params.id)
        if (!active) return
        setTemplate(data)
        setName(data.name)
        setType(data.type)
        setBody(data.body ?? "")
        setMediaUrl(data.mediaUrl ?? "")
      } catch (err) {
        if (!active) return
        if (err instanceof ApiClientError && err.code === "NOT_FOUND") {
          setError(d.loadNotFound)
        } else {
          setError(d.loadFailed)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [params.id, d.loadFailed, d.loadNotFound])

  const detectedVariables = useMemo(() => parseTemplateVariables(body), [body])
  const requiresMedia = type !== "text"
  const canSave = name.trim().length > 0 && (type === "text" ? body.trim().length > 0 : mediaUrl.trim().length > 0)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!template || !canSave) return

    setSaving(true)
    setError(null)
    try {
      const response = await api.templates.update(template.id, {
        name: name.trim(),
        body: body.trim() || null,
        mediaUrl: requiresMedia ? mediaUrl.trim() || null : null,
      })
      setTemplate(response)
      toast.success(t.templateUpdated)
      router.push(`/templates/${template.id}`)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TEMPLATE_INVALID") {
        setError(t.invalidTemplate)
      } else if (err instanceof ApiClientError && err.code === "VALIDATION_ERROR") {
        setError(t.validationError)
      } else {
        setError(t.templateUpdateFailed)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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
        <Alert variant="error" message={error ?? d.loadNotFound} />
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title={t.editTitle}
        description={template.name}
        action={
          <Button variant="secondary" onClick={() => router.push(`/templates/${template.id}`)}>
            <ArrowLeft01Icon className="w-4 h-4 mr-1.5" />
            {d.back}
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-4 border-primary/20 bg-primary-subtle">
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-text">{tNew.variableSyntax}</h3>
          </div>
          <p className="text-sm text-text-secondary">{tNew.variableSyntaxDescription}</p>
          <div className="flex flex-wrap gap-2">
            {detectedVariables.length > 0 ? (
              detectedVariables.map((variable) => (
                <Badge key={variable} variant={variable.startsWith("custom.") ? "warning" : "blue"}>
                  {variable}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-text-muted">{tNew.customVariablesDescription}</p>
            )}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_420px]">
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center gap-2">
                <File01Icon className="h-5 w-5 text-primary-ink" />
                <div>
                  <p className="text-sm font-semibold text-text-body">{d.contentTitle}</p>
                  <p className="text-xs text-text-muted">{d.metaPrefix} {type}</p>
                </div>
              </div>

              <Input label={tNew.templateName} value={name} onChange={(e) => setName(e.target.value)} required autoFocus />

              <Select label={t.type} value={type} onChange={(e) => setType(e.target.value as TemplateType)}>
                {TEMPLATE_TYPES.map((templateType) => (
                  <option key={templateType} value={templateType}>
                    {d.typeLabels[templateType]}
                  </option>
                ))}
              </Select>

              <Textarea
                label={requiresMedia ? t.bodyOptional : t.body}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required={!requiresMedia}
                rows={8}
                placeholder={tNew.bodyPlaceholder}
              />

              {requiresMedia && (
                <Input
                  label={d.mediaUrlTitle}
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={t.mediaUrlPlaceholder}
                  required
                />
              )}

              <div className="rounded-xl border border-border bg-bg-subtle p-4 text-sm leading-7 text-text">
                <HighlightedTemplateBody body={body} />
              </div>

              {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
            </Card>
          </div>

          <div className="space-y-6">
            <TemplateVariableGuide variables={detectedVariables} title={copy.templates.variableGuide.detailPageTitle} />
            <Card className="space-y-3">
              <p className="text-sm font-semibold text-text-body">{d.categorizationTitle}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">{type}</Badge>
                {requiresMedia && <Badge variant="warning">{d.badgeMedia}</Badge>}
              </div>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push(`/templates/${template.id}`)}>
            {tNew.cancel}
          </Button>
          <Button type="submit" variant="primary" loading={saving} disabled={!canSave}>
            {t.save}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
