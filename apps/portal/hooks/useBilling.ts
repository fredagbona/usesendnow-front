"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { SubscriptionResponse, Plan } from "@usesendnow/types"

export function useBilling() {
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
      setError("Impossible de charger les données de facturation.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBilling() }, [])

  return { subscription, plans, loading, error, refetch: fetchBilling, setSubscription }
}
