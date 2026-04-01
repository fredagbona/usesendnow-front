"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Payment } from "@usesendnow/types"

export function usePayments() {
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
      setError("Impossible de charger l'historique des paiements.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPayments(1) }, [fetchPayments])

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    fetchPayments(p)
  }

  return { payments, page, totalPages, total, loading, error, goToPage }
}
