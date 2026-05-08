"use client"

import type { InstanceHealth } from "@usesendnow/types"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { translateRecommendation } from "@/lib/safetyTranslations"
import { AlertDiamondIcon, InformationCircleIcon } from "hugeicons-react"

interface WarmupWarningModalProps {
  open: boolean
  health: InstanceHealth | null
  onClose: () => void
  onContinue: () => void
}

const SCORE_VARIANT: Record<string, "warning" | "error" | "neutral"> = {
  warming: "warning",
  at_risk: "error",
  restricted: "error",
  stable: "neutral",
  new: "warning",
}

export default function WarmupWarningModal({
  open,
  health,
  onClose,
  onContinue,
}: WarmupWarningModalProps) {
  const { locale, copy } = usePortalLocale()
  const s = copy.campaigns.safety
  const cw = copy.common.warmupWarning

  if (!health) return null

  const riskLevel = health.safetyScore > 85 ? "high" : health.safetyScore > 70 ? "medium" : "low"
  const riskLabel =
    riskLevel === "low" ? s.riskLow : riskLevel === "medium" ? s.riskMedium : s.riskHigh

  return (
    <Modal open={open} onClose={onClose} title={cw.title} maxWidth="max-w-2xl">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-warning/25 bg-warning-subtle p-4">
          <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-warning-text">
              {health.safetyScore > 60 ? cw.introHigh : cw.introLow}
            </p>
            <p className="mt-1 text-sm text-warning-text/90">
              {health.safetyScore > 60 ? cw.bodyHigh : cw.bodyLow}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-bg-subtle p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">{s.riskPrefix}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={SCORE_VARIANT[health.safetyState] ?? "warning"}>{riskLabel}</Badge>
              <span className="text-sm font-semibold text-text">{health.safetyScore}/100</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-bg-subtle p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">Warmup</p>
            <p className="mt-2 text-sm font-semibold text-text">{health.warmupPolicy.state}</p>
          </div>
        </div>

        {health.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-text">{s.recommendations}</p>
            <ul className="space-y-2">
              {health.recommendations.map((item, index) => (
                <li key={index} className="flex items-start gap-2 rounded-xl border border-border bg-bg-subtle p-3 text-sm text-text-body">
                  <AlertDiamondIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span>{translateRecommendation(item, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-warning/20 bg-warning-subtle p-4">
          <p className="text-sm font-medium text-warning-text">
            {cw.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cw.close}
          </Button>
          <Button variant="primary" onClick={onContinue}>
            {cw.continue}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
