"use client"

import { useCallback, useEffect, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Contact, ContactSort } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

const DEFAULT_LIMIT = 50

export function useContactsList(searchQuery: string, sort: ContactSort = "createdAt_desc") {
  const { copy } = usePortalLocale()
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchFirstPage = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.contacts.list({
        limit: DEFAULT_LIMIT,
        search: debouncedSearch.trim() || undefined,
        sort,
      })
      setContacts(data.contacts)
      setNextCursor(data.nextCursor ?? null)
      setHasMore(data.hasMore)
      setTotal(data.total)
    } catch {
      setError(copy.hooks.contactsLoadError)
    } finally {
      setLoading(false)
    }
  }, [copy.hooks.contactsLoadError, debouncedSearch, sort])

  useEffect(() => {
    void fetchFirstPage()
  }, [fetchFirstPage])

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return
    setLoadingMore(true)
    setError(null)
    try {
      const data = await apiClient.contacts.list({
        limit: DEFAULT_LIMIT,
        cursor: nextCursor,
        search: debouncedSearch.trim() || undefined,
        sort,
      })
      setContacts((prev) => [...prev, ...data.contacts])
      setNextCursor(data.nextCursor ?? null)
      setHasMore(data.hasMore)
    } catch {
      setError(copy.hooks.contactsLoadError)
    } finally {
      setLoadingMore(false)
    }
  }, [copy.hooks.contactsLoadError, debouncedSearch, hasMore, loadingMore, nextCursor, sort])

  const addContact = (contact: Contact) => {
    setContacts((prev) => [contact, ...prev])
    setTotal((prev) => prev + 1)
  }

  const updateContact = (updated: Contact) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
    setTotal((prev) => Math.max(0, prev - 1))
  }

  return {
    contacts,
    loading,
    loadingMore,
    hasMore,
    total,
    error,
    refetch: fetchFirstPage,
    loadMore,
    addContact,
    updateContact,
    removeContact,
  }
}
