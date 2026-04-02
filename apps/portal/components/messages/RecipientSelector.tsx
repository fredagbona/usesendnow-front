"use client"

import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import type { Contact } from "@usesendnow/types"

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
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-body">Destinataire</p>
      <div className="flex gap-1 rounded-xl bg-bg-muted p-1 w-fit">
        {([
          { value: "manual", label: "Nouveau numéro" },
          { value: "contact", label: "Contact enregistré" },
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
        <Select label="Choisir un contact" value={contactId} onChange={(event) => onContactChange(event.target.value)} required>
          <option value="">Sélectionner un contact...</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>{contact.name} · {contact.phone}</option>
          ))}
        </Select>
      ) : (
        <Input
          label="Destinataire (numéro)"
          type="tel"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          placeholder="+22912345678"
          required
        />
      )}

      {recipientMode === "contact" && contacts.length === 0 && (
        <p className="text-xs text-warning">Aucun contact enregistré disponible. Ajoutez un contact ou utilisez un nouveau numéro.</p>
      )}
    </div>
  )
}

