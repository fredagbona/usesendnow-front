export type PortalLocale = "fr" | "en"

export const PORTAL_LOCALE_COOKIE = "msgflash-portal-locale"

const SUPPORTED_LOCALES: PortalLocale[] = ["fr", "en"]

function normalize(value: string | null | undefined): PortalLocale | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower.startsWith("en")) return "en"
  if (lower.startsWith("fr")) return "fr"
  return null
}

export function detectPortalLocaleFromNavigator(language?: string | null): PortalLocale {
  return normalize(language) ?? "fr"
}

export function detectPortalLocaleFromHeader(headerValue?: string | null): PortalLocale {
  if (!headerValue) return "fr"

  const parts = headerValue.split(",").map((part) => part.trim())
  for (const part of parts) {
    const [locale] = part.split(";")
    const normalized = normalize(locale)
    if (normalized) return normalized
  }

  return "fr"
}

export function detectPortalLocaleFromCookie(cookieValue?: string | null): PortalLocale | null {
  return normalize(cookieValue)
}

export function isPortalLocale(value: string): value is PortalLocale {
  return SUPPORTED_LOCALES.includes(value as PortalLocale)
}

