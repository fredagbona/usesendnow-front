"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@usesendnow/api-client"
import type { TeamSummary } from "@usesendnow/types"
import {
  defaultPortalWorkspace,
  readPortalWorkspace,
  writePortalWorkspace,
  type PortalWorkspaceState,
} from "@/lib/workspace-storage"

interface WorkspaceContextValue {
  workspace: PortalWorkspaceState
  teams: TeamSummary[]
  teamsLoading: boolean
  refreshTeams: () => Promise<void>
  setPersonalWorkspace: () => void
  setTeamWorkspace: (team: TeamSummary) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<PortalWorkspaceState>(defaultPortalWorkspace)
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setWorkspace(readPortalWorkspace())
    setHydrated(true)
  }, [])

  const refreshTeams = useCallback(async () => {
    setTeamsLoading(true)
    try {
      const list = await apiClient.teams.list()
      setTeams(list)
      const stored = readPortalWorkspace()
      if (stored.mode === "team" && stored.teamId) {
        const stillThere = list.some((t) => t.id === stored.teamId)
        if (!stillThere) {
          const next = defaultPortalWorkspace
          writePortalWorkspace(next)
          setWorkspace(next)
        }
      }
    } catch {
      setTeams([])
    } finally {
      setTeamsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    void refreshTeams()
  }, [hydrated, refreshTeams])

  const setPersonalWorkspace = useCallback(() => {
    const next = defaultPortalWorkspace
    writePortalWorkspace(next)
    setWorkspace(next)
    router.refresh()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("msgflash:workspace-changed"))
    }
  }, [router])

  const setTeamWorkspace = useCallback(
    (team: TeamSummary) => {
      const next: PortalWorkspaceState = {
        mode: "team",
        teamId: team.id,
        teamName: team.name,
        role: team.myRole ?? null,
      }
      writePortalWorkspace(next)
      setWorkspace(next)
      router.refresh()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("msgflash:workspace-changed"))
      }
    },
    [router],
  )

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      teams,
      teamsLoading,
      refreshTeams,
      setPersonalWorkspace,
      setTeamWorkspace,
    }),
    [workspace, teams, teamsLoading, refreshTeams, setPersonalWorkspace, setTeamWorkspace],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider")
  }
  return ctx
}
