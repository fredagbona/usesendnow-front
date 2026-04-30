"use client"

import { useCallback, useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import type { AdminIdentity } from "@usesendnow/types"

export function useAdminSession() {
  const [admin, setAdmin] = useState<AdminIdentity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await adminApi.auth.me()
      setAdmin(me)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load admin session."
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSession()
  }, [fetchSession])

  return { admin, loading, error, refetch: fetchSession }
}
