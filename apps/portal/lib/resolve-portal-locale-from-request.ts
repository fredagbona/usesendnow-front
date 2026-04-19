import { cookies, headers } from "next/headers"
import {
  detectPortalLocaleFromCookie,
  detectPortalLocaleFromHeader,
  PORTAL_LOCALE_COOKIE,
  type PortalLocale,
} from "@/lib/portal-locale"

/**
 * Resolves portal UI locale for the current request (SSR).
 * Cookie wins, then Accept-Language, then French default.
 */
export async function resolvePortalLocaleFromRequest(): Promise<PortalLocale> {
  const cookieStore = await cookies()
  const fromCookie = detectPortalLocaleFromCookie(cookieStore.get(PORTAL_LOCALE_COOKIE)?.value)
  if (fromCookie) return fromCookie

  const headerStore = await headers()
  return detectPortalLocaleFromHeader(headerStore.get("accept-language"))
}
