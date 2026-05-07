import type { TeamDetail } from "@usesendnow/types"

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
      const sameUser = String(m.userId) === uid
      const memberRole = String(m.role ?? "")
        .toLowerCase()
        .trim()
      return sameUser && memberRole === "owner"
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
