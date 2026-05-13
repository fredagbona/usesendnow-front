"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useTemplates } from "@/hooks/useTemplates"
import { formatDate } from "@/lib/format"
import { parseTemplateVariables } from "@/lib/templateEngine"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { renderWithStrongCount, renderWithStrongName } from "@/lib/render-copy-placeholders"
import type { Template, TemplateType, MessageType, UploadedMedia } from "@usesendnow/types"
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
import { useManagedTemporaryMedia } from "@/hooks/useManagedTemporaryMedia"
import { MediaUploadPanel } from "@/components/messages/MediaUploadPanel"

const TEMPLATE_TYPES: TemplateType[] = ["text", "image", "video", "audio", "document"]

function TemplateEditModal({
  template,
  onSuccess,
  onClose,
}: {
  template: Template
  onSuccess: (template: Template) => void
  onClose: () => void
}) {
  const { copy } = usePortalLocale()
  const h = copy.hooks
  const list = copy.campaigns.list
  const t = copy.templates
  const tNew = t.new
  const typeLabels = t.detail.typeLabels

  const [name, setName] = useState(template.name)
  const [body, setBody] = useState(template.body ?? "")
  const [mediaUrl, setMediaUrl] = useState(template.mediaUrl ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const serverMediaUrlRef = useRef(template.mediaUrl?.trim() ? template.mediaUrl : null)

  const messageMediaType = template.type as MessageType

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
    shouldCleanupMediaRef,
  } = useManagedTemporaryMedia({
    mediaType: messageMediaType,
    listCopy: list,
    bytesMegabyte: copy.common.bytesMegabyte,
    onUploadSuccess,
    onClear: onClearMedia,
    onTeamAccessDenied: () => toast.error(h.teamAccessDenied),
  })

  const detectedVariables = useMemo(() => parseTemplateVariables(body), [body])
  const requiresMedia = template.type !== "text"

  const existingRemoteMediaUrl =
    requiresMedia &&
    Boolean(mediaUrl.trim()) &&
    !uploadedMedia &&
    serverMediaUrlRef.current != null &&
    mediaUrl.trim() === serverMediaUrlRef.current.trim()
      ? mediaUrl.trim()
      : null

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
      shouldCleanupMediaRef.current = false
      onSuccess(response)
      onClose()
      toast.success(t.templateUpdated)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TEMPLATE_INVALID") {
        setError(t.invalidTemplate)
      } else if (err instanceof ApiClientError && err.code === "VALIDATION_ERROR") {
        setError(t.validationError)
      } else if (err instanceof ApiClientError && err.code === "MEDIA_URL_EXPIRED") {
        setError(tNew.mediaUrlExpired)
      } else {
        setError(t.templateUpdateFailed)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={t.editTitle} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t.name} value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        <Select label={t.type} value={template.type} disabled>
          <option>{typeLabels[template.type]}</option>
        </Select>
        <Textarea
          label={requiresMedia ? t.bodyOptional : t.body}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required={!requiresMedia}
          rows={5}
          placeholder={tNew.bodyPlaceholder}
        />
        <TemplateVariableGuide variables={detectedVariables} />
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
              existingRemoteMediaUrl={existingRemoteMediaUrl}
              fileInputRef={fileInputRef}
              onFileChange={handleFileSelect}
              onRemove={handleRemoveFile}
            />
            {!uploadedMedia && !existingRemoteMediaUrl && (
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
        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {tNew.cancel}
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {t.save}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function TemplatesPage() {
  const router = useRouter()
  const { copy } = usePortalLocale()
  const t = copy.templates
  const { templates, total, page, limit, loading, goToPage, updateTemplate, removeTemplate } = useTemplates()
  const [editTarget, setEditTarget] = useState<Template | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const totalPages = Math.ceil(total / limit)
  const typeLabels = t.detail.typeLabels

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
    try {
      await api.templates.delete(deleteTarget.id)
      removeTemplate(deleteTarget.id)
      setDeleteTarget(null)
      toast.success(t.templateDeleted)
    } catch {
      toast.error(t.templateDeleteFailed)
    } finally {
      setDeleting(null)
    }
  }

  const pageIndicator =
    totalPages > 1
      ? t.pageIndicator.replace("{{page}}", String(page)).replace("{{total}}", String(totalPages))
      : null

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title={t.pageTitle}
        description={
          total > 0
            ? renderWithStrongCount(total === 1 ? t.headerCountOne : t.headerCountMany, total)
            : t.pageDescription
        }
        action={
          <Button variant="primary" onClick={() => router.push("/templates/new")}>
            {t.newTemplate}
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<File01Icon className="w-8 h-8" />}
          title={t.emptyTitle}
          description={t.emptyDescription}
          ctaLabel={t.newTemplate}
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
                    <Badge variant="neutral">{typeLabels[template.type]}</Badge>
                    {template.type !== "text" && <Badge variant="warning">{t.media}</Badge>}
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

                <p className="mt-4 text-xs text-text-muted">
                  {t.modifiedAt} {formatDate(template.updatedAt)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditTarget(template)}>
                    {t.edit}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => router.push(`/templates/${template.id}`)}>
                    {t.preview}
                  </Button>
                  <Button size="sm" variant="danger" loading={deleting === template.id} onClick={() => setDeleteTarget(template)}>
                    {t.delete}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && pageIndicator && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-text-secondary">{pageIndicator}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => goToPage(page - 1)}>
                  {t.previous}
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                  {t.next}
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

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t.deleteTitle}>
        {deleteTarget && (
          <div>
            <p className="mb-6 text-sm text-text-body">{renderWithStrongName(t.deleteConfirmMessage, deleteTarget.name)}</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                {t.cancel}
              </Button>
              <Button variant="danger" loading={!!deleting} onClick={handleDelete}>
                {t.deleteConfirm}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
