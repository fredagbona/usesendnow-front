"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Payment } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export function usePayments() {
  const { copy } = usePortalLocale()
  const [payments, setPayments] = useState<Payment[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.billing.getPayments(p)
      setPayments(data.payments)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPage(data.page)
    } catch {
      setError(copy.hooks.paymentsLoadError)
    } finally {
      setLoading(false)
    }
  }, [copy.hooks.paymentsLoadError])

  useEffect(() => { fetchPayments(1) }, [fetchPayments])

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    fetchPayments(p)
  }

  return { payments, page, totalPages, total, loading, error, goToPage }
}
