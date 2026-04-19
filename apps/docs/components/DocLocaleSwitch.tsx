"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function getLocalizedPath(pathname: string, locale: "en" | "fr") {
  const basePath = pathname === "/" ? "/introduction" : pathname
  const normalized = basePath.startsWith("/fr/") ? basePath.slice(3) : basePath
  if (locale === "fr") {
    return normalized.startsWith("/fr") ? normalized : `/fr${normalized}`
  }
  return normalized.startsWith("/fr") ? normalized.slice(3) || "/" : normalized
}

export function DocLocaleSwitch() {
  const pathname = usePathname()
  const isFrench = pathname.startsWith("/fr")
  const target = isFrench ? getLocalizedPath(pathname, "en") : getLocalizedPath(pathname, "fr")

  return (
    <div className="mb-6 flex items-center gap-2">
      <span className="text-sm text-gray-500">Language</span>
      <Link
        href={target}
        className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
      >
        {isFrench ? "English" : "Français"}
      </Link>
    </div>
  )
}
