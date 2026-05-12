"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { Instance, TeamDetail, TeamInvitation, TeamMember, TeamApiKeyRow } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { useWorkspace } from "@/components/workspace/WorkspaceContext"
import { deriveTeamPageAccess } from "@/lib/team-page-access"

type Tab = "overview" | "members" | "invitations" | "instances" | "keys" | "danger"

interface TeamWorkspaceDetailProps {
  teamId: string
  team: TeamDetail | null
  loading: boolean
  error: string | null
  currentUserId: string
  onRefresh: () => Promise<void>
}

function errMsg(code: string, errors: Record<string, string>): string {
  return errors[code] ?? errors.UNKNOWN
}

export default function TeamWorkspaceDetail({
  teamId,
  team,
  loading,
  error,
  currentUserId,
  onRefresh,
}: TeamWorkspaceDetailProps) {
  const { copy } = usePortalLocale()
  const t = copy.teams
  const errs = t.errors as Record<string, string>
  const router = useRouter()
  const { refreshTeams } = useWorkspace()
  const [tab, setTab] = useState<Tab>("overview")
  const [nameDraft, setNameDraft] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "collaborator">("collaborator")
  const [busy, setBusy] = useState(false)
  const [secretModal, setSecretModal] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [instances, setInstances] = useState<Instance[]>([])
  const [instId, setInstId] = useState("")
  const [memberAssignId, setMemberAssignId] = useState("")
  const [keyName, setKeyName] = useState("")
  const [apiKeys, setApiKeys] = useState<TeamApiKeyRow[]>([])

  useEffect(() => {
    if (team?.name) setNameDraft(team.name)
  }, [team?.name])

  const loadInstances = useCallback(async () => {
    try {
      const list = await apiClient.instances.list()
      setInstances(list)
    } catch {
      setInstances([])
    }
  }, [])

  const loadApiKeys = useCallback(async () => {
    try {
      const list = await apiClient.teams.listApiKeys(teamId)
      setApiKeys(list)
    } catch {
      setApiKeys([])
    }
  }, [teamId])

  useEffect(() => {
    if (tab === "instances") void loadInstances()
    if (tab === "keys") void loadApiKeys()
  }, [tab, loadInstances, loadApiKeys])

  const saveName = async () => {
    if (!team || !nameDraft.trim()) return
    setSavingName(true)
    try {
      await apiClient.teams.update(teamId, { name: nameDraft.trim() })
      toast.success(copy.toasts.profileUpdated)
      await onRefresh()
      await refreshTeams()
    } catch (e) {
      toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
    } finally {
      setSavingName(false)
    }
  }

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
    setBusy(true)
    try {
      await apiClient.teams.createInvitation(teamId, { email: inviteEmail.trim(), role: inviteRole })
      setInviteEmail("")
      toast.success(copy.toasts.profileUpdated)
      await onRefresh()
    } catch (e) {
      toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
    } finally {
      setBusy(false)
    }
  }

  const inviteRowId = (inv: TeamInvitation) => inv.invitationId ?? inv.id ?? ""

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: t.tabOverview },
    { id: "members", label: t.tabMembers },
    { id: "invitations", label: t.tabInvitations },
    { id: "instances", label: t.tabInstances },
    { id: "keys", label: t.tabApiKeys },
    { id: "danger", label: t.tabDanger },
  ]

  if (loading && !team) {
    return <p className="text-sm text-text-secondary">{copy.common.loading}</p>
  }
  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-error-hover">{error}</p>
        <Link href="/teams" className="text-sm text-primary-text underline">
          {copy.common.back}
        </Link>
      </div>
    )
  }
  if (!team) {
    return null
  }

  const { isOwner, canManage, canKeys, collaboratorOnly } = deriveTeamPageAccess(team, currentUserId)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              tab === x.id ? "bg-primary-subtle text-primary-text" : "text-text-secondary hover:bg-bg-subtle",
            ].join(" ")}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <Card>
          {!isOwner ? <p className="text-sm text-text-secondary mb-4">{t.billingHidden}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 min-w-0">
              <Input label={t.teamName} value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
            </div>
            {canManage ? (
              <Button variant="primary" loading={savingName} type="button" onClick={() => void saveName()}>
                {t.rename}
              </Button>
            ) : null}
          </div>
        </Card>
      )}

      {tab === "members" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-text-muted">
                  <th className="pb-2 pr-2">{t.email}</th>
                  <th className="pb-2 pr-2">{t.role}</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {(team.members ?? []).map((m: TeamMember, memberIndex) => {
                  const isRowOwner = m.role === "owner"
                  const isSelf = m.userId === currentUserId
                  return (
                    <tr
                      key={`${m.userId ?? "member"}-${m.joinedAt ?? ""}-${memberIndex}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-2 pr-2 font-mono text-xs">{m.email ?? m.userId}</td>
                      <td className="py-2 pr-2">{m.role}</td>
                      <td className="py-2 text-right">
                        {canManage && !isRowOwner ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={async () => {
                              try {
                                await apiClient.teams.removeMember(teamId, m.userId)
                                await onRefresh()
                              } catch (e) {
                                toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
                              }
                            }}
                          >
                            {t.removeMember}
                          </Button>
                        ) : null}
                        {isSelf && !isOwner ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            className="ml-2"
                            onClick={async () => {
                              try {
                                await apiClient.teams.leave(teamId)
                                await refreshTeams()
                                router.push("/teams")
                              } catch (e) {
                                toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
                              }
                            }}
                          >
                            {t.leaveTeam}
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {isOwner ? <p className="text-xs text-text-muted mt-3">{t.ownerCannotLeave}</p> : null}
        </Card>
      )}

      {tab === "invitations" && canManage && (
        <Card>
          <div className="mb-4 flex flex-wrap items-end gap-2">
            <div className="min-w-[200px] flex-1">
              <Input label={t.inviteEmail} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <select
              className="h-[42px] rounded-none border border-border-strong px-3 text-sm"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "admin" | "collaborator")}
            >
              <option value="admin">{t.roleAdmin}</option>
              <option value="collaborator">{t.roleCollaborator}</option>
            </select>
            <Button variant="primary" type="button" loading={busy} onClick={() => void sendInvite()}>
              {t.sendInvite}
            </Button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-text-muted">
                <th className="pb-2">{t.email}</th>
                <th className="pb-2">Status</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {(team.invitations ?? []).map((inv: TeamInvitation) => {
                const id = inviteRowId(inv)
                return (
                  <tr key={id || String(inv.email)} className="border-b border-border">
                    <td className="py-2">{inv.email}</td>
                    <td className="py-2">{inv.status}</td>
                    <td className="py-2 text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={async () => {
                          try {
                            await apiClient.teams.resendInvitation(teamId, id)
                            await onRefresh()
                          } catch (e) {
                            toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
                          }
                        }}
                      >
                        {t.resendInvite}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={async () => {
                          try {
                            await apiClient.teams.revokeInvitation(teamId, id)
                            await onRefresh()
                          } catch (e) {
                            toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
                          }
                        }}
                      >
                        {t.revokeInvite}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "invitations" && !canManage && (
        <Card>
          <p className="text-sm text-text-secondary">{t.collaboratorKeysHidden}</p>
        </Card>
      )}

      {tab === "instances" && canManage && (
        <Card>
          <p className="text-sm text-text-secondary mb-3">{t.instanceAssignTitle}</p>
          <div className="grid gap-2 md:grid-cols-3">
            <select
              className="border border-border-strong rounded-lg px-3 py-2 text-sm"
              value={instId}
              onChange={(e) => setInstId(e.target.value)}
            >
              <option value="">{t.instanceId}</option>
              {instances.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
            <Input label={t.memberUserId} value={memberAssignId} onChange={(e) => setMemberAssignId(e.target.value)} />
            <Button
              variant="primary"
              type="button"
              className="self-end"
              onClick={async () => {
                if (!instId || !memberAssignId) return
                try {
                  await apiClient.teams.assignInstance(teamId, { instanceId: instId, memberUserId: memberAssignId })
                  toast.success(copy.toasts.instanceCreated)
                  await onRefresh()
                } catch (e) {
                  toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
                }
              }}
            >
              {t.assign}
            </Button>
          </div>
        </Card>
      )}

      {tab === "instances" && collaboratorOnly && (
        <Card>
          <p className="text-sm text-text-secondary">{t.collaboratorKeysHidden}</p>
        </Card>
      )}

      {tab === "keys" && canKeys && (
        <Card>
          <p className="text-xs text-text-muted mb-3">{t.keysHintTeam}</p>
          <div className="mb-4 flex flex-wrap gap-2">
            <Input label={t.apiKeyName} value={keyName} onChange={(e) => setKeyName(e.target.value)} />
            <Button
              variant="primary"
              type="button"
              onClick={async () => {
                if (!keyName.trim()) return
                try {
                  const res = await apiClient.teams.createApiKey(teamId, { name: keyName.trim() })
                  setKeyName("")
                  if (res.secret) setSecretModal(res.secret)
                  await loadApiKeys()
                  await onRefresh()
                } catch (e) {
                  toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
                }
              }}
            >
              {t.createApiKey}
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {apiKeys.map((k) => (
              <li key={k.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-text">{k.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={async () => {
                    try {
                      await apiClient.teams.revokeApiKey(teamId, k.id)
                      await loadApiKeys()
                      await onRefresh()
                    } catch (e) {
                      toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
                    }
                  }}
                >
                  {t.revokeApiKey}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "keys" && !canKeys && (
        <Card>
          <p className="text-sm text-text-secondary">{t.collaboratorKeysHidden}</p>
        </Card>
      )}

      {tab === "danger" && isOwner && (
        <Card>
          <p className="text-sm text-error-hover mb-2">{t.deleteTeam}</p>
          <Input label={t.deleteConfirm} value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
          <Button
            variant="danger"
            className="mt-3"
            type="button"
            onClick={async () => {
              if (deleteConfirm !== team.name) {
                toast.error(t.deleteConfirm)
                return
              }
              try {
                await apiClient.teams.delete(teamId)
                await refreshTeams()
                router.push("/teams")
              } catch (e) {
                toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
              }
            }}
          >
            {t.deleteTeam}
          </Button>
        </Card>
      )}

      {tab === "danger" && !isOwner && (
        <Card>
          <p className="text-sm text-text-secondary">
            {canManage ? t.dangerOwnerOnly : t.dangerNoAccess}
          </p>
        </Card>
      )}

      <Modal open={!!secretModal} onClose={() => setSecretModal(null)} title={t.secretOnceTitle} description={t.secretOnceHint}>
        {secretModal ? (
          <div className="space-y-3">
            <pre className="font-mono text-xs break-all rounded-lg border border-border bg-bg-subtle p-3">{secretModal}</pre>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(secretModal)
                toast.success(t.copySecretToast)
              }}
            >
              {t.copySecret}
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
