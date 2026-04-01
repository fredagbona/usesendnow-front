"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cancel01Icon } from "hugeicons-react"
import { modalScale } from "@/lib/animations"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-dark/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-[0_12px_36px_rgba(0,0,0,0.24),0_4px_12px_rgba(0,0,0,0.14)] ${maxWidth}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-bg-muted px-6 pt-6 pb-4">
              <div>
                <h2 className="text-base font-semibold text-text">{title}</h2>
                {description && (
                  <p className="text-sm text-text-secondary mt-0.5">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-bg-subtle transition-all duration-150 cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="min-h-0 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
