/** Dispatched after workspace switch or forced reset (e.g. `TEAM_NOT_FOUND`). Portal hooks listen to refetch scoped data. */
export const PORTAL_WORKSPACE_CHANGED_EVENT = "msgflash:workspace-changed" as const

export function onPortalWorkspaceChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(PORTAL_WORKSPACE_CHANGED_EVENT, handler)
  return () => window.removeEventListener(PORTAL_WORKSPACE_CHANGED_EVENT, handler)
}
