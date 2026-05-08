"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { apiClient } from "@usesendnow/api-client"
import type { Instance, InstanceHealth } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { useInstances } from "@/hooks/useInstances"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { AlertDiamondIcon, ArrowRight01Icon, BarChartIcon, InformationCircleIcon } from "hugeicons-react"
import { translateRecommendation } from "@/lib/safetyTranslations"
import Link from "next/link"

type HealthEntry = {
  instance: Instance
  health: InstanceHealth
}

const STATE_VARIANTS: Record<string, "success" | "warning" | "error" | "neutral" | "info"> = {
  new: "neutral",
  warming: "warning",
  stable: "success",
  at_risk: "error",
  restricted: "error",
}

export default function GlobalWarmupPage() {
  const { copy, locale } = usePortalLocale()
  const { instances, loading: instancesLoading } = useInstances()
  const [entries, setEntries] = useState<HealthEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const g = copy.instances.globalHealth

  const connectedInstances = useMemo(
    () => instances.filter((instance) => instance.status === "connected"),
    [instances],
  )

  useEffect(() => {
    const fetchHealth = async () => {
      if (instancesLoading) return
      setLoading(true)
      setError(null)
      try {
        const results = await Promise.allSettled(
          connectedInstances.map(async (instance) => {
            const health = await apiClient.instances.getHealth(instance.id)
            return { instance, health }
          })
        )
        const fulfilled = results
          .filter((result): result is PromiseFulfilledResult<HealthEntry> => result.status === "fulfilled")
          .map((result) => result.value)
        if (results.length > 0 && fulfilled.length === 0) {
          setError(g.loadError)
        }
        fulfilled.sort((a, b) => b.health.safetyScore - a.health.safetyScore)
        setEntries(fulfilled)
      } finally {
        setLoading(false)
      }
    }

    void fetchHealth()
  }, [connectedInstances, g.loadError, instancesLoading])

  if (instancesLoading || loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-8 max-w-6xl">
      <PageHeader
        title={g.pageTitle}
        description={g.pageDescription}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-text-muted">{g.connectedInstances}</p>
          <p className="text-2xl font-bold text-text">{entries.length}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-text-muted">{g.stateLabel}</p>
          <p className="text-2xl font-bold text-warning">{entries.filter((entry) => entry.health.safetyState === "warming").length}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-text-muted">{g.stateLabel}</p>
          <p className="text-2xl font-bold text-success">{entries.filter((entry) => entry.health.safetyState === "stable").length}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-text-muted">{g.stateLabel}</p>
          <p className="text-2xl font-bold text-error">{entries.filter((entry) => ["at_risk", "restricted"].includes(entry.health.safetyState)).length}</p>
        </Card>
      </div>

      {error ? (
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-warning" />
            <h2 className="text-base font-medium text-text">{g.pageTitle}</h2>
          </div>
          <p className="text-sm text-text-secondary">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            {g.retry}
          </Button>
        </Card>
      ) : entries.length === 0 ? (
        <Card className="space-y-3 text-center">
          <BarChartIcon className="w-6 h-6 text-text-secondary mx-auto" />
          <h2 className="text-base font-medium text-text">{g.emptyTitle}</h2>
          <p className="text-sm text-text-secondary">{g.emptyDescription}</p>
          <Link
            href="/instances"
            className="inline-flex items-center justify-center rounded-none border border-border bg-bg-subtle px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-text-secondary hover:border-border-strong hover:bg-bg-muted hover:text-text transition-all duration-200"
          >
            {copy.nav.instances}
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map(({ instance, health }) => (
            <Card key={instance.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">{instance.name}</p>
                  <p className="text-xs text-text-muted font-mono break-all">{instance.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATE_VARIANTS[health.safetyState] ?? "neutral"}>
                    {(copy.instances.health.states as Record<string, string>)[health.safetyState]}
                  </Badge>
                  <span className="text-sm font-semibold text-text">{g.scoreLabel}: {health.safetyScore}/100</span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-bg-subtle p-4">
                  <p className="text-xs uppercase tracking-wide text-text-muted">{g.firstConnectedLabel}</p>
                  <p className="mt-1 text-sm text-text">
                    {health.firstConnectedAt ? new Date(health.firstConnectedAt).toLocaleString(locale === "fr" ? "fr-FR" : "en-US") : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-bg-subtle p-4">
                  <p className="text-xs uppercase tracking-wide text-text-muted">{copy.instances.health.hourlyCap}</p>
                  <p className="mt-1 text-sm text-text">{health.warmupPolicy.hourlyOutboundCap.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}</p>
                </div>
                <div className="rounded-xl border border-border bg-bg-subtle p-4">
                  <p className="text-xs uppercase tracking-wide text-text-muted">{copy.instances.health.dailyCap}</p>
                  <p className="mt-1 text-sm text-text">{health.warmupPolicy.dailyOutboundCap.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-bg-subtle p-4">
                  <p className="text-xs uppercase tracking-wide text-text-muted">{g.recommendationsTitle}</p>
                  <ul className="mt-2 space-y-2">
                    {health.recommendations.length > 0 ? health.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                        <AlertDiamondIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        <span>{translateRecommendation(rec, locale)}</span>
                      </li>
                    )) : (
                      <li className="text-sm text-text-secondary">{copy.numberLookups.emDash}</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-bg-subtle p-4">
                  <p className="text-xs uppercase tracking-wide text-text-muted">{copy.instances.health.activityTitle}</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-text-muted">{copy.instances.health.window1h}</p>
                      <p className="font-medium text-text">{health.usageWindowSummary.outbound1h} · {health.usageWindowSummary.uniqueRecipients1h}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">{copy.instances.health.window24h}</p>
                      <p className="font-medium text-text">{health.usageWindowSummary.outbound24h} · {health.usageWindowSummary.uniqueRecipients24h}</p>
                    </div>
                  </div>
                  <Link
                    href={`/instances/${instance.id}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-none border border-border bg-bg-subtle px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-text-secondary hover:border-border-strong hover:bg-bg-muted hover:text-text transition-all duration-200"
                  >
                    {g.details}
                    <ArrowRight01Icon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
