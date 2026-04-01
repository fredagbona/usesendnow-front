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
    "bg-[#FFD600] text-[#0A0A0A] border border-[#FFD600]",
  secondary:
    "bg-transparent text-[#F0F0F0] border border-[#3A3A3A] hover:border-[#FFD600] hover:text-[#FFD600]",
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
    "inline-flex items-center justify-center gap-2 font-(family-name:--font-geist-sans) font-bold uppercase tracking-[0.08em] rounded-none transition-colors cursor-pointer",
    sizeClasses[size],
    variantClasses[variant],
    className,
  ].join(" ")

  const motionProps =
    variant === "primary"
      ? {
          whileHover: { x: 2, y: 2, boxShadow: "none" },
          whileTap: { x: 2, y: 2, boxShadow: "none" },
          style: { boxShadow: "4px 4px 0px #0A0A0A" },
        }
      : {
          whileHover: { y: -1 },
          whileTap: { y: 0 },
        }

  const content = (
    <>
      <span>{children}</span>
      {showArrow && <ArrowRight01Icon className="h-3.5 w-3.5" />}
    </>
  )

  if (href) {
    return (
      <motion.a href={href} className={classes} {...motionProps}>
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
