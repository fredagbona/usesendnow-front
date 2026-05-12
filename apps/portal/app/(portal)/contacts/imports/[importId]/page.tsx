"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { ContactImport } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { fadeIn } from "@/lib/animations"
import { formatDate } from "@/lib/format"
import { ArrowLeft01Icon } from "hugeicons-react"
import { SkeletonCard } from "@/components/ui/Skeleton"

const STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "error"> = {
  pending: "neutral",
  processing: "blue",
  done: "success",
  failed: "error",
}

export default function ContactImportDetailPage() {
  const params = useParams<{ importId: string }>()
  const importId = params.importId
  const router = useRouter()
  const { copy } = usePortalLocale()
  const d = copy.contacts.importDetail
  const iw = copy.contacts.importWizard
  const statusLabels = copy.contacts.importStatus as Record<string, string>

  const [imp, setImp] = useState<ContactImport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadImport = useCallback(async (opts?: { silent?: boolean }) => {
    if (!importId) return
    if (!opts?.silent) setLoading(true)
    if (!opts?.silent) {
      setError(null)
    }
    try {
      const data = await apiClient.contacts.getImport(importId, { includeReport: true })
      setImp(data)
      if (opts?.silent) {
        setError(null)
      }
    } catch (err) {
      if (!opts?.silent) {
        if (err instanceof ApiClientError && err.code === "NOT_FOUND") {
          setError(d.notFound)
        } else {
          setError(d.loadError)
        }
        setImp(null)
      }
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [importId, d.loadError, d.notFound])

  useEffect(() => {
    void loadImport()
  }, [loadImport])

  useEffect(() => {
    if (!imp || (imp.status !== "pending" && imp.status !== "processing")) return
    const interval = setInterval(() => {
      void loadImport({ silent: true })
    }, 3000)
    return () => clearInterval(interval)
  }, [imp?.status, loadImport])

  if (loading && !imp) {
    return (
      <div className="space-y-6 max-w-3xl">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !imp) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => router.push("/contacts")}>
          <ArrowLeft01Icon className="w-4 h-4 mr-1.5" />
          {d.back}
        </Button>
        <Card className="p-6">
          <p className="text-sm text-text-body">{error ?? d.notFound}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => router.push("/contacts")}>
              {d.back}
            </Button>
            <Button variant="primary" onClick={() => void loadImport()}>
              {copy.common.retry}
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  const progressPct =
    typeof imp.progress === "number"
      ? imp.progress
      : imp.totalRows > 0 && typeof imp.processedRows === "number"
        ? Math.round((imp.processedRows / imp.totalRows) * 100)
        : null

  const errors = imp.report?.errors ?? []

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/contacts")}>
          <ArrowLeft01Icon className="w-4 h-4 mr-1.5" />
          {d.back}
        </Button>
      </div>

      <PageHeader
        title={d.pageTitle}
        description={
          <span className="font-mono text-xs text-text-muted">
            {d.idLabel}: {imp.id}
          </span>
        }
      />

      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={STATUS_VARIANT[imp.status] ?? "neutral"} pulse={imp.status === "processing"}>
            {statusLabels[imp.status] ?? imp.status}
          </Badge>
          <span className="text-sm text-text-muted">{formatDate(imp.createdAt)}</span>
          {imp.completedAt ? (
            <span className="text-sm text-text-muted">→ {formatDate(imp.completedAt)}</span>
          ) : null}
        </div>

        {progressPct !== null && (
          <div>
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>{d.progressLabel}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
              />
            </div>
            {typeof imp.processedRows === "number" ? (
              <p className="text-xs text-text-muted mt-1">
                {d.processedLabel}: {imp.processedRows.toLocaleString()} / {imp.totalRows.toLocaleString()}
              </p>
            ) : null}
          </div>
        )}

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-text-muted text-xs uppercase tracking-wide">{copy.contacts.importTableRows}</dt>
            <dd className="font-semibold text-text mt-0.5">{imp.totalRows.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-text-muted text-xs uppercase tracking-wide">{copy.contacts.importTableImported}</dt>
            <dd className="font-semibold text-text mt-0.5">{imp.importedCount.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-text-muted text-xs uppercase tracking-wide">{copy.contacts.importTableUpdated}</dt>
            <dd className="font-semibold text-text mt-0.5">{imp.updatedCount.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-text-muted text-xs uppercase tracking-wide">{d.skippedLabel}</dt>
            <dd className="font-semibold text-text mt-0.5">{imp.skippedCount.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-text-muted text-xs uppercase tracking-wide">{copy.contacts.importTableInvalid}</dt>
            <dd className="font-semibold text-text mt-0.5">{imp.invalidCount.toLocaleString()}</dd>
          </div>
        </dl>
      </Card>

      {errors.length > 0 ? (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text mb-3">{d.reportTitle}</h2>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-secondary uppercase">
                  <th className="pb-2 pr-3">{iw.errorsTableLine}</th>
                  <th className="pb-2 pr-3">{iw.errorsTablePhone}</th>
                  <th className="pb-2">{iw.errorsTableReason}</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((row, idx) => (
                  <tr key={`${row.line}-${row.phone}-${idx}`} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-mono">{row.line}</td>
                    <td className="py-2 pr-3 font-mono">{row.phone}</td>
                    <td className="py-2 text-text-body">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden space-y-3 divide-y divide-border">
            {errors.map((row, idx) => (
              <div key={`${row.line}-${row.phone}-${idx}`} className="pt-3 first:pt-0 text-sm">
                <p className="font-mono text-xs text-text-muted">
                  {iw.errorsTableLine} {row.line} · {row.phone}
                </p>
                <p className="text-text-body mt-1">{row.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </motion.div>
  )
}
