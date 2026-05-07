"use client"

import Link from "next/link"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { useWorkspace } from "@/components/workspace/WorkspaceContext"
import TeamInvitationsInbox from "@/components/teams/TeamInvitationsInbox"
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
            const max = team.maxSeats
            const seatLabel =
              max != null
                ? t.seats.replace("{{used}}", String(team.activeMemberCount ?? 0)).replace("{{max}}", String(max))
                : t.seatsUnknownMax.replace("{{used}}", String(team.activeMemberCount ?? 0))
            return (
              <Card key={team.id} elevated>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-base font-medium text-text truncate">{team.name}</h2>
                    <p className="text-xs text-text-secondary mt-1">
                      {t.youAre.replace("{{role}}", formatRole(team.myRole, t))}
                    </p>
                    <p className="text-xs text-text-muted mt-2">{seatLabel}</p>
                  </div>
                  {team.isOwner || team.myRole === "owner" ? (
                    <span className="shrink-0 rounded-full bg-bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-text-muted">
                      {t.ownerBadge}
                    </span>
                  ) : null}
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
