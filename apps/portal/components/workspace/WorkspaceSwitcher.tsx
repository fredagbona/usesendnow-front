"use client"

import Link from "next/link"
import { UserMultiple02Icon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { useWorkspace } from "@/components/workspace/WorkspaceContext"
import { getTeamSeatsSummary } from "@/lib/team-seats"

export interface WorkspaceMenuSectionProps {
  onClose: () => void
}

/** Workspace picker + link to /teams — for user menu dropdown. */
export function WorkspaceMenuSection({ onClose }: WorkspaceMenuSectionProps) {
  const { copy } = usePortalLocale()
  const t = copy.teams
  const { workspace, teams, teamsLoading, setPersonalWorkspace, setTeamWorkspace } = useWorkspace()

  return (
    <div className="border-b border-border py-1">
      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {t.workspaceLabel}
      </p>
      <div className="max-h-44 overflow-y-auto">
        <button
          type="button"
          onClick={() => {
            setPersonalWorkspace()
            onClose()
          }}
          className={[
            "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors cursor-pointer",
            workspace.mode === "personal"
              ? "bg-primary-subtle text-primary-text"
              : "text-text-body hover:bg-bg-subtle",
          ].join(" ")}
        >
          <span>{t.personal}</span>
        </button>
        {teamsLoading ? (
          <p className="px-3 py-2 text-xs text-text-muted">{copy.common.loading}</p>
        ) : (
          teams.map((team) => {
            const active = workspace.mode === "team" && workspace.teamId === team.id
            const owner = team.isOwner === true || team.myRole === "owner"
            const roleKey = String(team.myRole ?? "").toLowerCase()
            const badgeLabel = owner
              ? t.ownerBadge
              : roleKey === "admin"
                ? t.roleAdmin
                : roleKey === "collaborator"
                  ? t.roleCollaborator
                  : null
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  setTeamWorkspace(team)
                  onClose()
                }}
                className={[
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                  active ? "bg-primary-subtle text-primary-text" : "text-text-body hover:bg-bg-subtle",
                ].join(" ")}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{team.name}</span>
                  {(() => {
                    const s = getTeamSeatsSummary(team)
                    if (!s.hasSeatsObject && s.limit == null) return null
                    return (
                      <span className="mt-0.5 block text-[10px] font-medium tabular-nums text-text-muted">
                        {s.used}/{s.limit ?? "—"}
                      </span>
                    )
                  })()}
                </span>
                {badgeLabel ? (
                  <span className="shrink-0 rounded-full bg-bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-text-muted">
                    {badgeLabel}
                  </span>
                ) : null}
              </button>
            )
          })
        )}
      </div>
      <div className="border-t border-border mt-1 pt-1">
        <Link
          href="/teams"
          className="flex items-center gap-2 px-3 py-2 text-sm text-primary-text hover:bg-bg-subtle rounded-none"
          onClick={onClose}
        >
          <UserMultiple02Icon className="h-4 w-4 shrink-0 text-text-muted" />
          {t.openTeams}
        </Link>
      </div>
    </div>
  )
}
