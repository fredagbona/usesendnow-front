"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { InstanceHealth } from "@usesendnow/types"

export function useInstanceHealth(instanceId: string) {
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
      setError("Impossible de charger les données de warmup.")
    } finally {
      setLoading(false)
    }
  }, [instanceId])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  return { health, loading, error, refetch: fetchHealth }
}
