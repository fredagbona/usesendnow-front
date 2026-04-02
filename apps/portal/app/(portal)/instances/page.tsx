"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useInstances } from "@/hooks/useInstances"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import type { SubscriptionResponse } from "@usesendnow/types"
import { useEffect } from "react"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { SmartPhone01Icon, AlertDiamondIcon } from "hugeicons-react"

const STATUS_VARIANT: Record<string, "success" | "yellow" | "neutral" | "error"> = {
  connected:    "success",
  connecting:   "yellow",
  disconnected: "neutral",
  suspended:    "error",
}

const STATUS_LABEL: Record<string, string> = {
  connected:    "Connecté",
  connecting:   "Connexion...",
  disconnected: "Déconnecté",
  suspended:    "Suspendue",
}

export default function InstancesPage() {
  const router = useRouter()
  const { instances, loading, createInstance } = useInstances()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [planLimitReached, setPlanLimitReached] = useState(false)
  const normalizedNewName = newName.trim()
  const createNameError =
    normalizedNewName.length === 0
      ? null
      : normalizedNewName.length <= 3
        ? "Le nom de l'instance doit contenir plus de 3 caractères."
        : null

  useEffect(() => {
    apiClient.billing.getSubscription().then(setSubscription).catch(() => {})
  }, [])

  const maxInstances =
    subscription?.subscription?.plan?.limits?.maxInstances ??
    subscription?.subscription?.plan?.maxInstances ??
    Infinity
  const activeCount = subscription?.usage?.activeInstancesCount ?? 0
  const isAtLimit = activeCount >= maxInstances

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!normalizedNewName || createNameError) return
    setCreating(true)
    try {
      await createInstance(normalizedNewName)
      toast.success("Instance créée")
      setModalOpen(false)
      setNewName("")
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "MAX_INSTANCES_REACHED") {
        setModalOpen(false)
        setPlanLimitReached(true)
        toast.error("Limite d'instances atteinte. Mettez à niveau votre plan.")
      } else {
        toast.error("Impossible de créer l'instance.")
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title="Instances WhatsApp"
        description="Gérez vos numéros WhatsApp connectés"
        action={
          <Button
            variant="primary"
            onClick={() => setModalOpen(true)}
            disabled={isAtLimit || planLimitReached}
          >
            Nouvelle instance
          </Button>
        }
      />

      {(isAtLimit || planLimitReached) && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-warning-subtle border border-warning/30 rounded-2xl">
          <AlertDiamondIcon className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-text flex-1">
            Limite d&apos;instances atteinte ({maxInstances}).{" "}
            <button
              onClick={() => router.push("/billing")}
              className="text-primary-ink font-medium hover:text-text hover:underline"
            >
              Mettre à niveau →
            </button>
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : instances.length === 0 ? (
        <EmptyState
          icon={<SmartPhone01Icon className="w-8 h-8" />}
          title="Aucune instance pour l'instant"
          description="Créez votre première connexion WhatsApp."
          ctaLabel="Nouvelle instance"
          onCta={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map((instance) => (
            <Card
              key={instance.id}
              interactive
              elevated
              onClick={() => router.push(`/instances/${instance.id}`)}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className={[
                  "flex h-14 w-14 items-center justify-center rounded-2xl shrink-0 border",
                  instance.status === "suspended"
                    ? "border-error/20 bg-error-subtle"
                    : instance.status === "connected"
                      ? "border-primary/20 bg-primary-subtle"
                      : "border-border bg-bg-subtle",
                ].join(" ")}>
                  <SmartPhone01Icon className={[
                    "w-8 h-8",
                    instance.status === "suspended"
                      ? "text-error"
                      : instance.status === "connected"
                        ? "text-primary"
                        : "text-text",
                  ].join(" ")} />
                </div>
                <Badge
                  variant={STATUS_VARIANT[instance.status] ?? "neutral"}
                  pulse={instance.status === "connecting"}
                >
                  {instance.status === "connected"
                    ? "WhatsApp connecté"
                    : instance.status === "connecting"
                      ? "Connexion en cours"
                      : instance.status === "disconnected"
                        ? "WhatsApp non connecté"
                        : "Instance suspendue"}
                </Badge>
              </div>
              <h3 className="mb-1 text-base font-semibold text-text truncate">
                {instance.name}
              </h3>
              <p className="text-xs text-text-secondary font-mono mb-1">
                {instance.waNumber ?? "Aucun numéro lié"}
              </p>
              {instance.status === "suspended" && (
                <p className="text-xs text-error mb-3">
                  Suspendue suite à un changement de plan.
                </p>
              )}
              {instance.status !== "suspended" && (
                <p className="text-sm text-text-secondary">
                  {instance.status === "connected"
                    ? "Numéro actif et prêt à envoyer des messages."
                    : instance.status === "connecting"
                      ? "Finalisez la connexion WhatsApp depuis la page de détail."
                      : "Scannez un QR code pour connecter ce numéro."}
                </p>
              )}
              <div className={instance.status === "suspended" ? "mt-2" : "mt-4"}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/instances/${instance.id}`)
                  }}
                >
                  Gérer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setNewName("") }}
        title="Nouvelle instance"
        description="Créez une nouvelle connexion WhatsApp"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nom de l'instance"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ex : Boutique Principale"
            required
            autoFocus
            minLength={4}
            error={createNameError ?? undefined}
            hint="Minimum 4 caractères."
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={creating} disabled={!normalizedNewName || !!createNameError}>
              Créer
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
