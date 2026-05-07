"use client"

import Link from "next/link"
import { Card, DataTable } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"
import type { AdminUserTeamAssociation } from "@usesendnow/types"

interface UserTeamsCardProps {
  userId: string
}

export function UserTeamsCard({ userId }: UserTeamsCardProps) {
  const { data, loading, error } = useAdminData(() => adminApi.userTeams(userId), [userId])
  const rows = data?.items ?? []

  return (
    <Card>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Teams</h2>
      <p className="mb-3 text-sm text-text-secondary">
        Workspaces this user owns or belongs to. Open a team for membership and invitation audit (no secrets).
      </p>
      {error ? (
        <p className="mb-3 text-sm text-warning-text">
          {error}
          {" "}
          <span className="text-text-secondary">(If the endpoint is not deployed yet, this section stays empty.)</span>
        </p>
      ) : null}
      <DataTable<AdminUserTeamAssociation>
        loading={loading}
        emptyMessage="No team memberships returned."
        columns={[
          {
            key: "name",
            label: "Team",
            render: (row) => (
              <Link href={`/teams/${row.teamId}`} className="text-primary-ink underline">
                {row.name ?? row.teamId}
              </Link>
            ),
          },
          { key: "role", label: "Role" },
          {
            key: "isOwner",
            label: "Owner",
            render: (row) => (row.isOwner === true ? "Yes" : row.isOwner === false ? "No" : "—"),
          },
          { key: "teamId", label: "Team ID" },
        ]}
        rows={rows}
      />
    </Card>
  )
}
