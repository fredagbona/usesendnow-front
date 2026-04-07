"use client"

import { useState, useEffect } from "react"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import { Contact01Icon } from "hugeicons-react"
import type { ContactGroup } from "@usesendnow/types"

interface ImportContactsPanelProps {
  lookupId: string
  onImport: (lookupId: string, groupId?: string, tag?: string) => Promise<boolean>
  importing: boolean
  groups: ContactGroup[]
  onValidCount: number
}

export default function ImportContactsPanel({
  lookupId,
  onImport,
  importing,
  groups,
  onValidCount,
}: ImportContactsPanelProps) {
  const [groupId, setGroupId] = useState("")
  const [tag, setTag] = useState("")
  const [open, setOpen] = useState(false)

  // Reset form when lookupId changes
  useEffect(() => {
    setGroupId("")
    setTag("")
  }, [lookupId])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border-strong rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:border-primary hover:bg-primary-subtle transition-colors"
      >
        <Contact01Icon className="w-4 h-4" />
        Importer {onValidCount} numéro{onValidCount !== 1 ? "s" : ""} comme contacts
      </button>
    )
  }

  const handleImport = async () => {
    const success = await onImport(lookupId, groupId || undefined, tag || undefined)
    if (success) {
      setOpen(false)
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
