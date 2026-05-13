"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Webhook } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { onPortalWorkspaceChanged } from "@/lib/workspace-events"

export function useWebhooks() {
  const { copy } = usePortalLocale()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWebhooks = useCallback(async () => {
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
  }, [copy.hooks.webhooksLoadError])

  useEffect(() => {
    void fetchWebhooks()
  }, [fetchWebhooks])

  useEffect(() => onPortalWorkspaceChanged(() => void fetchWebhooks()), [fetchWebhooks])

  const addWebhook = (webhook: Webhook) => {
    setWebhooks((prev) => [webhook, ...prev])
  }

  const removeWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id))
  }

  return { webhooks, loading, error, refetch: fetchWebhooks, addWebhook, removeWebhook }
}
