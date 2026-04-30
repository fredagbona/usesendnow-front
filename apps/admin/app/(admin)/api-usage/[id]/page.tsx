"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button, Card, DataTable, Input, Modal, PageHeader } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"

export default function ApiKeyDetailPage() {
  const params = useParams<{ id: string }>()
  const keyId = params.id
  const { data, loading, refetch } = useAdminData(() => adminApi.apiKeyDetail(keyId), [keyId])
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleRevoke = async () => {
    if (!reason.trim()) return
    setSubmitting(true)
    try {
      await adminApi.revokeApiKey(keyId, { reason, note })
      await refetch()
      setOpen(false)
      setReason("")
      setNote("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="API key detail" description={`Key ${keyId}`} />
      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Identity and owner</h2>
        <DataTable
          loading={loading}
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
            { key: "keyPrefix", label: "Prefix" },
            { key: "userId", label: "Owner user" },
            { key: "revokedAt", label: "Revoked at" },
          ]}
          rows={data ? [data] : []}
        />
      </Card>
      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Recent request logs</h2>
        <p className="text-sm text-text-secondary">Rendered from API key detail payload.</p>
      </Card>
      <Button variant="danger" onClick={() => setOpen(true)}>Revoke API key</Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Confirm API key revocation">
        <div className="space-y-4">
          <Input label="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Input label="Internal note" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={submitting} onClick={handleRevoke}>Confirm revoke</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
