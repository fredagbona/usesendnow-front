"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Contact, ContactSort } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { onPortalWorkspaceChanged } from "@/lib/workspace-events"

export const CONTACTS_LIST_PAGE_SIZE = 100

export function useContactsList(
  searchQuery: string,
  sort: ContactSort = "createdAt_desc",
  groupIdFilter = "",
) {
  const { copy } = usePortalLocale()
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  /** Cursor sent to the API to load page `i` (`null` = first page). */
  const [startCursors, setStartCursors] = useState<(string | null)[]>([null])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const skipFilterReset = useRef(true)

  const canGoPrev = pageIndex > 0
  const canGoNext = Boolean(nextCursor)

  useEffect(() => {
    if (skipFilterReset.current) {
      skipFilterReset.current = false
      return
    }
    setPageIndex(0)
    setStartCursors([null])
  }, [debouncedSearch, sort, groupIdFilter])

  useEffect(() => {
    return onPortalWorkspaceChanged(() => {
      setPageIndex(0)
      setStartCursors([null])
      setReloadToken((t) => t + 1)
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const cursor = startCursors[pageIndex] ?? null
        const data = await apiClient.contacts.list({
          limit: CONTACTS_LIST_PAGE_SIZE,
          cursor: cursor ?? undefined,
          search: debouncedSearch.trim() || undefined,
          sort,
          groupId: groupIdFilter.trim() || undefined,
        })
        if (cancelled) return
        setContacts(data.contacts)
        setNextCursor(data.nextCursor ?? null)
        setTotal(data.total)
      } catch {
        if (!cancelled) {
          setError(copy.hooks.contactsLoadError)
          setContacts([])
          setNextCursor(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [
    copy.hooks.contactsLoadError,
    debouncedSearch,
    groupIdFilter,
    pageIndex,
    reloadToken,
    sort,
    startCursors,
  ])

  const goNextPage = useCallback(() => {
    if (!nextCursor) return
    const c = nextCursor
    setStartCursors((prev) => {
      const next = [...prev]
      while (next.length <= pageIndex + 1) next.push(null)
      next[pageIndex + 1] = c
      return next
    })
    setPageIndex((p) => p + 1)
  }, [nextCursor, pageIndex])

  const goPrevPage = useCallback(() => {
    setPageIndex((p) => Math.max(0, p - 1))
  }, [])

  const refetch = useCallback(() => {
    setReloadToken((t) => t + 1)
  }, [])

  const addContact = (contact: Contact) => {
    if (pageIndex !== 0) return
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

  const rangeStart = total === 0 ? 0 : pageIndex * CONTACTS_LIST_PAGE_SIZE + 1
  const rangeEnd = total === 0 ? 0 : pageIndex * CONTACTS_LIST_PAGE_SIZE + contacts.length

  return {
    contacts,
    loading,
    error,
    total,
    pageIndex,
    pageSize: CONTACTS_LIST_PAGE_SIZE,
    canGoPrev,
    canGoNext,
    goNextPage,
    goPrevPage,
    rangeStart,
    rangeEnd,
    refetch,
    addContact,
    updateContact,
    removeContact,
  }
}
