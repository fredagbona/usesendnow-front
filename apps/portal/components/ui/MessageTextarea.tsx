"use client"

import { useRef } from "react"
import { EmojiPicker } from "./EmojiPicker"

interface MessageTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  rows?: number
  label?: string
  error?: string
}

export function MessageTextarea({
  value,
  onChange,
  placeholder = "Rédigez votre message...",
  maxLength,
  disabled = false,
  rows = 4,
  label,
  error,
}: MessageTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertEmojiAtCursor(emoji: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.substring(0, start) + emoji + value.substring(end)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  const isOverLimit = maxLength ? value.length > maxLength : false

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text">{label}</label>
      )}

      <div
        className={[
          "relative border rounded-lg overflow-visible transition-all",
          "focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent",
          error ? "border-error" : "border-border-strong",
          disabled ? "opacity-50 bg-bg-subtle" : "bg-bg",
        ].join(" ")}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="w-full px-3 pt-3 pb-1 text-sm text-text placeholder:text-text-muted resize-none focus:outline-none bg-transparent"
        />

        <div className="flex items-center justify-between px-2 pb-2">
          <EmojiPicker onEmojiSelect={insertEmojiAtCursor} disabled={disabled} />
          {maxLength && (
            <span
              className={[
                "text-xs tabular-nums",
                isOverLimit ? "text-error font-medium" : "text-text-muted",
              ].join(" ")}
            >
              {value.length} / {maxLength}
            </span>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
