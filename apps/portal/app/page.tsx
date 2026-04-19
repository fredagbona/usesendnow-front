import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { portalBrand } from "@/lib/brand"
import { portalCopy } from "@/lib/portal-copy"
import { resolvePortalLocaleFromRequest } from "@/lib/resolve-portal-locale-from-request"

const PRODUCT_DISPLAY = "MsgFlash"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePortalLocaleFromRequest()
  const portalLabel = portalCopy[locale].titles.portal
  return {
    title: `${PRODUCT_DISPLAY} - ${portalLabel}`,
    description: portalBrand.tagline,
  }
}

export default function RootPage() {
  redirect("/dashboard")
}
