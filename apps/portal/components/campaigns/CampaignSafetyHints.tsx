"use client"

import type { SafetyAssessment } from "@usesendnow/types"
import Badge from "@/components/ui/Badge"
import { translateReason, translateRecommendation } from "@/lib/safetyTranslations"
import { AlertDiamondIcon, InformationCircleIcon, Megaphone01Icon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

interface CampaignSafetyHintsProps {
  safety: SafetyAssessment
  className?: string
}

const RISK_VARIANTS: Record<string, "warning" | "error" | "neutral"> = {
  low: "neutral",
  medium: "warning",
  high: "error",
}

export default function CampaignSafetyHints({
  safety,
  className = "",
}: CampaignSafetyHintsProps) {
  const { locale, copy } = usePortalLocale()
  const s = copy.campaigns.safety
  const { riskLevel, reasons, recommendations, appliedLimits, audience } = safety

  const numberLocale = locale === "fr" ? "fr-FR" : "en-US"

  const riskLabel =
    riskLevel === "low" ? s.riskLow : riskLevel === "medium" ? s.riskMedium : riskLevel === "high" ? s.riskHigh : riskLevel

  return (
    <div className={`border border-warning/30 bg-warning-subtle rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-2 mb-3">
        <InformationCircleIcon className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-warning-text">{s.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={RISK_VARIANTS[riskLevel] ?? "warning"}>
              {s.riskPrefix} {riskLabel}
            </Badge>
            {safety.score !== undefined && (
              <span className="flex items-center gap-1 text-xs text-warning-text">
                <InformationCircleIcon className="w-3.5 h-3.5" />
                {s.scorePrefix} {safety.score}/100
              </span>
            )}
          </div>
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <p className="text-xs font-semibold text-warning-text">{s.reasons}</p>
          <ul className="space-y-1">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-warning-text">
                <AlertDiamondIcon className="w-3 h-3 shrink-0 mt-0.5" />
                <span>{translateReason(reason)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <p className="text-xs font-semibold text-warning-text">{s.recommendations}</p>
          <ul className="space-y-1">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-warning-text">
                <Megaphone01Icon className="w-3 h-3 shrink-0 mt-0.5" />
                <span>{translateRecommendation(rec)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {appliedLimits && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {appliedLimits.maxCampaignRecipients !== undefined && (
            <div className="bg-bg/50 border border-warning/20 rounded-lg px-2.5 py-1.5">
              <p className="text-[10px] text-warning-text/70">{s.maxCampaignRecipients}</p>
              <p className="text-sm font-bold text-warning-text">{appliedLimits.maxCampaignRecipients.toLocaleString(numberLocale)}</p>
            </div>
          )}
          {appliedLimits.maxColdRatio !== undefined && (
            <div className="bg-bg/50 border border-warning/20 rounded-lg px-2.5 py-1.5">
              <p className="text-[10px] text-warning-text/70">{s.maxColdRatio}</p>
              <p className="text-sm font-bold text-warning-text">{Math.round(appliedLimits.maxColdRatio * 100)}%</p>
            </div>
          )}
        </div>
      )}

      {audience && (
        <div className="bg-bg/50 border border-warning/20 rounded-lg p-3">
          <p className="text-xs font-semibold text-warning-text mb-2">
            {s.audienceTitle.replace("{{count}}", audience.totalRecipients.toLocaleString(numberLocale))}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-[10px] text-text-muted">{s.warmContacts}</p>
              <p className="font-bold text-primary">{audience.warmCount.toLocaleString(numberLocale)}</p>
              <p className="text-[10px] text-text-muted">{Math.round(audience.warmRatio * 100)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted">{s.coldContacts}</p>
              <p className="font-bold text-warning">{audience.coldCount.toLocaleString(numberLocale)}</p>
              <p className="text-[10px] text-text-muted">{Math.round(audience.coldRatio * 100)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted">{s.unknownContacts}</p>
              <p className="font-bold text-text-secondary">{audience.unknownCount.toLocaleString(numberLocale)}</p>
              <p className="text-[10px] text-text-muted">{Math.round(audience.unknownRatio * 100)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
