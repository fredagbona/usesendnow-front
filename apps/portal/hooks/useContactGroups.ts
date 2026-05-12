"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { ContactGroup } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

const PAGE_LIMIT = 50

export function useContactGroups(searchQuery = "") {
  const { copy } = usePortalLocale()
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const [groups, setGroups] = useState<ContactGroup[]>([])
  const [total, setTotal] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFirstPage = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.contactGroups.list({
        limit: PAGE_LIMIT,
        search: debouncedSearch.trim() || undefined,
      })
      setGroups(data.groups)
      setTotal(data.total)
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch {
      setError(copy.hooks.contactGroupsLoadError)
    } finally {
      setLoading(false)
    }
  }, [copy.hooks.contactGroupsLoadError, debouncedSearch])

  useEffect(() => {
    void fetchFirstPage()
  }, [fetchFirstPage])

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await apiClient.contactGroups.list({
        limit: PAGE_LIMIT,
        cursor: nextCursor,
        search: debouncedSearch.trim() || undefined,
      })
      setGroups((prev) => [...prev, ...data.groups])
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch {
      setError(copy.hooks.contactGroupsLoadError)
    } finally {
      setLoadingMore(false)
    }
  }, [copy.hooks.contactGroupsLoadError, debouncedSearch, hasMore, loadingMore, nextCursor])

  const addGroup = (group: ContactGroup) => {
    setGroups((prev) => [group, ...prev])
    setTotal((prev) => prev + 1)
  }

  const updateGroup = (updated: ContactGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
  }

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
    setTotal((prev) => Math.max(0, prev - 1))
  }

  return {
    groups,
    total,
    hasMore,
    nextCursor,
    loading,
    loadingMore,
    error,
    refetch: fetchFirstPage,
    loadMore,
    addGroup,
    updateGroup,
    removeGroup,
  }
}
