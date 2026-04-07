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

const WEBHOOK_EVENTS: WebhookEvent[] = [
  "message.sent",
  "message.delivered",
  "message.failed",
  "instance.connected",
]

const EVENT_LABEL: Record<WebhookEvent, string> = {
  "message.sent": "Message envoyé",
  "message.delivered": "Message livré",
  "message.failed": "Message échoué",
  "instance.connected": "Instance connectée",
}

export default function NewWebhookPage() {
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
          toast.error("Les webhooks ne sont pas disponibles sur votre plan.")
        } else if (err.code === "MAX_WEBHOOK_ENDPOINTS_REACHED") {
          toast.error("Limite d'endpoints webhook atteinte pour votre plan.")
        } else {
          toast.error("Impossible d'enregistrer l'endpoint.")
        }
      } else {
        toast.error("Impossible d'enregistrer l'endpoint.")
      }
    } finally {
      setCreating(false)
    }
  }

  if (planBlocked) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
        <PageHeader
          title="Nouveau webhook"
          description="Ajouter un endpoint webhook"
          action={<Button variant="secondary" onClick={() => router.push("/webhooks")}>Retour aux webhooks</Button>}
        />
        <PlanGateBanner message="Les webhooks ne sont pas disponibles sur le plan Gratuit. Passez au plan Starter pour y accéder." />
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
      <PageHeader
        title="Nouveau webhook"
        description="Ajoutez un endpoint pour recevoir des notifications d'événements en temps réel."
        action={<Button variant="secondary" onClick={() => router.push("/webhooks")}>Retour aux webhooks</Button>}
      />

      <form onSubmit={handleCreate} className="space-y-6">
        <Card className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-text mb-1">Endpoint URL</h3>
            <p className="text-xs text-text-secondary mb-3">L'URL qui recevra les notifications POST.</p>
            <Input
              label="URL du webhook"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://mon-api.com/webhooks/msgflash"
              required
              autoFocus
              type="url"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text mb-1">Événements</h3>
            <p className="text-xs text-text-secondary mb-3">Sélectionnez les événements à recevoir.</p>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map((event) => (
                <label key={event} className="flex items-center gap-3 p-3 bg-bg-subtle border border-border rounded-xl cursor-pointer hover:border-border-strong transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="h-4 w-4 rounded border-border-strong accent-primary"
                  />
                  <span className="text-sm text-text-body">{EVENT_LABEL[event]}</span>
                  <code className="text-xs text-text-muted ml-auto font-mono">{event}</code>
                </label>
              ))}
            </div>
            {selectedEvents.length === 0 && (
              <p className="text-xs text-warning mt-2 flex items-center gap-1">
                <AlertDiamondIcon className="w-3.5 h-3.5" />
                Sélectionnez au moins un événement.
              </p>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            La clé de signature HMAC-SHA256 sera affichée une seule fois après la création.
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/webhooks")}>Annuler</Button>
            <Button type="submit" variant="primary" loading={creating} disabled={!newUrl.trim() || selectedEvents.length === 0}>
              Créer le webhook
            </Button>
          </div>
        </div>
      </form>

      {/* Secret reveal modal */}
      <Modal open={!!secretModal} onClose={() => setSecretModal(null)} title="Webhook créé">
        {secretModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-warning-subtle border border-warning/30 rounded-xl">
              <AlertDiamondIcon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning-text">
                Copiez cette clé de signature. Elle ne sera plus jamais affichée.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1.5">Clé de signature HMAC-SHA256</p>
              <CodeSnippet value={secretModal.secret} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1.5">Endpoint</p>
              <CodeSnippet value={secretModal.url} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setSecretModal(null)}>Fermer</Button>
              <Button variant="primary" onClick={() => router.push("/webhooks")}>Voir les webhooks</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
