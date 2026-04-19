"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useTemplates } from "@/hooks/useTemplates"
import { formatDate } from "@/lib/format"
import { parseTemplateVariables } from "@/lib/templateEngine"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { portalCopy } from "@/lib/portal-copy"
import type { Template, TemplateType } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import EmptyState from "@/components/ui/EmptyState"
import Alert from "@/components/ui/Alert"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { HighlightedTemplateBody } from "@/components/templates/HighlightedTemplateBody"
import { TemplateVariableGuide } from "@/components/templates/TemplateVariableGuide"
import { File01Icon } from "hugeicons-react"
import { apiClient as api, ApiClientError } from "@usesendnow/api-client"

const TEMPLATE_TYPES: TemplateType[] = ["text", "image", "video", "audio", "document"]

const TYPE_LABEL: Record<TemplateType, string> = {
  text: "Texte",
  image: "Image",
  video: "Vidéo",
  audio: "Audio",
  document: "Document",
}

function TemplateEditModal({
  template,
  onSuccess,
  onClose,
}: {
  template: Template
  onSuccess: (template: Template) => void
  onClose: () => void
}) {
  const [name, setName] = useState(template.name)
  const [body, setBody] = useState(template.body ?? "")
  const [mediaUrl, setMediaUrl] = useState(template.mediaUrl ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detectedVariables = useMemo(() => parseTemplateVariables(body), [body])
  const requiresMedia = template.type !== "text"

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await api.templates.update(template.id, {
        name: name.trim(),
        body: body.trim() || null,
        mediaUrl: requiresMedia ? mediaUrl.trim() || null : null,
      })
      onSuccess(response)
      onClose()
      toast.success("Template mis à jour")
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TEMPLATE_INVALID") {
        setError("Ce template contient des placeholders invalides ou une configuration média incomplète.")
      } else if (err instanceof ApiClientError && err.code === "VALIDATION_ERROR") {
        setError("Vérifiez les champs obligatoires du template.")
      } else {
        setError("Impossible d'enregistrer le template.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Modifier le template" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        <Select label="Type" value={template.type} disabled>
          <option>{TYPE_LABEL[template.type]}</option>
        </Select>
        <Textarea
          label={requiresMedia ? "Corps (optionnel)" : "Corps"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required={!requiresMedia}
          rows={5}
          placeholder="Bonjour {{contact.firstName}}, utilisez {{custom.code}} aujourd'hui."
        />
        <TemplateVariableGuide variables={detectedVariables} />
        {requiresMedia && (
          <Input
            label="Media URL"
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://cdn.msgflash.com/assets/promo.jpg"
          />
        )}
        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" loading={loading}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function TemplatesPage() {
  const router = useRouter()
  const { locale } = usePortalLocale()
  const copy = portalCopy[locale]
  const { templates, total, page, limit, loading, goToPage, addTemplate, updateTemplate, removeTemplate } = useTemplates()
  const [editTarget, setEditTarget] = useState<Template | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const totalPages = Math.ceil(total / limit)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
      try {
        await api.templates.delete(deleteTarget.id)
        removeTemplate(deleteTarget.id)
        setDeleteTarget(null)
      toast.success(copy.templates.templateDeleted)
      } catch {
      toast.error(copy.templates.templateDeleteFailed)
      } finally {
        setDeleting(null)
      }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title={copy.templates.pageTitle}
        description={total > 0 ? `${total} template${total !== 1 ? "s" : ""}` : copy.templates.pageDescription}
        action={<Button variant="primary" onClick={() => router.push("/templates/new")}>{copy.templates.newTemplate}</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((index) => <SkeletonCard key={index} />)}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<File01Icon className="w-8 h-8" />}
          title={copy.templates.emptyTitle}
          description={copy.templates.emptyDescription}
          ctaLabel={copy.templates.newTemplate}
          onCta={() => router.push("/templates/new")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-text truncate">{template.name}</h3>
                  <div className="flex gap-1.5">
                    <Badge variant="neutral">{TYPE_LABEL[template.type]}</Badge>
                    {template.type !== "text" && <Badge variant="warning">{copy.templates.media}</Badge>}
                  </div>
                </div>

                <div className="mt-3 min-h-16 text-sm text-text-secondary line-clamp-3">
                  <HighlightedTemplateBody body={template.body} />
                </div>

                {template.variables.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant={variable.startsWith("custom.") ? "warning" : "blue"}>
                        {variable}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs text-text-muted">{copy.templates.modifiedAt} {formatDate(template.updatedAt)}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditTarget(template)}>{copy.templates.edit}</Button>
                  <Button size="sm" variant="ghost" onClick={() => router.push(`/templates/${template.id}`)}>{copy.templates.preview}</Button>
                  <Button size="sm" variant="danger" loading={deleting === template.id} onClick={() => setDeleteTarget(template)}>
                    {copy.templates.delete}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-text-secondary">Page {page} / {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => goToPage(page - 1)}>
                  {copy.templates.previous}
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                  {copy.templates.next}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {editTarget && (
        <TemplateEditModal
          template={editTarget}
          onSuccess={(template) => {
            updateTemplate(template)
            setEditTarget(null)
          }}
          onClose={() => setEditTarget(null)}
        />
      )}

        <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={copy.templates.deleteTitle}>
        {deleteTarget && (
          <div>
            <p className="mb-6 text-sm text-text-body">
              {copy.templates.confirmDelete} <strong className="text-text">{deleteTarget.name}</strong> ?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
              <Button variant="danger" loading={!!deleting} onClick={handleDelete}>{copy.templates.deleteConfirm}</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
