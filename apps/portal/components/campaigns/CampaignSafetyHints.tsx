"use client"

import type { SafetyAssessment } from "@usesendnow/types"
import Badge from "@/components/ui/Badge"
import { translateReason, translateRecommendation } from "@/lib/safetyTranslations"
import { AlertDiamondIcon, InformationCircleIcon, Megaphone01Icon } from "hugeicons-react"

interface CampaignSafetyHintsProps {
  safety: SafetyAssessment
  className?: string
}

const RISK_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Modéré",
  high: "Élevé",
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
  const { riskLevel, reasons, recommendations, appliedLimits, audience } = safety

  return (
    <div className={`border border-warning/30 bg-warning-subtle rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-2 mb-3">
        <InformationCircleIcon className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-warning-text">Warmup guidance</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={RISK_VARIANTS[riskLevel] ?? "warning"}>
              Niveau de risque : {RISK_LABELS[riskLevel] ?? riskLevel}
            </Badge>
            {safety.score !== undefined && (
              <span className="flex items-center gap-1 text-xs text-warning-text">
                <InformationCircleIcon className="w-3.5 h-3.5" />
                Score : {safety.score}/100
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reasons */}
      {reasons.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <p className="text-xs font-semibold text-warning-text">Raisons</p>
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

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <p className="text-xs font-semibold text-warning-text">Recommandations</p>
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

      {/* Applied limits */}
      {appliedLimits && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {appliedLimits.maxCampaignRecipients !== undefined && (
            <div className="bg-bg/50 border border-warning/20 rounded-lg px-2.5 py-1.5">
              <p className="text-[10px] text-warning-text/70">Max destinataires campagne</p>
              <p className="text-sm font-bold text-warning-text">{appliedLimits.maxCampaignRecipients.toLocaleString("fr-FR")}</p>
            </div>
          )}
          {appliedLimits.maxColdRatio !== undefined && (
            <div className="bg-bg/50 border border-warning/20 rounded-lg px-2.5 py-1.5">
              <p className="text-[10px] text-warning-text/70">Ratio contacts froids max</p>
              <p className="text-sm font-bold text-warning-text">{Math.round(appliedLimits.maxColdRatio * 100)}%</p>
            </div>
          )}
        </div>
      )}

      {/* Audience breakdown */}
      {audience && (
        <div className="bg-bg/50 border border-warning/20 rounded-lg p-3">
          <p className="text-xs font-semibold text-warning-text mb-2">
            Audience ({audience.totalRecipients.toLocaleString("fr-FR")} destinataires)
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-[10px] text-text-muted">Contacts chauds</p>
              <p className="font-bold text-primary">{audience.warmCount.toLocaleString("fr-FR")}</p>
              <p className="text-[10px] text-text-muted">{Math.round(audience.warmRatio * 100)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted">Contacts froids</p>
              <p className="font-bold text-warning">{audience.coldCount.toLocaleString("fr-FR")}</p>
              <p className="text-[10px] text-text-muted">{Math.round(audience.coldRatio * 100)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted">Inconnus</p>
              <p className="font-bold text-text-secondary">{audience.unknownCount.toLocaleString("fr-FR")}</p>
              <p className="text-[10px] text-text-muted">{Math.round(audience.unknownRatio * 100)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
