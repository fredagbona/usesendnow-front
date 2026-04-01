"use client"

import { useRef, useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { SmileIcon } from "hugeicons-react"
import { usePortalTheme } from "@/components/ui/ThemeProvider"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
}

export function EmojiPicker({ onEmojiSelect, disabled }: EmojiPickerProps) {
  const { theme } = usePortalTheme()
  const [open, setOpen] = useState(false)
  const [opensUpward, setOpensUpward] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Detect vertical space on open
  useEffect(() => {
    if (!open || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setOpensUpward(rect.top > 400)
  }, [open])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="p-2 text-text-muted hover:text-text-secondary hover:bg-bg-subtle rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Insérer un emoji"
      >
        <SmileIcon className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={[
              "absolute z-50 overflow-hidden rounded-xl border border-border bg-bg shadow-[0_18px_48px_rgba(0,0,0,0.24)] right-0 sm:left-0 sm:right-auto",
              opensUpward ? "bottom-10" : "top-10",
            ].join(" ")}
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji: { native: string }) => {
                onEmojiSelect(emoji.native)
                setOpen(false)
              }}
              locale="fr"
              theme={theme === "dark" ? "dark" : "light"}
              previewPosition="none"
              skinTonePosition="search"
              maxFrequentRows={2}
              perLine={8}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
