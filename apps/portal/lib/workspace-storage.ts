const WORKSPACE_STORAGE_KEY = "msgflash_portal_workspace_v1"

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

export function readPortalWorkspace(): PortalWorkspaceState {
  if (typeof window === "undefined") return defaultPortalWorkspace
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY)
    if (!raw) return defaultPortalWorkspace
    const parsed = JSON.parse(raw) as Partial<PortalWorkspaceState>
    if (parsed.mode !== "personal" && parsed.mode !== "team") return defaultPortalWorkspace
    return {
      mode: parsed.mode,
      teamId: typeof parsed.teamId === "string" ? parsed.teamId : null,
      teamName: typeof parsed.teamName === "string" ? parsed.teamName : null,
      role: typeof parsed.role === "string" ? parsed.role : null,
    }
  } catch {
    return defaultPortalWorkspace
  }
}

export function writePortalWorkspace(state: PortalWorkspaceState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state))
}
