"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { resolveTeamDetailAccess, getTeamMemberUserId, getTeamInstanceAssignmentUserId } from "@/lib/team-page-access"
import { teamHasNoSeatAvailable } from "@/lib/team-seats"

type Tab = "overview" | "members" | "invitations" | "instances" | "keys" | "danger"

interface TeamWorkspaceDetailProps {
  teamId: string
  team: TeamDetail | null
  loading: boolean
  error: string | null
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
  onRefresh,
}: TeamWorkspaceDetailProps) {
  const { copy } = usePortalLocale()
  const t = copy.teams
  const errs = t.errors as Record<string, string>
  const router = useRouter()
  const { refreshTeams, me, workspace, workspaceCurrent } = useWorkspace()
  const viewerId = me?.id ?? ""
  const meTeamMembership = useMemo(() => me?.teams?.find((x) => x.id === teamId) ?? null, [me?.teams, teamId])
  const [tab, setTab] = useState<Tab>("overview")
  const [nameDraft, setNameDraft] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "collaborator">("collaborator")
  const [busy, setBusy] = useState(false)
  const [secretModal, setSecretModal] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [instances, setInstances] = useState<Instance[]>([])
  const [togglingCell, setTogglingCell] = useState<string | null>(null)
  const [keyName, setKeyName] = useState("")
  const [apiKeys, setApiKeys] = useState<TeamApiKeyRow[]>([])
  const [keyCreateOpen, setKeyCreateOpen] = useState(false)
  const [creatingKey, setCreatingKey] = useState(false)

  const collaborators = useMemo(() => {
    if (!team) return []
    return (team.members ?? [])
      .filter((m) => String(m.role ?? "").toLowerCase().trim() === "collaborator")
      .filter((m) => getTeamMemberUserId(m) !== "")
  }, [team])

  const myInstanceAssignments = useMemo(() => {
    if (!team || !viewerId.trim()) return []
    return (team.instanceAssignments ?? []).filter((a) => getTeamInstanceAssignmentUserId(a) === viewerId)
  }, [team, viewerId])

  const hasInstanceAssignment = useCallback(
    (memberUserId: string, instanceId: string) => {
      const rows = team?.instanceAssignments ?? []
      return rows.some(
        (a) => getTeamInstanceAssignmentUserId(a) === memberUserId && a.instanceId === instanceId,
      )
    },
    [team],
  )

  useEffect(() => {
    setTogglingCell(null)
  }, [teamId])

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

  const handleCreateTeamApiKey = useCallback(async () => {
    if (!keyName.trim()) return
    setCreatingKey(true)
    try {
      const res = await apiClient.teams.createApiKey(teamId, { name: keyName.trim() })
      setKeyName("")
      setKeyCreateOpen(false)
      if (res.secret) setSecretModal(res.secret)
      await loadApiKeys()
      await onRefresh()
    } catch (e) {
      toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
    } finally {
      setCreatingKey(false)
    }
  }, [keyName, teamId, loadApiKeys, onRefresh])

  useEffect(() => {
    if (tab === "instances") void loadInstances()
    if (tab === "keys") void loadApiKeys()
  }, [tab, loadInstances, loadApiKeys])

  useEffect(() => {
    if (tab !== "keys") {
      setKeyCreateOpen(false)
      setKeyName("")
    }
  }, [tab])

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
    if (teamHasNoSeatAvailable(team)) {
      toast.error(t.inviteNoSeatsHint)
      return
    }
    setBusy(true)
    try {
      await apiClient.teams.createInvitation(teamId, { email: inviteEmail.trim(), role: inviteRole })
      setInviteEmail("")
      toast.success(t.inviteSent)
      await onRefresh()
    } catch (e) {
      toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
    } finally {
      setBusy(false)
    }
  }

  const inviteRowId = (inv: TeamInvitation) => inv.invitationId ?? inv.id ?? ""

  const access = useMemo(
    () => resolveTeamDetailAccess(teamId, team, viewerId, workspace, workspaceCurrent, meTeamMembership),
    [teamId, team, viewerId, workspace, workspaceCurrent, meTeamMembership],
  )

  const inviteSeatsBlocked = useMemo(() => teamHasNoSeatAvailable(team), [team])

  const visibleTabs = useMemo(() => {
    const row = (id: Tab, label: string, visible: boolean) => ({ id, label, visible })
    return [
      row("overview", t.tabOverview, true),
      row("members", t.tabMembers, true),
      row("invitations", t.tabInvitations, access.canManage),
      row("instances", t.tabInstances, access.canManageInstances || access.collaboratorOnly),
      row("keys", t.tabApiKeys, access.canKeys),
      row("danger", t.tabDanger, access.isOwner || access.canManage),
    ].filter((x) => x.visible)
  }, [
    access.canManage,
    access.canManageInstances,
    access.canKeys,
    access.collaboratorOnly,
    access.isOwner,
    t.tabApiKeys,
    t.tabDanger,
    t.tabInstances,
    t.tabInvitations,
    t.tabMembers,
    t.tabOverview,
  ])

  useEffect(() => {
    if (!visibleTabs.some((x) => x.id === tab)) {
      setTab("overview")
    }
  }, [visibleTabs, tab])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {visibleTabs.map((x) => (
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
          {!access.isOwner ? <p className="text-sm text-text-secondary mb-4">{t.billingHidden}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 min-w-0">
              <Input label={t.teamName} value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
            </div>
            {access.canManage ? (
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
                  const memberId = getTeamMemberUserId(m)
                  const isRowOwner = m.role === "owner"
                  const isSelf = memberId === viewerId
                  return (
                    <tr
                      key={`${memberId || "member"}-${m.joinedAt ?? ""}-${memberIndex}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-2 pr-2 font-mono text-xs">{m.email ?? memberId}</td>
                      <td className="py-2 pr-2">{m.role}</td>
                      <td className="py-2 text-right">
                        {access.canManage && !isRowOwner ? (
                          <Button
                            variant="danger"
                            size="sm"
                            type="button"
                            onClick={async () => {
                              try {
                                await apiClient.teams.removeMember(teamId, memberId)
                                await onRefresh()
                              } catch (e) {
                                toast.error(e instanceof ApiClientError ? errMsg(e.code, errs) : errs.UNKNOWN)
                              }
                            }}
                          >
                            {t.removeMember}
                          </Button>
                        ) : null}
                        {isSelf && !access.isOwner ? (
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
          {access.isOwner ? <p className="text-xs text-text-muted mt-3">{t.ownerCannotLeave}</p> : null}
        </Card>
      )}

      {tab === "invitations" && access.canManage && (
        <Card>
          {inviteSeatsBlocked ? (
            <p className="mb-4 text-xs leading-snug text-text-muted">{t.inviteNoSeatsHint}</p>
          ) : null}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end max-w-4xl">
            <div className="w-full min-w-0 sm:flex-1 sm:max-w-md">
              <Input label={t.inviteEmail} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className="w-full sm:w-44 shrink-0">
              <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="team-invite-role">
                {t.role}
              </label>
              <select
                id="team-invite-role"
                className="h-10 w-full rounded-lg border border-border-strong bg-bg px-3 text-sm text-text"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "collaborator")}
              >
                <option value="admin">{t.roleAdmin}</option>
                <option value="collaborator">{t.roleCollaborator}</option>
              </select>
            </div>
            <Button
              variant="primary"
              size="sm"
              type="button"
              loading={busy}
              disabled={inviteSeatsBlocked}
              onClick={() => void sendInvite()}
            >
              {t.sendInvite}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-md text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-text-muted">
                  <th className="pb-2 pr-4">{t.email}</th>
                  <th className="pb-2 pr-4">{t.inviteStatusColumn}</th>
                  <th className="pb-2 text-right">{t.inviteActionsColumn}</th>
                </tr>
              </thead>
            <tbody>
              {(team.invitations ?? []).map((inv: TeamInvitation) => {
                const id = inviteRowId(inv)
                return (
                  <tr key={id || String(inv.email)} className="border-b border-border">
                    <td className="py-2">{inv.email}</td>
                    <td className="py-2">{inv.status?.trim() ? inv.status : t.inviteStatusPending}</td>
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
                        variant="danger"
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
          </div>
        </Card>
      )}

      {tab === "instances" && access.canManageInstances && !access.collaboratorOnly && (
        <Card>
          <p className="text-sm text-text-secondary mb-2">{t.instanceAccessGridIntro}</p>
          {collaborators.length === 0 ? (
            <p className="text-sm text-text-muted">{t.instanceAccessNoCollaborators}</p>
          ) : instances.length === 0 ? (
            <p className="text-sm text-text-muted">{t.instanceAccessNoInstances}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-muted text-xs uppercase text-text-muted">
                    <th className="sticky left-0 z-10 min-w-40 bg-bg-muted px-3 py-2.5 font-medium">
                      {t.instanceAccessCollaboratorColumn}
                    </th>
                    {instances.map((i) => (
                      <th key={i.id} className="whitespace-nowrap px-3 py-2.5 font-medium text-text-secondary">
                        {i.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {collaborators.map((m, rowIndex) => {
                    const mid = getTeamMemberUserId(m)
                    const label = (m.fullName ?? m.email ?? mid).trim() || mid
                    return (
                      <tr
                        key={mid || `collab-${rowIndex}`}
                        className="border-b border-border last:border-0 odd:bg-bg-subtle/60"
                      >
                        <td className="sticky left-0 z-10 bg-bg-muted px-3 py-2 font-medium text-text">{label}</td>
                        {instances.map((i) => {
                          const checked = mid ? hasInstanceAssignment(mid, i.id) : false
                          const busy = togglingCell === `${mid}:${i.id}`
                          const disabled = !mid || busy
                          return (
                            <td key={i.id} className="px-3 py-2 text-center align-middle">
                              <input
                                type="checkbox"
                                className="h-4 w-4 cursor-pointer rounded border-border-strong accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                                checked={checked}
                                disabled={disabled}
                                aria-label={t.instanceAccessToggleAria
                                  .replace("{{member}}", label)
                                  .replace("{{instance}}", i.name)}
                                onChange={(e) => {
                                  if (!mid) return
                                  const nextOn = e.target.checked
                                  void (async () => {
                                    setTogglingCell(`${mid}:${i.id}`)
                                    try {
                                      if (nextOn) {
                                        await apiClient.teams.assignInstance(teamId, {
                                          instanceId: i.id,
                                          memberUserId: mid,
                                        })
                                      } else {
                                        await apiClient.teams.unassignInstance(teamId, i.id, mid)
                                      }
                                      toast.success(t.instanceAccessSaved)
                                      await onRefresh()
                                    } catch (err) {
                                      toast.error(
                                        err instanceof ApiClientError ? errMsg(err.code, errs) : errs.UNKNOWN,
                                      )
                                    } finally {
                                      setTogglingCell(null)
                                    }
                                  })()
                                }}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "instances" && access.collaboratorOnly && (
        <Card>
          <p className="text-sm text-text-secondary mb-4">{t.instanceTabCollaboratorHint}</p>
          {myInstanceAssignments.length === 0 ? (
            <p className="text-sm text-text-muted">{t.collaboratorNoInstanceAssignments}</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {myInstanceAssignments.map((a) => {
                const name =
                  a.instance?.name ??
                  instances.find((x) => x.id === a.instanceId)?.name ??
                  a.instanceId
                const wa = a.instance?.waNumber ?? instances.find((x) => x.id === a.instanceId)?.waNumber
                const status = a.instance?.status
                return (
                  <li key={`${a.instanceId}-${a.createdAt ?? ""}`} className="flex flex-col gap-0.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-text">{name}</span>
                    <span className="font-mono text-xs text-text-muted">
                      {[wa, status].filter(Boolean).join(" · ") || null}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      )}

      {tab === "keys" && access.canKeys && (
        <Card>
          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center md:py-16">
              <p className="mb-1 text-sm font-medium text-text">{t.keysEmptyTitle}</p>
              <p className="mb-6 max-w-md text-sm text-text-secondary">{t.keysEmptyDescription}</p>
              <Button size="sm" variant="primary" type="button" onClick={() => setKeyCreateOpen(true)}>
                {t.createApiKey}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="max-w-2xl text-xs text-text-muted">{t.keysHintTeam}</p>
                <Button size="sm" variant="secondary" type="button" className="shrink-0" onClick={() => setKeyCreateOpen(true)}>
                  {t.createApiKey}
                </Button>
              </div>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {apiKeys.map((k) => (
                  <li key={k.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate font-medium text-text">{k.name}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      type="button"
                      className="shrink-0"
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
            </>
          )}
        </Card>
      )}

      <Modal
        open={keyCreateOpen}
        onClose={() => {
          setKeyCreateOpen(false)
          setKeyName("")
        }}
        title={t.createApiKey}
        description={t.keysHintTeam}
      >
        <Input label={t.apiKeyName} value={keyName} onChange={(e) => setKeyName(e.target.value)} />
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => {
              setKeyCreateOpen(false)
              setKeyName("")
            }}
          >
            {t.cancelAction}
          </Button>
          <Button variant="primary" size="sm" type="button" loading={creatingKey} onClick={() => void handleCreateTeamApiKey()}>
            {t.createApiKey}
          </Button>
        </div>
      </Modal>

      {tab === "danger" && access.isOwner && (
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

      {tab === "danger" && !access.isOwner && (
        <Card>
          <p className="text-sm text-text-secondary">
            {access.canManage ? t.dangerOwnerOnly : t.dangerNoAccess}
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
