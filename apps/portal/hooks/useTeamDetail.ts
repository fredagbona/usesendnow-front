"use client"

import { useCallback, useEffect, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { TeamDetail } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export function useTeamDetail(teamId: string) {
  const { copy } = usePortalLocale()
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeam = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.teams.get(teamId)
      setTeam(data)
    } catch {
      setError(copy.hooks.teamDetailLoadError)
      setTeam(null)
    } finally {
      setLoading(false)
    }
  }, [teamId, copy.hooks.teamDetailLoadError])

  useEffect(() => {
    void fetchTeam()
  }, [fetchTeam])

  return { team, loading, error, refetch: fetchTeam }
}
