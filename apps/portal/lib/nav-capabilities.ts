import type { WorkspaceCapabilities, WorkspaceCurrentPayload } from "@usesendnow/types"

/**
 * Team owner or admin — spec 37 §9 (manage templates / webhooks).
 * Used when `capabilities.canManageTemplates|canManageWebhooks` are wrongly `false` from API.
 */
function teamOwnerOrAdminWorkspace(workspace: WorkspaceCurrentPayload | null | undefined): boolean {
  if (!workspace || workspace.kind !== "team" || workspace.team == null) return false
  if (workspace.capabilities?.isRestrictedCollaborator === true) return false
  const t = workspace.team
  if (t.isOwner === true) return true
  const role = String(t.role ?? "").toLowerCase()
  return role === "owner" || role === "admin"
}

/**
 * Sidebar / mobile nav visibility from `GET /api/workspace/current` capabilities (spec 37).
 * When `workspaceBootstrapLoading` is true, callers should pass full-open defaults from context.
 *
 * @param workspace Optional `workspace/current` payload — used to recover Templates/Webhooks for
 * team owner/admin when `canManageTemplates` / `canManageWebhooks` are incorrectly `false`.
 */
export function isPortalNavHrefVisible(
  href: string,
  caps: WorkspaceCapabilities,
  workspace?: WorkspaceCurrentPayload | null,
): boolean {
  const base = href.split("?")[0] ?? href
  if (base === "/dashboard") return true
  if (base === "/instances" || base.startsWith("/instances/")) return true
  if (base === "/health" || base.startsWith("/health/")) return true
  if (base === "/messages" || base.startsWith("/messages/")) return caps.canSendMessages !== false
  if (base === "/campaigns" || base.startsWith("/campaigns/")) return caps.canCreateCampaigns !== false
  if (base === "/contacts" || base.startsWith("/contacts/")) return true
  if (base === "/templates" || base.startsWith("/templates/")) {
    if (caps.canManageTemplates !== false) return true
    return teamOwnerOrAdminWorkspace(workspace)
  }
  if (base === "/webhooks" || base.startsWith("/webhooks/")) {
    if (caps.canManageWebhooks !== false) return true
    if (caps.canUseWebhooks === true) return true
    return teamOwnerOrAdminWorkspace(workspace)
  }
  if (base === "/number-lookups" || base.startsWith("/number-lookups/")) return caps.canUseNumberLookups !== false
  if (base === "/api-keys") return caps.canManageApiKeys !== false
  if (base === "/billing" || base.startsWith("/billing")) {
    return caps.canMutateBilling !== false || caps.canViewPayments !== false
  }
  return true
}
