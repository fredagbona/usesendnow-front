"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft01Icon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import TeamWorkspaceDetail from "@/components/teams/TeamWorkspaceDetail"
import { useTeamDetail } from "@/hooks/useTeamDetail"

export default function TeamDetailPage() {
  const params = useParams<{ id: string }>()
  const teamId = params.id
  const { copy } = usePortalLocale()
  const t = copy.teams
  const { team, loading, error, refetch } = useTeamDetail(teamId)

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text"
        >
          <ArrowLeft01Icon className="h-4 w-4 shrink-0" aria-hidden />
          {t.backToTeamsList}
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#111827] tracking-tight">
          {team?.name ?? t.detailTitle}
        </h1>
        <p className="text-sm text-[#6B7280] mt-0.5 font-mono">{teamId}</p>
      </div>
      <TeamWorkspaceDetail teamId={teamId} team={team} loading={loading} error={error} onRefresh={refetch} />
    </div>
  )
}
