"use client"

import Link from "next/link"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { useWorkspace } from "@/components/workspace/WorkspaceContext"
import TeamInvitationsInbox from "@/components/teams/TeamInvitationsInbox"
import { getTeamSeatsSummary } from "@/lib/team-seats"
import { UserMultiple02Icon } from "hugeicons-react"

function formatRole(
  role: string | undefined,
  t: { roleOwner: string; roleAdmin: string; roleCollaborator: string },
): string {
  if (!role) return "—"
  const k = role.toLowerCase()
  if (k === "owner") return t.roleOwner
  if (k === "admin") return t.roleAdmin
  if (k === "collaborator") return t.roleCollaborator
  return role
}

function roleBadgeClass(role: string | undefined): string {
  const base =
    "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-none tracking-tight"
  const k = (role ?? "").toLowerCase()
  if (k === "owner") {
    return `${base} border-black/10 bg-primary text-black shadow-sm dark:border-black/20 dark:bg-primary dark:text-black`
  }
  if (k === "admin") {
    return `${base} border-primary/35 bg-primary-subtle text-primary-text dark:text-primary-text`
  }
  if (k === "collaborator") {
    return `${base} border-border-strong bg-bg-muted text-text`
  }
  return `${base} border-border-strong bg-bg-subtle text-text-secondary`
}

export default function TeamsListPage() {
  const { copy } = usePortalLocale()
  const t = copy.teams
  const { teams, teamsLoading, refreshTeams } = useWorkspace()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[#111827] tracking-tight">{t.listTitle}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{t.listDescription}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void refreshTeams()}>
            {copy.common.retry}
          </Button>
          <Link href="/teams/new">
            <Button variant="primary">{t.createTeam}</Button>
          </Link>
        </div>
      </div>

      <TeamInvitationsInbox />

      {teamsLoading ? (
        <p className="text-sm text-text-secondary">{copy.common.loading}</p>
      ) : teams.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-12 text-center">
            <UserMultiple02Icon className="w-10 h-10 text-text-muted mb-4" />
            <p className="text-sm font-medium text-text">{t.listTitle}</p>
            <p className="text-sm text-text-secondary mt-1 mb-4 max-w-md">{t.listDescription}</p>
            <Link href="/teams/new">
              <Button variant="primary">{t.createTeam}</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => {
            const seatSummary = getTeamSeatsSummary(team)
            const used = seatSummary.used
            const limit = seatSummary.limit
            const effectiveRole = team.myRole ?? (team.isOwner ? "owner" : undefined)
            const caption = seatSummary.hasSeatsObject
              ? t.teamCardSeatsCaption
              : limit != null
                ? t.teamCardSeatsCaptionLegacy
                : t.teamCardSeatsCaptionNoMax
            return (
              <Card key={team.id} elevated>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-medium text-text truncate">{team.name}</h2>
                    <div className="mt-2 space-y-1">
                      <p
                        className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                        title={t.teamCardSeatsTooltip}
                      >
                        <span className="inline-flex items-center gap-1.5 text-text-muted">
                          <UserMultiple02Icon className="h-4 w-4 shrink-0" aria-hidden />
                          <span className="text-xs font-medium">{t.teamCardSeatsShortLabel}</span>
                        </span>
                        <span className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="text-lg font-semibold tabular-nums leading-none text-text">{used}</span>
                          <span className="text-sm text-text-muted">/</span>
                          <span
                            className={`text-lg font-semibold tabular-nums leading-none ${
                              limit != null ? "text-text" : "text-text-muted"
                            }`}
                          >
                            {limit != null ? limit : "—"}
                          </span>
                        </span>
                      </p>
                      <p className="text-xs leading-snug text-text-muted">{caption}</p>
                    </div>
                  </div>
                  <span className={roleBadgeClass(effectiveRole)}>{formatRole(effectiveRole, t)}</span>
                </div>
                <div className="mt-4">
                  <Link href={`/teams/${team.id}`}>
                    <Button variant="secondary" className="w-full sm:w-auto">
                      {t.open}
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
