"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { apiClient } from "@usesendnow/api-client"
import type { Message } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

interface MessagesFilter {
  instanceId?: string
  status?: string
}

export function useMessages(filters: MessagesFilter = {}) {
  const { copy } = usePortalLocale()
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
      setError(copy.hooks.messagesListLoadError)
    } finally {
      setLoading(false)
    }
  }, [filters.instanceId, filters.status, copy.hooks.messagesListLoadError])

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
      toast.error(copy.hooks.messagesLoadMoreError)
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
  const { copy } = usePortalLocale()
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
        setError(copy.hooks.messageNotFound)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id, copy.hooks.messageNotFound])

  return { message, loading, error }
}
