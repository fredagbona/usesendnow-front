"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { ContactBulkJobProgress } from "@usesendnow/types"
import { isBulkJobProgressTerminal } from "@/lib/waitForContactBulkJob"

export interface ContactBulkJobPollHandlers {
  onProgress?: (p: ContactBulkJobProgress) => void
  onComplete: (p: ContactBulkJobProgress) => void
}

export type ContactBulkJobVariant = "delete" | "groupAdd"

export interface ContactBulkJobStartOptions {
  variant?: ContactBulkJobVariant
}

/**
 * Polls `GET /api/contacts/bulk-jobs/:jobId/progress` while a job is active.
 * Use `cancel()` to call `POST .../cancel` and stop polling without `onComplete`.
 */
export function useContactBulkJobPoll() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [variant, setVariant] = useState<ContactBulkJobVariant | null>(null)
  const [snapshot, setSnapshot] = useState({ progress: 0, status: "pending" })
  const [cancelling, setCancelling] = useState(false)
  const handlersRef = useRef<ContactBulkJobPollHandlers | null>(null)
  const activeJobIdRef = useRef<string | null>(null)

  const stop = useCallback(() => {
    activeJobIdRef.current = null
    setActiveJobId(null)
    setVariant(null)
    handlersRef.current = null
  }, [])

  useEffect(() => {
    activeJobIdRef.current = activeJobId
  }, [activeJobId])

  useEffect(() => {
    if (!activeJobId) return
    const jobId = activeJobId
    let stopped = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    const tick = async () => {
      if (stopped) return
      try {
        const p = await apiClient.contacts.bulkJobs.getProgress(jobId)
        if (stopped) return
        setSnapshot({ progress: p.progress, status: p.status })
        handlersRef.current?.onProgress?.(p)
        if (isBulkJobProgressTerminal(p)) {
          stopped = true
          if (intervalId) clearInterval(intervalId)
          const onComplete = handlersRef.current?.onComplete
          handlersRef.current = null
          setActiveJobId(null)
          onComplete?.(p)
        }
      } catch {
        /* transient network errors: next tick retries */
      }
    }

    void tick()
    intervalId = setInterval(tick, 2000)
    return () => {
      stopped = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [activeJobId])

  const start = useCallback(
    (jobId: string, handlers: ContactBulkJobPollHandlers, options?: ContactBulkJobStartOptions) => {
      handlersRef.current = handlers
      activeJobIdRef.current = jobId
      setVariant(options?.variant ?? "delete")
      setSnapshot({ progress: 0, status: "pending" })
      setActiveJobId(jobId)
    },
    [],
  )

  const cancel = useCallback(async () => {
    const id = activeJobIdRef.current
    if (!id) return
    setCancelling(true)
    try {
      await apiClient.contacts.bulkJobs.cancel(id)
    } finally {
      setCancelling(false)
      stop()
    }
  }, [stop])

  return {
    activeJobId,
    variant,
    snapshot,
    cancelling,
    start,
    cancel,
    stop,
  }
}
