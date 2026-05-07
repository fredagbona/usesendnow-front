"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { NumberLookup } from "@usesendnow/types"
import { fadeIn } from "@/lib/animations"
import { toast } from "@/lib/toast"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton"
import LookupSummaryCards from "@/components/number-lookups/LookupSummaryCards"
import LookupResultsTabs from "@/components/number-lookups/LookupResultsTabs"
import ImportContactsPanel from "@/components/number-lookups/ImportContactsPanel"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { useContactGroups } from "@/hooks/useContactGroups"
import { ArrowLeft01Icon, AlertCircleIcon, Calendar01Icon, Contact01Icon, RefreshIcon } from "hugeicons-react"

const STATUS_VARIANTS: Record<string, "success" | "error" | "warning" | "info" | "neutral"> = {
  done: "success",
  failed: "error",
  pending: "info",
  processing: "warning",
}

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatShort(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function NumberLookupDetailPage() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const lookupId = Array.isArray(params.id) ? params.id[0] : params.id
  const { copy, locale } = usePortalLocale()
  const { groups, loading: groupsLoading } = useContactGroups()
  const [lookup, setLookup] = useState<NumberLookup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const c = copy.numberLookups.detail
  const statusLabels = c.status as Record<string, string>

  const fetchLookup = async () => {
    if (!lookupId) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.numberLookups.get(lookupId)
      setLookup(data)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "NOT_FOUND") {
        setError(c.loadNotFound)
      } else {
        setError(c.loadFailed)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchLookup()
    // lookupId is a route param.
  }, [lookupId])

  const canImport = lookup?.status === "done" && !lookup.importedAt && !!lookup.result
  const statusLabel = lookup ? statusLabels[lookup.status] ?? lookup.status : ""
  const instanceName = lookup?.instance?.name ?? copy.numberLookups.emDash
  const instanceStatus = lookup?.instance?.status ?? copy.numberLookups.emDash
  const hasResult = !!lookup?.result && (
    lookup.result.onWhatsApp.length + lookup.result.notOnWhatsApp.length + lookup.result.invalid.length > 0
  )

  const completedOn = useMemo(() => {
    if (!lookup?.completedAt) return null
    return formatDate(lookup.completedAt, locale)
  }, [locale, lookup?.completedAt])

  const handleImport = async (groupId?: string, tag?: string) => {
    if (!lookup) return false
    setImporting(true)
    try {
      const payload: { groupId?: string; tag?: string } = {}
      if (groupId && groupId.trim()) payload.groupId = groupId.trim()
      if (tag && tag.trim()) payload.tag = tag.trim()
      const result = await apiClient.numberLookups.importContacts(lookup.id, payload)
      if (result.skipped > 0 && result.created === 0 && result.updated === 0) {
        toast.info(copy.numberLookups.partialImport)
      } else {
        toast.success(copy.numberLookups.contactsImported)
      }
      await fetchLookup()
      return true
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "LOOKUP_NOT_READY") {
          toast.error(copy.hooks.numberLookupNotReady)
        } else if (err.code === "CONTACT_GROUP_NOT_FOUND") {
          toast.error(copy.hooks.numberLookupGroupNotFound)
        } else {
          toast.error(copy.hooks.numberLookupImportFailed)
        }
      }
      return false
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-12 w-48" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !lookup) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-5xl">
        <Button variant="secondary" size="sm" onClick={() => router.push("/number-lookups")}>
          <ArrowLeft01Icon className="w-4 h-4 mr-1.5" />
          {copy.common.back}
        </Button>
        <PageHeader title={copy.numberLookups.pageTitle} description={copy.numberLookups.pageDescription} />
        <div className="bg-bg border border-border rounded-2xl p-6 text-center">
          <AlertCircleIcon className="w-5 h-5 text-error mx-auto mb-3" />
          <p className="text-sm text-text-body">{error ?? c.loadFailed}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="secondary" onClick={() => router.push("/number-lookups")}>
              {copy.common.back}
            </Button>
            <Button variant="primary" onClick={fetchLookup}>
              <RefreshIcon className="w-4 h-4 mr-1.5" />
              {copy.common.retry}
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-8 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => router.push("/number-lookups")}>
          <ArrowLeft01Icon className="w-4 h-4 mr-1.5" />
          {copy.common.back}
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANTS[lookup.status] ?? "neutral"}>{statusLabel}</Badge>
          <Button variant="ghost" size="sm" onClick={fetchLookup}>
            <RefreshIcon className="w-4 h-4 mr-1.5" />
            {copy.common.retry}
          </Button>
        </div>
      </div>

      <PageHeader title={copy.numberLookups.pageTitle} description={copy.numberLookups.pageDescription} />

      <section className="bg-bg border border-border rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)] space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
              <Calendar01Icon className="w-4 h-4" />
              <span>{formatShort(lookup.createdAt, locale)}</span>
            </div>
            <p className="text-xs text-text-muted font-mono break-all">{lookup.id}</p>
          </div>
          <Badge variant={STATUS_VARIANTS[lookup.status] ?? "neutral"}>{statusLabel}</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="bg-bg-subtle border border-border rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted mb-1">{c.instance}</p>
            <p className="text-sm font-medium text-text">{instanceName}</p>
          </div>
          <div className="bg-bg-subtle border border-border rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted mb-1">{c.instanceStatus}</p>
            <p className="text-sm font-medium text-text capitalize">{instanceStatus}</p>
          </div>
        </div>

        {lookup.status === "pending" || lookup.status === "processing" ? (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-warning/25 bg-warning-subtle">
            <AlertCircleIcon className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">{copy.numberLookups.processing}</p>
              {lookup.progress !== undefined ? (
                <div className="mt-3 w-full bg-bg-muted rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(lookup.progress, 100)}%` }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {lookup.status === "failed" && lookup.error ? (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-error/30 bg-error-subtle">
            <AlertCircleIcon className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error-hover">{lookup.error}</p>
          </div>
        ) : null}

        {lookup.status === "done" && lookup.result ? (
          <>
            <LookupSummaryCards
              requested={lookup.requestedCount}
              checked={lookup.checkedCount || lookup.normalizedCount}
              onWhatsApp={lookup.onWhatsAppCount}
              notOnWhatsApp={lookup.notOnWhatsAppCount}
              invalid={lookup.invalidCount}
            />

            <LookupResultsTabs
              onWhatsApp={lookup.result.onWhatsApp}
              notOnWhatsApp={lookup.result.notOnWhatsApp}
              invalid={lookup.result.invalid}
            />

            {hasResult ? (
              <ImportContactsPanel
                lookupId={lookup.id}
                importing={importing}
                groups={groups}
                onImported={fetchLookup}
                onValidCount={lookup.onWhatsAppCount}
              />
            ) : null}

            {completedOn ? (
              <p className="text-xs text-text-muted text-center">
                {c.completedOn.replace("{{date}}", completedOn)}
              </p>
            ) : null}
          </>
        ) : null}

        {canImport && !groupsLoading ? (
          <div className="border-t border-border pt-4 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => void handleImport()} loading={importing}>
              <Contact01Icon className="w-4 h-4 mr-1.5" />
              {lookup.onWhatsAppCount > 1
                ? c.importMany.replace("{{count}}", String(lookup.onWhatsAppCount))
                : c.importOne.replace("{{count}}", String(lookup.onWhatsAppCount))}
            </Button>
          </div>
        ) : null}
      </section>
    </motion.div>
  )
}
