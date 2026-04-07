"use client"

import type { MessageButton, ButtonType } from "@usesendnow/types"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Alert from "@/components/ui/Alert"
import { Add01Icon, Delete01Icon, AlertCircleIcon } from "hugeicons-react"

const BUTTON_TYPES: { value: ButtonType; label: string }[] = [
  { value: "reply", label: "Réponse" },
  { value: "copy", label: "Copier" },
  { value: "url", label: "Lien" },
  { value: "call", label: "Appel" },
  { value: "pix", label: "Pix" },
]

interface ButtonBuilderProps {
  buttons: MessageButton[]
  onChange: (buttons: MessageButton[]) => void
}

function generateId(): string {
  return `btn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default function ButtonBuilder({ buttons, onChange }: ButtonBuilderProps) {
  const addError = (idx: number, msg: string) => {
    const updated = [...buttons]
    ;(updated[idx] as any)._error = msg
    onChange(updated)
  }

  const clearError = (idx: number) => {
    const updated = [...buttons]
    delete (updated[idx] as any)._error
    onChange(updated)
  }

  const updateButton = (idx: number, updates: Partial<MessageButton>) => {
    const updated = [...buttons]
    updated[idx] = { ...updated[idx], ...updates }
    delete (updated[idx] as any)._error
    onChange(updated)
  }

  const handleAdd = () => {
    if (buttons.length >= 2) return
    onChange([...buttons, { type: "reply", displayText: "", id: generateId() }])
  }

  const handleRemove = (idx: number) => {
    const updated = buttons.filter((_, i) => i !== idx)
    onChange(updated)
  }

  const handleTypeChange = (idx: number, type: ButtonType) => {
    const base: MessageButton = { type, displayText: buttons[idx].displayText }
    if (type === "reply") base.id = buttons[idx].id || generateId()
    onChange([...buttons.slice(0, idx), base, ...buttons.slice(idx + 1)])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text">Boutons</p>
        <Button
          variant="secondary"
          size="sm"
          disabled={buttons.length >= 2}
          onClick={handleAdd}
        >
          <Add01Icon className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {buttons.length === 0 && (
        <p className="text-sm text-text-muted">
          Aucun bouton configuré. Ajoutez jusqu&apos;à 2 boutons interactifs.
        </p>
      )}

      {buttons.map((btn, idx) => {
        const error = (btn as any)._error
        return (
          <div key={idx} className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Bouton {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-error-hover hover:text-error-hover/80"
              >
                <Delete01Icon className="w-4 h-4" />
              </button>
            </div>

            <Select
              label="Type de bouton"
              value={btn.type}
              onChange={(e) => handleTypeChange(idx, e.target.value as ButtonType)}
            >
              {BUTTON_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>

            <Input
              label="Texte affiché"
              value={btn.displayText}
              onChange={(e) => updateButton(idx, { displayText: e.target.value })}
              placeholder="ex. Visiter le site"
              maxLength={50}
              hint={`${btn.displayText.length}/50`}
            />

            {btn.type === "reply" && (
              <Input
                label="ID du bouton"
                value={btn.id ?? ""}
                onChange={(e) => updateButton(idx, { id: e.target.value })}
                placeholder="opt1"
                hint="Identifiant unique pour le callback"
              />
            )}

            {btn.type === "copy" && (
              <Input
                label="Code à copier"
                value={btn.copyCode ?? ""}
                onChange={(e) => updateButton(idx, { copyCode: e.target.value })}
                placeholder="ex. PROMO2024"
                required
              />
            )}

            {btn.type === "url" && (
              <Input
                label="URL"
                value={btn.url ?? ""}
                onChange={(e) => updateButton(idx, { url: e.target.value })}
                placeholder="https://example.com"
                required
              />
            )}

            {btn.type === "call" && (
              <Input
                label="Numéro de téléphone"
                value={btn.phoneNumber ?? ""}
                onChange={(e) => updateButton(idx, { phoneNumber: e.target.value })}
                placeholder="+33612345000"
                required
              />
            )}

            {btn.type === "pix" && (
              <div className="space-y-3">
                <Input
                  label="Devise"
                  value={btn.currency ?? ""}
                  onChange={(e) => updateButton(idx, { currency: e.target.value })}
                  placeholder="BRL"
                  required
                />
                <Input
                  label="Nom du destinataire"
                  value={btn.name ?? ""}
                  onChange={(e) => updateButton(idx, { name: e.target.value })}
                  placeholder="Entreprise SARL"
                  required
                />
                <Select
                  label="Type de clé Pix"
                  value={btn.keyType ?? ""}
                  onChange={(e) => updateButton(idx, { keyType: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">Email</option>
                  <option value="phone">Téléphone</option>
                  <option value="random">Aléatoire</option>
                </Select>
                <Input
                  label="Clé Pix"
                  value={btn.key ?? ""}
                  onChange={(e) => updateButton(idx, { key: e.target.value })}
                  placeholder="ex. 123.456.789-00"
                  required
                />
              </div>
            )}

            {error && (
              <Alert variant="error" message={error} onClose={() => clearError(idx)} />
            )}
          </div>
        )
      })}
    </div>
  )
}
