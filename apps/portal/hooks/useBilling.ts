"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { SubscriptionResponse, Plan } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

const WORKSPACE_CHANGED = "msgflash:workspace-changed"

export function useBilling() {
  const { copy } = usePortalLocale()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBilling = useCallback(async () => {
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
      setError(copy.hooks.billingLoadError)
    } finally {
      setLoading(false)
    }
  }, [copy.hooks.billingLoadError])

  useEffect(() => {
    void fetchBilling()
  }, [fetchBilling])

  useEffect(() => {
    if (typeof window === "undefined") return
    const onWorkspaceChanged = () => {
      void fetchBilling()
    }
    window.addEventListener(WORKSPACE_CHANGED, onWorkspaceChanged)
    return () => window.removeEventListener(WORKSPACE_CHANGED, onWorkspaceChanged)
  }, [fetchBilling])

  return { subscription, plans, loading, error, refetch: fetchBilling, setSubscription }
}
