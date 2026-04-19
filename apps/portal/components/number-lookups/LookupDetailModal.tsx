"use client"

import type { NumberLookup } from "@usesendnow/types"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { Calendar01Icon, CheckmarkCircle01Icon, Cancel01Icon, AlertCircleIcon, Contact01Icon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

interface LookupDetailModalProps {
  lookup: NumberLookup | null
  onClose: () => void
  onImport?: (lookupId: string) => void
}

const STATUS_VARIANTS: Record<string, "success" | "error" | "warning" | "info" | "neutral"> = {
  done: "success",
  failed: "error",
  pending: "info",
  processing: "warning",
}

function makeFormatLookupDate(locale: string) {
  return (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
}

export default function LookupDetailModal({ lookup, onClose, onImport }: LookupDetailModalProps) {
  const { locale, copy } = usePortalLocale()
  const nl = copy.numberLookups
  const d = nl.detail
  const formatDate = makeFormatLookupDate(locale)

  if (!lookup) return null

  const result = lookup.result
  const dash = nl.emDash
  const instanceName = lookup.instance?.name ?? dash
  const instanceStatus = lookup.instance?.status ?? dash
  const canImport = lookup.status === "done" && !lookup.importedAt

  const statusLabels = d.status as Record<string, string>
  const statusLabel = statusLabels[lookup.status] ?? lookup.status

  return (
    <Modal open={!!lookup} onClose={onClose} title={d.title} maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar01Icon className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {formatDate(lookup.createdAt)}
              </span>
            </div>
            <p className="text-xs text-text-muted font-mono">{lookup.id}</p>
          </div>
          <Badge variant={STATUS_VARIANTS[lookup.status] ?? "neutral"}>
            {statusLabel}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-subtle border border-border rounded-lg p-3">
            <p className="text-xs text-text-secondary mb-1">{d.instance}</p>
            <p className="text-sm font-medium text-text">{instanceName}</p>
          </div>
          <div className="bg-bg-subtle border border-border rounded-lg p-3">
            <p className="text-xs text-text-secondary mb-1">{d.instanceStatus}</p>
            <p className="text-sm font-medium text-text capitalize">{instanceStatus}</p>
          </div>
        </div>

        {lookup.status === "done" && result && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-bg-subtle border border-border rounded-lg p-3 text-center">
                <p className="text-xs text-text-secondary">{d.requested}</p>
                <p className="text-xl font-bold text-text">{lookup.requestedCount}</p>
              </div>
              <div className="bg-primary-subtle border border-primary/30 rounded-lg p-3 text-center">
                <p className="text-xs text-text-secondary">{d.onWhatsApp}</p>
                <p className="text-xl font-bold text-primary">{lookup.onWhatsAppCount}</p>
              </div>
              <div className="bg-bg-subtle border border-border rounded-lg p-3 text-center">
                <p className="text-xs text-text-secondary">{d.absent}</p>
                <p className="text-xl font-bold text-text-secondary">{lookup.notOnWhatsAppCount}</p>
              </div>
              <div className="bg-error-subtle border border-error/30 rounded-lg p-3 text-center">
                <p className="text-xs text-text-secondary">{d.invalid}</p>
                <p className="text-xl font-bold text-error">{lookup.invalidCount}</p>
              </div>
            </div>

            {result.invalid.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text mb-2 flex items-center gap-1.5">
                  <AlertCircleIcon className="w-4 h-4 text-error" />
                  {d.invalidNumbers}
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {result.invalid.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-error-subtle border border-error/20 rounded-lg p-2.5">
                      <Cancel01Icon className="w-3.5 h-3.5 text-error shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-text truncate">{entry.input}</p>
                        {entry.reason && (
                          <p className="text-xs text-error-hover mt-0.5">{entry.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.notOnWhatsApp.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text mb-2 flex items-center gap-1.5">
                  <CheckmarkCircle01Icon className="w-4 h-4 text-text-muted" />
                  {d.notOnWhatsApp}
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {result.notOnWhatsApp.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-bg-subtle border border-border rounded-lg p-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-text truncate">{entry.input}</p>
                        {entry.normalized && entry.normalized !== entry.input && (
                          <p className="text-xs text-text-muted">{d.normalized} {entry.normalized}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.onWhatsApp.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text mb-2 flex items-center gap-1.5">
                  <CheckmarkCircle01Icon className="w-4 h-4 text-primary" />
                  {d.onWhatsAppTitle}
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {result.onWhatsApp.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-primary-subtle border border-primary/20 rounded-lg p-2.5">
                      <CheckmarkCircle01Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-text truncate">{entry.input}</p>
                        {entry.normalized && entry.normalized !== entry.input && (
                          <p className="text-xs text-text-muted">{d.normalized} {entry.normalized}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {lookup.status === "failed" && lookup.error && (
          <div className="flex items-start gap-2 p-3 bg-error-subtle border border-error/30 rounded-xl">
            <AlertCircleIcon className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error-hover">{lookup.error}</p>
          </div>
        )}

        {lookup.progress !== undefined && lookup.status !== "done" && lookup.status !== "failed" && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-text-secondary">{d.progress}</span>
              <span className="text-text">{lookup.progress}%</span>
            </div>
            <div className="w-full bg-bg-muted rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(lookup.progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {lookup.completedAt && (
          <p className="text-xs text-text-muted text-center">
            {d.completedOn.replace("{{date}}", formatDate(lookup.completedAt))}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            {canImport && onImport && (
              <Button variant="primary" size="sm" onClick={() => onImport(lookup.id)}>
                <Contact01Icon className="w-4 h-4 mr-1.5" />
                {lookup.onWhatsAppCount > 1
                  ? d.importMany.replace("{{count}}", String(lookup.onWhatsAppCount))
                  : d.importOne.replace("{{count}}", String(lookup.onWhatsAppCount))}
              </Button>
            )}
            {lookup.importedAt && (
              <Badge variant="info">{d.alreadyImported}</Badge>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            <Cancel01Icon className="w-4 h-4 mr-1.5" />
            {d.close}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
