"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useWebhooks } from "@/hooks/useWebhooks"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { SubscriptionResponse, WebhookEvent } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import PlanGateBanner from "@/components/ui/PlanGateBanner"
import CodeSnippet from "@/components/ui/CodeSnippet"
import Modal from "@/components/ui/Modal"
import { WebhookIcon, AlertDiamondIcon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

const WEBHOOK_EVENTS: WebhookEvent[] = [
  "message.sent",
  "message.delivered",
  "message.failed",
  "instance.connected",
]

const eventLabel = (copy: ReturnType<typeof usePortalLocale>["copy"]) => ({
  "message.sent": copy.webhooks.events.messageSent,
  "message.delivered": copy.webhooks.events.messageDelivered,
  "message.failed": copy.webhooks.events.messageFailed,
  "instance.connected": copy.webhooks.events.instanceConnected,
} satisfies Record<WebhookEvent, string>)

export default function NewWebhookPage() {
  const { copy } = usePortalLocale()
  const webhookCopy = copy.webhooks
  const router = useRouter()
  const { addWebhook } = useWebhooks()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const [secretModal, setSecretModal] = useState<{ secret: string; url: string } | null>(null)
  const [newUrl, setNewUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([])
  const [creating, setCreating] = useState(false)

  const toggleEvent = (event: WebhookEvent) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  useEffect(() => {
    apiClient.billing.getSubscription()
      .then((sub) => {
        setSubscription(sub)
        const hasWebhooks = sub?.subscription?.plan?.features?.webhooks ?? false
        if (!hasWebhooks) setPlanBlocked(true)
      })
      .catch(() => setPlanBlocked(true))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim() || selectedEvents.length === 0) return
    setCreating(true)
    try {
      const data = await apiClient.webhooks.create({ url: newUrl.trim(), events: selectedEvents })
      addWebhook({
        id: data.id,
        userId: "",
        url: data.url,
        secret: data.secret,
        events: data.events,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
      })
      setSecretModal({ secret: data.secret, url: data.url })
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "WEBHOOKS_NOT_AVAILABLE_ON_PLAN") {
          setPlanBlocked(true)
          toast.error(webhookCopy.errors.planUnavailable)
        } else if (err.code === "MAX_WEBHOOK_ENDPOINTS_REACHED") {
          toast.error(webhookCopy.errors.limitReached)
        } else {
          toast.error(webhookCopy.errors.saveFailed)
        }
      } else {
        toast.error(webhookCopy.errors.saveFailed)
      }
    } finally {
      setCreating(false)
    }
  }

  if (planBlocked) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
        <PageHeader
          title={webhookCopy.newTitle}
          description={webhookCopy.newDescription}
          action={<Button variant="secondary" onClick={() => router.push("/webhooks")}>{webhookCopy.back}</Button>}
        />
        <PlanGateBanner message={webhookCopy.planBlocked} />
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
      <PageHeader
        title={webhookCopy.newTitle}
        description={webhookCopy.newDescription}
        action={<Button variant="secondary" onClick={() => router.push("/webhooks")}>{webhookCopy.back}</Button>}
      />

      <form onSubmit={handleCreate} className="space-y-6">
        <Card className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-text mb-1">{webhookCopy.endpointTitle}</h3>
            <p className="text-xs text-text-secondary mb-3">{webhookCopy.endpointDescription}</p>
            <Input
              label={webhookCopy.endpointLabel}
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={webhookCopy.endpointUrlPlaceholder}
              required
              autoFocus
              type="url"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text mb-1">{webhookCopy.eventsTitle}</h3>
            <p className="text-xs text-text-secondary mb-3">{webhookCopy.eventsDescription}</p>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map((event) => (
                <label key={event} className="flex items-center gap-3 p-3 bg-bg-subtle border border-border rounded-xl cursor-pointer hover:border-border-strong transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="h-4 w-4 rounded border-border-strong accent-primary"
                  />
                  <span className="text-sm text-text-body">{eventLabel(copy)[event]}</span>
                  <code className="text-xs text-text-muted ml-auto font-mono">{event}</code>
                </label>
              ))}
            </div>
            {selectedEvents.length === 0 && (
              <p className="text-xs text-warning mt-2 flex items-center gap-1">
                <AlertDiamondIcon className="w-3.5 h-3.5" />
                {webhookCopy.minEvent}
              </p>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {webhookCopy.hmacNotice}
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/webhooks")}>{webhookCopy.cancel}</Button>
            <Button type="submit" variant="primary" loading={creating} disabled={!newUrl.trim() || selectedEvents.length === 0}>
              {webhookCopy.create}
            </Button>
          </div>
        </div>
      </form>

      {/* Secret reveal modal */}
      <Modal open={!!secretModal} onClose={() => setSecretModal(null)} title={webhookCopy.createdTitle}>
        {secretModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-warning-subtle border border-warning/30 rounded-xl">
              <AlertDiamondIcon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning-text">
                {webhookCopy.secretWarning}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1.5">{webhookCopy.secretLabel}</p>
              <CodeSnippet value={secretModal.secret} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1.5">{webhookCopy.endpointLabelShort}</p>
              <CodeSnippet value={secretModal.url} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setSecretModal(null)}>{webhookCopy.close}</Button>
              <Button variant="primary" onClick={() => router.push("/webhooks")}>{webhookCopy.viewWebhooks}</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
