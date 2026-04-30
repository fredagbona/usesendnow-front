"use client"

import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger"
  loading?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary border border-[#0A0A0A] text-black hover:bg-primary-hover",
  secondary: "bg-bg border border-border text-text hover:bg-bg-subtle",
  danger: "bg-error border border-[#0A0A0A] text-white hover:opacity-90",
}

export function Button({ variant = "primary", loading = false, className = "", children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center gap-2 rounded-none px-4 py-2 text-xs font-(family-name:--font-geist-sans) font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  )
}
