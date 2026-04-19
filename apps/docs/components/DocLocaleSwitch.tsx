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
  const hrefEn = getLocalizedPath(pathname, "en")
  const hrefFr = getLocalizedPath(pathname, "fr")

  return (
    <div className="not-prose mb-6 flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Language</span>
      <div
        className="inline-flex items-center gap-0.5 rounded-full border border-gray-300 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-900"
        role="group"
        aria-label="Documentation language"
      >
        <Link
          href={hrefEn}
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
            !isFrench
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
          ].join(" ")}
          aria-current={!isFrench ? "true" : undefined}
        >
          EN
        </Link>
        <Link
          href={hrefFr}
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
            isFrench
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
          ].join(" ")}
          aria-current={isFrench ? "true" : undefined}
        >
          FR
        </Link>
      </div>
    </div>
  )
}
