"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { DataTable, Input, PageHeader, Select } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"
import { ExportButton } from "@/components/shared/ExportButton"

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState("")
  const [plan, setPlan] = useState("")
  const [subscriptionStatus, setSubscriptionStatus] = useState("")
  const [userStatus, setUserStatus] = useState("")
  const [activity, setActivity] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  const params = useMemo(() => ({
    page,
    limit,
    search,
    plan,
    subscriptionStatus,
    userStatus,
    activity,
    sortBy,
    sortOrder,
  }), [activity, limit, page, plan, search, sortBy, sortOrder, subscriptionStatus, userStatus])

  const { data, loading } = useAdminData(() => adminApi.users(params), [JSON.stringify(params)])
  const rows = (data?.rows ?? []).map((row) => ({ ...row, detail: "Open" }))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Browse and segment customer accounts."
        action={<ExportButton path="/api/admin/export/users.csv" params={params} />}
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Input placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="plus">Plus</option>
        </Select>
        <Select value={subscriptionStatus} onChange={(e) => setSubscriptionStatus(e.target.value)}>
          <option value="">Subscription status</option>
          <option value="active">active</option>
          <option value="past_due">past_due</option>
          <option value="cancelled">cancelled</option>
        </Select>
        <Select value={userStatus} onChange={(e) => setUserStatus(e.target.value)}>
          <option value="">User status</option>
          <option value="active">active</option>
          <option value="suspended">suspended</option>
        </Select>
        <Select value={activity} onChange={(e) => setActivity(e.target.value)}>
          <option value="">Activity filter</option>
          <option value="active_7d">active_7d</option>
          <option value="inactive_7d">inactive_7d</option>
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">createdAt</option>
          <option value="messagesThisMonth">messagesThisMonth</option>
          <option value="apiRequestsThisMonth">apiRequestsThisMonth</option>
        </Select>
        <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">desc</option>
          <option value="asc">asc</option>
        </Select>
      </div>

      <DataTable
        loading={loading}
        columns={[
          { key: "id", label: "ID" },
          {
            key: "fullName",
            label: "Name",
            render: (row) => (
              <Link href={`/users/${String((row as { id?: string }).id ?? "")}`} className="text-primary-ink underline">
                {String((row as { fullName?: string }).fullName ?? "Unknown")}
              </Link>
            ),
          },
          { key: "email", label: "Email" },
          { key: "status", label: "Status" },
          { key: "planCode", label: "Plan" },
          { key: "subscriptionStatus", label: "Subscription" },
          { key: "instanceCount", label: "Instances" },
          { key: "activeApiKeyCount", label: "API Keys" },
          { key: "messagesThisMonth", label: "Messages" },
          { key: "apiRequestsThisMonth", label: "Requests" },
          { key: "lastActivityAt", label: "Last activity" },
        ]}
        rows={rows}
      />

      <div className="flex items-center justify-between">
        <button className="text-sm text-text-secondary hover:text-text" onClick={() => setPage((value) => Math.max(1, value - 1))}>
          Previous
        </button>
        <span className="text-sm text-text-secondary">Page {page}</span>
        <button className="text-sm text-text-secondary hover:text-text" onClick={() => setPage((value) => value + 1)}>
          Next
        </button>
      </div>

      <div className="text-sm text-text-secondary">
        Open user details via route:
        {" "}
        <Link href="/users/example-user-id" className="text-primary-ink underline">/users/:id</Link>
      </div>
    </div>
  )
}
