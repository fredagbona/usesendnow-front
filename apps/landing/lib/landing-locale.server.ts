import { cookies, headers } from "next/headers"
import { normalizeLandingLocale } from "./landing-i18n-data"

export async function detectLandingLocaleFromHeaders() {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("msgflash-landing-locale")?.value
  if (cookieLocale === "fr" || cookieLocale === "en") {
    return cookieLocale
  }

  const headerList = await headers()
  const acceptLanguage = headerList.get("accept-language")
  return normalizeLandingLocale(acceptLanguage?.split(",")[0])
}
