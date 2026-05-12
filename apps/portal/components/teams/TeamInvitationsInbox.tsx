"use client"

import { toast } from "sonner"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { useMyTeamInvitations } from "@/hooks/useMyTeamInvitations"
import { useWorkspace } from "@/components/workspace/WorkspaceContext"

function errLabel(code: string, errors: Record<string, string>): string {
  return errors[code] ?? errors.UNKNOWN
}

export default function TeamInvitationsInbox() {
  const { copy, locale } = usePortalLocale()
  const t = copy.teams
  const errs = t.errors as Record<string, string>
  const { items, loading, error, refetch } = useMyTeamInvitations()
  const { refreshTeams } = useWorkspace()
  const numberLocale = locale === "fr" ? "fr-FR" : "en-US"

  const accept = async (invitationId: string) => {
    try {
      await apiClient.teams.acceptInvitation({ invitationId })
      toast.success(copy.toasts.profileUpdated)
      await refetch()
      await refreshTeams()
    } catch (e) {
      toast.error(e instanceof ApiClientError ? errLabel(e.code, errs) : errs.UNKNOWN)
    }
  }

  const header = (
    <>
      <h2 className="text-base font-medium text-text mb-1">{t.inboxTitle}</h2>
      <p className="text-sm text-text-secondary mb-4">{t.inboxDescription}</p>
    </>
  )

  if (loading && items.length === 0) {
    return (
      <Card className="mb-8">
        {header}
        <p className="text-sm text-text-secondary">{copy.common.loading}</p>
      </Card>
    )
  }

  if (error && items.length === 0) {
    return (
      <Card className="mb-8">
        {header}
        <p className="text-sm text-[#F59E0B]">{error}</p>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      {header}
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">{t.inboxEmpty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((inv) => (
            <li key={inv.invitationId} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-text">{inv.teamName}</p>
                <p className="text-xs text-text-muted font-mono">{inv.teamId}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {new Date(inv.expiresAt).toLocaleString(numberLocale)}
                </p>
              </div>
              <Button variant="primary" size="sm" type="button" onClick={() => void accept(inv.invitationId)}>
                {t.accept}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
