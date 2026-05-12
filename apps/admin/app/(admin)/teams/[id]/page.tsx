"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, DataTable, PageHeader } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"
import type {
  AdminTeamDetailResponse,
  AdminTeamInvitationRow,
  AdminTeamListItem,
  AdminTeamMemberRow,
} from "@usesendnow/types"

function formatOwner(owner: AdminTeamListItem["owner"]): string {
  if (owner == null) return "—"
  if (typeof owner === "string") return owner
  return owner.email ?? owner.fullName ?? owner.id ?? "—"
}

function flattenTeamDetail(raw: AdminTeamDetailResponse | null): {
  summary: Partial<AdminTeamListItem>
  members: AdminTeamMemberRow[]
  invitations: AdminTeamInvitationRow[]
  usageThisMonth: AdminTeamDetailResponse["usageThisMonth"]
  instances: Array<Record<string, unknown>>
  billingOwnerUserId: string | null | undefined
} {
  if (!raw) {
    return { summary: {}, members: [], invitations: [], usageThisMonth: null, instances: [], billingOwnerUserId: undefined }
  }
  const nested = raw.team
  const summary: Partial<AdminTeamListItem> = {
    id: raw.id ?? nested?.id,
    name: raw.name ?? nested?.name,
    ownerUserId: raw.ownerUserId ?? nested?.ownerUserId,
    owner: raw.owner ?? nested?.owner,
    activeMemberCount: raw.activeMemberCount ?? nested?.activeMemberCount,
    maxSeats: raw.maxSeats ?? nested?.maxSeats,
    deletedAt: raw.deletedAt ?? nested?.deletedAt,
    createdAt: raw.createdAt ?? nested?.createdAt,
  }
  return {
    summary,
    members: Array.isArray(raw.members) ? raw.members : [],
    invitations: Array.isArray(raw.invitations) ? raw.invitations : [],
    usageThisMonth: raw.usageThisMonth ?? null,
    instances: Array.isArray(raw.instances) ? raw.instances : [],
    billingOwnerUserId: typeof raw.billingOwnerUserId === "string" ? raw.billingOwnerUserId : undefined,
  }
}

type RowWithId = Record<string, unknown> & { id: string }

function withStableIds(rows: Record<string, unknown>[], seed: string): RowWithId[] {
  return rows.map((row, index) => ({
    ...row,
    id: String(row.id ?? row.userId ?? row.email ?? `${seed}-${index}`),
  }))
}

function UsageBlock({ usage }: { usage: AdminTeamDetailResponse["usageThisMonth"] }) {
  if (usage === null || usage === undefined) {
    return <p className="text-sm text-text-secondary">No usage payload for this team.</p>
  }
  if (typeof usage === "number") {
    return <p className="text-lg font-bold text-text">{usage.toLocaleString()}</p>
  }
  const entries = Object.entries(usage).filter(([, v]) => v !== null && v !== undefined && v !== "")
  if (entries.length === 0) {
    return <p className="text-sm text-text-secondary">Usage object is empty.</p>
  }
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="border border-border bg-bg-subtle px-3 py-2">
          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">{key}</dt>
          <dd className="mt-1 font-(family-name:--font-geist-sans) text-sm font-semibold text-text">
            {typeof value === "number" ? value.toLocaleString() : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function AdminTeamDetailPage() {
  const params = useParams<{ id: string }>()
  const teamId = params.id
  const { data, loading, error } = useAdminData(() => adminApi.teamDetail(teamId), [teamId])

  const { summary, members, invitations, usageThisMonth, instances, billingOwnerUserId } = flattenTeamDetail(data)
  const title = summary.name ?? teamId

  const memberRows = withStableIds(members as Record<string, unknown>[], "member")
  const inviteRows = withStableIds(invitations as Record<string, unknown>[], "invite")
  const instanceRows = withStableIds(instances, "instance")

  return (
    <div className="space-y-4">
      <PageHeader
        title={loading ? "Team detail" : title}
        description={`Team ID: ${teamId}. Membership and invitations are audit-only (no tokens or key material).`}
      />

      {error ? <p className="text-sm text-warning-text">{error}</p> : null}

      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Summary</h2>
        <DataTable<Partial<AdminTeamListItem>>
          loading={loading}
          emptyMessage="No summary fields returned."
          columns={[
            { key: "name", label: "Name" },
            { key: "id", label: "Team ID" },
            {
              key: "ownerUserId",
              label: "Owner",
              render: (row) =>
                row.ownerUserId ? (
                  <Link href={`/users/${row.ownerUserId}`} className="text-primary-ink underline">
                    {formatOwner(row.owner)}
                  </Link>
                ) : (
                  "—"
                ),
            },
            {
              key: "activeMemberCount",
              label: "Seats (used / max)",
              render: (row) => {
                const max = row.maxSeats
                const suffix = max != null ? String(max) : "—"
                const used = row.activeMemberCount ?? "—"
                return `${used} / ${suffix}`
              },
            },
            {
              key: "deletedAt",
              label: "Status",
              render: (row) => (row.deletedAt ? "deleted" : "active"),
            },
            { key: "createdAt", label: "Created" },
          ]}
          rows={[{ ...summary, id: summary.id ?? teamId, name: summary.name ?? "—" }]}
        />
        {billingOwnerUserId ? (
          <p className="mt-3 text-sm text-text-secondary">
            Billing owner:{" "}
            <Link href={`/users/${billingOwnerUserId}`} className="text-primary-ink underline">
              {billingOwnerUserId}
            </Link>
          </p>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Members</h2>
        <p className="mb-3 text-sm text-text-secondary">Active and historical memberships as returned by the API.</p>
        <DataTable<RowWithId>
          loading={loading}
          emptyMessage="No members returned."
          columns={[
            { key: "userId", label: "User ID" },
            { key: "email", label: "Email" },
            { key: "fullName", label: "Name" },
            { key: "role", label: "Role" },
            { key: "status", label: "Status" },
            { key: "joinedAt", label: "Joined" },
            { key: "leftAt", label: "Left" },
            { key: "removedAt", label: "Removed" },
            { key: "removedByUserId", label: "Removed by" },
          ]}
          rows={memberRows}
        />
      </Card>

      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Invitations</h2>
        <p className="mb-3 text-sm text-text-secondary">Invitation audit trail (no raw tokens or hashes).</p>
        <DataTable<RowWithId>
          loading={loading}
          emptyMessage="No invitations returned."
          columns={[
            { key: "email", label: "Email" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created" },
            { key: "expiresAt", label: "Expires" },
            { key: "acceptedAt", label: "Accepted" },
            { key: "revokedAt", label: "Revoked" },
          ]}
          rows={inviteRows}
        />
      </Card>

      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Usage (this month)</h2>
        <p className="mb-3 text-sm text-text-secondary">Aggregated from usage records for the current calendar month.</p>
        <UsageBlock usage={usageThisMonth} />
      </Card>

      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Instance assignments</h2>
        <p className="mb-3 text-sm text-text-secondary">When the API returns instance rows, they appear here.</p>
        <DataTable<RowWithId>
          loading={loading}
          emptyMessage="No instance assignments returned."
          columns={[
            { key: "id", label: "Instance ID" },
            { key: "instanceId", label: "Instance" },
            { key: "assignedUserId", label: "Assigned user" },
            { key: "userId", label: "User ID" },
            { key: "status", label: "Status" },
          ]}
          rows={instanceRows}
        />
      </Card>
    </div>
  )
}
