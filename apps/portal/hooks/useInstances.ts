"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { apiClient } from "@usesendnow/api-client"
import type { Instance } from "@usesendnow/types"

export function useInstances() {
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
      setError("Impossible de charger les instances.")
      toast.error("Impossible de charger les instances.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInstances() }, [])

  const createInstance = async (name: string) => {
    const instance = await apiClient.instances.create(name)
    setInstances((prev) => [instance, ...prev])
    return instance
  }

  return { instances, loading, error, refetch: fetchInstances, createInstance }
}

export function useInstance(id: string) {
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
        setError("Instance introuvable.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

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
