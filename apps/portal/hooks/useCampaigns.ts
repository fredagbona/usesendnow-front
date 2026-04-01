"use client"

import { useCallback, useEffect, useState } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Campaign, CampaignStatus } from "@usesendnow/types"

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.campaigns.list()
      setCampaigns(data)
    } catch {
      setError("Impossible de charger les campagnes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCampaigns() }, [])

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
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await apiClient.campaigns.get(id)
        setCampaign(data)
      } catch {
        setError("Campagne introuvable.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const updateStatus = useCallback((status: CampaignStatus) => {
    setCampaign((prev) => prev ? { ...prev, status } : prev)
  }, [])

  return { campaign, loading, error, updateStatus, setCampaign }
}
