"use client"

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Campaign, Contact, ContactGroup, Instance, Message } from "@usesendnow/types"

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

const PAGE_RESULTS: GlobalSearchResult[] = [
  { id: "page-dashboard", category: "page", title: "Tableau de bord", description: "Vue d'ensemble du portal", href: "/dashboard" },
  { id: "page-instances", category: "page", title: "Instances", description: "Gérer les connexions WhatsApp", href: "/instances" },
  { id: "page-messages", category: "page", title: "Messages", description: "Envoyer et consulter les messages", href: "/messages" },
  { id: "page-campaigns", category: "page", title: "Campagnes", description: "Piloter les envois en masse", href: "/campaigns" },
  { id: "page-contacts", category: "page", title: "Contacts", description: "Carnet d'adresses et imports", href: "/contacts" },
  { id: "page-contact-groups", category: "page", title: "Groupes de contacts", description: "Organiser les contacts par groupes", href: "/contacts/groups" },
  { id: "page-templates", category: "page", title: "Modèles", description: "Bibliothèque de modèles de messages", href: "/templates" },
  { id: "page-webhooks", category: "page", title: "Webhooks", description: "Recevoir les événements du portal", href: "/webhooks" },
  { id: "page-api-keys", category: "page", title: "Clés API", description: "Gérer les accès à l'API publique", href: "/api-keys" },
  { id: "page-billing", category: "page", title: "Facturation", description: "Abonnement, quotas et paiements", href: "/billing" },
  { id: "page-profile", category: "page", title: "Profil", description: "Informations personnelles du compte", href: "/profile" },
]

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

function buildResults(query: string, dataset: SearchDataset | null): GlobalSearchResult[] {
  const pageResults = PAGE_RESULTS.filter((item) =>
    includesQuery([item.title, item.description], query)
  )

  if (!dataset) return pageResults

  const instanceResults = dataset.instances
    .filter((instance) => includesQuery([instance.name, instance.waNumber, instance.status], query))
    .slice(0, 5)
    .map<GlobalSearchResult>((instance) => ({
      id: `instance-${instance.id}`,
      category: "instance",
      title: instance.name,
      description: instance.waNumber ?? "Instance WhatsApp",
      href: `/instances/${instance.id}`,
    }))

  const messageResults = dataset.messages
    .filter((message) => includesQuery([message.to, message.body, message.status, message.type], query))
    .slice(0, 5)
    .map<GlobalSearchResult>((message) => ({
      id: `message-${message.id}`,
      category: "message",
      title: message.to,
      description: truncate(message.body) || `Message ${message.type}`,
      href: `/messages/${message.id}`,
    }))

  const campaignResults = dataset.campaigns
    .filter((campaign) => includesQuery([campaign.name, campaign.status], query))
    .slice(0, 5)
    .map<GlobalSearchResult>((campaign) => ({
      id: `campaign-${campaign.id}`,
      category: "campaign",
      title: campaign.name,
      description: `Campagne ${campaign.status}`,
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

  const groupResults = dataset.groups
    .filter((group) => includesQuery([group.name, group.description], query))
    .slice(0, 5)
    .map<GlobalSearchResult>((group) => ({
      id: `group-${group.id}`,
      category: "group",
      title: group.name,
      description: group.description || `${group.contactCount.toLocaleString("fr-FR")} contact${group.contactCount !== 1 ? "s" : ""}`,
      href: `/contacts/groups/${group.id}`,
    }))

  return [
    ...pageResults,
    ...instanceResults,
    ...messageResults,
    ...campaignResults,
    ...contactResults,
    ...groupResults,
  ]
}

export function useGlobalSearch(rawQuery: string) {
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
        if (!cancelled) setError("Impossible de charger la recherche globale.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [dataset, loading, query])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    startTransition(() => {
      setResults(buildResults(query, dataset))
    })
  }, [dataset, query])

  return { query, results, loading, error }
}
