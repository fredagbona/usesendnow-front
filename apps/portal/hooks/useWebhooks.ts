"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Webhook } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export function useWebhooks() {
  const { copy } = usePortalLocale()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWebhooks = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.webhooks.list()
      setWebhooks(data)
    } catch {
      setError(copy.hooks.webhooksLoadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWebhooks() }, [copy.hooks.webhooksLoadError])

  const addWebhook = (webhook: Webhook) => {
    setWebhooks((prev) => [webhook, ...prev])
  }

  const removeWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id))
  }

  return { webhooks, loading, error, refetch: fetchWebhooks, addWebhook, removeWebhook }
}
