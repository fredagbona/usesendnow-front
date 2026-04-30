import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">{label}</span> : null}
      <input className={`w-full border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-border-strong ${className}`} {...props} />
    </label>
  )
}
