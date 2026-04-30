"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, DataTable, PageHeader } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"

const DETAIL_SECTIONS = ["usage", "instances", "apiKeys", "requestLogs", "messages", "campaigns", "payments", "actionsHistory"] as const

function serializeValue(value: unknown) {
  if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
    return JSON.stringify(value)
  }
  return value
}

function toRows(section: unknown): Record<string, unknown>[] {
  if (Array.isArray(section)) {
    return section.map((item) => {
      const row = (item as Record<string, unknown>) ?? {}
      return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, serializeValue(value)]))
    })
  }
  if (typeof section === "object" && section !== null) {
    const row = section as Record<string, unknown>
    return [Object.fromEntries(Object.entries(row).map(([key, value]) => [key, serializeValue(value)]))]
  }
  return []
}

export default function UserDetailSectionPage() {
  const params = useParams<{ id: string; section: string }>()
  const userId = params.id
  const section = params.section
  const { data, loading } = useAdminData(() => adminApi.userDetail(userId), [userId])

  if (!DETAIL_SECTIONS.includes(section as (typeof DETAIL_SECTIONS)[number])) {
    return (
      <div className="space-y-4">
        <PageHeader title="Unknown section" description="This user detail section does not exist." />
        <Link href={`/users/${userId}`} className="text-sm text-primary-ink underline">
          Back to user detail
        </Link>
      </div>
    )
  }

  const user = (data as Record<string, unknown> | null) ?? {}
  const rows = toRows(user[section])
  const columns =
    rows.length > 0
      ? Object.keys(rows[0]).map((key) => ({
          key,
          label: key,
        }))
      : []

  return (
    <div className="space-y-4">
      <PageHeader title={`${section} detail`} description={`Detailed ${section} data for user ${userId}.`} />
      <Link href={`/users/${userId}`} className="text-sm text-primary-ink underline">
        Back to user detail
      </Link>
      <Card>
        {rows.length > 0 ? (
          <DataTable loading={loading} columns={columns} rows={rows} />
        ) : (
          <p className="text-sm text-text-secondary">No data returned for this section.</p>
        )}
      </Card>
    </div>
  )
}
