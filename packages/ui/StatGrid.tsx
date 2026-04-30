import * as React from "react"
import { Card } from "./Card"

export interface StatItem {
  label: string
  value: string | number
}

export interface StatGridProps {
  items: StatItem[]
}

export function StatGrid({ items }: StatGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">{item.label}</p>
          <p className="mt-2 text-2xl font-bold text-text">{item.value}</p>
        </Card>
      ))}
    </div>
  )
}
