"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminShell } from "@/components/layout/AdminShell"
import { getAdminToken } from "@/lib/admin-auth"
import { useAdminSession } from "@/hooks/useAdminSession"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = getAdminToken()
  const { admin, loading, error } = useAdminSession()

  useEffect(() => {
    if (!token) router.push("/login")
  }, [router, token])

  useEffect(() => {
    if (!loading && error) router.push("/login")
  }, [loading, error, router])

  if (!token || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4">
        <div className="flex flex-col items-center gap-4 border border-border bg-bg p-8 shadow-[3px_3px_0px_0px_rgba(10,10,10,0.08)]">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 border-2 border-border" />
            <div className="absolute inset-0 animate-spin border-2 border-transparent border-t-primary border-r-primary" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Admin session</p>
            <p className="mt-1 text-sm text-text">Loading your workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  return <AdminShell adminName={admin?.fullName}>{children}</AdminShell>
}
