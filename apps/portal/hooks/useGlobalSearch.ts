"use client"

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Campaign, Contact, ContactGroup, Instance, Message } from "@usesendnow/types"
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

interface SearchDataset {
  instances: Instance[]
  messages: Message[]
  campaigns: Campaign[]
  contacts: Contact[]
  groups: ContactGroup[]
}

type LocaleCopy = (typeof portalCopy)["fr"]

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

function buildResults(
  query: string,
  dataset: SearchDataset | null,
  copy: LocaleCopy,
  locale: PortalLocale
): GlobalSearchResult[] {
  const gs = copy.globalSearch
  const pageResults: GlobalSearchResult[] = (gs.staticPages ?? []).map((p) => ({
    id: p.id,
    category: "page" as const,
    title: p.title,
    description: p.description,
    href: p.href,
  }))

  const filteredPageResults = pageResults.filter((item) =>
    includesQuery([item.title, item.description], query)
  )

  if (!dataset) return filteredPageResults

  const localeTag = locale === "fr" ? "fr-FR" : "en-US"

  const instanceResults = dataset.instances
    .filter((instance) => includesQuery([instance.name, instance.waNumber, instance.status], query))
    .slice(0, 5)
    .map<GlobalSearchResult>((instance) => ({
      id: `instance-${instance.id}`,
      category: "instance",
      title: instance.name,
      description: instance.waNumber ?? gs.fallbackInstanceDescription,
      href: `/instances/${instance.id}`,
    }))

  const messageResults = dataset.messages
    .filter((message) => includesQuery([message.to, message.body, message.status, message.type], query))
    .slice(0, 5)
    .map<GlobalSearchResult>((message) => ({
      id: `message-${message.id}`,
      category: "message",
      title: message.to,
      description: truncate(message.body) || gs.messagePreview.replace("{{type}}", message.type),
      href: `/messages/${message.id}`,
    }))

  const campaignResults = dataset.campaigns
    .filter((campaign) => includesQuery([campaign.name, campaign.status], query))
    .slice(0, 5)
    .map<GlobalSearchResult>((campaign) => ({
      id: `campaign-${campaign.id}`,
      category: "campaign",
      title: campaign.name,
      description: gs.campaignWithStatus.replace("{{status}}", campaign.status),
      href: `/campaigns/${campaign.id}`,
    }))

  const contactResults = dataset.contacts
    .filter((contact) => includesQuery([contact.name, contact.phone, contact.tags.join(" ")], query))
    .slice(0, 5)
    .map<GlobalSearchResult>((contact) => ({
      id: `contact-${contact.id}`,
      category: "contact",
      title: contact.name,
      description: contact.phone,
      href: `/contacts?search=${encodeURIComponent(contact.phone)}`,
    }))

  const groupSuffix =
    copy.contacts.groups.detailsCountSuffix
  const groupSuffixPlural = copy.contacts.groups.detailsCountSuffixPlural

  const groupResults = dataset.groups
    .filter((group) => includesQuery([group.name, group.description], query))
    .slice(0, 5)
    .map<GlobalSearchResult>((group) => ({
      id: `group-${group.id}`,
      category: "group",
      title: group.name,
      description:
        group.description ||
        `${group.contactCount.toLocaleString(localeTag)} ${
          group.contactCount !== 1 ? groupSuffixPlural : groupSuffix
        }`,
      href: `/contacts/groups/${group.id}`,
    }))

  return [
    ...filteredPageResults,
    ...instanceResults,
    ...messageResults,
    ...campaignResults,
    ...contactResults,
    ...groupResults,
  ]
}

export function useGlobalSearch(rawQuery: string) {
  const { copy, locale } = usePortalLocale()
  const deferredQuery = useDeferredValue(rawQuery)
  const [dataset, setDataset] = useState<SearchDataset | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const query = useMemo(() => normalize(deferredQuery), [deferredQuery])

  useEffect(() => {
    if (query.length < 2 || dataset || loading) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [instances, messageResponse, campaigns, contacts, groupsResponse] = await Promise.all([
          apiClient.instances.list(),
          apiClient.messages.list({ limit: 50 }),
          apiClient.campaigns.list(),
          apiClient.contacts.list(),
          apiClient.contactGroups.list(),
        ])

        if (cancelled) return

        setDataset({
          instances,
          messages: messageResponse.messages,
          campaigns,
          contacts,
          groups: groupsResponse.groups,
        })
      } catch {
        if (!cancelled) setError(copy.hooks.globalSearchLoadError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [copy.hooks.globalSearchLoadError, dataset, loading, query])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    startTransition(() => {
      setResults(buildResults(query, dataset, copy, locale))
    })
  }, [copy, dataset, locale, query])

  return { query, results, loading, error }
}
