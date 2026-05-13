"use client"

import { useCallback, useEffect, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Campaign, CampaignStatus } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { onPortalWorkspaceChanged } from "@/lib/workspace-events"

export function useCampaigns() {
  const { copy } = usePortalLocale()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.campaigns.list()
      setCampaigns(data)
    } catch {
      setError(copy.hooks.campaignsListLoadError)
    } finally {
      setLoading(false)
    }
  }, [copy.hooks.campaignsListLoadError])

  useEffect(() => {
    void fetchCampaigns()
  }, [fetchCampaigns])

  useEffect(() => onPortalWorkspaceChanged(() => void fetchCampaigns()), [fetchCampaigns])

  const updateCampaignStatus = useCallback((id: string, status: CampaignStatus) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    )
  }, [])

  const removeCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const prependCampaign = useCallback((campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev])
  }, [])

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
    updateCampaignStatus,
    removeCampaign,
    prependCampaign,
  }
}

export function useCampaign(id: string) {
  const { copy } = usePortalLocale()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.campaigns.get(id)
      setCampaign(data)
    } catch {
      setError(copy.hooks.campaignNotFound)
    } finally {
      setLoading(false)
    }
  }, [id, copy.hooks.campaignNotFound])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => onPortalWorkspaceChanged(() => void load()), [load])

  const updateStatus = useCallback((status: CampaignStatus) => {
    setCampaign((prev) => prev ? { ...prev, status } : prev)
  }, [])

  return { campaign, loading, error, updateStatus, setCampaign }
}
