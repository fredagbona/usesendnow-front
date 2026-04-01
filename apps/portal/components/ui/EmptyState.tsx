import { motion } from "framer-motion"
import { slideUp } from "@/lib/animations"
import Button from "./Button"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  ctaLabel?: string
  onCta?: () => void
}

export default function EmptyState({ icon, title, description, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center text-text-muted mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-text">{title}</p>
      {description && (
        <p className="text-sm text-text-secondary mt-1.5 mb-5 max-w-xs">{description}</p>
      )}
      {ctaLabel && onCta && (
        <Button variant="primary" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </motion.div>
  )
}
