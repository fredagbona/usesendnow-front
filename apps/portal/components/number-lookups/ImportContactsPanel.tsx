"use client"

import { useState, useMemo } from "react"
import { toast } from "@/lib/toast"
import { ApiClientError } from "@usesendnow/api-client"
import { apiClient } from "@usesendnow/api-client"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
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
  const { copy } = usePortalLocale()
  const ip = copy.numberLookups.importPanel
  const [groupId, setGroupId] = useState("")
  const [tag, setTag] = useState("")
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)

  const openCta = useMemo(() => {
    const template = onValidCount === 1 ? ip.importAsContactsOne : ip.importAsContactsMany
    return template.replace("{{count}}", String(onValidCount))
  }, [onValidCount, ip.importAsContactsOne, ip.importAsContactsMany])

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
        {openCta}
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
        toast.info(copy.numberLookups.partialImport)
      } else {
        toast.success(copy.numberLookups.contactsImported)
      }
      setGroupId("")
      setTag("")
      setOpen(false)
      onImported()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "LOOKUP_NOT_READY") {
          toast.error(copy.numberLookups.lookupFailed)
        } else if (err.code === "CONTACT_GROUP_NOT_FOUND") {
          toast.error(copy.contacts.importFailed)
        } else {
          toast.error(copy.contacts.importFailed)
        }
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="bg-bg border border-border rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]">
      <h4 className="text-sm font-medium text-text mb-4">
        {ip.title}
      </h4>

      <div className="space-y-3">
        <Select
          label={ip.groupOptional}
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          hint={ip.groupHint}
        >
          <option value="">{ip.noGroupOption}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>

        <Input
          label={ip.tagOptional}
          placeholder={ip.tagPlaceholder}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          hint={ip.tagHint}
        />

        <div className="flex items-center gap-2 pt-2">
          <Button variant="primary" size="sm" loading={importing} onClick={handleImport}>
            <Contact01Icon className="w-4 h-4 mr-1.5" />
            {ip.import}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            {ip.cancel}
          </Button>
        </div>
      </div>
    </div>
  )
}
