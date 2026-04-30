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

export default function CampaignAnalyticsPage() {
  const [windowValue, setWindowValue] = useState<(typeof WINDOW_OPTIONS)[number]>("last_7_days")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const fromIso = toIsoBoundary(fromDate, "start")
  const toIso = toIsoBoundary(toDate, "end")
  const windowParams =
    windowValue === "custom_range"
      ? { window: windowValue, from: fromIso, to: toIso }
      : { window: windowValue }
  const { data, loading } = useAdminData(() => adminApi.campaignAnalytics(windowParams), [windowValue, fromDate, toDate])
  const summary = data?.summary ?? {}
  const volumeBars = (data?.series ?? []).slice(-12).map((point) => {
    const record = point as { timestamp?: string; value?: number; date?: string; count?: number }
    const rawDate = record.timestamp ?? record.date ?? ""
    return {
      label: rawDate ? new Date(rawDate).toLocaleDateString() : "N/A",
      value: Number.isFinite(record.value) ? (record.value as number) : Number.isFinite(record.count) ? (record.count as number) : 0,
    }
  })
  const byStatusBars = toBreakdownBars(data?.breakdowns?.byStatus)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Campaigns Analytics"
        description="Monitor campaign creation and status distribution globally."
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
            <ExportButton path="/api/admin/export/campaigns.csv" params={windowParams} />
          </div>
        }
      />
      {windowValue === "custom_range" && (!fromDate || !toDate) ? (
        <p className="text-sm text-warning-text">Select both from and to dates for custom range.</p>
      ) : null}

      <StatGrid
        items={[
          { label: "Total campaigns", value: summary.totalCampaigns ?? 0 },
          { label: "Scheduled campaigns", value: summary.scheduledCampaigns ?? 0 },
          { label: "Running campaigns", value: summary.runningCampaigns ?? 0 },
          { label: "Paused campaigns", value: summary.pausedCampaigns ?? 0 },
          { label: "Completed campaigns", value: summary.completedCampaigns ?? 0 },
        ]}
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <BarChart title="Campaign volume over time" data={volumeBars} />
        <BarChart title="Status distribution" data={byStatusBars} />
      </div>

      <DataTable
        loading={loading}
        columns={[
          { key: "id", label: "ID" },
          { key: "userId", label: "User ID" },
          { key: "name", label: "Name" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created at" },
          {
            key: "recipients",
            label: "Recipients",
            render: (row) => {
              const recipients = (row as { recipients?: { type?: string } }).recipients
              return recipients?.type ?? "—"
            },
          },
        ]}
        rows={data?.rows ?? []}
      />
    </div>
  )
}
