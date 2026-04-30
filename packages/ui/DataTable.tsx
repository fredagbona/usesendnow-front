import * as React from "react"

export interface DataTableColumn<T extends object> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

export interface DataTableProps<T extends object> {
  columns: DataTableColumn<T>[]
  rows: T[]
  loading?: boolean
  emptyMessage?: string
}

function renderCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}

export function DataTable<T extends object>({ columns, rows, loading = false, emptyMessage = "No data." }: DataTableProps<T>) {
  if (loading) return <p className="text-sm text-text-secondary">Loading...</p>
  if (rows.length === 0) return <p className="text-sm text-text-secondary">{emptyMessage}</p>

  return (
    <div className="overflow-x-auto border border-border bg-bg">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-border bg-bg-subtle">
            {columns.map((column) => (
              <th key={String(column.key)} className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String((row as Record<string, unknown>).id ?? index)} className="border-b border-border last:border-0">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-3 py-2 text-sm text-text-body">
                  {column.render ? column.render(row) : renderCell((row as Record<string, unknown>)[String(column.key)])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
