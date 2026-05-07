"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useTemplates } from "@/hooks/useTemplates"
import { formatDate } from "@/lib/format"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { renderWithStrongCount, renderWithStrongName } from "@/lib/render-copy-placeholders"
import type { Template, TemplateType } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { HighlightedTemplateBody } from "@/components/templates/HighlightedTemplateBody"
import { File01Icon } from "hugeicons-react"
import { apiClient as api, ApiClientError } from "@usesendnow/api-client"

export default function TemplatesPage() {
  const router = useRouter()
  const { copy } = usePortalLocale()
  const t = copy.templates
  const { templates, total, page, limit, loading, goToPage, removeTemplate } = useTemplates()
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
                  <Button size="sm" variant="secondary" onClick={() => router.push(`/templates/${template.id}/edit`)}>
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
