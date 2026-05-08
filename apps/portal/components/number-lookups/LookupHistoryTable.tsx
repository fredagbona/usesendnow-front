"use client"

import type { NumberLookup } from "@usesendnow/types"
import Badge from "@/components/ui/Badge"
import { EyeIcon, Contact01Icon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

interface LookupHistoryTableProps {
  lookups: NumberLookup[]
  onView: (lookup: NumberLookup) => void
  onImport: (id: string) => void
  importingId: string | null
}

function makeFormatShortDate(locale: string) {
  return (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
}

export default function LookupHistoryTable({
  lookups,
  onView,
  onImport,
  importingId,
}: LookupHistoryTableProps) {
  const { locale, copy } = usePortalLocale()
  const nl = copy.numberLookups
  const ht = nl.historyTable
  const statusLabels = nl.detail.status as Record<string, string>
  const formatDate = makeFormatShortDate(locale)

  const statusVariant = (status: string): "success" | "error" | "warning" | "info" | "neutral" => {
    const map: Record<string, "success" | "error" | "warning" | "info" | "neutral"> = {
      done: "success",
      failed: "error",
      pending: "info",
      processing: "warning",
    }
    return map[status] ?? "info"
  }

  if (lookups.length === 0) {
    return (
      <div className="bg-bg border border-border rounded-2xl p-10 text-center">
        <p className="text-sm text-text-muted">
          {ht.empty}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-bg border border-border rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]">
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {ht.headers.map((h) => (
                <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lookups.map((lookup) => {
              const variant = statusVariant(lookup.status)
              const label = statusLabels[lookup.status] ?? lookup.status
              const instanceName = lookup.instance?.name ?? nl.emDash
              const canImport = lookup.status === "done" && !lookup.importedAt
              return (
                <tr key={lookup.id} className="border-b border-border last:border-0 hover:bg-bg-subtle transition-colors">
                  <td className="px-5 py-3 text-sm text-text-body whitespace-nowrap">
                    {formatDate(lookup.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-text whitespace-nowrap">
                    {instanceName}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={variant}>{label}</Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-text-body">{lookup.requestedCount}</td>
                  <td className="px-5 py-3 text-sm text-primary font-medium">{lookup.onWhatsAppCount}</td>
                  <td className="px-5 py-3 text-sm text-text-secondary">{lookup.notOnWhatsAppCount}</td>
                  <td className="px-5 py-3 text-sm text-error">{lookup.invalidCount}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onView(lookup)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:border-primary hover:bg-primary-subtle transition-colors cursor-pointer"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        <span>{ht.viewDetails}</span>
                      </button>
                      {canImport ? (
                        <button
                          type="button"
                          onClick={() => onImport(lookup.id)}
                          title={ht.importContacts}
                          disabled={importingId === lookup.id}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-subtle transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Contact01Icon className="w-4 h-4" />
                        </button>
                      ) : lookup.importedAt ? (
                        <Badge variant="info">{ht.imported}</Badge>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden divide-y divide-border">
        {lookups.map((lookup) => {
          const variant = statusVariant(lookup.status)
          const label = statusLabels[lookup.status] ?? lookup.status
          const instanceName = lookup.instance?.name ?? nl.emDash
          const canImport = lookup.status === "done" && !lookup.importedAt
          return (
            <div key={lookup.id} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text">
                  {formatDate(lookup.createdAt)} · {instanceName}
                </span>
                <Badge variant={variant}>{label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-xs text-text-secondary">
                  <span>{ht.mobileWhatsApp} <strong className="text-primary">{lookup.onWhatsAppCount}</strong></span>
                  <span>{ht.mobileAbsent} <strong>{lookup.notOnWhatsAppCount}</strong></span>
                  <span>{ht.mobileInvalid} <strong className="text-error">{lookup.invalidCount}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onView(lookup)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-text-secondary hover:text-text hover:border-primary hover:bg-primary-subtle transition-colors cursor-pointer"
                  >
                    <EyeIcon className="w-3.5 h-3.5" />
                    <span>{ht.viewDetails}</span>
                  </button>
                  {canImport ? (
                    <button
                      type="button"
                      onClick={() => onImport(lookup.id)}
                      title={ht.importContacts}
                      disabled={importingId === lookup.id}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-subtle transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Contact01Icon className="w-4 h-4" />
                    </button>
                  ) : lookup.importedAt ? (
                    <Badge variant="info">{ht.imported}</Badge>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
