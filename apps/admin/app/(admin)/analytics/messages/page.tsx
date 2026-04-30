"use client"

import { useState } from "react"
import { BarChart, DataTable, Input, PageHeader, Select, StatGrid } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"
import { ExportButton } from "@/components/shared/ExportButton"

const WINDOW_OPTIONS = ["today", "last_7_days", "current_month", "custom_range"] as const

function toIsoBoundary(date: string, boundary: "start" | "end") {
  if (!date) return ""
  const suffix = boundary === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z"
  const iso = new Date(`${date}${suffix}`).toISOString()
  return iso
}

function toBreakdownBars(input: unknown) {
  if (Array.isArray(input)) {
    return input.map((item) => {
      const record = item as { key?: string; count?: number }
      return {
        label: record.key ?? "Unknown",
        value: Number.isFinite(record.count) ? (record.count as number) : 0,
      }
    })
  }
  if (typeof input === "object" && input !== null) {
    return Object.entries(input as Record<string, unknown>).map(([key, value]) => ({
      label: key,
      value: Number.isFinite(value) ? (value as number) : 0,
    }))
  }
  return []
}

export default function MessageAnalyticsPage() {
  const [windowValue, setWindowValue] = useState<(typeof WINDOW_OPTIONS)[number]>("last_7_days")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const fromIso = toIsoBoundary(fromDate, "start")
  const toIso = toIsoBoundary(toDate, "end")
  const windowParams =
    windowValue === "custom_range"
      ? { window: windowValue, from: fromIso, to: toIso }
      : { window: windowValue }
  const { data, loading } = useAdminData(() => adminApi.messageAnalytics(windowParams), [windowValue, fromDate, toDate])
  const summary = data?.summary ?? {}
  const volumeBars = (data?.series ?? []).slice(-12).map((point) => {
    const record = point as { timestamp?: string; value?: number; date?: string; count?: number }
    const rawDate = record.timestamp ?? record.date ?? ""
    return {
      label: rawDate ? new Date(rawDate).toLocaleDateString() : "N/A",
      value: Number.isFinite(record.value) ? (record.value as number) : Number.isFinite(record.count) ? (record.count as number) : 0,
    }
  })
  const byTypeBars = toBreakdownBars(data?.breakdowns?.byType)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Messages Analytics"
        description="Monitor outbound messaging activity globally."
        action={
          <div className="flex gap-2">
            {windowValue === "custom_range" ? (
              <>
                <Input label="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <Input label="To" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </>
            ) : null}
            <Select value={windowValue} onChange={(e) => setWindowValue(e.target.value as (typeof WINDOW_OPTIONS)[number])}>
              {WINDOW_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
            <ExportButton path="/api/admin/export/messages.csv" params={windowParams} />
          </div>
        }
      />
      {windowValue === "custom_range" && (!fromDate || !toDate) ? (
        <p className="text-sm text-warning-text">Select both from and to dates for custom range.</p>
      ) : null}

      <StatGrid
        items={[
          { label: "Total outbound messages", value: summary.totalOutboundMessages ?? 0 },
          { label: "Failed messages", value: summary.failedMessages ?? 0 },
          { label: "Queued messages", value: summary.queuedMessages ?? 0 },
          { label: "Delivered messages", value: summary.deliveredMessages ?? 0 },
        ]}
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <BarChart title="Message volume over time" data={volumeBars} />
        <BarChart title="Message type distribution" data={byTypeBars} />
      </div>

      <DataTable
        loading={loading}
        columns={[
          { key: "id", label: "ID" },
          { key: "createdAt", label: "Created at" },
          { key: "status", label: "Status" },
          { key: "type", label: "Type" },
          { key: "userId", label: "User ID" },
          { key: "instanceId", label: "Instance ID" },
        ]}
        rows={data?.rows ?? []}
      />
    </div>
  )
}
