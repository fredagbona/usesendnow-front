"use client"

import { forwardRef } from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = "", id, children, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-body">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={[
            "w-full border rounded-lg px-3.5 py-2.5 text-sm text-text bg-bg",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "transition-all duration-150",
            error ? "border-error" : "border-border-strong",
            className,
          ].join(" ")}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-error-hover">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    )
  }
)

Select.displayName = "Select"
export default Select
