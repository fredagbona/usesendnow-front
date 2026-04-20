"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useInstance } from "@/hooks/useInstances"
import { useInstanceHealth } from "@/hooks/useInstanceHealth"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import InstanceHealthCard from "@/components/instances/InstanceHealthCard"
import { apiClient } from "@usesendnow/api-client"
import type { ConnectResponse } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { ArrowLeft01Icon, AlertDiamondIcon, Copy01Icon, Tick01Icon } from "hugeicons-react"

const STATUS_VARIANT: Record<string, "success" | "yellow" | "neutral" | "error"> = {
  connected:    "success",
  connecting:   "yellow",
  disconnected: "neutral",
  suspended:    "error",
}

export default function InstanceDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { copy } = usePortalLocale()
  const detail = copy.instances.detail
  const { instance, liveStatus, loading, error, refreshState, updateStatus } = useInstance(id)
  const { health, loading: healthLoading, error: healthError, refetch: healthRefetch } = useInstanceHealth(id)
  const [connectData, setConnectData] = useState<ConnectResponse | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<"id" | "instanceId" | null>(null)

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
          toast.success(detail.toastWhatsappConnected)
          setConnectData(null)
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [liveStatus, poll, detail.toastWhatsappConnected])

  const handleConnectQR = async () => {
    setConnecting(true)
    try {
      const data = await apiClient.instances.connect(id)
      setConnectData(data)
      updateStatus("connecting")
    } catch {
      toast.error(detail.toastConnectFailed)
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
      toast.success(detail.toastWhatsappDisconnected)
    } catch {
      toast.error(detail.toastDisconnectFailed)
    } finally {
      setLoggingOut(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiClient.instances.delete(id)
      toast.success(detail.toastInstanceDeleted)
      router.push("/instances")
    } catch {
      toast.error(detail.toastDeleteFailed)
      setDeleting(false)
    }
  }

  const handleCopyValue = async (value: string, field: "id" | "instanceId") => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error(detail.toastCopyFailed)
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
        <p className="text-sm text-text-secondary">{detail.notFound}</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/instances")}>
          {detail.backToInstances}
        </Button>
      </div>
    )
  }

  const status = liveStatus ?? instance.status
  const apiInstanceId = instance.meta?.instance?.instanceId ?? detail.apiIdUnavailable
  const linkedWaNumber = instance.waNumber ?? detail.waNumberPending
  const statusLabel = (s: string) =>
    (detail.status as Record<string, string>)[s] ?? s

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title={instance.name}
        description={instance.waNumber ?? detail.headerNotConnected}
        action={
          <div className="flex items-center gap-3">
            <Badge
              variant={STATUS_VARIANT[status] ?? "neutral"}
              pulse={status === "connecting"}
            >
              {statusLabel(status)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => router.push("/instances")}>
              <ArrowLeft01Icon className="w-4 h-4" />
              {copy.common.back}
            </Button>
          </div>
        }
      />

      {/* Suspended banner */}
      {status === "suspended" && (
        <div className="flex items-start gap-3 p-4 bg-error-subtle border border-error/30 rounded-2xl">
          <AlertDiamondIcon className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-error-hover">{detail.suspendedBannerTitle}</p>
            <p className="text-sm text-error-hover/80 mt-0.5">
              {detail.suspendedBannerBody}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card>
          <h2 className="mb-5 text-sm font-semibold text-text">{detail.whatsappSectionTitle}</h2>

          {status === "suspended" && (
            <p className="text-sm text-text-secondary">
              {detail.suspendedReconnectHint}
            </p>
          )}

          {status === "connected" && (
            <div className="space-y-4">
              <p className="text-sm text-text-body">
                {detail.connectedLine}{instance.waNumber ? ` : ${instance.waNumber}` : ""}.
              </p>
              <Button variant="secondary" loading={loggingOut} onClick={handleLogout}>
                {detail.disconnect}
              </Button>
            </div>
          )}

          {status === "disconnected" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  {detail.disconnectedQrHint}
                </p>
                <Button variant="primary" loading={connecting} onClick={handleConnectQR}>
                  {detail.generateQr}
                </Button>
              </div>
            </div>
          )}

          {status === "connecting" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-text-body">{detail.connectingWaiting}</p>
              </div>

              {connectData?.qrCode ? (
                <div className="space-y-3">
                  <p className="text-xs text-text-secondary">
                    {detail.qrScanSteps}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={connectData.qrCode}
                    alt={detail.qrAlt}
                    className="w-52 h-52 border border-border rounded-2xl"
                  />
                  <Button variant="ghost" size="sm" onClick={handleConnectQR}>
                    {detail.regenerateQr}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => poll()}>
                  {detail.refreshStatus}
                </Button>
              )}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-5 text-sm font-semibold text-text">{detail.apiSectionTitle}</h2>
          <div className="space-y-4">
            <ApiDetailRow
              label={detail.apiFieldId}
              value={instance.id}
              copyLabel={detail.copyId}
              copiedLabel={detail.copied}
              copied={copiedField === "id"}
              onCopy={() => handleCopyValue(instance.id, "id")}
            />
            <ApiDetailRow
              label={detail.apiFieldInstanceId}
              value={apiInstanceId}
              copyLabel={detail.copyInstanceId}
              copiedLabel={detail.copied}
              copied={copiedField === "instanceId"}
              onCopy={() => handleCopyValue(apiInstanceId, "instanceId")}
              canCopy={apiInstanceId !== detail.apiIdUnavailable}
            />
            <div className="rounded-2xl border border-border bg-bg-subtle p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {detail.linkedWaTitle}
              </p>
              <p className="mt-1 break-all font-mono text-sm text-text">
                {linkedWaNumber}
              </p>
              <p className="mt-2 text-xs text-text-muted">
                {detail.linkedWaHint}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Health / Warmup card */}
      <InstanceHealthCard
        health={health}
        loading={healthLoading}
        error={healthError}
        onRetry={healthRefetch}
      />

      {/* Danger zone */}
      <div className="border border-error/30 bg-error-subtle rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertDiamondIcon className="w-5 h-5 text-error" />
          <h2 className="text-sm font-semibold text-text">{detail.dangerTitle}</h2>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          {detail.dangerBody}
        </p>
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          {detail.deleteInstanceCta}
        </Button>
      </div>

      {/* Delete confirmation */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={detail.deleteModalTitle}
      >
        <p className="text-sm text-text-body mb-6">
          {detail.deleteModalPrefix}{" "}
          <strong className="text-text">{instance.name}</strong>
          {detail.deleteModalSuffix}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            {copy.common.back}
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            {detail.deleteConfirm}
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}

function ApiDetailRow({
  label,
  value,
  copyLabel,
  copiedLabel,
  copied,
  onCopy,
  canCopy = true,
}: {
  label: string
  value: string
  copyLabel: string
  copiedLabel: string
  copied: boolean
  onCopy: () => void
  canCopy?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {label}
        </p>
        <p className="mt-1 break-all font-mono text-sm text-text">
          {value}
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onCopy} disabled={!canCopy}>
        {copied ? (
          <>
            <Tick01Icon className="h-4 w-4" />
            {copiedLabel}
          </>
        ) : (
          <>
            <Copy01Icon className="h-4 w-4" />
            {copyLabel}
          </>
        )}
      </Button>
    </div>
  )
}
