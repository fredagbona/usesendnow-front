"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { apiClient } from "@usesendnow/api-client"
import type { InstanceHealth } from "@usesendnow/types"
import { formatRelativeDate } from "@/lib/format"
import { useMessages } from "@/hooks/useMessages"
import { useInstances } from "@/hooks/useInstances"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import Select from "@/components/ui/Select"
import { SkeletonTableRow } from "@/components/ui/Skeleton"
import { Message01Icon } from "hugeicons-react"
import WarmupWarningModal from "@/components/shared/WarmupWarningModal"

const STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "purple" | "error" | "orange"> = {
  queued: "neutral",
  sent: "blue",
  delivered: "success",
  read: "purple",
  failed: "error",
  cancelled: "orange",
  received: "neutral",
}

const STATUSES = ["queued", "sent", "delivered", "read", "failed", "cancelled", "received"] as const

export default function MessagesPage() {
  const router = useRouter()
  const { copy } = usePortalLocale()
  const L = copy.messages.list
  const cw = copy.common.warmupWarning
  const messageTypes = copy.messages.detail.types
  const [instanceFilter, setInstanceFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [warmupWarningOpen, setWarmupWarningOpen] = useState(false)
  const [warmupWarningHealth, setWarmupWarningHealth] = useState<InstanceHealth | null>(null)
  const pendingRouteRef = useRef<string | null>(null)
  const { messages, loading, loadingMore, hasMore, loadMore } = useMessages({
    instanceId: instanceFilter || undefined,
    status: statusFilter || undefined,
  })
  const { instances } = useInstances()

  const statusLabel = (status: string) =>
    L.statusLabels[status as keyof typeof L.statusLabels] ?? status

  const openComposer = async () => {
    const connectedInstances = instances.filter((instance) => instance.status === "connected")
    if (connectedInstances.length === 0) {
      router.push("/messages/new")
      return
    }

    try {
      const healthResults = await Promise.allSettled(
        connectedInstances.map(async (instance) => ({
          instance,
          health: await apiClient.instances.getHealth(instance.id),
        }))
      )
      const bestCandidate = healthResults
        .filter((result): result is PromiseFulfilledResult<{ instance: typeof connectedInstances[number]; health: InstanceHealth }> => result.status === "fulfilled")
        .map((result) => result.value)
        .sort((a, b) => b.health.safetyScore - a.health.safetyScore)[0]

      if (bestCandidate && bestCandidate.health.safetyScore > 60) {
        setWarmupWarningHealth(bestCandidate.health)
        pendingRouteRef.current = "/messages/new"
        setWarmupWarningOpen(true)
        return
      }
    } catch {
      // If health fetch fails, continue normally.
    }

    router.push("/messages/new")
  }

  const continueToComposer = () => {
    setWarmupWarningOpen(false)
    const pending = pendingRouteRef.current
    pendingRouteRef.current = null
    router.push(pending ?? "/messages/new")
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title={L.title}
        description={L.description}
        action={<Button variant="primary" onClick={() => void openComposer()}>{L.action}</Button>}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={instanceFilter} onChange={(event) => setInstanceFilter(event.target.value)} className="w-48">
          <option value="">{L.allInstances}</option>
          {instances.map((instance) => (
            <option key={instance.id} value={instance.id}>{instance.name}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-w-44 w-auto sm:w-52">
          <option value="">{L.allStatuses}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{statusLabel(status)}</option>
          ))}
        </Select>
      </div>

      <Card>
        {loading ? (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {[L.recipient, L.type, L.preview, L.status, L.date].map((header) => (
                      <th key={header} className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{[1, 2, 3, 4, 5].map((index) => <SkeletonTableRow key={index} cols={5} />)}</tbody>
              </table>
            </div>

            <div className="space-y-2 sm:hidden">
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center gap-3 rounded-xl border border-border p-3 animate-pulse">
                  <div className="h-5 w-16 rounded-full bg-bg-muted" />
                  <div className="h-4 flex-1 rounded bg-bg-muted" />
                  <div className="h-3 w-10 rounded bg-bg-muted" />
                </div>
              ))}
            </div>
          </>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<Message01Icon className="w-8 h-8" />}
            title={L.emptyTitle}
            description={statusFilter || instanceFilter ? L.emptyWithFilter : L.emptyDefault}
            ctaLabel={L.action}
            onCta={() => void openComposer()}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {[L.recipient, L.type, L.preview, L.status, L.date].map((header) => (
                      <th key={header} className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr
                      key={message.id}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-bg-subtle"
                      onClick={() => router.push(`/messages/${message.id}`)}
                    >
                      <td className="py-3 pr-4 text-sm font-mono text-text">{message.to}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="neutral">
                            {messageTypes[message.type as keyof typeof messageTypes] ?? message.type}
                          </Badge>
                          {message.meta?.templateId && <Badge variant="warning">{L.template}</Badge>}
                        </div>
                      </td>
                      <td className="max-w-xs py-3 pr-4 text-sm text-text-secondary">
                        <div className="truncate">{message.body ? message.body.slice(0, 50) : L.mediaPreviewPlaceholder}</div>
                          {message.meta?.templateId && (
                            <div className="mt-1 text-xs text-text-muted">{L.generatedFromTemplate}</div>
                          )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>{statusLabel(message.status)}</Badge>
                      </td>
                      <td className="whitespace-nowrap py-3 text-sm text-text-muted">{formatRelativeDate(message.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border sm:hidden">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => router.push(`/messages/${message.id}`)}
                  className="flex w-full items-start justify-between gap-3 py-3 text-left transition-colors hover:bg-bg-subtle"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>{statusLabel(message.status)}</Badge>
                      <Badge variant="neutral">
                        {messageTypes[message.type as keyof typeof messageTypes] ?? message.type}
                      </Badge>
                      {message.meta?.templateId && <Badge variant="warning">{L.template}</Badge>}
                    </div>
                    <p className="truncate text-sm font-mono text-text">{message.to}</p>
                    {message.body && <p className="mt-0.5 truncate text-xs text-text-muted">{message.body.slice(0, 60)}</p>}
                  </div>
                  <span className="mt-0.5 shrink-0 text-xs text-text-muted">{formatRelativeDate(message.createdAt)}</span>
                </button>
              ))}
            </div>

            {hasMore && (
              <div className="pt-4 text-center">
                <Button variant="secondary" loading={loadingMore} onClick={loadMore}>{L.loadMore}</Button>
              </div>
            )}
          </>
        )}
      </Card>

      <WarmupWarningModal
        open={warmupWarningOpen}
        health={warmupWarningHealth}
        onClose={() => {
          setWarmupWarningOpen(false)
          pendingRouteRef.current = null
        }}
        onContinue={continueToComposer}
      />
    </motion.div>
  )
}
