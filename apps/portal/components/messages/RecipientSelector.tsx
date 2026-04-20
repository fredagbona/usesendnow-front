"use client"

import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import type { Contact } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export type RecipientMode = "manual" | "contact"

interface RecipientSelectorProps {
  recipientMode: RecipientMode
  onRecipientModeChange: (mode: RecipientMode) => void
  to: string
  contactId: string
  contacts: Contact[]
  onToChange: (value: string) => void
  onContactChange: (contactId: string) => void
}

export function RecipientSelector({
  recipientMode,
  onRecipientModeChange,
  to,
  contactId,
  contacts,
  onToChange,
  onContactChange,
}: RecipientSelectorProps) {
  const { copy } = usePortalLocale()
  const recipientCopy = copy.messages.recipient

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-body">{recipientCopy.title}</p>
      <div className="flex gap-1 rounded-xl bg-bg-muted p-1 w-fit">
        {([
          { value: "manual", label: recipientCopy.manual },
          { value: "contact", label: recipientCopy.contact },
        ] as const).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onRecipientModeChange(option.value)}
            className={[
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-all cursor-pointer",
              recipientMode === option.value
                ? "bg-bg border border-border text-text shadow-sm"
                : "text-text-secondary hover:text-text",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>

      {recipientMode === "contact" ? (
        <Select label={recipientCopy.chooseContact} value={contactId} onChange={(event) => onContactChange(event.target.value)} required>
          <option value="">{recipientCopy.selectContact}</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>{contact.name} · {contact.phone}</option>
          ))}
        </Select>
      ) : (
        <Input
          label={recipientCopy.phoneLabel}
          type="tel"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          placeholder={recipientCopy.phonePlaceholder}
          required
        />
      )}

      {recipientMode === "contact" && contacts.length === 0 && (
        <p className="text-xs text-warning">{recipientCopy.noContact}</p>
      )}
    </div>
  )
}
