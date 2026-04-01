"use client"

import { forwardRef } from "react"

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "inverted" | "outlined" | "outline-primary"
type ButtonSize = "sm" | "md"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-black border border-[#0A0A0A] hover:bg-primary-hover shadow-[3px_3px_0px_0px_rgba(10,10,10,0.9)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
  secondary:
    "bg-bg-subtle border border-border-strong text-text hover:bg-bg-muted hover:border-border-strong shadow-[2px_2px_0px_0px_rgba(10,10,10,0.16)]",
  danger:
    "bg-error text-white border border-[#0A0A0A] hover:bg-error-hover",
  ghost:
    "bg-bg-subtle border border-border text-text-secondary hover:text-text hover:bg-bg-muted hover:border-border-strong",
  inverted:
    "bg-secondary text-secondary-text border border-border hover:bg-secondary-hover",
  outlined:
    "bg-bg-subtle border border-border-strong text-text hover:bg-bg-muted hover:border-border-strong",
  "outline-primary":
    "bg-primary-subtle border border-primary/50 text-primary-ink hover:bg-primary-subtle hover:border-primary hover:text-text",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          sizeClasses[size],
          variantClasses[variant],
          "font-(family-name:--font-geist-sans) font-bold uppercase tracking-[0.08em] rounded-none transition-all duration-200 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "inline-flex items-center gap-2",
          className,
        ].join(" ")}
        {...props}
      >
        {loading && (
          <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
export default Button
