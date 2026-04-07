"use client"

interface LookupSummaryCardsProps {
  requested: number
  checked: number
  onWhatsApp: number
  notOnWhatsApp: number
  invalid: number
}

export default function LookupSummaryCards({
  requested,
  checked,
  onWhatsApp,
  notOnWhatsApp,
  invalid,
}: LookupSummaryCardsProps) {
  const cards = [
    { label: "Demandés", value: requested, color: "text-text" },
    { label: "Vérifiés", value: checked, color: "text-text" },
    { label: "Sur WhatsApp", value: onWhatsApp, color: "text-primary" },
    { label: "Absents", value: notOnWhatsApp, color: "text-text-secondary" },
    { label: "Invalides", value: invalid, color: "text-error" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-bg border border-border rounded-xl p-4 text-center"
        >
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            {card.label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>
            {card.value.toLocaleString("fr-FR")}
          </p>
        </div>
      ))}
    </div>
  )
}
