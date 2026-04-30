import * as React from "react"

export interface BarChartDatum {
  label: string
  value: number
}

export interface BarChartProps {
  title: string
  data: BarChartDatum[]
  className?: string
}

export function BarChart({ title, data, className = "" }: BarChartProps) {
  const normalizedData = data.map((item) => ({
    label: item.label,
    value: Number.isFinite(item.value) ? item.value : 0,
  }))
  const max = Math.max(...normalizedData.map((item) => item.value), 1)

  return (
    <section className={`border border-border bg-bg p-4 ${className}`}>
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">{title}</h3>
      <div className="mt-4 space-y-3">
        {normalizedData.map((item, index) => {
          const width = Math.max((item.value / max) * 100, item.value > 0 ? 3 : 0)
          const key = `${item.label || "point"}-${index}`
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
                <span>{item.label}</span>
                <span className="font-semibold text-text">{item.value.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-bg-subtle">
                <div className="h-full bg-primary transition-all" style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
