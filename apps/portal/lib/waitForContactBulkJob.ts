import { apiClient } from "@usesendnow/api-client"
import type { ContactBulkJobProgress } from "@usesendnow/types"

const TERMINAL = new Set(["completed", "done", "failed", "cancelled", "canceled", "error"])

export function isBulkJobProgressTerminal(p: ContactBulkJobProgress): boolean {
  const s = (p.status ?? "").toLowerCase()
  if (TERMINAL.has(s)) return true
  if (p.progress >= 100 && s !== "pending" && s !== "processing") return true
  return false
}

/** Polls `GET /api/contacts/bulk-jobs/:jobId/progress` until the job reaches a terminal state (or timeout). */
export async function waitForContactBulkJobProgress(
  jobId: string,
  opts?: { intervalMs?: number; deadlineMs?: number },
): Promise<ContactBulkJobProgress> {
  const intervalMs = opts?.intervalMs ?? 2000
  const deadlineMs = opts?.deadlineMs ?? 30 * 60 * 1000
  const deadline = Date.now() + deadlineMs

  while (Date.now() < deadline) {
    const p = await apiClient.contacts.bulkJobs.getProgress(jobId)
    if (isBulkJobProgressTerminal(p)) return p
    await new Promise((r) => setTimeout(r, intervalMs))
  }

  return apiClient.contacts.bulkJobs.getProgress(jobId)
}
