"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { apiClient } from "@usesendnow/api-client"
import type { Contact } from "@usesendnow/types"

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.contacts.list()
      setContacts(data)
    } catch {
      setError("Impossible de charger les contacts.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContacts() }, [])

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
