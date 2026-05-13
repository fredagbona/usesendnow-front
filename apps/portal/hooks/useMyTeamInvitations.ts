"use client"

import { useCallback, useEffect, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { TeamInvitationMine } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { onPortalWorkspaceChanged } from "@/lib/workspace-events"

export function useMyTeamInvitations() {
  const { copy } = usePortalLocale()
  const [items, setItems] = useState<TeamInvitationMine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvites = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.teams.listMineInvitations()
      setItems(data)
    } catch {
      setError(copy.hooks.teamsInvitationsMineLoadError)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [copy.hooks.teamsInvitationsMineLoadError])

  useEffect(() => {
    void fetchInvites()
  }, [fetchInvites])

  useEffect(() => onPortalWorkspaceChanged(() => void fetchInvites()), [fetchInvites])

  return { items, loading, error, refetch: fetchInvites }
}
