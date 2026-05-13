"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Template } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { onPortalWorkspaceChanged } from "@/lib/workspace-events"

export function useTemplates(initialPage = 1, limit = 20) {
  const { copy } = usePortalLocale()
  const [templates, setTemplates] = useState<Template[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [workspaceEpoch, setWorkspaceEpoch] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.templates.list(p, limit)
      setTemplates(data.templates)
      setTotal(data.total)
    } catch {
      setError(copy.hooks.templatesLoadError)
    } finally {
      setLoading(false)
    }
  }, [copy.hooks.templatesLoadError, limit])

  useEffect(() => {
    void fetchTemplates(page)
  }, [fetchTemplates, page, workspaceEpoch])

  useEffect(() => {
    return onPortalWorkspaceChanged(() => {
      setPage(1)
      setWorkspaceEpoch((e) => e + 1)
    })
  }, [])

  const goToPage = (p: number) => setPage(p)

  const addTemplate = (template: Template) => {
    setTemplates((prev) => [template, ...prev])
    setTotal((t) => t + 1)
  }

  const updateTemplate = (updated: Template) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    )
  }

  const removeTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    setTotal((t) => t - 1)
  }

  return {
    templates,
    total,
    page,
    limit,
    loading,
    error,
    goToPage,
    refetch: () => fetchTemplates(page),
    addTemplate,
    updateTemplate,
    removeTemplate,
  }
}
