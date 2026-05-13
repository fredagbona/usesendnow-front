import type { TeamSeats, TeamSummary } from "@usesendnow/types"

export interface TeamSeatsSummary {
  used: number
  limit: number | null
  available: number | null
  pending: number
  active: number
  hasSeatsObject: boolean
}

/** Prefer `seats` from API; fall back to legacy `activeMemberCount` / `maxSeats`. */
export function getTeamSeatsSummary(team: {
  seats?: TeamSeats
  activeMemberCount?: number
  maxSeats?: number | null
}): TeamSeatsSummary {
  if (team.seats) {
    const s = team.seats
    return {
      used: s.used,
      limit: s.limit,
      available: s.available,
      pending: s.pending,
      active: s.active,
      hasSeatsObject: true,
    }
  }
  const active = team.activeMemberCount ?? 0
  const limit = team.maxSeats ?? null
  const available = typeof limit === "number" ? Math.max(0, limit - active) : null
  return {
    used: active,
    limit,
    available,
    pending: 0,
    active,
    hasSeatsObject: false,
  }
}

/** True when invitation should be blocked (authoritative `seats` from API only). */
export function teamHasNoSeatAvailable(team: { seats?: TeamSeats } | null | undefined): boolean {
  return team?.seats != null && team.seats.available <= 0
}

/**
 * Merge `GET /api/teams` rows into `me.teams` summaries — keeps `myRole` / `isOwner` from auth,
 * adds `seats` and other team fields from the list endpoint.
 */
export function mergeTeamSummariesWithFullList(fromMe: TeamSummary[], list: TeamSummary[]): TeamSummary[] {
  if (list.length === 0) return fromMe.length > 0 ? fromMe : []
  const byId = new Map(list.map((t) => [t.id, t]))
  if (fromMe.length === 0) return list
  return fromMe.map((meRow) => {
    const row = byId.get(meRow.id)
    if (!row) return meRow
    return {
      ...row,
      myRole: meRow.myRole ?? row.myRole,
      isOwner: meRow.isOwner ?? row.isOwner,
    }
  })
}
