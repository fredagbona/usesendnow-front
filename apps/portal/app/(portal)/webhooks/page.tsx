"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useWebhooks } from "@/hooks/useWebhooks"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { apiClient } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { WebhookEvent } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import PlanGateBanner from "@/components/ui/PlanGateBanner"
import EmptyState from "@/components/ui/EmptyState"
import CodeSnippet from "@/components/ui/CodeSnippet"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { WebhookIcon, AlertDiamondIcon } from "hugeicons-react"

export default function WebhooksPage() {
  const router = useRouter()
  const { copy } = usePortalLocale()
  const list = copy.webhooks.list
  const { webhooks, loading, removeWebhook } = useWebhooks()
  const [planBlocked, setPlanBlocked] = useState(false)
  const [secretModal, setSecretModal] = useState<{ secret: string; url: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; url: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const eventLabel = (ev: WebhookEvent) =>
    (list.eventLabels as Record<string, string>)[ev] ?? ev

  useEffect(() => {
    apiClient.billing.getSubscription()
      .then((sub) => {
        const hasWebhooks = sub?.subscription?.plan?.features?.webhooks ?? false
        if (!hasWebhooks) {
          setPlanBlocked(true)
        }
      })
      .catch(() => {})
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
    try {
      await apiClient.webhooks.delete(deleteTarget.id)
      removeWebhook(deleteTarget.id)
      toast.success(list.deleteSuccessToast)
      setDeleteTarget(null)
    } catch {
      toast.error(list.deleteErrorToast)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title={copy.titles.webhooks}
        description={list.pageDescription}
        action={
          !planBlocked && (
            <Button variant="primary" onClick={() => router.push("/webhooks/new")}>
              {list.addCta}
            </Button>
          )
        }
      />

      {planBlocked && (
        <div className="mb-6">
          <PlanGateBanner message={list.planGateMessage} />
        </div>
      )}

      {!planBlocked && (
        loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : webhooks.length === 0 ? (
          <EmptyState
            icon={<WebhookIcon className="w-8 h-8" />}
            title={list.emptyTitle}
            description={list.emptyDescription}
            ctaLabel={list.addCta}
            onCta={() => router.push("/webhooks/new")}
          />
        ) : (
          <div className="space-y-4">
            {webhooks.map((wh) => (
              <Card key={wh.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono text-text truncate">{wh.url}</code>
                      <Badge variant={wh.active ? "success" : "neutral"}>
                        {wh.active ? list.statusActive : list.statusInactive}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {wh.events.map((ev) => (
                        <Badge key={ev} variant="neutral">{eventLabel(ev)}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted">{list.createdOn} {formatDate(wh.createdAt)}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deleting === wh.id}
                    onClick={() => setDeleteTarget({ id: wh.id, url: wh.url })}
                  >
                    {list.delete}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}


      {/* Secret reveal modal */}
      <Modal
        open={!!secretModal}
        onClose={() => setSecretModal(null)}
        title={list.secretModalTitle}
        maxWidth="max-w-lg"
      >
        {secretModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-warning-subtle border border-warning/30 rounded-xl">
              <AlertDiamondIcon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning-text">
                {list.secretHint}
              </p>
            </div>
            <CodeSnippet value={secretModal.secret} />
            <div className="bg-bg-subtle border border-border rounded-xl p-3">
              <p className="text-xs font-mono text-text-secondary">
                {list.secretSignature}<br />
                {list.secretCompare}
              </p>
            </div>
            <div className="flex justify-end pt-1">
              <Button variant="primary" onClick={() => setSecretModal(null)}>
                {list.secretSaved}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={list.deleteModalTitle}
      >
        {deleteTarget && (
          <>
            <p className="text-sm text-text-body mb-6">
              {list.deleteModalBeforeUrl}{" "}
              <strong className="text-text font-mono text-xs break-all">{deleteTarget.url}</strong>
              {list.deleteModalAfterUrl}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>{copy.webhooks.cancel}</Button>
              <Button variant="danger" loading={!!deleting} onClick={handleDelete}>{list.deleteConfirm}</Button>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  )
}
