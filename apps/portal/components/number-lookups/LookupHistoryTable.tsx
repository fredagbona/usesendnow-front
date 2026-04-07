"use client"

import type { NumberLookup } from "@usesendnow/types"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { EyeIcon, Contact01Icon } from "hugeicons-react"

interface LookupHistoryTableProps {
  lookups: NumberLookup[]
  onView: (lookup: NumberLookup) => void
  onImport: (id: string) => void
  importingId: string | null
}

const STATUS_CONFIG: Record<string, { variant: "success" | "error" | "warning" | "info" | "neutral"; label: string }> = {
  done: { variant: "success", label: "Terminé" },
  failed: { variant: "error", label: "Échoué" },
  pending: { variant: "info", label: "En attente" },
  processing: { variant: "warning", label: "En cours" },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
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
  if (lookups.length === 0) {
    return (
      <div className="bg-bg border border-border rounded-2xl p-10 text-center">
        <p className="text-sm text-text-muted">
          Aucun lookup effectué pour le moment.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-bg border border-border rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Date", "Instance", "Statut", "Demandés", "WhatsApp", "Absents", "Invalides", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lookups.map((lookup) => {
              const config = STATUS_CONFIG[lookup.status] ?? STATUS_CONFIG.pending
              const instanceName = lookup.instance?.name ?? "—"
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
                    <Badge variant={config.variant}>{config.label}</Badge>
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
                        title="Voir les détails"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-text hover:bg-bg-subtle transition-colors cursor-pointer"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {canImport ? (
                        <button
                          type="button"
                          onClick={() => onImport(lookup.id)}
                          title="Importer les contacts"
                          disabled={importingId === lookup.id}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-subtle transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Contact01Icon className="w-4 h-4" />
                        </button>
                      ) : lookup.importedAt ? (
                        <Badge variant="info">Importé</Badge>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-border">
        {lookups.map((lookup) => {
          const config = STATUS_CONFIG[lookup.status] ?? STATUS_CONFIG.pending
          const instanceName = lookup.instance?.name ?? "—"
          const canImport = lookup.status === "done" && !lookup.importedAt
          return (
            <div key={lookup.id} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text">
                  {formatDate(lookup.createdAt)} · {instanceName}
                </span>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-xs text-text-secondary">
                  <span>WhatsApp: <strong className="text-primary">{lookup.onWhatsAppCount}</strong></span>
                  <span>Absents: <strong>{lookup.notOnWhatsAppCount}</strong></span>
                  <span>Invalides: <strong className="text-error">{lookup.invalidCount}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onView(lookup)}
                    title="Voir les détails"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-text hover:bg-bg-subtle transition-colors cursor-pointer"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  {canImport ? (
                    <button
                      type="button"
                      onClick={() => onImport(lookup.id)}
                      title="Importer les contacts"
                      disabled={importingId === lookup.id}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-subtle transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Contact01Icon className="w-4 h-4" />
                    </button>
                  ) : lookup.importedAt ? (
                    <Badge variant="info">Importé</Badge>
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
