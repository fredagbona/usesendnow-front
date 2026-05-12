"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@usesendnow/api-client"
import type { Contact } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export function useContacts() {
  const { copy } = usePortalLocale()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.contacts.list({ limit: 200, sort: "name_asc" })
      setContacts(data.contacts)
    } catch {
      setError(copy.hooks.contactsLoadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContacts() }, [copy.hooks.contactsLoadError])

  const addContact = (contact: Contact) => {
    setContacts((prev) => [contact, ...prev])
  }

  const updateContact = (updated: Contact) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )
  }

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    addContact,
    updateContact,
    removeContact,
  }
}
