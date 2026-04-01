"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useWebhooks } from "@/hooks/useWebhooks"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { SubscriptionResponse, WebhookEvent } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import PlanGateBanner from "@/components/ui/PlanGateBanner"
import EmptyState from "@/components/ui/EmptyState"
import CodeSnippet from "@/components/ui/CodeSnippet"
import { SkeletonCard } from "@/components/ui/Skeleton"
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

export default function WebhooksPage() {
  const { webhooks, loading, addWebhook, removeWebhook } = useWebhooks()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [secretModal, setSecretModal] = useState<{ secret: string; url: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; url: string } | null>(null)
  const [newUrl, setNewUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([])
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    apiClient.billing.getSubscription()
      .then((sub) => {
        setSubscription(sub)
        const hasWebhooks = sub?.subscription?.plan?.features?.webhooks ?? false
        if (!hasWebhooks) {
          setPlanBlocked(true)
        }
      })
      .catch(() => {})
  }, [])

  const toggleEvent = (event: WebhookEvent) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

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
      setCreateModalOpen(false)
      setNewUrl("")
      setSelectedEvents([])
      setSecretModal({ secret: data.secret, url: data.url })
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "WEBHOOKS_NOT_AVAILABLE_ON_PLAN") {
          setCreateModalOpen(false)
          setPlanBlocked(true)
        } else if (err.code === "MAX_WEBHOOK_ENDPOINTS_REACHED") {
          toast.error("Limite d'endpoints webhook atteinte pour votre plan.")
          setCreateModalOpen(false)
        } else {
          toast.error("Impossible d'enregistrer l'endpoint.")
        }
      }
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
    try {
      await apiClient.webhooks.delete(deleteTarget.id)
      removeWebhook(deleteTarget.id)
      toast.success("Webhook supprimé")
      setDeleteTarget(null)
    } catch {
      toast.error("Impossible de supprimer le webhook.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title="Webhooks"
        description="Recevez des notifications d'événements en temps réel"
        action={
          !planBlocked && (
            <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
              Ajouter un endpoint
            </Button>
          )
        }
      />

      {planBlocked && (
        <div className="mb-6">
          <PlanGateBanner message="Les webhooks ne sont pas disponibles sur votre plan actuel. Mettez à niveau pour recevoir des notifications en temps réel." />
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
            title="Aucun webhook enregistré"
            description="Ajoutez un endpoint pour recevoir des notifications d'événements."
            ctaLabel="Ajouter un endpoint"
            onCta={() => setCreateModalOpen(true)}
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
                        {wh.active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {wh.events.map((ev) => (
                        <Badge key={ev} variant="neutral">{ev}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted">Créé le {formatDate(wh.createdAt)}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deleting === wh.id}
                    onClick={() => setDeleteTarget({ id: wh.id, url: wh.url })}
                  >
                    Supprimer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Create modal */}
      <Modal
        open={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setNewUrl(""); setSelectedEvents([]) }}
        title="Enregistrer un endpoint"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="URL de l'endpoint"
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://monapp.com/hooks/msgflash"
            required
            autoFocus
          />
          <div>
            <p className="text-sm font-medium text-text-body mb-2">Événements</p>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map((ev) => (
                <label key={ev} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(ev)}
                    onChange={() => toggleEvent(ev)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-text-body">{EVENT_LABEL[ev]}</span>
                  <span className="text-xs text-text-muted font-mono">{ev}</span>
                </label>
              ))}
            </div>
            {selectedEvents.length === 0 && (
              <p className="text-xs text-error-hover mt-1">Sélectionnez au moins un événement.</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creating}
              disabled={selectedEvents.length === 0}
            >
              Enregistrer l'endpoint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Secret reveal modal */}
      <Modal
        open={!!secretModal}
        onClose={() => setSecretModal(null)}
        title="Webhook enregistré"
        maxWidth="max-w-lg"
      >
        {secretModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-warning-subtle border border-warning/30 rounded-xl">
              <AlertDiamondIcon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning-text">
                Ce secret de signature n&apos;est affiché qu&apos;une seule fois. Utilisez-le pour vérifier les requêtes entrantes avec HMAC-SHA256.
              </p>
            </div>
            <CodeSnippet value={secretModal.secret} />
            <div className="bg-bg-subtle border border-border rounded-xl p-3">
              <p className="text-xs font-mono text-text-secondary">
                signature = HMAC-SHA256(secret, rawBody)<br />
                compare(signature, request.headers[&apos;x-msgflash-signature&apos;])
              </p>
            </div>
            <div className="flex justify-end pt-1">
              <Button variant="primary" onClick={() => setSecretModal(null)}>
                J&apos;ai sauvegardé le secret
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le webhook"
      >
        {deleteTarget && (
          <>
            <p className="text-sm text-text-body mb-6">
              Supprimer l&apos;endpoint{" "}
              <strong className="text-text font-mono text-xs break-all">{deleteTarget.url}</strong> ?
              Aucun événement ne sera plus livré à cette URL.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
              <Button variant="danger" loading={!!deleting} onClick={handleDelete}>Supprimer</Button>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  )
}
