"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { GlobalSearchResponse } from "@usesendnow/types"
import { portalCopy } from "@/lib/portal-copy"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import type { PortalLocale } from "@/lib/portal-locale"

export type GlobalSearchCategory = "page" | "instance" | "message" | "campaign" | "contact" | "group"

export interface GlobalSearchResult {
  id: string
  category: GlobalSearchCategory
  title: string
  description: string
  href: string
}

type LocaleCopy = (typeof portalCopy)[PortalLocale]

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

function includesQuery(parts: Array<string | null | undefined>, query: string) {
  return parts.some((part) => part && normalize(part).includes(query))
}

function truncate(value: string | null | undefined, length = 64) {
  if (!value) return ""
  return value.length > length ? `${value.slice(0, length - 1)}…` : value
}

function filteredStaticPages(query: string, copy: LocaleCopy): GlobalSearchResult[] {
  const gs = copy.globalSearch
  const pageResults: GlobalSearchResult[] = (gs.staticPages ?? []).map((p) => ({
    id: p.id,
    category: "page" as const,
    title: p.title,
    description: p.description,
    href: p.href,
  }))
  return pageResults.filter((item) => includesQuery([item.title, item.description], query))
}

function mapApiSearch(resp: GlobalSearchResponse, copy: LocaleCopy, locale: PortalLocale): GlobalSearchResult[] {
  const gs = copy.globalSearch
  const localeTag = locale === "fr" ? "fr-FR" : "en-US"
  const groupSuffix = copy.contacts.groups.detailsCountSuffix
  const groupSuffixPlural = copy.contacts.groups.detailsCountSuffixPlural
  const out: GlobalSearchResult[] = []

  for (const instance of resp.sections.instances ?? []) {
    const id = typeof instance.id === "string" ? instance.id : ""
    if (!id) continue
    out.push({
      id: `instance-${id}`,
      category: "instance",
      title: String(instance.name ?? ""),
      description: String(instance.waNumber ?? gs.fallbackInstanceDescription),
      href: `/instances/${id}`,
    })
  }

  for (const message of resp.sections.messages ?? []) {
    const id = typeof message.id === "string" ? message.id : ""
    if (!id) continue
    const body = typeof message.body === "string" ? message.body : ""
    const type = typeof message.type === "string" ? message.type : ""
    out.push({
      id: `message-${id}`,
      category: "message",
      title: String(message.to ?? ""),
      description: truncate(body) || gs.messagePreview.replace("{{type}}", type),
      href: `/messages/${id}`,
    })
  }

  for (const campaign of resp.sections.campaigns ?? []) {
    const id = typeof campaign.id === "string" ? campaign.id : ""
    if (!id) continue
    const status = String(campaign.status ?? "")
    out.push({
      id: `campaign-${id}`,
      category: "campaign",
      title: String(campaign.name ?? ""),
      description: gs.campaignWithStatus.replace("{{status}}", status),
      href: `/campaigns/${id}`,
    })
  }

  for (const contact of resp.sections.contacts ?? []) {
    const id = typeof contact.id === "string" ? contact.id : ""
    if (!id) continue
    const phone = String(contact.phone ?? "")
    out.push({
      id: `contact-${id}`,
      category: "contact",
      title: String(contact.name ?? ""),
      description: phone,
      href: `/contacts?search=${encodeURIComponent(phone)}`,
    })
  }

  for (const group of resp.sections.groups ?? []) {
    const id = typeof group.id === "string" ? group.id : ""
    if (!id) continue
    const desc = typeof group.description === "string" ? group.description : ""
    const count = typeof group.contactCount === "number" ? group.contactCount : 0
    out.push({
      id: `group-${id}`,
      category: "group",
      title: String(group.name ?? ""),
      description:
        desc ||
        `${count.toLocaleString(localeTag)} ${count !== 1 ? groupSuffixPlural : groupSuffix}`,
      href: `/contacts/groups/${id}`,
    })
  }

  return out
}

export function useGlobalSearch(rawQuery: string) {
  const { copy, locale } = usePortalLocale()
  const deferredQuery = useDeferredValue(rawQuery.trim())
  const [loading, setLoading] = useState(false)
  const [apiResults, setApiResults] = useState<GlobalSearchResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const query = useMemo(() => normalize(deferredQuery), [deferredQuery])

  useEffect(() => {
    if (!query || query.length < 2) {
      setApiResults([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    const handle = async () => {
      setLoading(true)
      setError(null)
      try {
        const resp = await apiClient.search.query(deferredQuery, 5)
        if (cancelled) return
        setApiResults(mapApiSearch(resp, copy, locale))
      } catch {
        if (!cancelled) setError(copy.hooks.globalSearchLoadError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const t = setTimeout(() => {
      void handle()
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, deferredQuery, copy, locale])

  const results = useMemo(() => {
    if (!query) return []
    const pages = filteredStaticPages(query, copy)
    if (query.length < 2) return pages
    return [...pages, ...apiResults]
  }, [query, copy, apiResults])

  return { query, results, loading, error }
}
