"use client"

import { motion } from "framer-motion"
import { ArrowRight01Icon } from "hugeicons-react"

type ButtonVariant = "primary" | "secondary"
type ButtonSize = "sm" | "md"

interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  className?: string
  showArrow?: boolean
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-5 py-3 text-xs",
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#FFD600] text-[#171515] border border-[#D7B800] hover:bg-[#FFE04A]",
  secondary:
    "bg-white text-[#171515] border border-black/15 hover:border-[#A18A00] hover:text-[#171515] hover:bg-[#FFF8D6]",
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  showArrow = false,
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 font-(family-name:--font-geist-sans) font-semibold uppercase tracking-[0.1em] rounded-sm transition-all duration-300 ease-out cursor-pointer will-change-transform",
    sizeClasses[size],
    variantClasses[variant],
    className,
  ].join(" ")

  const motionProps =
    variant === "primary"
      ? {
          whileHover: { y: -1, scale: 1.01 },
          whileTap: { y: 0, scale: 0.99 },
          style: { boxShadow: "0 8px 24px rgba(23,21,21,0.12)" },
        }
      : {
          whileHover: { y: -1, scale: 1.01 },
          whileTap: { y: 0 },
        }

  const content = (
    <>
      <span>{children}</span>
      {showArrow && <ArrowRight01Icon className="h-3.5 w-3.5" />}
    </>
  )

  if (href) {
    const isExternal = href.startsWith("http")
    return (
      <motion.a
        href={href}
        className={classes}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...motionProps}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button type="button" className={classes} {...motionProps}>
      {content}
    </motion.button>
  )
}
