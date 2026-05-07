"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { DataTable, Input, PageHeader } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"
import type { AdminTeamListItem } from "@usesendnow/types"

function formatOwner(owner: AdminTeamListItem["owner"]): string {
  if (owner == null) return "—"
  if (typeof owner === "string") return owner
  return owner.email ?? owner.fullName ?? owner.id ?? "—"
}

export default function AdminTeamsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState("")

  const params = useMemo(() => ({ page, limit, search }), [limit, page, search])

  const { data, loading, error } = useAdminData(() => adminApi.teams(params), [JSON.stringify(params)])

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Teams & workspaces"
        description="Platform-wide teams: owner, seat usage, status. Supports search by team name or owner email."
      />

      {error ? <p className="text-sm text-warning-text">{error}</p> : null}

      <div className="flex flex-wrap gap-3 md:max-w-xl">
        <Input
          placeholder="Search team name or owner email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <DataTable<AdminTeamListItem>
        loading={loading}
        emptyMessage="No teams match this query."
        columns={[
          {
            key: "name",
            label: "Team",
            render: (row) => (
              <Link href={`/teams/${row.id}`} className="text-primary-ink underline">
                {row.name}
              </Link>
            ),
          },
          {
            key: "owner",
            label: "Owner",
            render: (row) => (
              <Link href={`/users/${row.ownerUserId}`} className="text-primary-ink underline">
                {formatOwner(row.owner)}
              </Link>
            ),
          },
          { key: "ownerUserId", label: "Owner user ID" },
          {
            key: "activeMemberCount",
            label: "Seats (used / max)",
            render: (row) => {
              const max = row.maxSeats
              const suffix = max != null ? String(max) : "—"
              return `${row.activeMemberCount} / ${suffix}`
            },
          },
          {
            key: "deletedAt",
            label: "Status",
            render: (row) => (row.deletedAt ? "deleted" : "active"),
          },
          { key: "createdAt", label: "Created" },
          {
            key: "id",
            label: "Actions",
            render: (row) => (
              <Link href={`/teams/${row.id}`} className="text-primary-ink underline">
                View
              </Link>
            ),
          },
        ]}
        rows={items}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-secondary">
          Page {data?.page ?? page} of {totalPages}
          {" · "}
          {total.toLocaleString()} teams
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-sm text-text-secondary hover:text-text disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="text-sm text-text-secondary hover:text-text disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
