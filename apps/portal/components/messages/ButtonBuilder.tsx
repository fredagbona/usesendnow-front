"use client"

import { useMemo } from "react"
import type { MessageButton, ButtonType } from "@usesendnow/types"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Alert from "@/components/ui/Alert"
import { Add01Icon, Delete01Icon } from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

interface ButtonBuilderProps {
  buttons: MessageButton[]
  onChange: (buttons: MessageButton[]) => void
}

function generateId(): string {
  return `btn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default function ButtonBuilder({ buttons, onChange }: ButtonBuilderProps) {
  const { copy } = usePortalLocale()
  const b = copy.messages.buttonBuilder
  const types = b.types

  const buttonTypes = useMemo(
    () =>
      (["reply", "copy", "url", "call", "pix"] as const).map((value) => ({
        value,
        label: types[value],
      })),
    [types]
  )

  const clearError = (idx: number) => {
    const updated = [...buttons]
    delete (updated[idx] as { _error?: string })._error
    onChange(updated)
  }

  const updateButton = (idx: number, updates: Partial<MessageButton>) => {
    const updated = [...buttons]
    updated[idx] = { ...updated[idx], ...updates }
    delete (updated[idx] as { _error?: string })._error
    onChange(updated)
  }

  const handleAdd = () => {
    if (buttons.length >= 2) return
    onChange([...buttons, { title: "reply", displayText: "", id: generateId() }])
  }

  const handleRemove = (idx: number) => {
    const updated = buttons.filter((_, i) => i !== idx)
    onChange(updated)
  }

  const handleTypeChange = (idx: number, title: ButtonType) => {
    const base: MessageButton = { title, displayText: buttons[idx].displayText }
    if (title === "reply") base.id = buttons[idx].id || generateId()
    onChange([...buttons.slice(0, idx), base, ...buttons.slice(idx + 1)])
  }

  const pix = b.pixKeyTypes

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text">{b.title}</p>
        <Button
          variant="secondary"
          size="sm"
          disabled={buttons.length >= 2}
          onClick={handleAdd}
        >
          <Add01Icon className="w-4 h-4 mr-1" />
          {b.add}
        </Button>
      </div>

      {buttons.length === 0 && (
        <p className="text-sm text-text-muted">
          {b.emptyHint}
        </p>
      )}

      {buttons.map((btn, idx) => {
        const error = (btn as { _error?: string })._error
        return (
          <div key={idx} className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {b.buttonN.replace("{{n}}", String(idx + 1))}
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
              label={b.typeLabel}
              value={btn.title}
              onChange={(e) => handleTypeChange(idx, e.target.value as ButtonType)}
            >
              {buttonTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>

            <Input
              label={b.displayText}
              value={btn.displayText}
              onChange={(e) => updateButton(idx, { displayText: e.target.value })}
              placeholder={b.displayPlaceholder}
              maxLength={50}
              hint={`${btn.displayText.length}/50`}
            />

            {btn.title === "reply" && (
              <Input
                label={b.buttonId}
                value={btn.id ?? ""}
                onChange={(e) => updateButton(idx, { id: e.target.value })}
                placeholder="opt1"
                hint={b.buttonIdHint}
              />
            )}

            {btn.title === "copy" && (
              <Input
                label={b.copyCode}
                value={btn.copyCode ?? ""}
                onChange={(e) => updateButton(idx, { copyCode: e.target.value })}
                placeholder={b.copyPlaceholder}
                required
              />
            )}

            {btn.title === "url" && (
              <Input
                label={b.url}
                value={btn.url ?? ""}
                onChange={(e) => updateButton(idx, { url: e.target.value })}
                placeholder="https://example.com"
                required
              />
            )}

            {btn.title === "call" && (
              <Input
                label={b.phone}
                value={btn.phoneNumber ?? ""}
                onChange={(e) => updateButton(idx, { phoneNumber: e.target.value })}
                placeholder="+33612345000"
                required
              />
            )}

            {btn.title === "pix" && (
              <div className="space-y-3">
                <Input
                  label={b.pixCurrency}
                  value={btn.currency ?? ""}
                  onChange={(e) => updateButton(idx, { currency: e.target.value })}
                  placeholder="BRL"
                  required
                />
                <Input
                  label={b.pixRecipientName}
                  value={btn.name ?? ""}
                  onChange={(e) => updateButton(idx, { name: e.target.value })}
                  placeholder={b.pixCompanyPlaceholder}
                  required
                />
                <Select
                  label={b.pixKeyType}
                  value={btn.keyType ?? ""}
                  onChange={(e) => updateButton(idx, { keyType: e.target.value })}
                >
                  <option value="">{b.pixKeyTypePlaceholder}</option>
                  <option value="cpf">{pix.cpf}</option>
                  <option value="cnpj">{pix.cnpj}</option>
                  <option value="email">{pix.email}</option>
                  <option value="phone">{pix.phone}</option>
                  <option value="random">{pix.random}</option>
                </Select>
                <Input
                  label={b.pixKey}
                  value={btn.key ?? ""}
                  onChange={(e) => updateButton(idx, { key: e.target.value })}
                  placeholder={b.pixKeyPlaceholder}
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
