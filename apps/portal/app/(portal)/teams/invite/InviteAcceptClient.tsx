"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { PORTAL_WORKSPACE_CHANGED_EVENT } from "@/lib/workspace-events"
import { writePortalWorkspace } from "@/lib/workspace-storage"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

export default function InviteAcceptClient() {
  const { copy } = usePortalLocale()
  const t = copy.teams
  const errs = t.errors as Record<string, string>
  const router = useRouter()
  const search = useSearchParams()
  const token = search.get("token") ?? ""
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("err")
      setMessage(t.noToken)
      return
    }
    let cancelled = false
    setStatus("loading")
    ;(async () => {
      try {
        const res = await apiClient.teams.acceptInvitation({ token })
        if (!cancelled) {
          if (res.teamId) {
            writePortalWorkspace({
              mode: "team",
              teamId: res.teamId,
              teamName: null,
              role: res.role ?? null,
            })
            window.dispatchEvent(new CustomEvent(PORTAL_WORKSPACE_CHANGED_EVENT))
          }
          setStatus("ok")
          setMessage(t.invitePageSuccess)
          setTimeout(() => router.replace("/dashboard"), 1500)
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("err")
          const code = e instanceof ApiClientError ? e.code : "UNKNOWN"
          setMessage(errs[code] ?? t.invitePageError)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, router, t, errs])

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-text tracking-tight mb-2">{t.invitePageTitle}</h1>
      <Card>
        {status === "loading" ? <p className="text-sm text-text-secondary">{t.invitePageLoading}</p> : null}
        {status === "ok" ? <p className="text-sm text-primary-text">{message}</p> : null}
        {status === "err" ? <p className="text-sm text-error-hover">{message}</p> : null}
        <div className="mt-4">
          <Button variant="secondary" type="button" onClick={() => router.push("/dashboard")}>
            {t.backDashboard}
          </Button>
        </div>
      </Card>
    </div>
  )
}
