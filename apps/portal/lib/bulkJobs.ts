"use client"

import { apiClient } from "@usesendnow/api-client"
import type { BulkJob } from "@usesendnow/types"

export interface BulkJobTrackResult {
  job: BulkJob
  cancelled: boolean
}

export async function trackBulkJob(
  jobId: string,
  onUpdate?: (job: BulkJob) => void,
  intervalMs = 2000,
): Promise<BulkJobTrackResult> {
  while (true) {
    const job = await apiClient.contacts.getBulkJobProgress(jobId)
    onUpdate?.(job)
    if (job.status === "done" || job.status === "failed" || job.status === "cancelled") {
      return { job, cancelled: false }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}

export function isBulkJobQueuedResponse(
  response: unknown,
): response is {
  mode: "async"
  jobId: string
  status: string
  operation: string
  requestedCount: number
  groupId?: string | null
  progress: number
  message: string
} {
  return Boolean(response && typeof response === "object" && "mode" in response && (response as { mode?: unknown }).mode === "async")
}
