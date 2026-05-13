"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { InstanceHealth } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { onPortalWorkspaceChanged } from "@/lib/workspace-events"

export function useInstanceHealth(instanceId: string) {
  const { copy } = usePortalLocale()
  const [health, setHealth] = useState<InstanceHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = useCallback(async () => {
    if (!instanceId) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.instances.getHealth(instanceId)
      setHealth(data)
    } catch {
      setError(copy.instances.health.loadError)
    } finally {
      setLoading(false)
    }
  }, [instanceId, copy.instances.health.loadError])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  useEffect(() => onPortalWorkspaceChanged(() => void fetchHealth()), [fetchHealth])

  return { health, loading, error, refetch: fetchHealth }
}
