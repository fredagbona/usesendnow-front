"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Template } from "@usesendnow/types"

export function useTemplates(initialPage = 1, limit = 20) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.templates.list(p, limit)
      setTemplates(data.templates)
      setTotal(data.total)
    } catch {
      setError("Impossible de charger les modèles.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates(page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

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
