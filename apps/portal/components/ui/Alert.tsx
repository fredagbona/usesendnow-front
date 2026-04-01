import {
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  AlertDiamondIcon,
  Cancel01Icon,
} from "hugeicons-react"

type AlertVariant = "error" | "success" | "warning" | "info"

interface AlertProps {
  variant: AlertVariant
  title?: string
  message: string
  onClose?: () => void
  className?: string
  children?: React.ReactNode
}

const config: Record<
  AlertVariant,
  { icon: React.ComponentType<{ className?: string }>; wrapper: string; iconClass: string; titleClass: string }
> = {
  error: {
    icon: AlertCircleIcon,
    wrapper: "bg-error-subtle border border-error/30 text-error-hover",
    iconClass: "text-error-hover",
    titleClass: "text-error-hover",
  },
  success: {
    icon: CheckmarkCircle01Icon,
    wrapper: "bg-primary-subtle border border-primary/30 text-primary-text",
    iconClass: "text-primary",
    titleClass: "text-primary-text",
  },
  warning: {
    icon: AlertDiamondIcon,
    wrapper: "bg-warning-subtle border border-warning/30 text-warning-text",
    iconClass: "text-warning",
    titleClass: "text-warning-text",
  },
  info: {
    icon: InformationCircleIcon,
    wrapper: "bg-[#3B82F6]/12 border border-[#3B82F6]/24 text-[#93C5FD]",
    iconClass: "text-[#60A5FA]",
    titleClass: "text-[#BFDBFE]",
  },
}

export default function Alert({ variant, title, message, onClose, className = "", children }: AlertProps) {
  const { icon: Icon, wrapper, iconClass, titleClass } = config[variant]

  return (
    <div className={["flex items-start gap-3 rounded-xl p-3.5", wrapper, className].join(" ")}>
      <Icon className={["w-4 h-4 shrink-0 mt-0.5", iconClass].join(" ")} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={["text-sm font-semibold leading-tight mb-0.5", titleClass].join(" ")}>
            {title}
          </p>
        )}
        <p className="text-sm leading-snug">{message}</p>
        {children && <div className="mt-1">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Cancel01Icon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
