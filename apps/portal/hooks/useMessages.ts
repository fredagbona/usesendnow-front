"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { apiClient } from "@usesendnow/api-client"
import type { Message } from "@usesendnow/types"

interface MessagesFilter {
  instanceId?: string
  status?: string
}

export function useMessages(filters: MessagesFilter = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.messages.list({
        limit: 20,
        instanceId: filters.instanceId,
        status: filters.status,
      })
      setMessages(data.messages)
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch {
      setError("Impossible de charger les messages.")
    } finally {
      setLoading(false)
    }
  }, [filters.instanceId, filters.status])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await apiClient.messages.list({
        limit: 20,
        cursor: nextCursor,
        instanceId: filters.instanceId,
        status: filters.status,
      })
      setMessages((prev) => [...prev, ...data.messages])
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch {
      toast.error("Impossible de charger plus de messages.")
    } finally {
      setLoadingMore(false)
    }
  }

  const prependMessage = (message: Message) => {
    setMessages((prev) => [message, ...prev])
  }

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    prependMessage,
    refetch: fetchMessages,
  }
}

export function useMessage(id: string) {
  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await apiClient.messages.get(id)
        setMessage(data)
      } catch {
        setError("Message introuvable.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  return { message, loading, error }
}
