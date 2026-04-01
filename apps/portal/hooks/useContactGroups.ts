"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { ContactGroup } from "@usesendnow/types"

export function useContactGroups() {
  const [groups, setGroups] = useState<ContactGroup[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.contactGroups.list()
      setGroups(data.groups)
      setTotal(data.total)
    } catch {
      setError("Impossible de charger les groupes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups() }, [])

  const addGroup = (group: ContactGroup) => {
    setGroups((prev) => [group, ...prev])
    setTotal((prev) => prev + 1)
  }

  const updateGroup = (updated: ContactGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
  }

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
    setTotal((prev) => Math.max(0, prev - 1))
  }

  return {
    groups,
    total,
    loading,
    error,
    refetch: fetchGroups,
    addGroup,
    updateGroup,
    removeGroup,
  }
}
