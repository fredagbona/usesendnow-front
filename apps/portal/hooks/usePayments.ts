"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { Payment } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

const WORKSPACE_CHANGED = "msgflash:workspace-changed"

export function usePayments() {
  const { copy } = usePortalLocale()
  const [payments, setPayments] = useState<Payment[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    void fetchPayments(1)
  }, [fetchPayments])

  useEffect(() => {
    if (typeof window === "undefined") return
    const onWorkspaceChanged = () => {
      void fetchPayments(1)
    }
    window.addEventListener(WORKSPACE_CHANGED, onWorkspaceChanged)
    return () => window.removeEventListener(WORKSPACE_CHANGED, onWorkspaceChanged)
  }, [fetchPayments])

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    void fetchPayments(p)
  }

  return { payments, page, totalPages, total, loading, error, goToPage, paymentsTeamOwnerOnly }
}
