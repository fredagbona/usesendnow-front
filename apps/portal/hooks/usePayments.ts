"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { Payment } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { onPortalWorkspaceChanged } from "@/lib/workspace-events"

export interface UsePaymentsOptions {
  /** When false, no billing payments request is made (e.g. team collaborator without payment visibility). */
  enabled?: boolean
}

export function usePayments(options?: UsePaymentsOptions) {
  const enabled = options?.enabled !== false
  const { copy } = usePortalLocale()
  const [payments, setPayments] = useState<Payment[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  /** Backend 403 BILLING_PAYMENTS_TEAM_OWNER_ONLY — hide list, show owner-only copy */
  const [paymentsTeamOwnerOnly, setPaymentsTeamOwnerOnly] = useState(false)

  const fetchPayments = useCallback(
    async (p: number) => {
      setLoading(true)
      setError(null)
      setPaymentsTeamOwnerOnly(false)
      try {
        const data = await apiClient.billing.getPayments(p)
        setPayments(data.payments)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        setPage(data.page)
      } catch (e) {
        if (e instanceof ApiClientError && e.code === "BILLING_PAYMENTS_TEAM_OWNER_ONLY") {
          setPayments([])
          setTotal(0)
          setTotalPages(1)
          setPage(1)
          setPaymentsTeamOwnerOnly(true)
        } else {
          setError(copy.hooks.paymentsLoadError)
        }
      } finally {
        setLoading(false)
      }
    },
    [copy.hooks.paymentsLoadError],
  )

  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setPayments([])
      setTotal(0)
      setTotalPages(1)
      setPage(1)
      setPaymentsTeamOwnerOnly(false)
      setError(null)
      return
    }
    void fetchPayments(1)
  }, [fetchPayments, enabled])

  useEffect(() => {
    if (typeof window === "undefined") return
    return onPortalWorkspaceChanged(() => {
      if (!enabledRef.current) return
      void fetchPayments(1)
    })
  }, [fetchPayments])

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    void fetchPayments(p)
  }

  return { payments, page, totalPages, total, loading, error, goToPage, paymentsTeamOwnerOnly }
}
