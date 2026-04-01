"use client"

import { useState } from "react"
import { Copy01Icon, Tick01Icon } from "hugeicons-react"

interface CodeSnippetProps {
  value: string
  className?: string
}

export default function CodeSnippet({ value, className = "" }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <code className="flex-1 font-mono text-sm bg-bg-subtle border border-border rounded-lg px-3 py-2 text-text-body select-all overflow-x-auto">
        {value}
      </code>
      <button
        onClick={handleCopy}
        className="shrink-0 p-2 text-text-muted hover:text-text hover:bg-bg-subtle rounded-lg transition-colors"
        title="Copier dans le presse-papiers"
      >
        {copied ? (
          <Tick01Icon className="w-4 h-4 text-[#FFD600]" />
        ) : (
          <Copy01Icon className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
