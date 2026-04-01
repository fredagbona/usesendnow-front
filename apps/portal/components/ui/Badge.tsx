type BadgeVariant =
  | "success"
  | "error"
  | "warning"
  | "neutral"
  | "info"
  | "blue"
  | "purple"
  | "orange"
  | "yellow"

type BadgeDisplay = "soft" | "solid" | "outline"

interface BadgeProps {
  variant?: BadgeVariant
  display?: BadgeDisplay
  children: React.ReactNode
  pulse?: boolean
  icon?: React.ReactNode
  className?: string
}

// Soft — subtle background + colored text
const softClasses: Record<BadgeVariant, string> = {
  success: "bg-primary-subtle text-primary-text border-primary/20",
  error:   "bg-error-subtle text-error-hover border-error/25",
  warning: "bg-warning-subtle text-warning-text border-warning/25",
  neutral: "bg-bg-subtle text-text-secondary border-border",
  info:    "bg-[#3B82F6]/16 text-[#93C5FD] border-[#3B82F6]/28",
  blue:    "bg-[#3B82F6]/16 text-[#93C5FD] border-[#3B82F6]/28",
  purple:  "bg-[#A855F7]/16 text-[#D8B4FE] border-[#A855F7]/28",
  orange:  "bg-[#F97316]/16 text-[#FDBA74] border-[#F97316]/28",
  yellow:  "bg-[#F59E0B]/16 text-[#FCD34D] border-[#F59E0B]/28",
}

// Solid — filled bg + white text
const solidClasses: Record<BadgeVariant, string> = {
  success: "bg-primary text-black",
  error:   "bg-error text-white",
  warning: "bg-warning text-white",
  neutral: "bg-neutral-dark text-white",
  info:    "bg-[#3B82F6] text-white",
  blue:    "bg-[#3B82F6] text-white",
  purple:  "bg-[#7C3AED] text-white",
  orange:  "bg-[#EA580C] text-white",
  yellow:  "bg-[#D97706] text-white",
}

// Outline — white bg + colored border + colored text
const outlineClasses: Record<BadgeVariant, string> = {
  success: "bg-primary-subtle border border-primary/35 text-primary-text",
  error:   "bg-error-subtle border border-error/35 text-error-hover",
  warning: "bg-warning-subtle border border-warning/35 text-warning-text",
  neutral: "bg-bg-subtle border border-border-strong text-text-secondary",
  info:    "bg-[#3B82F6]/14 border border-[#3B82F6]/40 text-[#93C5FD]",
  blue:    "bg-[#3B82F6]/14 border border-[#3B82F6]/40 text-[#93C5FD]",
  purple:  "bg-[#A855F7]/14 border border-[#A855F7]/40 text-[#D8B4FE]",
  orange:  "bg-[#F97316]/14 border border-[#F97316]/40 text-[#FDBA74]",
  yellow:  "bg-[#F59E0B]/14 border border-[#F59E0B]/40 text-[#FCD34D]",
}

const displayMap: Record<BadgeDisplay, Record<BadgeVariant, string>> = {
  soft:    softClasses,
  solid:   solidClasses,
  outline: outlineClasses,
}

export default function Badge({
  variant = "neutral",
  display = "soft",
  children,
  pulse,
  icon,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "text-xs font-medium px-2.5 py-0.5 rounded-none inline-flex items-center gap-1.5 border",
        displayMap[display][variant],
        className,
      ].join(" ")}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
}
