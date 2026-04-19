"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { NumberLookup, CreateLookupResponse, Instance } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export function useNumberLookups() {
  const { copy } = usePortalLocale()
  const [lookups, setLookups] = useState<NumberLookup[]>([])
  const [activeLookup, setActiveLookup] = useState<NumberLookup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [polling, setPolling] = useState(false)
  const [importing, setImporting] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const startPolling = useCallback((lookupId: string) => {
    clearPoll()
    setPolling(true)
    pollRef.current = setInterval(async () => {
      try {
        const data = await apiClient.numberLookups.get(lookupId)
        setActiveLookup(data)
        if (data.status === "done" || data.status === "failed") {
          clearPoll()
          setPolling(false)
          await fetchLookups()
          if (data.status === "done") {
            toast.success(copy.toasts.lookupCompleted)
          } else {
            toast.error(copy.toasts.lookupFailed)
          }
        }
      } catch {
        // continue polling
      }
    }, 4000)
  }, [clearPoll])

  const fetchLookups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.numberLookups.list()
      const sorted = (response.lookups ?? []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setLookups(sorted)
    } catch {
      setError(copy.hooks.numberLookupsHistoryLoadError)
    } finally {
      setLoading(false)
    }
  }, [copy.hooks.numberLookupsHistoryLoadError])

  useEffect(() => { fetchLookups() }, [fetchLookups])

  const submitLookup = async (instanceId: string, numbers: string[]): Promise<CreateLookupResponse | null> => {
    setSubmitting(true)
    setError(null)
    try {
      const result = await apiClient.numberLookups.create({ instanceId, numbers })
      setActiveLookup(null)

      if (result.mode === "sync" && result.result) {
        // Build a NumberLookup from sync result for display
        const now = new Date().toISOString()
        const syncLookup: NumberLookup = {
          id: result.lookupId,
          userId: "",
          instanceId,
          status: result.status,
          requestedCount: result.requested,
          normalizedCount: result.normalized ?? 0,
          checkedCount: result.checked ?? 0,
          onWhatsAppCount: result.onWhatsAppCount ?? 0,
          notOnWhatsAppCount: result.notOnWhatsAppCount ?? 0,
          invalidCount: result.invalidCount ?? 0,
          result: result.result,
          createdAt: now,
          updatedAt: now,
        }
        setActiveLookup(syncLookup)
        toast.success(copy.toasts.lookupCompleted)
      } else {
        toast.info(copy.toasts.lookupStarted)
        startPolling(result.lookupId)
      }

      await fetchLookups()
      return result
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "VALIDATION_ERROR") {
          toast.error(copy.hooks.numberLookupInvalidNumbers)
        } else if (err.code === "NOT_FOUND") {
          toast.error(copy.hooks.numberLookupInstanceNotFound)
        } else if (err.code === "PROVIDER_ERROR" || err.code === "PROVIDER_TIMEOUT" || err.code === "PROVIDER_UNAVAILABLE") {
          toast.error(copy.hooks.numberLookupProviderUnavailable)
        } else {
          toast.error(copy.hooks.numberLookupExecuteFailed)
        }
      }
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const viewLookup = async (id: string) => {
    try {
      const data = await apiClient.numberLookups.get(id)
      setActiveLookup(data)
    } catch {
      toast.error(copy.hooks.numberLookupViewFailed)
    }
  }

  const importContacts = async (lookupId: string, groupId?: string, tag?: string): Promise<boolean> => {
    setImporting(true)
    try {
      const payload: { groupId?: string; tag?: string } = {}
      // Only include groupId if it's a valid, non-empty value
      if (groupId && groupId.trim() !== "") {
        payload.groupId = groupId.trim()
      }
      // Only include tag if it's a valid, non-empty value
      if (tag && tag.trim() !== "") {
        payload.tag = tag.trim()
      }
      const result = await apiClient.numberLookups.importContacts(lookupId, payload)
      if (result.skipped > 0 && result.created === 0 && result.updated === 0) {
        toast.info(copy.toasts.partialImport)
      } else {
        toast.success(copy.toasts.contactsImported)
      }
      return true
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "LOOKUP_NOT_READY") {
          toast.error(copy.hooks.numberLookupNotReady)
        } else if (err.code === "CONTACT_GROUP_NOT_FOUND") {
          toast.error(copy.hooks.numberLookupGroupNotFound)
        } else {
          toast.error(copy.hooks.numberLookupImportFailed)
        }
      }
      return false
    } finally {
      setImporting(false)
    }
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => { clearPoll() }
  }, [clearPoll])

  return {
    lookups,
    activeLookup: activeLookup,
    loading,
    error,
    submitting,
    polling,
    importing,
    submitLookup,
    viewLookup,
    importContacts,
    refetch: fetchLookups,
    setActiveLookup,
  }
}
