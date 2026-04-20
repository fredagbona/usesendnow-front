"use client"

import type { InstanceHealth, SafetyState } from "@usesendnow/types"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { translateRecommendation } from "@/lib/safetyTranslations"
import {
  BarChartIcon,
  InformationCircleIcon,
  AlertDiamondIcon,
} from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

const STATE_VARIANTS: Record<SafetyState, "neutral" | "warning" | "success" | "error" | "info"> = {
  new: "neutral",
  warming: "warning",
  stable: "success",
  at_risk: "error",
  restricted: "error",
}

const SCORE_COLORS: Record<string, string> = {
  new: "text-text-muted",
  warming: "text-warning",
  stable: "text-primary",
  at_risk: "text-error-hover",
  restricted: "text-error-hover",
}

function makeFormatters(locale: string, emDash: string) {
  const numberLocale = locale === "fr" ? "fr-FR" : "en-US"
  const formatCap = (value: number | undefined): string => {
    if (value === undefined) return emDash
    return value.toLocaleString(numberLocale)
  }
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return emDash
    return new Date(dateStr).toLocaleDateString(numberLocale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }
  return { formatCap, formatDate }
}

interface InstanceHealthCardProps {
  health: InstanceHealth | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

export default function InstanceHealthCard({
  health,
  loading,
  error,
  onRetry,
}: InstanceHealthCardProps) {
  const { locale, copy } = usePortalLocale()
  const h = copy.instances.health
  const nl = copy.numberLookups
  const { formatCap, formatDate } = makeFormatters(locale, nl.emDash)

  const stateLabels = h.states as Record<SafetyState, string>

  if (loading) {
    return (
      <Card className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChartIcon className="w-5 h-5 text-text-secondary" />
          <h3 className="text-base font-medium text-text">{h.title}</h3>
        </div>
        <SkeletonCard />
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <BarChartIcon className="w-5 h-5 text-text-secondary" />
          <h3 className="text-base font-medium text-text">{h.title}</h3>
        </div>
        <p className="text-sm text-text-secondary mt-2">
          {h.loadError}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="text-xs text-primary-ink hover:text-text hover:underline mt-1"
        >
          {h.retry}
        </button>
      </Card>
    )
  }

  if (!health) return null

  const { warmupPolicy, usageWindowSummary, recommendations } = health
  const scoreColor = SCORE_COLORS[health.safetyState] ?? "text-text"

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <BarChartIcon className="w-5 h-5 text-text-secondary" />
        <h3 className="text-base font-medium text-text">{h.title}</h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant={STATE_VARIANTS[health.safetyState]}>
            {stateLabels[health.safetyState]}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <InformationCircleIcon className="w-4 h-4 text-text-muted" />
          <span className={`text-lg font-bold ${scoreColor}`}>{health.safetyScore}</span>
          <span className="text-xs text-text-muted">/ 100</span>
        </div>
      </div>

      <div className="text-sm text-text-secondary">
        {h.firstConnected} <span className="text-text font-medium">{formatDate(health.firstConnectedAt)}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg-subtle border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">{h.hourlyCap}</p>
          <p className="text-sm font-bold text-text">{formatCap(warmupPolicy.hourlyOutboundCap)}</p>
        </div>
        <div className="bg-bg-subtle border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">{h.dailyCap}</p>
          <p className="text-sm font-bold text-text">{formatCap(warmupPolicy.dailyOutboundCap)}</p>
        </div>
        <div className="bg-bg-subtle border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">{h.maxCampaign}</p>
          <p className="text-sm font-bold text-text">{formatCap(warmupPolicy.maxCampaignRecipients)}</p>
        </div>
        <div className="bg-bg-subtle border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">{h.maxColdRatio}</p>
          <p className="text-sm font-bold text-text">{warmupPolicy.maxColdRatio > 0 ? `${Math.round(warmupPolicy.maxColdRatio * 100)}%` : nl.emDash}</p>
        </div>
      </div>

      <div className="bg-bg-subtle border border-border rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          {h.activityTitle}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-text-muted">{h.window1h}</p>
            <p className="font-medium text-text">
              {h.sentUnique
                .replace("{{sent}}", String(usageWindowSummary.outbound1h))
                .replace("{{unique}}", String(usageWindowSummary.uniqueRecipients1h))}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">{h.window24h}</p>
            <p className="font-medium text-text">
              {h.sentUnique
                .replace("{{sent}}", String(usageWindowSummary.outbound24h))
                .replace("{{unique}}", String(usageWindowSummary.uniqueRecipients24h))}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-text-muted">{h.replies}</p>
            <p className="font-medium text-text">
              {h.repliesLine
                .replace("{{in24}}", String(usageWindowSummary.inboundReplies24h))
                .replace("{{in7}}", String(usageWindowSummary.inboundReplies7d))}
            </p>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <InformationCircleIcon className="w-4 h-4 text-text-secondary" />
            <p className="text-sm font-medium text-text">{h.recommendations}</p>
          </div>
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <AlertDiamondIcon className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                <span>{translateRecommendation(rec, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
