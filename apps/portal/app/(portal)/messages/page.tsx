"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { formatRelativeDate } from "@/lib/format"
import { TYPE_LABEL } from "@/lib/messageComposer"
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

const STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "purple" | "error"> = {
  queued: "neutral",
  sent: "blue",
  delivered: "success",
  read: "purple",
  failed: "error",
}

const STATUS_LABEL: Record<string, string> = {
  queued: "En file",
  sent: "Envoyé",
  delivered: "Livré",
  read: "Lu",
  failed: "Échoué",
}

const STATUSES = ["queued", "sent", "delivered", "read", "failed"]

export default function MessagesPage() {
  const router = useRouter()
  const { locale } = usePortalLocale()
  const copy = {
    fr: {
      title: "Messages",
      description: "Tous les messages envoyés depuis vos instances",
      action: "Envoyer un message",
      allInstances: "Toutes les instances",
      allStatuses: "Tous les statuts",
      recipient: "Destinataire",
      type: "Type",
      preview: "Aperçu",
      status: "Statut",
      date: "Date",
      emptyTitle: "Aucun message trouvé",
      emptyWithFilter: "Aucun message ne correspond à vos filtres.",
      emptyDefault: "Aucun message envoyé pour l’instant.",
      template: "Template",
      generatedFromTemplate: "Généré depuis un template",
      loadMore: "Charger plus",
    },
    en: {
      title: "Messages",
      description: "All messages sent from your instances",
      action: "Send a message",
      allInstances: "All instances",
      allStatuses: "All statuses",
      recipient: "Recipient",
      type: "Type",
      preview: "Preview",
      status: "Status",
      date: "Date",
      emptyTitle: "No messages found",
      emptyWithFilter: "No messages match your filters.",
      emptyDefault: "No messages sent yet.",
      template: "Template",
      generatedFromTemplate: "Generated from a template",
      loadMore: "Load more",
    },
  }[locale]
  const [instanceFilter, setInstanceFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const { messages, loading, loadingMore, hasMore, loadMore } = useMessages({
    instanceId: instanceFilter || undefined,
    status: statusFilter || undefined,
  })
  const { instances } = useInstances()

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={<Button variant="primary" onClick={() => router.push("/messages/new")}>{copy.action}</Button>}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={instanceFilter} onChange={(event) => setInstanceFilter(event.target.value)} className="w-48">
          <option value="">{copy.allInstances}</option>
          {instances.map((instance) => (
            <option key={instance.id} value={instance.id}>{instance.name}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-44">
          <option value="">{copy.allStatuses}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{STATUS_LABEL[status] ?? status}</option>
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
                    {[copy.recipient, copy.type, copy.preview, copy.status, copy.date].map((header) => (
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
            title={copy.emptyTitle}
            description={statusFilter || instanceFilter ? copy.emptyWithFilter : copy.emptyDefault}
            ctaLabel={copy.action}
            onCta={() => router.push("/messages/new")}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {[copy.recipient, copy.type, copy.preview, copy.status, copy.date].map((header) => (
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
                          <Badge variant="neutral">{TYPE_LABEL[message.type] ?? message.type}</Badge>
                          {message.meta?.templateId && <Badge variant="warning">{copy.template}</Badge>}
                        </div>
                      </td>
                      <td className="max-w-xs py-3 pr-4 text-sm text-text-secondary">
                        <div className="truncate">{message.body ? message.body.slice(0, 50) : "[média]"}</div>
                          {message.meta?.templateId && (
                            <div className="mt-1 text-xs text-text-muted">{copy.generatedFromTemplate}</div>
                          )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>{STATUS_LABEL[message.status] ?? message.status}</Badge>
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
                      <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>{STATUS_LABEL[message.status] ?? message.status}</Badge>
                      <Badge variant="neutral">{TYPE_LABEL[message.type] ?? message.type}</Badge>
                      {message.meta?.templateId && <Badge variant="warning">{copy.template}</Badge>}
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
                <Button variant="secondary" loading={loadingMore} onClick={loadMore}>{copy.loadMore}</Button>
              </div>
            )}
          </>
        )}
      </Card>
    </motion.div>
  )
}
