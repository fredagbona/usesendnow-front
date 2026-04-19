"use client"

import { useMemo, useState } from "react"
import type { LookupResultEntry } from "@usesendnow/types"
import { Tick01Icon, Cancel01Icon, AlertCircleIcon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

interface LookupResultsTabsProps {
  onWhatsApp: LookupResultEntry[]
  notOnWhatsApp: LookupResultEntry[]
  invalid: LookupResultEntry[]
}

type TabKey = "onWhatsApp" | "notOnWhatsApp" | "invalid"

export default function LookupResultsTabs({
  onWhatsApp,
  notOnWhatsApp,
  invalid,
}: LookupResultsTabsProps) {
  const { copy } = usePortalLocale()
  const rt = copy.numberLookups.resultsTabs
  const [activeTab, setActiveTab] = useState<TabKey>("onWhatsApp")

  const tabs = useMemo(
    () =>
      [
        { key: "onWhatsApp" as const, label: rt.onWhatsApp },
        { key: "notOnWhatsApp" as const, label: rt.notOnWhatsApp },
        { key: "invalid" as const, label: rt.invalid },
      ],
    [rt.onWhatsApp, rt.notOnWhatsApp, rt.invalid]
  )

  const data: Record<TabKey, LookupResultEntry[]> = {
    onWhatsApp,
    notOnWhatsApp,
    invalid,
  }

  const counts: Record<TabKey, number> = {
    onWhatsApp: onWhatsApp.length,
    notOnWhatsApp: notOnWhatsApp.length,
    invalid: invalid.length,
  }

  const iconMap: Record<TabKey, React.ReactNode> = {
    onWhatsApp: <Tick01Icon className="w-3.5 h-3.5 text-primary shrink-0" />,
    notOnWhatsApp: <Cancel01Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />,
    invalid: <AlertCircleIcon className="w-3.5 h-3.5 text-error shrink-0" />,
  }

  const entries = data[activeTab]

  return (
    <div className="bg-bg border border-border rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]">
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={[
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "text-text bg-bg-subtle border-b-2 border-primary"
                : "text-text-secondary hover:text-text hover:bg-bg-subtle",
            ].join(" ")}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-border">
        {entries.length === 0 ? (
          <div className="py-10 text-center text-sm text-text-muted">
            {rt.emptyCategory}
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-3 px-4 py-3 hover:bg-bg-subtle transition-colors">
              {iconMap[activeTab]}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-mono text-text truncate">
                  {entry.input}
                </p>
                {entry.normalized && entry.normalized !== entry.input && (
                  <p className="text-xs text-text-muted">
                    {rt.normalized} {entry.normalized}
                  </p>
                )}
                {entry.reason && (
                  <p className="text-xs text-error-hover">
                    {rt.reasonPrefix} {entry.reason}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
