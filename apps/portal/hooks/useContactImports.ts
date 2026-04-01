"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { apiClient } from "@usesendnow/api-client"
import type { ContactImport } from "@usesendnow/types"

export function useContactImports() {
  const [imports, setImports] = useState<ContactImport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollingRefs = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  const fetchImports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.contacts.listImports(20)
      setImports(data.imports)
    } catch {
      setError("Impossible de charger les imports.")
    } finally {
      setLoading(false)
    }
  }, [])

  const pollImport = useCallback((importId: string) => {
    if (pollingRefs.current.has(importId)) return
    const interval = setInterval(async () => {
      try {
        const imp = await apiClient.contacts.getImport(importId)
        setImports((prev) => prev.map((i) => (i.id === importId ? imp : i)))
        if (imp.status === "done" || imp.status === "failed") {
          clearInterval(interval)
          pollingRefs.current.delete(importId)
          if (imp.status === "done") {
            toast.success(`Import terminé — ${imp.importedCount} contacts importés`)
          } else {
            toast.error("L'import a échoué.")
          }
        }
      } catch {
        clearInterval(interval)
        pollingRefs.current.delete(importId)
      }
    }, 3000)
    pollingRefs.current.set(importId, interval)
  }, [])

  useEffect(() => {
    fetchImports()
  }, [fetchImports])

  useEffect(() => {
    imports.forEach((imp) => {
      if (imp.status === "pending" || imp.status === "processing") {
        pollImport(imp.id)
      }
    })
  }, [imports, pollImport])

  useEffect(() => {
    return () => {
      pollingRefs.current.forEach((interval) => clearInterval(interval))
    }
  }, [])

  const prependImport = (imp: ContactImport) => {
    setImports((prev) => [imp, ...prev])
    if (imp.status === "pending" || imp.status === "processing") {
      pollImport(imp.id)
    }
  }

  return {
    imports,
    loading,
    error,
    refetch: fetchImports,
    prependImport,
  }
}
