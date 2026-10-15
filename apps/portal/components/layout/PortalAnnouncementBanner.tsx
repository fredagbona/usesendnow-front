"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight01Icon, Cancel01Icon, Megaphone01Icon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { portalBrand } from "@/lib/brand"

export const BUSINESS_EVENT_AUTOMATION_ANNOUNCEMENT_ID = "business-event-automation-launch-2026-07"
const DISMISSAL_KEY = `msgflash:announcement:${BUSINESS_EVENT_AUTOMATION_ANNOUNCEMENT_ID}:dismissed`

interface PortalAnnouncementBannerProps {}

export default function PortalAnnouncementBanner({}: PortalAnnouncementBannerProps) {
  const { copy } = usePortalLocale()
  const [dismissed, setDismissed] = useState(false)
  const announcement = copy.announcement

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISSAL_KEY) === "true")
  }, [])

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISSAL_KEY, "true")
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className="border-b border-[#E5E7EB] bg-[#F0FDF4] px-4 py-3 md:px-6" role="region" aria-label={announcement.title}>
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <Megaphone01Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#15803D]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#111827]">{announcement.title}</p>
          <p className="mt-0.5 text-sm text-[#374151]">{announcement.message}</p>
          <a
            href={`${portalBrand.marketingUrl}/announcements/business-event-automation`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#15803D] underline decoration-[#15803D]/40 underline-offset-2 hover:text-[#166534] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
          >
            {announcement.cta}
            <ArrowUpRight01Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={announcement.dismiss}
          className="shrink-0 rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-white hover:text-[#111827] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
        >
          <Cancel01Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
