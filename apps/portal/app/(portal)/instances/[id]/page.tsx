"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useInstance } from "@/hooks/useInstances"
import { apiClient } from "@usesendnow/api-client"
import type { ConnectResponse } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { ArrowLeft01Icon, AlertDiamondIcon } from "hugeicons-react"

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

type ConnectTab = "qr" | "pairing"

export default function InstanceDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { instance, liveStatus, loading, error, refreshState, updateStatus } = useInstance(id)
  const [connectData, setConnectData] = useState<ConnectResponse | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [connectTab, setConnectTab] = useState<ConnectTab>("qr")
  const [phoneNumber, setPhoneNumber] = useState("")

  const poll = useCallback(async () => {
    const status = await refreshState()
    if (status) updateStatus(status)
    return status
  }, [refreshState, updateStatus])

  useEffect(() => {
    if (liveStatus !== "connecting") return
    const interval = setInterval(async () => {
      const status = await poll()
      if (status === "connected" || status === "disconnected") {
        clearInterval(interval)
        if (status === "connected") {
          toast.success("WhatsApp connecté !")
          setConnectData(null)
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [liveStatus, poll])

  const handleConnectQR = async () => {
    setConnecting(true)
    try {
      const data = await apiClient.instances.connect(id)
      setConnectData(data)
      updateStatus("connecting")
    } catch {
      toast.error("Impossible d'initier la connexion. Réessayez.")
    } finally {
      setConnecting(false)
    }
  }

  const handleConnectPairing = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Entrez votre numéro WhatsApp.")
      return
    }
    setConnecting(true)
    try {
      const data = await apiClient.instances.connect(id, phoneNumber.trim())
      setConnectData(data)
      updateStatus("connecting")
    } catch {
      toast.error("Impossible d'initier la connexion. Réessayez.")
    } finally {
      setConnecting(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await apiClient.instances.logout(id)
      updateStatus("disconnected")
      setConnectData(null)
      toast.success("WhatsApp déconnecté")
    } catch {
      toast.error("Impossible de déconnecter. Réessayez.")
    } finally {
      setLoggingOut(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiClient.instances.delete(id)
      toast.success("Instance supprimée")
      router.push("/instances")
    } catch {
      toast.error("Impossible de supprimer l'instance.")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !instance) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-text-secondary">Instance introuvable.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/instances")}>
          Retour aux instances
        </Button>
      </div>
    )
  }

  const status = liveStatus ?? instance.status

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title={instance.name}
        description={instance.waNumber ?? "Non connecté"}
        action={
          <div className="flex items-center gap-3">
            <Badge
              variant={STATUS_VARIANT[status] ?? "neutral"}
              pulse={status === "connecting"}
            >
              {STATUS_LABEL[status] ?? status}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => router.push("/instances")}>
              <ArrowLeft01Icon className="w-4 h-4" />
              Retour
            </Button>
          </div>
        }
      />

      {/* Suspended banner */}
      {status === "suspended" && (
        <div className="flex items-start gap-3 p-4 bg-error-subtle border border-error/30 rounded-2xl">
          <AlertDiamondIcon className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-error-hover">Instance suspendue</p>
            <p className="text-sm text-error-hover/80 mt-0.5">
              Cette instance a été suspendue suite à un changement de plan. Passez à un plan supérieur pour la réactiver.
            </p>
          </div>
        </div>
      )}

      {/* Connection card */}
      <Card>
        <h2 className="text-sm font-semibold text-text mb-5">Connexion WhatsApp</h2>

        {status === "suspended" && (
          <p className="text-sm text-text-secondary">
            Reconnectez-vous à un plan supérieur pour réactiver cette instance.
          </p>
        )}

        {status === "connected" && (
          <div className="space-y-4">
            <p className="text-sm text-text-body">
              WhatsApp connecté{instance.waNumber ? ` : ${instance.waNumber}` : ""}.
            </p>
            <Button variant="secondary" loading={loggingOut} onClick={handleLogout}>
              Déconnecter
            </Button>
          </div>
        )}

        {status === "disconnected" && (
          <div className="space-y-5">
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-bg-muted rounded-xl w-fit">
              {(["qr", "pairing"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setConnectTab(tab); setConnectData(null) }}
                  className={[
                    "px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-100 cursor-pointer",
                    connectTab === tab
                      ? "bg-bg text-text border border-border shadow-sm"
                      : "text-text-secondary hover:text-text",
                  ].join(" ")}
                >
                  {tab === "qr" ? "QR Code" : "Code d'appairage"}
                </button>
              ))}
            </div>

            {connectTab === "qr" && (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Connectez-vous en scannant un QR code depuis votre téléphone.
                </p>
                <Button variant="primary" loading={connecting} onClick={handleConnectQR}>
                  Générer le QR Code
                </Button>
              </div>
            )}

            {connectTab === "pairing" && (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Entrez votre numéro WhatsApp pour recevoir un code d&apos;appairage.
                </p>
                <input
                  type="tel"
                  placeholder="+22912345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full max-w-xs border border-border-strong rounded-lg px-3.5 py-2.5 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150"
                />
                <Button variant="primary" loading={connecting} onClick={handleConnectPairing}>
                  Obtenir le code
                </Button>
              </div>
            )}
          </div>
        )}

        {status === "connecting" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-text-body">En attente de connexion...</p>
            </div>

            {connectData?.qrCode ? (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">
                  Ouvrez WhatsApp sur votre téléphone → Appareils connectés → Connecter un appareil, puis scannez ce QR code.
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={connectData.qrCode}
                  alt="QR Code"
                  className="w-52 h-52 border border-border rounded-2xl"
                />
                <Button variant="ghost" size="sm" onClick={handleConnectQR}>
                  Regénérer le QR
                </Button>
              </div>
            ) : connectData?.pairingCode ? (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">
                  Ouvrez WhatsApp → Appareils connectés → Lier avec un numéro, puis entrez ce code.
                </p>
                <div className="inline-flex items-center gap-3 bg-bg-subtle border border-border rounded-2xl px-6 py-4">
                  <span className="font-mono text-2xl font-bold tracking-[0.2em] text-text">
                    {connectData.pairingCode}
                  </span>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => poll()}>
                Actualiser le statut
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Danger zone */}
      <div className="border border-error/30 bg-error-subtle rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertDiamondIcon className="w-5 h-5 text-error" />
          <h2 className="text-sm font-semibold text-text">Zone de danger</h2>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          La suppression de cette instance déconnectera WhatsApp et effacera toutes les données associées.
        </p>
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          Supprimer cette instance
        </Button>
      </div>

      {/* Delete confirmation */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer l'instance"
      >
        <p className="text-sm text-text-body mb-6">
          Supprimer{" "}
          <strong className="text-text">{instance.name}</strong> ? WhatsApp sera déconnecté et toutes les données associées seront effacées.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Annuler
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
