"use client"

import { useMemo, useState } from "react"
import { Button, Card, DataTable, Input, PageHeader, Select } from "@usesendnow/ui"
import { adminApi } from "@/lib/admin-api"
import { useAdminData } from "@/hooks/useAdminData"

type ActionType = "suspend" | "reactivate" | "revoke" | "deactivate"

export default function ActionsPage() {
  const [actionType, setActionType] = useState<ActionType>("suspend")
  const [targetId, setTargetId] = useState("")
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [running, setRunning] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const query = useMemo(() => ({ page, limit: 25 }), [page])
  const { data, loading, refetch } = useAdminData(() => adminApi.actionLogs(query), [JSON.stringify(query)])

  const executeAction = async () => {
    if (!targetId.trim() || !reason.trim()) return
    setRunning(true)
    setFeedback(null)
    try {
      const payload = { reason, note }
      if (actionType === "suspend") await adminApi.suspendUser(targetId, payload)
      if (actionType === "reactivate") await adminApi.reactivateUser(targetId, payload)
      if (actionType === "revoke") await adminApi.revokeApiKey(targetId, payload)
      if (actionType === "deactivate") await adminApi.deactivateInstance(targetId, payload)
      setFeedback("Action executed successfully.")
      setTargetId("")
      setReason("")
      setNote("")
      await refetch()
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Action failed.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Admin Actions" description="Apply auditable operations with mandatory reason and notes." />

      <Card className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Execute action</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Select label="Action" value={actionType} onChange={(e) => setActionType(e.target.value as ActionType)}>
            <option value="suspend">Suspend user</option>
            <option value="reactivate">Reactivate user</option>
            <option value="revoke">Revoke API key</option>
            <option value="deactivate">Deactivate instance</option>
          </Select>
          <Input label="Target ID" value={targetId} onChange={(e) => setTargetId(e.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Input label="Internal note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {feedback && <p className="text-sm text-text-secondary">{feedback}</p>}
        <Button loading={running} onClick={executeAction}>Confirm action</Button>
      </Card>

      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Action history</h2>
        <DataTable
          loading={loading}
          columns={[
            { key: "createdAt", label: "At" },
            { key: "adminUserId", label: "Admin" },
            { key: "action", label: "Action" },
            { key: "targetType", label: "Target type" },
            { key: "targetId", label: "Target ID" },
            { key: "reason", label: "Reason" },
          ]}
          rows={data?.rows ?? []}
        />
        <div className="mt-3 flex items-center justify-between">
          <button className="text-sm text-text-secondary hover:text-text" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <span className="text-sm text-text-secondary">Page {page}</span>
          <button className="text-sm text-text-secondary hover:text-text" onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </Card>
    </div>
  )
}
