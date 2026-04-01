"use client"

import { Add01Icon, Delete02Icon } from "hugeicons-react"
import type { CustomVariableEntry } from "@/lib/templateEngine"

interface CustomVariableBuilderProps {
  entries: CustomVariableEntry[]
  onChange: (entries: CustomVariableEntry[]) => void
  label?: string
  hint?: string
}

export default function CustomVariableBuilder({
  entries,
  onChange,
  label = "Variables custom",
  hint,
}: CustomVariableBuilderProps) {
  const updateEntry = (index: number, field: "key" | "value", value: string) => {
    onChange(entries.map((entry, currentIndex) => (
      currentIndex === index ? { ...entry, [field]: value } : entry
    )))
  }

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, currentIndex) => currentIndex !== index))
  }

  const addEntry = () => {
    onChange([...entries, { key: "", value: "" }])
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-text-body">{label}</p>
        {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={`${index}-${entry.key}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <input
              type="text"
              value={entry.key}
              onChange={(event) => updateEntry(index, "key", event.target.value)}
              placeholder="code"
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="text"
              value={entry.value}
              onChange={(event) => updateEntry(index, "value", event.target.value)}
              placeholder="PROMO10"
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => removeEntry(index)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-muted hover:text-error hover:border-error/40 transition-colors cursor-pointer"
              aria-label="Supprimer la variable"
            >
              <Delete02Icon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary-ink hover:text-text transition-colors cursor-pointer"
      >
        <Add01Icon className="h-4 w-4" />
        Ajouter une variable
      </button>
    </div>
  )
}
