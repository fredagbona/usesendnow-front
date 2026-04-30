"use client"

import { useState } from "react"
import { Button } from "@usesendnow/ui"
import { downloadAdminCsv } from "@/lib/admin-api"

interface ExportButtonProps {
  path: string
  params?: Record<string, string | number | undefined>
  label?: string
}

export function ExportButton({ path, params, label = "Export CSV" }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const onExport = async () => {
    setLoading(true)
    try {
      const { blob, fileName } = await downloadAdminCsv(path, params)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="secondary" loading={loading} onClick={onExport}>
      {label}
    </Button>
  )
}
