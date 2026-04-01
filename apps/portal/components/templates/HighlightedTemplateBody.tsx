"use client"

interface HighlightedTemplateBodyProps {
  body: string | null
}

export function HighlightedTemplateBody({ body }: HighlightedTemplateBodyProps) {
  if (!body) return <span className="text-text-muted">Aucun corps</span>

  const parts = body.split(/(\{\{\s*[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*\s*\}\})/g)

  return (
    <span>
      {parts.map((part, index) => (
        /^\{\{\s*[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*\s*\}\}$/.test(part)
          ? <mark key={index} className="rounded px-0.5 bg-warning-subtle text-warning-text">{part}</mark>
          : <span key={index}>{part}</span>
      ))}
    </span>
  )
}
