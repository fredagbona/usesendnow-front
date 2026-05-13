"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import PortalAppChrome from "@/components/layout/PortalAppChrome"
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login"
      return
    }
    setChecked(true)
  }, [router])

  if (!checked) {
    return null
  }

  return (
    <WorkspaceProvider>
      <PortalAppChrome>{children}</PortalAppChrome>
    </WorkspaceProvider>
  )
}
