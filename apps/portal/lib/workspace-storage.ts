import type { UserTeamSummary } from "@usesendnow/types"

/** Same key as `@usesendnow/api-client` (JWT `X-Team-Id`). Spec 37 §11.1. */
export const PORTAL_WORKSPACE_STORAGE_KEY = "msgflash_portal_workspace_v1"

export type PortalWorkspaceMode = "personal" | "team"

export interface PortalWorkspaceState {
  mode: PortalWorkspaceMode
  teamId: string | null
  teamName: string | null
  role: string | null
}

export const defaultPortalWorkspace: PortalWorkspaceState = {
  mode: "personal",
  teamId: null,
  teamName: null,
  role: null,
}

function parseStoredTeamPayload(raw: string): {
  teamId: string | null
  teamName: string | null
  role: string | null
} {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed === null || parsed === undefined) {
      return { teamId: null, teamName: null, role: null }
    }
    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      return { teamId: null, teamName: null, role: null }
    }
    const p = parsed as Record<string, unknown>
    const teamId = typeof p.teamId === "string" && p.teamId.length > 0 ? p.teamId : null
    const teamName = typeof p.teamName === "string" ? p.teamName : null
    const role = typeof p.role === "string" ? p.role : null
    if (teamId) return { teamId, teamName, role }
  } catch {
    /* ignore */
  }
  return { teamId: null, teamName: null, role: null }
}

export function readPortalWorkspace(): PortalWorkspaceState {
  if (typeof window === "undefined") return defaultPortalWorkspace
  const raw = window.localStorage.getItem(PORTAL_WORKSPACE_STORAGE_KEY)
  if (!raw) return defaultPortalWorkspace
  const { teamId, teamName, role } = parseStoredTeamPayload(raw)
  if (!teamId) return defaultPortalWorkspace
  return { mode: "team", teamId, teamName, role }
}

/** Persist active team — spec minimal shape `{ teamId }` (legacy full object still read). */
export function writePortalWorkspace(state: PortalWorkspaceState) {
  if (typeof window === "undefined") return
  if (state.mode === "personal" || !state.teamId) {
    window.localStorage.removeItem(PORTAL_WORKSPACE_STORAGE_KEY)
    return
  }
  window.localStorage.setItem(PORTAL_WORKSPACE_STORAGE_KEY, JSON.stringify({ teamId: state.teamId }))
}

export function clearPortalWorkspace(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(PORTAL_WORKSPACE_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/** Enrich switcher label/role from `GET /api/auth/me` → `teams[]` when storage only has `teamId`. */
export function enrichWorkspaceFromUserTeams(
  stored: PortalWorkspaceState,
  teams: UserTeamSummary[] | undefined,
): PortalWorkspaceState {
  if (stored.mode !== "team" || !stored.teamId || !teams?.length) return stored
  const row = teams.find((t) => t.id === stored.teamId)
  if (!row) return stored
  return {
    mode: "team",
    teamId: stored.teamId,
    teamName: row.name,
    role: row.role,
  }
}
