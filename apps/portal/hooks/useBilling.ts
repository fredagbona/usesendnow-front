"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { SubscriptionResponse, Plan } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export function useBilling() {
  const { copy } = usePortalLocale()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBilling = async () => {
    setLoading(true)
    setError(null)
    try {
      const [sub, plansData] = await Promise.all([
        apiClient.billing.getSubscription(),
        apiClient.billing.getPlans(),
      ])
      setSubscription(sub)
      setPlans(plansData)
    } catch {
      setError(`${copy.billing.loadErrorTitle}.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBilling() }, [copy.billing.loadErrorTitle])

  return { subscription, plans, loading, error, refetch: fetchBilling, setSubscription }
}
