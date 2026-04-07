"use client"

import { useState } from "react"
import { toast } from "@/lib/toast"
import { ApiClientError } from "@usesendnow/api-client"
import { apiClient } from "@usesendnow/api-client"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import { Contact01Icon } from "hugeicons-react"
import type { ContactGroup } from "@usesendnow/types"

interface ImportContactsPanelProps {
  lookupId: string
  importing: boolean
  onImported: () => void
  groups: ContactGroup[]
  onValidCount: number
}

export default function ImportContactsPanel({
  lookupId,
  importing: importingProp,
  onImported,
  groups,
  onValidCount,
}: ImportContactsPanelProps) {
  const [groupId, setGroupId] = useState("")
  const [tag, setTag] = useState("")
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleOpen = () => {
    setGroupId("")
    setTag("")
    setOpen(true)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border-strong rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:border-primary hover:bg-primary-subtle transition-colors"
      >
        <Contact01Icon className="w-4 h-4" />
        Importer {onValidCount} numéro{onValidCount !== 1 ? "s" : ""} comme contacts
      </button>
    )
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const payload: { groupId?: string; tag?: string } = {}
      const trimmedGroup = groupId.trim()
      const trimmedTag = tag.trim()
      if (trimmedGroup) {
        payload.groupId = trimmedGroup
      }
      if (trimmedTag) {
        payload.tag = trimmedTag
      }
      const result = await apiClient.numberLookups.importContacts(lookupId, payload)
      if (result.skipped > 0 && result.created === 0 && result.updated === 0) {
        toast.info("Certains contacts ont été importés, d'autres ont été ignorés.")
      } else {
        toast.success("Contacts importés avec succès")
      }
      setGroupId("")
      setTag("")
      setOpen(false)
      onImported()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "LOOKUP_NOT_READY") {
          toast.error("Le lookup n'est pas encore terminé.")
        } else if (err.code === "CONTACT_GROUP_NOT_FOUND") {
          toast.error("Le groupe cible est introuvable.")
        } else {
          toast.error("Impossible d'importer les contacts. Réessayez.")
        }
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="bg-bg border border-border rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]">
      <h4 className="text-sm font-medium text-text mb-4">
        Importer les numéros trouvés sur WhatsApp
      </h4>

      <div className="space-y-3">
        <Select
          label="Groupe (optionnel)"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          hint="Les contacts seront ajoutés à ce groupe."
        >
          <option value="">— Aucun groupe —</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>

        <Input
          label="Tag (optionnel)"
          placeholder="ex: verified-whatsapp"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          hint="Tag appliqué à tous les contacts importés."
        />

        <div className="flex items-center gap-2 pt-2">
          <Button variant="primary" size="sm" loading={importing} onClick={handleImport}>
            <Contact01Icon className="w-4 h-4 mr-1.5" />
            Importer
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  )
}
