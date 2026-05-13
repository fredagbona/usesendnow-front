"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/lib/toast"
import { apiClient } from "@usesendnow/api-client"
import type { Instance } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { onPortalWorkspaceChanged } from "@/lib/workspace-events"

export function useInstances() {
  const { copy } = usePortalLocale()
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstances = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.instances.list()
      setInstances(data)
    } catch {
      const message = copy.hooks.instancesLoadError
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [copy.hooks.instancesLoadError])

  useEffect(() => {
    void fetchInstances()
  }, [fetchInstances])

  useEffect(() => onPortalWorkspaceChanged(() => void fetchInstances()), [fetchInstances])

  const createInstance = async (name: string) => {
    const instance = await apiClient.instances.create(name)
    setInstances((prev) => [instance, ...prev])
    return instance
  }

  return { instances, loading, error, refetch: fetchInstances, createInstance }
}

export function useInstance(id: string) {
  const { copy } = usePortalLocale()
  const [instance, setInstance] = useState<Instance | null>(null)
  const [liveStatus, setLiveStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [inst, state] = await Promise.all([
        apiClient.instances.get(id),
        apiClient.instances.getState(id),
      ])
      setInstance(inst)
      setLiveStatus(state.status)
    } catch {
      setError(copy.hooks.instanceNotFound)
    } finally {
      setLoading(false)
    }
  }, [id, copy.hooks.instanceNotFound])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => onPortalWorkspaceChanged(() => void load()), [load])

  const refreshState = async () => {
    try {
      const state = await apiClient.instances.getState(id)
      setLiveStatus(state.status)
      return state.status
    } catch {
      return null
    }
  }

  const updateStatus = (status: string) => setLiveStatus(status)

  return { instance, liveStatus, loading, error, refreshState, updateStatus }
}
