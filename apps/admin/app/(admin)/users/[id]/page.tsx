"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button, Card, DataTable, Input, Modal, PageHeader } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"

const DETAIL_SECTIONS = ["usage", "instances", "apiKeys", "requestLogs", "messages", "campaigns", "payments", "actionsHistory"] as const

export default function UserDetailPage() {
  const params = useParams<{ id: string }>()
  const userId = params.id
  const { data, loading, refetch } = useAdminData(() => adminApi.userDetail(userId), [userId])
  const [actionModal, setActionModal] = useState<"suspend" | "reactivate" | null>(null)
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const user = (data as Record<string, unknown> | null) ?? {}

  const runAction = async () => {
    if (!actionModal || !reason.trim()) return
    setSubmitting(true)
    try {
      if (actionModal === "suspend") await adminApi.suspendUser(userId, { reason, note })
      if (actionModal === "reactivate") await adminApi.reactivateUser(userId, { reason, note })
      await refetch()
      setActionModal(null)
      setReason("")
      setNote("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="User detail" description={`Comprehensive account view for ${userId}.`} />

      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Account summary</h2>
        <DataTable
          loading={loading}
          columns={[
            { key: "id", label: "ID" },
            { key: "fullName", label: "Name" },
            { key: "email", label: "Email" },
            { key: "status", label: "Status" },
            { key: "subscriptionStatus", label: "Subscription" },
          ]}
          rows={[user]}
        />
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {DETAIL_SECTIONS.map((sectionKey) => (
          <Link key={sectionKey} href={`/users/${userId}/sections/${sectionKey}`}>
            <Card className="h-full transition-colors hover:bg-bg-subtle">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">{sectionKey}</h3>
              <p className="text-sm text-text-secondary">Open dedicated {sectionKey} page.</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="flex flex-wrap gap-2">
        <Button variant="danger" onClick={() => setActionModal("suspend")}>Suspend user</Button>
        <Button variant="secondary" onClick={() => setActionModal("reactivate")}>Reactivate user</Button>
      </Card>

      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal === "suspend" ? "Confirm suspension" : "Confirm reactivation"}
      >
        <div className="space-y-4">
          <Input label="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Input label="Internal note" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button loading={submitting} onClick={runAction}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
