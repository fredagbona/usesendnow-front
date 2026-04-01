"use client"

import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-body">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full border rounded-none px-3.5 py-2.5 text-sm text-text bg-bg",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-border-strong",
            "transition-all duration-150",
            error ? "border-error" : "border-border-strong",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-error-hover">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input
