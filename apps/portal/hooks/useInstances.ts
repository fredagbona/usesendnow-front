"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { apiClient } from "@usesendnow/api-client"
import type { Instance } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export function useInstances() {
  const { copy } = usePortalLocale()
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstances = async () => {
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
  }

  useEffect(() => { fetchInstances() }, [copy.hooks.instancesLoadError])

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

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
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
    }
    fetch()
  }, [id, copy.hooks.instanceNotFound])

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
