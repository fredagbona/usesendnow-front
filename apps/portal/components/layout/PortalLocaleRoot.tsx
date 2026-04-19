"use client"

import type { ReactNode } from "react"
import type { PortalLocale } from "@/lib/portal-locale"
import { PortalLocaleProvider } from "./PortalLocaleProvider"

/** Bridges server-resolved locale into the client `PortalLocaleProvider` for all routes (auth + portal). */
export function PortalLocaleRoot({
  initialLocale,
  children,
}: {
  initialLocale: PortalLocale
  children: ReactNode
}) {
  return <PortalLocaleProvider initialLocale={initialLocale}>{children}</PortalLocaleProvider>
}
