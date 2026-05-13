import type {
  TeamDetail,
  TeamInstanceAssignment,
  TeamMember,
  UserTeamSummary,
  WorkspaceCapabilities,
  WorkspaceCurrentPayload,
} from "@usesendnow/types"
import type { PortalWorkspaceState } from "@/lib/workspace-storage"

function parseTruthyOwner(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === "string") {
    const s = value.toLowerCase().trim()
    return s === "true" || s === "1" || s === "yes"
  }
  return false
}

function firstNonEmptyString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return ""
}

/**
 * `GET /api/teams/:id` member rows may expose the user id as `userId`, `id`, `memberUserId`, `user_id`, or nested `user.id`.
 */
export function getTeamMemberUserId(m: TeamMember): string {
  const r = m as TeamMember & Record<string, unknown>
  let nested: unknown
  if (r.user !== null && r.user !== undefined && typeof r.user === "object" && !Array.isArray(r.user)) {
    const u = r.user as Record<string, unknown>
    nested = u.id ?? u.userId
  }
  return firstNonEmptyString(m.userId, m.id, r.memberUserId, r.user_id, r.memberId, r.id, nested)
}

/** Assignment row uses `userId`; tolerate legacy `memberUserId` if present. */
export function getTeamInstanceAssignmentUserId(a: TeamInstanceAssignment): string {
  const r = a as TeamInstanceAssignment & { memberUserId?: string }
  return firstNonEmptyString(r.userId, r.memberUserId)
}

/**
 * Derive owner/admin for team detail UI — tolerates alternate API field names
 * (`role`, `membershipRole`, …) and infers owner from the members list when needed.
 */
export function deriveTeamPageAccess(team: TeamDetail, currentUserId: string) {
  const r = team as TeamDetail & Record<string, unknown>
  const roleHint = firstNonEmptyString(
    r.myRole,
    r.role,
    r.membershipRole,
    r.currentUserRole,
    r.viewerRole,
  )
  const normalizedRole = roleHint.toLowerCase()

  const uid = currentUserId.trim()
  const isOwnerFromMembers =
    uid.length > 0 &&
    (team.members ?? []).some((m) => {
      const mid = getTeamMemberUserId(m)
      const memberRole = String(m.role ?? "")
        .toLowerCase()
        .trim()
      return mid === uid && memberRole === "owner"
    })

  const isOwner =
    team.isOwner === true ||
    parseTruthyOwner(r.isOwner) ||
    normalizedRole === "owner" ||
    isOwnerFromMembers

  const isAdmin = normalizedRole === "admin"
  const canManage = isOwner || isAdmin
  const canKeys = canManage

  return { isOwner, isAdmin, canManage, canKeys, collaboratorOnly: !canManage }
}

/** Access flags for `/teams/[id]` — prefer `workspace/current` when this team is the active workspace (authoritative caps). */
export interface TeamDetailResolvedAccess {
  isOwner: boolean
  isAdmin: boolean
  /** Members, invites, rename — `canManageMembers` from workspace when active. */
  canManage: boolean
  /** Team API keys tab — `canManageApiKeys`. */
  canKeys: boolean
  /** Instance assignment UI — `canManageInstances`. */
  canManageInstances: boolean
  collaboratorOnly: boolean
  /** True when caps came from `GET /api/workspace/current` for this team. */
  usedWorkspaceCapabilities: boolean
}

export function resolveTeamDetailAccess(
  teamId: string,
  team: TeamDetail | null,
  currentUserId: string,
  workspace: PortalWorkspaceState,
  workspaceCurrent: WorkspaceCurrentPayload | null,
  meTeamMembership: UserTeamSummary | null = null,
): TeamDetailResolvedAccess {
  const meRow = meTeamMembership && meTeamMembership.id === teamId ? meTeamMembership : null

  const activeTeam =
    workspace.mode === "team" &&
    workspace.teamId === teamId &&
    workspaceCurrent != null &&
    workspaceCurrent.kind === "team" &&
    workspaceCurrent.team != null &&
    workspaceCurrent.team.id === teamId

  if (activeTeam) {
    const caps: WorkspaceCapabilities = workspaceCurrent.capabilities ?? {}
    const wt = workspaceCurrent.team!
    const role = String(wt.role ?? meRow?.role ?? "").toLowerCase().trim()
    const isOwner = wt.isOwner === true || role === "owner" || meRow?.isOwner === true
    const isAdmin = role === "admin"
    return {
      isOwner,
      isAdmin,
      canManage: caps.canManageMembers !== false,
      canKeys: caps.canManageApiKeys !== false,
      canManageInstances: caps.canManageInstances !== false,
      collaboratorOnly: caps.isRestrictedCollaborator === true,
      usedWorkspaceCapabilities: true,
    }
  }

  if (meRow) {
    const role = String(meRow.role ?? "").toLowerCase().trim()
    const isOwner = meRow.isOwner === true || role === "owner"
    const isAdmin = role === "admin"
    const isCollab = role === "collaborator"
    return {
      isOwner,
      isAdmin,
      canManage: isOwner || isAdmin,
      canKeys: isOwner || isAdmin,
      canManageInstances: isOwner || isAdmin,
      collaboratorOnly: isCollab,
      usedWorkspaceCapabilities: false,
    }
  }

  const uid = currentUserId.trim()
  if (team && uid.length > 0) {
    const d = deriveTeamPageAccess(team, uid)
    return {
      isOwner: d.isOwner,
      isAdmin: d.isAdmin,
      canManage: d.canManage,
      canKeys: d.canKeys,
      canManageInstances: d.canManage,
      collaboratorOnly: d.collaboratorOnly,
      usedWorkspaceCapabilities: false,
    }
  }

  /* Bootstrap: `me` not ready yet — infer from team payload so owners are not shown as collaborators. */
  if (team) {
    const r = team as TeamDetail & Record<string, unknown>
    const roleHint = firstNonEmptyString(team.myRole, r.role).toLowerCase().trim()
    if (team.isOwner === true || roleHint === "owner") {
      return {
        isOwner: true,
        isAdmin: false,
        canManage: true,
        canKeys: true,
        canManageInstances: true,
        collaboratorOnly: false,
        usedWorkspaceCapabilities: false,
      }
    }
    if (roleHint === "admin") {
      return {
        isOwner: false,
        isAdmin: true,
        canManage: true,
        canKeys: true,
        canManageInstances: true,
        collaboratorOnly: false,
        usedWorkspaceCapabilities: false,
      }
    }
    if (roleHint === "collaborator") {
      return {
        isOwner: false,
        isAdmin: false,
        canManage: false,
        canKeys: false,
        canManageInstances: false,
        collaboratorOnly: true,
        usedWorkspaceCapabilities: false,
      }
    }
  }

  return {
    isOwner: false,
    isAdmin: false,
    canManage: false,
    canKeys: false,
    canManageInstances: false,
    collaboratorOnly: true,
    usedWorkspaceCapabilities: false,
  }
}
