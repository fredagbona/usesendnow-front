import type { ReactNode } from "react"

/** Renders `template` with every `{{count}}` replaced by a bold number. */
export function renderWithStrongCount(template: string, count: number): ReactNode {
  const parts = template.split("{{count}}")
  if (parts.length === 1) return template.replace("{{count}}", String(count))
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? <strong>{count}</strong> : null}
        </span>
      ))}
    </>
  )
}

/** Renders `template` with `{{name}}` replaced by a bold name (single placeholder). */
export function renderWithStrongName(template: string, name: string): ReactNode {
  const parts = template.split("{{name}}")
  if (parts.length === 1) return template.replace("{{name}}", name)
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? <strong className="text-text">{name}</strong> : null}
        </span>
      ))}
    </>
  )
}
