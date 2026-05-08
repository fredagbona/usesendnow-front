"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { ContactGroup, ContactGroupMember, Contact } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Alert from "@/components/ui/Alert"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonCard, SkeletonTableRow } from "@/components/ui/Skeleton"
import {
  UserMultiple02Icon,
  ArrowLeft01Icon,
  Download01Icon,
  UserAdd01Icon,
  CheckmarkCircle01Icon,
} from "hugeicons-react"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { renderWithStrongCount, renderWithStrongName } from "@/lib/render-copy-placeholders"
import { isBulkJobQueuedResponse, trackBulkJob } from "@/lib/bulkJobs"

const PRESET_COLORS = ["#FFD600", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899"]

// ─── Edit Group Modal ──────────────────────────────────────────────────────────

function EditGroupModal({
  group,
  onSuccess,
  onClose,
}: {
  group: ContactGroup
  onSuccess: (g: ContactGroup) => void
  onClose: () => void
}) {
  const { copy } = usePortalLocale()
  const gCopy = copy.contacts.groups
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description ?? "")
  const [color, setColor] = useState(group.color ?? PRESET_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const updated = await apiClient.contactGroups.update(group.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      })
      onSuccess(updated)
      toast.success(gCopy.updated)
      onClose()
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "CONFLICT") {
        setError(gCopy.nameConflictTemplate.replace("{{name}}", name.trim()))
      } else {
        setError(gCopy.updateFailed)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={gCopy.editModalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={gCopy.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          maxLength={100}
        />
        <div>
          <label className="block text-sm font-medium text-text-body mb-1.5">
            {gCopy.description}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={255}
            rows={3}
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-150"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-body mb-2">{gCopy.color}</label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={[
                  "w-7 h-7 rounded-full transition-all",
                  color === c ? "ring-2 ring-offset-2 ring-border-strong scale-110" : "hover:scale-105",
                ].join(" ")}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded-full cursor-pointer border border-border overflow-hidden"
            />
          </div>
        </div>
        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>{gCopy.cancel}</Button>
          <Button type="submit" variant="primary" loading={loading}>{gCopy.save}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Add Members Modal ─────────────────────────────────────────────────────────

function AddMembersModal({
  groupId,
  existingMemberIds,
  onSuccess,
  onClose,
}: {
  groupId: string
  existingMemberIds: Set<string>
  onSuccess: (count: number) => void
  onClose: () => void
}) {
  const { copy } = usePortalLocale()
  const gCopy = copy.contacts.groups
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobProgress, setJobProgress] = useState<{ current: number; total: number } | null>(null)

  useEffect(() => {
    apiClient.contacts.list()
      .then((data) => setContacts(data))
      .catch(() => {})
      .finally(() => setLoadingContacts(false))
  }, [])

  const filtered = contacts.filter((c) => {
    if (existingMemberIds.has(c.id)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = async () => {
    if (selected.size === 0) return
    setAdding(true)
    setError(null)
    try {
      const contactIds = [...selected]
      const res = await apiClient.contactGroups.addMembers(groupId, contactIds)
      if (isBulkJobQueuedResponse(res)) {
        setJobProgress({ current: 0, total: res.requestedCount })
        const tracked = await trackBulkJob(res.jobId, (job) => {
          setJobProgress({
            current: job.processedCount,
            total: job.requestedCount,
          })
        })
        const added = tracked.job.summary.added ?? 0
        const tpl =
          added === 1 ? gCopy.addMembersSuccessOne : gCopy.addMembersSuccessMany
        toast.success(tpl.replace("{{count}}", String(added)))
        onSuccess(added)
        onClose()
      } else {
        const tpl =
          res.added === 1 ? gCopy.addMembersSuccessOne : gCopy.addMembersSuccessMany
        toast.success(tpl.replace("{{count}}", String(res.added)))
        onSuccess(res.added)
        onClose()
      }
    } catch {
      setError(gCopy.addMembersFailed)
    } finally {
      setAdding(false)
      setJobProgress(null)
    }
  }

  return (
    <Modal open onClose={onClose} title={gCopy.addMembersTitle} maxWidth="max-w-lg">
      <div className="space-y-4">
        <Input
          placeholder={gCopy.searchContactsPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="max-h-64 overflow-y-auto border border-border rounded-xl divide-y divide-border">
          {loadingContacts ? (
            <div className="p-4 text-sm text-text-secondary text-center">{gCopy.loading}</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-text-secondary text-center">{gCopy.noContactsAvailable}</div>
          ) : (
            filtered.map((c) => (
              <label key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-bg-subtle cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleSelect(c.id)}
                  className="accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{c.name}</p>
                  <p className="text-xs text-text-muted font-mono">{c.phone}</p>
                </div>
              </label>
            ))
          )}
        </div>
        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
        {jobProgress && (
          <Alert
            variant="info"
            title={gCopy.addMembersJobProgressTitle
              .replace("{{current}}", String(jobProgress.current))
              .replace("{{total}}", String(jobProgress.total))}
            message={gCopy.addMembersJobProgressMessage}
          >
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#3B82F6]/15">
              <div
                className="h-full rounded-full bg-[#3B82F6] transition-all"
                style={{ width: `${Math.min(100, Math.round((jobProgress.current / jobProgress.total) * 100))}%` }}
              />
            </div>
          </Alert>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>{gCopy.cancel}</Button>
          <Button variant="primary" loading={adding} disabled={selected.size === 0} onClick={handleAdd}>
            {gCopy.addContacts} {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ContactGroupDetailPage() {
  const { copy } = usePortalLocale()
  const gCopy = copy.contacts.groups
  const router = useRouter()
  const { groupId } = useParams<{ groupId: string }>()

  const [group, setGroup] = useState<ContactGroup | null>(null)
  const [members, setMembers] = useState<ContactGroupMember[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [loadingGroup, setLoadingGroup] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [search, setSearch] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false)
  const [addMembersOpen, setAddMembersOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ContactGroupMember | null>(null)
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
  const [bulkRemoving, setBulkRemoving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchGroup = useCallback(async () => {
    try {
      const g = await apiClient.contactGroups.get(groupId)
      setGroup(g)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "NOT_FOUND") {
        toast.error(gCopy.notFound)
        router.push("/contacts/groups")
      }
    } finally {
      setLoadingGroup(false)
    }
  }, [groupId, router, gCopy])

  const fetchMembers = useCallback(async (searchVal?: string, cursor?: string) => {
    setLoadingMembers(true)
    try {
      const data = await apiClient.contactGroups.listMembers(groupId, {
        limit: 50,
        cursor,
        search: searchVal || undefined,
      })
      if (cursor) {
        setMembers((prev) => [...prev, ...data.contacts])
      } else {
        setMembers(data.contacts)
      }
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
      setTotal(data.total)
    } catch {
      toast.error(gCopy.saveFailed)
    } finally {
      setLoadingMembers(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchGroup()
    fetchMembers()
  }, [fetchGroup, fetchMembers])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    fetchMembers(val)
  }

  const handleLoadMore = async () => {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const data = await apiClient.contactGroups.listMembers(groupId, {
        limit: 50,
        cursor: nextCursor,
        search: search || undefined,
      })
      setMembers((prev) => [...prev, ...data.contacts])
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await apiClient.contactGroups.removeMembers(groupId, [removeTarget.id])
      setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setGroup((prev) => prev ? { ...prev, contactCount: Math.max(0, prev.contactCount - 1) } : prev)
      toast.success(gCopy.removeMemberSuccess)
      setRemoveTarget(null)
    } catch {
      toast.error(gCopy.removeMemberFailed)
    } finally {
      setRemoving(false)
    }
  }

  const handleDeleteGroup = async () => {
    setDeletingGroup(true)
    try {
      await apiClient.contactGroups.delete(groupId)
      toast.success(gCopy.deleted)
      router.push("/contacts/groups")
    } catch {
      toast.error(gCopy.deleteFailed)
      setDeletingGroup(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    const toastId = toast.loading(gCopy.exporting)
    try {
      const { blob, filename } = await apiClient.contacts.export(groupId)
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
      toast.dismiss(toastId)
    } catch {
      toast.dismiss(toastId)
      toast.error(gCopy.exportFailed)
    } finally {
      setExporting(false)
    }
  }

  const memberIds = new Set(members.map((m) => m.id))
  const allSelected = members.length > 0 && members.every((member) => selectedMemberIds.has(member.id))

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllMembers = () => {
    if (allSelected) {
      setSelectedMemberIds(new Set())
    } else {
      setSelectedMemberIds(new Set(members.map((member) => member.id)))
    }
  }

  const handleBulkRemoveMembers = async () => {
    if (selectedMemberIds.size === 0) return
    setBulkRemoving(true)
    try {
      const ids = Array.from(selectedMemberIds)
      const result = await apiClient.contactGroups.removeMembers(groupId, ids)

      if (isBulkJobQueuedResponse(result)) {
        const tracked = await trackBulkJob(result.jobId)
        const removedCount = tracked.job.summary.removed ?? 0
        setMembers((prev) => prev.filter((member) => !selectedMemberIds.has(member.id)))
        setTotal((prev) => Math.max(0, prev - removedCount))
        setGroup((prev) => prev ? { ...prev, contactCount: Math.max(0, prev.contactCount - removedCount) } : prev)
        setSelectedMemberIds(new Set())
        toast.success(
          (removedCount === 1 ? gCopy.removeMembersSuccessOne : gCopy.removeMembersSuccessMany)
            .replace("{{count}}", String(removedCount))
        )
      } else {
        const removedCount = result.removed
        setMembers((prev) => prev.filter((member) => !selectedMemberIds.has(member.id)))
        setTotal((prev) => Math.max(0, prev - removedCount))
        setGroup((prev) => prev ? { ...prev, contactCount: Math.max(0, prev.contactCount - removedCount) } : prev)
        setSelectedMemberIds(new Set())
        toast.success(
          (removedCount === 1 ? gCopy.removeMembersSuccessOne : gCopy.removeMembersSuccessMany)
            .replace("{{count}}", String(removedCount))
        )
      }
    } catch {
      toast.error(gCopy.removeMemberFailed)
    } finally {
      setBulkRemoving(false)
    }
  }

  if (loadingGroup) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!group) return null

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title={group.name}
        description={
          <>
            {renderWithStrongCount(
              total === 1 ? gCopy.detailPageCountOne : gCopy.detailPageCountMany,
              total,
            )}
            {group.description ? ` · ${group.description}` : ""}
          </>
        }
        action={
          <div className="flex items-center flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/contacts/groups")}>
              <ArrowLeft01Icon className="w-4 h-4" />
              {gCopy.back}
            </Button>
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: group.color ?? "#6B7280" }}
            />
            <Button variant="secondary" loading={exporting} onClick={handleExport}>
              <Download01Icon className="w-4 h-4" />
              {gCopy.export}
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              {gCopy.edit}
            </Button>
            <Button variant="danger" onClick={() => setDeleteGroupOpen(true)}>
              {gCopy.delete}
            </Button>
          </div>
        }
      />

      {/* Search + Add */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={gCopy.searchMembersPlaceholder}
          className="flex-1 min-w-0 sm:max-w-sm"
        />
        <Button variant="primary" onClick={() => setAddMembersOpen(true)}>
          <UserAdd01Icon className="w-4 h-4" />
          {gCopy.addContacts}
        </Button>
      </div>

      {selectedMemberIds.size > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CheckmarkCircle01Icon className="h-5 w-5 text-primary" />
            <span className="text-sm text-text">
              {selectedMemberIds.size === 1
                ? gCopy.bulkSelectedOne.replace("{{count}}", String(selectedMemberIds.size))
                : gCopy.bulkSelectedMany.replace("{{count}}", String(selectedMemberIds.size))}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedMemberIds(new Set())}>
              {gCopy.deselectAll}
            </Button>
            <Button variant="danger" size="sm" loading={bulkRemoving} onClick={handleBulkRemoveMembers}>
              {gCopy.removeSelected}
            </Button>
          </div>
        </div>
      )}

      {/* Members table */}
      <Card>
        {loadingMembers && members.length === 0 ? (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["", gCopy.table.name, gCopy.table.phone, gCopy.table.tags, gCopy.table.addedAt, ""].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{[1, 2, 3].map((i) => <SkeletonTableRow key={i} cols={5} />)}</tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border animate-pulse">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-28 bg-bg-muted rounded" />
                    <div className="h-3 w-20 bg-bg-muted rounded" />
                  </div>
                  <div className="h-7 w-14 bg-bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          </>
        ) : members.length === 0 ? (
          <EmptyState
            icon={<UserMultiple02Icon className="w-8 h-8" />}
            title={gCopy.noMembers}
            description={gCopy.noMembersDescription}
            ctaLabel={gCopy.addContacts}
            onCta={() => setAddMembersOpen(true)}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {[gCopy.table.name, gCopy.table.phone, gCopy.table.tags, gCopy.table.addedAt, ""].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                      <td className="py-3 pr-4">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.has(member.id)}
                          onChange={() => toggleSelectMember(member.id)}
                          className="h-4 w-4 rounded border-border-strong accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="py-3 pr-4 text-sm font-semibold text-text">{member.name}</td>
                      <td className="py-3 pr-4 text-sm font-mono text-text-body whitespace-nowrap">{member.phone}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {member.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="neutral">{tag}</Badge>
                          ))}
                          {member.tags.length > 3 && <Badge variant="neutral">+{member.tags.length - 3}</Badge>}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-muted whitespace-nowrap">{formatDate(member.addedAt)}</td>
                      <td className="py-3">
                        <Button size="sm" variant="ghost" onClick={() => setRemoveTarget(member)}>{gCopy.remove}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-border">
              {members.map((member) => (
                <div key={member.id} className="py-3 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.has(member.id)}
                      onChange={() => toggleSelectMember(member.id)}
                      className="h-4 w-4 mt-1 rounded border-border-strong accent-primary cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text truncate">{member.name}</p>
                      <p className="text-xs font-mono text-text-muted">{member.phone}</p>
                      {member.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="neutral">{tag}</Badge>
                          ))}
                          {member.tags.length > 3 && <Badge variant="neutral">+{member.tags.length - 3}</Badge>}
                        </div>
                      )}
                      <p className="text-xs text-text-muted mt-1">{formatDate(member.addedAt)}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setRemoveTarget(member)}>{gCopy.remove}</Button>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" loading={loadingMore} onClick={handleLoadMore}>
                  {gCopy.loadMore}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Edit group modal */}
      {editOpen && (
        <EditGroupModal
          group={group}
          onSuccess={(g) => { setGroup(g); setEditOpen(false) }}
          onClose={() => setEditOpen(false)}
        />
      )}

      {/* Delete group modal */}
      {deleteGroupOpen && (
        <Modal open onClose={() => setDeleteGroupOpen(false)} title={gCopy.deleteModalTitle}>
          <p className="text-sm text-text-body mb-2">
            {renderWithStrongName(gCopy.deleteGroupQuestion, group.name)}
          </p>
          <p className="text-sm text-text-secondary mb-6">
            {renderWithStrongCount(
              group.contactCount === 1
                ? gCopy.deleteGroupContactsNoteOne
                : gCopy.deleteGroupContactsNoteMany,
              group.contactCount,
            )}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteGroupOpen(false)}>{gCopy.cancel}</Button>
            <Button variant="danger" loading={deletingGroup} onClick={handleDeleteGroup}>{gCopy.delete}</Button>
          </div>
        </Modal>
      )}

      {/* Add members modal */}
      {addMembersOpen && (
        <AddMembersModal
          groupId={groupId}
          existingMemberIds={memberIds}
          onSuccess={(count) => {
            setGroup((prev) => prev ? { ...prev, contactCount: prev.contactCount + count } : prev)
            fetchMembers(search)
          }}
          onClose={() => setAddMembersOpen(false)}
        />
      )}

      {/* Remove member confirmation */}
      <Modal open={!!removeTarget} onClose={() => setRemoveTarget(null)} title={gCopy.removeModalTitle}>
        {removeTarget && (
          <>
            <p className="text-sm text-text-body mb-6">
              {gCopy.removeMemberPart1}
              <strong className="text-text">{removeTarget.name}</strong>
              {gCopy.removeMemberPart2}
              <strong className="text-text">{group.name}</strong>
              {gCopy.removeMemberPart3}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRemoveTarget(null)}>{gCopy.cancel}</Button>
              <Button variant="danger" loading={removing} onClick={handleRemoveMember}>{gCopy.remove}</Button>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  )
}
