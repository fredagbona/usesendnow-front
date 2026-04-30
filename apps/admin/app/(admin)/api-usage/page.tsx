"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { DataTable, Input, PageHeader } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"
import { ExportButton } from "@/components/shared/ExportButton"

export default function ApiUsagePage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  const [search, setSearch] = useState("")
  const params = useMemo(() => ({ page, limit, search }), [limit, page, search])
  const { data, loading } = useAdminData(() => adminApi.apiKeys(params), [JSON.stringify(params)])

  return (
    <div className="space-y-4">
      <PageHeader
        title="API Usage"
        description="Monitor public API consumption and API key behavior."
        action={<ExportButton path="/api/admin/export/api-usage.csv" params={params} />}
      />

      <Input placeholder="Search by key name / owner..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <DataTable
        loading={loading}
        columns={[
          { key: "id", label: "API key ID" },
          { key: "userId", label: "Owner user" },
          { key: "name", label: "Key name" },
          { key: "keyPrefix", label: "Prefix" },
          { key: "requestCount", label: "Requests" },
          { key: "lastRequestAt", label: "Last request" },
          { key: "revokedAt", label: "Revoked at" },
          { key: "createdAt", label: "Created at" },
        ]}
        rows={data?.rows ?? []}
      />

      <div className="flex items-center justify-between">
        <button className="text-sm text-text-secondary hover:text-text" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
        <span className="text-sm text-text-secondary">Page {page}</span>
        <button className="text-sm text-text-secondary hover:text-text" onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>

      <Link href="/api-usage/example-key-id" className="text-sm text-primary-ink underline">Open key detail page</Link>
    </div>
  )
}
