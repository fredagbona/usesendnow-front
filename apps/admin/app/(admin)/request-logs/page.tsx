"use client"

import { useMemo, useState } from "react"
import { DataTable, Input, PageHeader, Select } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"
import { ExportButton } from "@/components/shared/ExportButton"

export default function RequestLogsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  const [source, setSource] = useState("")
  const [method, setMethod] = useState("")
  const [statusCode, setStatusCode] = useState("")
  const [path, setPath] = useState("")
  const [userId, setUserId] = useState("")

  const params = useMemo(() => ({ page, limit, source, method, statusCode, path, userId }), [limit, method, page, path, source, statusCode, userId])
  const { data, loading } = useAdminData(() => adminApi.requestLogs(params), [JSON.stringify(params)])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Request Logs"
        description="Request-level activity across public API, dashboard, and admin sources."
        action={<ExportButton path="/api/admin/export/request-logs.csv" params={params} />}
      />

      <div className="grid gap-3 md:grid-cols-5">
        <Select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          <option value="public_api">public_api</option>
          <option value="dashboard">dashboard</option>
          <option value="admin">admin</option>
        </Select>
        <Select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">All methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </Select>
        <Input placeholder="Status code" value={statusCode} onChange={(e) => setStatusCode(e.target.value)} />
        <Input placeholder="Path contains..." value={path} onChange={(e) => setPath(e.target.value)} />
        <Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>

      <DataTable
        loading={loading}
        columns={[
          { key: "requestAt", label: "At" },
          { key: "source", label: "Source" },
          { key: "method", label: "Method" },
          { key: "path", label: "Path" },
          { key: "statusCode", label: "Status" },
          { key: "latencyMs", label: "Latency" },
          { key: "ipAddress", label: "IP" },
          { key: "userId", label: "User" },
          { key: "adminUserId", label: "Admin" },
          { key: "apiKeyName", label: "API key" },
          { key: "errorCode", label: "Error code" },
        ]}
        rows={data?.rows ?? []}
      />

      <div className="flex items-center justify-between">
        <button className="text-sm text-text-secondary hover:text-text" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
        <span className="text-sm text-text-secondary">Page {page}</span>
        <button className="text-sm text-text-secondary hover:text-text" onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
    </div>
  )
}
