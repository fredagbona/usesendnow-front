"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { useMessage } from "@/hooks/useMessages"
import { formatFullDate } from "@/lib/format"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import CodeSnippet from "@/components/ui/CodeSnippet"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { ArrowLeft01Icon, AlertDiamondIcon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

const STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "purple" | "error" | "orange"> = {
  queued: "neutral",
  sent: "blue",
  delivered: "success",
  read: "purple",
  failed: "error",
  cancelled: "orange",
  received: "neutral",
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-border last:border-0">
      <span className="w-44 shrink-0 text-sm text-text-secondary">{label}</span>
      <div className="flex-1 text-sm text-text">{children}</div>
    </div>
  )
}

export default function MessageDetailPage() {
  const { copy } = usePortalLocale()
  const detailCopy = copy.messages.detail
  const list = copy.messages.list
  const messageStatusLabel = (status: string) =>
    list.statusLabels[status as keyof typeof list.statusLabels] ?? status
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { message, loading, error } = useMessage(id)

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !message) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-text-secondary">{detailCopy.notFound}</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/messages")}>
          {detailCopy.backToMessages}
        </Button>
      </div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title={detailCopy.title}
        action={
          <div className="flex items-center gap-3">
            {message.meta?.templateId && <Badge variant="warning">{detailCopy.template}</Badge>}
            <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>
              {messageStatusLabel(message.status)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => router.push("/messages")}>
              <ArrowLeft01Icon className="w-4 h-4" />
              {detailCopy.back}
            </Button>
          </div>
        }
      />

      {message.status === "failed" && message.error && (
        <div className="flex items-start gap-3 p-4 border border-error/30 rounded-2xl bg-error-subtle">
          <AlertDiamondIcon className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-error-hover">
              {message.meta?.templateId ? detailCopy.templateRenderFailed : detailCopy.sendFailed}
            </p>
            <p className="text-sm text-text-body mt-0.5">{message.error}</p>
          </div>
        </div>
      )}

      <Card>
        <DetailRow label={detailCopy.status}>
          <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>
            {messageStatusLabel(message.status)}
          </Badge>
        </DetailRow>
        <DetailRow label={detailCopy.type}>
          <Badge variant="neutral">{detailCopy.types[message.type as keyof typeof detailCopy.types] ?? message.type}</Badge>
        </DetailRow>
        <DetailRow label={detailCopy.recipient}>
          <span className="font-mono">{message.to}</span>
        </DetailRow>
        <DetailRow label={detailCopy.instance}>
          <span className="font-mono text-xs">{message.instanceId}</span>
        </DetailRow>
        {message.providerMessageId && (
          <DetailRow label={detailCopy.providerId}>
            <CodeSnippet value={message.providerMessageId} />
          </DetailRow>
        )}
        <DetailRow label={detailCopy.content}>
          {message.type === "text" && message.body ? (
            <span>{message.body}</span>
          ) : message.mediaUrl ? (
            <a
              href={message.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-ink hover:text-text hover:underline break-all"
            >
              {message.mediaUrl}
            </a>
          ) : (
            <span className="text-text-muted">[{detailCopy.types[message.type as keyof typeof detailCopy.types] ?? message.type}]</span>
          )}
        </DetailRow>
        <DetailRow label={detailCopy.createdAt}>{formatFullDate(message.createdAt)}</DetailRow>
        <DetailRow label={detailCopy.updatedAt}>{formatFullDate(message.updatedAt)}</DetailRow>
        {message.campaignId && (
          <DetailRow label={detailCopy.campaign}>
            <button
              onClick={() => router.push(`/campaigns/${message.campaignId}`)}
              className="text-primary-ink hover:text-text hover:underline text-sm"
            >
              {detailCopy.viewCampaign}
            </button>
          </DetailRow>
        )}
        {message.contactId && (
          <DetailRow label={detailCopy.contact}>
            <span className="font-mono text-xs">{message.contactId}</span>
          </DetailRow>
        )}
      </Card>

      {message.meta?.templateId && (
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-text">{detailCopy.templateRender}</h2>
          <DetailRow label={detailCopy.templateId}>
            <span className="font-mono text-xs">{message.meta.templateId}</span>
          </DetailRow>
          <DetailRow label={detailCopy.usedVariables}>
            {message.meta.usedVariables?.length
              ? (
                <div className="flex flex-wrap gap-1.5">
                  {message.meta.usedVariables.map((variable) => (
                    <Badge key={variable} variant="blue">{variable}</Badge>
                  ))}
                </div>
              )
              : <span className="text-text-muted">{detailCopy.none}</span>}
          </DetailRow>
          {message.meta.missingVariables?.length ? (
            <DetailRow label={detailCopy.missingVariables}>
              <div className="flex flex-wrap gap-1.5">
                {message.meta.missingVariables.map((variable) => (
                  <Badge key={variable} variant="warning">{variable}</Badge>
                ))}
              </div>
            </DetailRow>
          ) : null}
          {message.meta.code && (
            <DetailRow label={detailCopy.renderCode}>
              <CodeSnippet value={message.meta.code} />
            </DetailRow>
          )}
        </Card>
      )}
    </motion.div>
  )
}
