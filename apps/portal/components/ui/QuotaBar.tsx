interface QuotaBarProps {
  label: string
  used: number
  total: number
  className?: string
}

export default function QuotaBar({ label, used, total, className = "" }: QuotaBarProps) {
  const isUnlimited = total <= 0 || total >= 999999
  const percent = isUnlimited ? 0 : Math.min(Math.round((used / total) * 100), 100)

  const barColor =
    percent >= 90 ? "#EF4444" : percent >= 70 ? "#F59E0B" : "#FFD600"

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-body">{label}</span>
        <span className="text-sm font-medium text-text">
          {isUnlimited
            ? `${used.toLocaleString("fr-FR")} / Illimité`
            : `${used.toLocaleString("fr-FR")} / ${total.toLocaleString("fr-FR")}`}
        </span>
      </div>
      <div className="w-full bg-bg-muted rounded-full h-1.5">
        {!isUnlimited && (
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${percent}%`, backgroundColor: barColor }}
          />
        )}
      </div>
    </div>
  )
}
