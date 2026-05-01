"use client"

import { useState } from "react"
import { BarChart, Card, Input, PageHeader, Select, StatGrid } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"
import type { AdminOverviewSummary, AdminSeriesPoint } from "@usesendnow/types"

const WINDOW_OPTIONS = ["today", "last_7_days", "current_month", "custom_range"] as const

function toIsoBoundary(date: string, boundary: "start" | "end") {
  if (!date) return ""
  const suffix = boundary === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z"
  const iso = new Date(`${date}${suffix}`).toISOString()
  return iso
}

function toBars(series: AdminSeriesPoint[] | undefined) {
  return (series ?? []).slice(-12).map((point) => {
    if (point.date !== undefined && typeof point.count === "number") {
      return {
        label: new Date(`${point.date}T12:00:00.000Z`).toLocaleDateString(),
        value: point.count,
      }
    }
    if (point.timestamp) {
      return {
        label: new Date(point.timestamp).toLocaleDateString(),
        value: point.value ?? 0,
      }
    }
    return { label: "—", value: point.value ?? point.count ?? 0 }
  })
}

export default function OverviewPage() {
  const [windowValue, setWindowValue] = useState<(typeof WINDOW_OPTIONS)[number]>("last_7_days")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const fromIso = toIsoBoundary(fromDate, "start")
  const toIso = toIsoBoundary(toDate, "end")
  const windowParams =
    windowValue === "custom_range"
      ? { window: windowValue, from: fromIso, to: toIso }
      : { window: windowValue }
  const { data, loading } = useAdminData(
    () => adminApi.overview(windowParams),
    [windowValue, fromDate, toDate],
  )

  const summary: Partial<AdminOverviewSummary> = data?.summary ?? {}
  const requestShare =
    summary.totalRequests && summary.totalRequests > 0
      ? `${Math.round(((summary.publicApiRequests ?? 0) / summary.totalRequests) * 100)}% API public`
      : "No request volume yet"

  return (
    <div className="space-y-4">
      <PageHeader
        title="Admin Overview"
        description="Global operational summary across users, API, messages, and campaigns."
        action={
          <div className="flex items-end gap-2">
            {windowValue === "custom_range" ? (
              <>
                <Input label="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <Input label="To" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </>
            ) : null}
            <Select value={windowValue} onChange={(e) => setWindowValue(e.target.value as (typeof WINDOW_OPTIONS)[number])}>
              {WINDOW_OPTIONS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </Select>
          </div>
        }
      />
      {windowValue === "custom_range" && (!fromDate || !toDate) ? (
        <p className="text-sm text-warning-text">Select both from and to dates for custom range.</p>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <StatGrid
            items={[
              { label: "Total users", value: summary.totalUsers ?? 0 },
              { label: "New users", value: summary.newUsers ?? 0 },
              { label: "Active users", value: summary.activeUsers ?? 0 },
              { label: "Connected instances", value: summary.connectedInstances ?? 0 },
              { label: "Active API keys", value: summary.activeApiKeys ?? 0 },
              { label: "Total requests", value: summary.totalRequests ?? 0 },
              { label: "Public API requests", value: summary.publicApiRequests ?? 0 },
              { label: "Dashboard requests", value: summary.dashboardRequests ?? 0 },
            ]}
          />
        </div>
        <Card className="xl:col-span-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Control tower</h3>
          <div className="mt-4 space-y-3">
            <div className="border border-border p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-text-secondary">Traffic split</p>
              <p className="mt-1 text-lg font-bold text-text">{requestShare}</p>
            </div>
            <div className="border border-border p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-text-secondary">Outbound / Failed</p>
              <p className="mt-1 text-lg font-bold text-text">
                {(summary.outboundMessages ?? 0).toLocaleString()} / {(summary.failedMessages ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="border border-border p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-text-secondary">Campaigns created</p>
              <p className="mt-1 text-lg font-bold text-text">{(summary.campaignsCreated ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <BarChart title="Requests over time" data={toBars(data?.series?.requests)} />
        </div>
        <div className="xl:col-span-5">
          <BarChart title="Messages over time" data={toBars(data?.series?.messages)} />
        </div>
        <div className="xl:col-span-12">
          <BarChart title="Campaigns over time" data={toBars(data?.series?.campaigns)} />
        </div>
      </div>
      {loading ? <p className="text-sm text-text-secondary">Loading chart data...</p> : null}
    </div>
  )
}
