"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type {
  Instance,
  SubscriptionResponse,
  TeamSummary,
  User,
  UserTeamSummary,
  WorkspaceCapabilities,
  WorkspaceCurrentPayload,
} from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { toast } from "@/lib/toast"
import { PORTAL_WORKSPACE_CHANGED_EVENT, onPortalWorkspaceChanged } from "@/lib/workspace-events"
import { getTeamInstanceAssignmentUserId } from "@/lib/team-page-access"
import { mergeTeamSummariesWithFullList } from "@/lib/team-seats"
import {
  PORTAL_WORKSPACE_STORAGE_KEY,
  defaultPortalWorkspace,
  enrichWorkspaceFromUserTeams,
  readPortalWorkspace,
  writePortalWorkspace,
  type PortalWorkspaceState,
} from "@/lib/workspace-storage"

const DEFAULT_CAPABILITIES: WorkspaceCapabilities = {
  canSendMessages: true,
  canCreateCampaigns: true,
  canPublishStatuses: true,
  canUseWebhooks: true,
  canUseNumberLookups: true,
  canMutateBilling: true,
  canViewPayments: true,
  canManageMembers: true,
  canManageInstances: true,
  canManageApiKeys: true,
  canManageWebhooks: true,
  canManageTemplates: true,
  isRestrictedCollaborator: false,
}

function mapUserTeamToSummary(t: UserTeamSummary): TeamSummary {
  return {
    id: t.id,
    name: t.name,
    myRole: t.role,
    isOwner: t.isOwner,
  }
}

function workspaceToPortalState(cur: WorkspaceCurrentPayload): PortalWorkspaceState {
  if (cur.kind !== "team" || !cur.team) {
    return defaultPortalWorkspace
  }
  return {
    mode: "team",
    teamId: cur.team.id,
    teamName: cur.team.name,
    role: cur.team.role ?? null,
  }
}

function subscriptionFromWorkspaceCurrent(cur: WorkspaceCurrentPayload): SubscriptionResponse {
  return {
    subscription: cur.subscription ?? null,
    usage: cur.usage ?? null,
    period: cur.period ?? null,
  }
}

interface WorkspaceContextValue {
  workspace: PortalWorkspaceState
  teams: TeamSummary[]
  teamsLoading: boolean
  me: User | null
  workspaceCurrent: WorkspaceCurrentPayload | null
  workspaceBootstrapLoading: boolean
  capabilities: WorkspaceCapabilities
  /** Sidebar / layout — spec 37 §3.1 */
  subscriptionLayout: SubscriptionResponse | null
  /** `null` = not restricted; otherwise instance ids the collaborator may use. */
  collaboratorAssignedInstanceIds: string[] | null
  filterInstancesForWorkspace: (instances: Instance[]) => Instance[]
  refreshTeams: () => Promise<void>
  refreshWorkspaceBootstrap: () => Promise<void>
  setPersonalWorkspace: () => void
  setTeamWorkspace: (team: TeamSummary) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { copy } = usePortalLocale()
  const [workspace, setWorkspace] = useState<PortalWorkspaceState>(defaultPortalWorkspace)
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [me, setMe] = useState<User | null>(null)
  const [workspaceCurrent, setWorkspaceCurrent] = useState<WorkspaceCurrentPayload | null>(null)
  const [workspaceBootstrapLoading, setWorkspaceBootstrapLoading] = useState(true)
  const [collaboratorAssignedInstanceIds, setCollaboratorAssignedInstanceIds] = useState<string[] | null>(
    null,
  )
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setWorkspace(readPortalWorkspace())
    setHydrated(true)
  }, [])

  const loadCollaboratorAssignments = useCallback(async (teamId: string, viewerId: string) => {
    try {
      const detail = await apiClient.teams.get(teamId)
      const rows = detail.instanceAssignments ?? []
      const ids = rows
        .filter((a) => getTeamInstanceAssignmentUserId(a) === viewerId)
        .map((a) => a.instanceId)
      setCollaboratorAssignedInstanceIds(ids.length > 0 ? ids : [])
    } catch {
      setCollaboratorAssignedInstanceIds([])
    }
  }, [])

  const fetchWorkspaceCurrentWithRecovery = useCallback(async () => {
    const failWorkspace = (e: unknown) => {
      setWorkspaceCurrent(null)
      setCollaboratorAssignedInstanceIds(null)
      const unauthorized = e instanceof ApiClientError && e.status === 401
      if (!unauthorized) {
        toast.error(copy.hooks.workspaceCurrentLoadError)
      }
    }

    try {
      const cur = await apiClient.workspace.current()
      setWorkspaceCurrent(cur)
      setWorkspace(workspaceToPortalState(cur))
      const caps = cur.capabilities
      const team = cur.team
      const restricted =
        caps?.isRestrictedCollaborator === true && cur.kind === "team" && team != null
      if (restricted && cur.viewer?.id && team) {
        await loadCollaboratorAssignments(team.id, cur.viewer.id)
      } else {
        setCollaboratorAssignedInstanceIds(null)
      }
      return cur
    } catch (e) {
      if (e instanceof ApiClientError && e.code === "TEAM_NOT_FOUND") {
        writePortalWorkspace(defaultPortalWorkspace)
        setWorkspace(defaultPortalWorkspace)
        toast.info(copy.hooks.workspaceNotAvailable)
        try {
          const cur = await apiClient.workspace.current()
          setWorkspaceCurrent(cur)
          setWorkspace(workspaceToPortalState(cur))
          setCollaboratorAssignedInstanceIds(null)
          return cur
        } catch (inner) {
          failWorkspace(inner)
          return null
        }
      }
      failWorkspace(e)
      return null
    }
  }, [copy.hooks.workspaceCurrentLoadError, copy.hooks.workspaceNotAvailable, loadCollaboratorAssignments])

  const refreshWorkspaceBootstrap = useCallback(async () => {
    setTeamsLoading(true)
    setWorkspaceBootstrapLoading(true)
    try {
      const user = await apiClient.auth.me()
      setMe(user)
      const fromMe = (user.teams ?? []).map(mapUserTeamToSummary)

      let merged: TeamSummary[] = fromMe
      try {
        const list = await apiClient.teams.list()
        merged = mergeTeamSummariesWithFullList(fromMe, list)
      } catch {
        merged = fromMe
      }
      setTeams(merged)

      const stored = readPortalWorkspace()
      if (stored.mode === "team" && stored.teamId) {
        const stillThere = merged.some((t) => t.id === stored.teamId)
        if (!stillThere) {
          writePortalWorkspace(defaultPortalWorkspace)
          setWorkspace(defaultPortalWorkspace)
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent(PORTAL_WORKSPACE_CHANGED_EVENT))
          }
        }
      }

      const cur = await fetchWorkspaceCurrentWithRecovery()
      if (cur?.kind === "team" && cur.team?.seats) {
        setTeams((prev) =>
          prev.length === 0
            ? prev
            : prev.map((t) => (t.id === cur.team!.id ? { ...t, seats: cur.team!.seats } : t)),
        )
      }

      const storedAfter = readPortalWorkspace()
      if (storedAfter.mode === "team" && user.teams?.length) {
        setWorkspace(enrichWorkspaceFromUserTeams(storedAfter, user.teams))
      }
    } catch {
      setTeams([])
      setWorkspaceCurrent(null)
      setCollaboratorAssignedInstanceIds(null)
    } finally {
      setTeamsLoading(false)
      setWorkspaceBootstrapLoading(false)
    }
  }, [fetchWorkspaceCurrentWithRecovery])

  useEffect(() => {
    if (!hydrated) return
    void refreshWorkspaceBootstrap()
  }, [hydrated, refreshWorkspaceBootstrap])

  useEffect(() => {
    if (!hydrated) return
    return onPortalWorkspaceChanged(() => {
      setWorkspace(readPortalWorkspace())
      void fetchWorkspaceCurrentWithRecovery().catch(() => {
        setWorkspaceCurrent(null)
        setCollaboratorAssignedInstanceIds(null)
      })
      void apiClient.auth
        .me()
        .then(async (u) => {
          setMe(u)
          const fromMe = (u.teams ?? []).map(mapUserTeamToSummary)
          let merged: TeamSummary[] = fromMe
          try {
            const list = await apiClient.teams.list()
            merged = mergeTeamSummariesWithFullList(fromMe, list)
          } catch {
            merged = fromMe
          }
          setTeams(merged)
        })
        .catch(() => {})
    })
  }, [hydrated, fetchWorkspaceCurrentWithRecovery])

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return

    const onStorage = (e: StorageEvent) => {
      if (e.key !== PORTAL_WORKSPACE_STORAGE_KEY) return
      if (e.storageArea !== window.localStorage) return
      setWorkspace(readPortalWorkspace())
      window.dispatchEvent(new CustomEvent(PORTAL_WORKSPACE_CHANGED_EVENT))
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [hydrated])

  const refreshTeams = useCallback(async () => {
    await refreshWorkspaceBootstrap()
  }, [refreshWorkspaceBootstrap])

  const setPersonalWorkspace = useCallback(() => {
    const next = defaultPortalWorkspace
    writePortalWorkspace(next)
    setWorkspace(next)
    router.refresh()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PORTAL_WORKSPACE_CHANGED_EVENT))
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
        window.dispatchEvent(new CustomEvent(PORTAL_WORKSPACE_CHANGED_EVENT))
      }
    },
    [router],
  )

  const capabilities = useMemo(
    () => workspaceCurrent?.capabilities ?? DEFAULT_CAPABILITIES,
    [workspaceCurrent],
  )

  const subscriptionLayout = useMemo((): SubscriptionResponse | null => {
    if (!workspaceCurrent) return null
    return subscriptionFromWorkspaceCurrent(workspaceCurrent)
  }, [workspaceCurrent])

  const filterInstancesForWorkspace = useCallback(
    (instances: Instance[]) => {
      if (!collaboratorAssignedInstanceIds) return instances
      const allow = new Set(collaboratorAssignedInstanceIds)
      return instances.filter((i) => allow.has(i.id))
    },
    [collaboratorAssignedInstanceIds],
  )

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      teams,
      teamsLoading,
      me,
      workspaceCurrent,
      workspaceBootstrapLoading,
      capabilities,
      subscriptionLayout,
      collaboratorAssignedInstanceIds,
      filterInstancesForWorkspace,
      refreshTeams,
      refreshWorkspaceBootstrap,
      setPersonalWorkspace,
      setTeamWorkspace,
    }),
    [
      workspace,
      teams,
      teamsLoading,
      me,
      workspaceCurrent,
      workspaceBootstrapLoading,
      capabilities,
      subscriptionLayout,
      collaboratorAssignedInstanceIds,
      filterInstancesForWorkspace,
      refreshTeams,
      refreshWorkspaceBootstrap,
      setPersonalWorkspace,
      setTeamWorkspace,
    ],
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
