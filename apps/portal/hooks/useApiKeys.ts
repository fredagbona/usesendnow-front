"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { ApiKey, ApiKeyUsage } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export function useApiKeys() {
  const { copy } = usePortalLocale()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usage, setUsage] = useState<ApiKeyUsage[]>([])
  const [periodKey, setPeriodKey] = useState<string | null>(null)
  const [totalRequests, setTotalRequests] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApiKeys = async () => {
    setLoading(true)
    setError(null)
    try {
      const [keys, usageData] = await Promise.all([
        apiClient.apiKeys.list(),
        apiClient.apiKeys.usage(),
      ])
      setApiKeys(keys)
      setUsage(usageData.apiKeys)
      setPeriodKey(usageData.periodKey)
      setTotalRequests(usageData.totalRequests)
    } catch {
      setError(copy.apiKeys.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApiKeys() }, [copy.apiKeys.loadError])

  const addApiKey = (key: ApiKey) => {
    setApiKeys((prev) => [key, ...prev])
  }

  const removeApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
    setUsage((prev) => prev.filter((k) => k.id !== id))
  }

  return { apiKeys, usage, periodKey, totalRequests, loading, error, refetch: fetchApiKeys, addApiKey, removeApiKey }
}
