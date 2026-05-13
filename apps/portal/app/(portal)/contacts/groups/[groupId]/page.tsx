"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { ContactGroup, ContactGroupMember, Contact } from "@usesendnow/types"
import { isContactBulkJobAccepted } from "@usesendnow/types"
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
import { useContactBulkJobPoll } from "@/hooks/useContactBulkJobPoll"

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

const CONTACTS_PAGE_SIZE = 100
const ADD_MEMBERS_BATCH = 200
const GROUP_MODAL_ADD_TOAST_ID = "portal-group-modal-add-members"
const GROUP_MEMBER_BULK_REMOVE_TOAST_ID = "portal-group-members-bulk-remove"

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
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bulkJobPoll = useContactBulkJobPoll()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadFirstPage = useCallback(async () => {
    setLoadingContacts(true)
    setError(null)
    try {
      const data = await apiClient.contacts.list({
        limit: CONTACTS_PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        sort: "name_asc",
      })
      setContacts(data.contacts)
      setNextCursor(data.nextCursor ?? null)
      setHasMore(data.hasMore)
    } catch {
      setContacts([])
      setNextCursor(null)
      setHasMore(false)
    } finally {
      setLoadingContacts(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    void loadFirstPage()
  }, [loadFirstPage])

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await apiClient.contacts.list({
        limit: CONTACTS_PAGE_SIZE,
        cursor: nextCursor,
        search: debouncedSearch.trim() || undefined,
        sort: "name_asc",
      })
      setContacts((prev) => [...prev, ...data.contacts])
      setNextCursor(data.nextCursor ?? null)
      setHasMore(data.hasMore)
    } catch {
      /* keep current list */
    } finally {
      setLoadingMore(false)
    }
  }, [debouncedSearch, hasMore, loadingMore, nextCursor])

  const visible = contacts.filter((c) => !existingMemberIds.has(c.id))
  const visibleIds = useMemo(() => visible.map((c) => c.id), [visible])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))

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
    const ids = [...selected]
    let totalAdded = 0
    let aborted = false
    let fatalError = false
    let anyAsyncBulk = false
    const BULK_ID = GROUP_MODAL_ADD_TOAST_ID
    try {
      for (let i = 0; i < ids.length; i += ADD_MEMBERS_BATCH) {
        const chunk = ids.slice(i, i + ADD_MEMBERS_BATCH)
        const hasMoreAfterThis = i + ADD_MEMBERS_BATCH < ids.length
        const res = await apiClient.contactGroups.addMembers(groupId, chunk)
        if (isContactBulkJobAccepted(res)) {
          anyAsyncBulk = true
          toast.loading(gCopy.addMembersBulkRunning, { id: BULK_ID })
          setAdding(false)
          await new Promise<void>((resolve) => {
            bulkJobPoll.start(
              res.jobId,
              {
                onProgress: (p) => {
                  toast.loading(
                    gCopy.addMembersBulkProgress
                      .replace("{{percent}}", String(p.progress))
                      .replace("{{status}}", p.status),
                    { id: BULK_ID },
                  )
                },
                onComplete: (progress) => {
                  const st = (progress.status ?? "").toLowerCase()
                  if (st === "failed" || st === "error") {
                    setError(gCopy.addMembersFailed)
                    toast.error(gCopy.addMembersFailed, { id: BULK_ID })
                    aborted = true
                    fatalError = true
                  } else if (st === "cancelled" || st === "canceled") {
                    toast.info(gCopy.addMembersBulkEndedCancelled, { id: BULK_ID })
                    aborted = true
                  } else {
                    const added = progress.summary?.added ?? progress.processedCount ?? chunk.length
                    totalAdded += added
                    if (hasMoreAfterThis) {
                      toast.loading(gCopy.addMembersBulkRunning, { id: BULK_ID })
                    }
                  }
                  resolve()
                },
              },
              { variant: "groupAdd" },
            )
          })
          if (aborted) {
            if (!fatalError) {
              onSuccess(totalAdded)
              onClose()
            }
            return
          }
          setAdding(true)
        } else {
          totalAdded += res.added
        }
      }
      if (totalAdded > 0) {
        const tpl = totalAdded === 1 ? gCopy.addMembersSuccessOne : gCopy.addMembersSuccessMany
        if (anyAsyncBulk) {
          toast.success(tpl.replace("{{count}}", String(totalAdded)), { id: BULK_ID })
        } else {
          toast.success(tpl.replace("{{count}}", String(totalAdded)))
        }
      } else if (anyAsyncBulk && !fatalError && !aborted) {
        toast.dismiss(BULK_ID)
      }
      onSuccess(totalAdded)
      onClose()
    } catch {
      setError(gCopy.addMembersFailed)
    } finally {
      setAdding(false)
    }
  }

  const handleCancelBulkAdd = async () => {
    try {
      await bulkJobPoll.cancel()
      toast.success(gCopy.addMembersBulkCancelled)
      onSuccess(0)
      onClose()
    } catch {
      toast.error(gCopy.addMembersBulkCancelFailed)
    }
  }

  const handleModalClose = () => {
    if (bulkJobPoll.activeJobId) return
    onClose()
  }

  return (
    <Modal open onClose={handleModalClose} title={gCopy.addMembersTitle} maxWidth="max-w-lg">
      <div className="space-y-4">
        {bulkJobPoll.activeJobId ? (
          <div className="space-y-2 rounded-xl border border-border-strong bg-bg-subtle p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text">{gCopy.addMembersBulkRunning}</p>
                <p className="text-xs text-text-muted mt-0.5 font-mono">
                  {gCopy.addMembersBulkProgress
                    .replace("{{percent}}", String(bulkJobPoll.snapshot.progress))
                    .replace("{{status}}", bulkJobPoll.snapshot.status)}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                loading={bulkJobPoll.cancelling}
                onClick={() => void handleCancelBulkAdd()}
              >
                {gCopy.addMembersBulkCancel}
              </Button>
            </div>
            <Link
              href={`/contacts/bulk-jobs/${bulkJobPoll.activeJobId}`}
              className="inline-block text-xs font-medium text-primary-ink hover:underline"
            >
              {copy.contacts.trackBulkJobLink}
            </Link>
          </div>
        ) : null}
        <Input
          placeholder={gCopy.searchContactsPlaceholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          autoFocus
        />
        {visible.length > 0 && !loadingContacts ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelected((prev) => {
                  const next = new Set(prev)
                  if (allVisibleSelected) {
                    visibleIds.forEach((id) => next.delete(id))
                  } else {
                    visibleIds.forEach((id) => next.add(id))
                  }
                  return next
                })
              }}
            >
              {allVisibleSelected ? gCopy.deselectAllPick : gCopy.selectAllVisible}
            </Button>
          </div>
        ) : null}
        <div className="max-h-72 overflow-y-auto border border-border rounded-xl divide-y divide-border">
          {loadingContacts ? (
            <div className="p-4 text-sm text-text-secondary text-center">{gCopy.loading}</div>
          ) : visible.length === 0 ? (
            <div className="p-4 text-sm text-text-secondary text-center">{gCopy.noContactsAvailable}</div>
          ) : (
            visible.map((c) => (
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
        {hasMore && !loadingContacts && (
          <div className="flex justify-center">
            <Button variant="secondary" size="sm" loading={loadingMore} onClick={() => void loadMore()}>
              {gCopy.loadMore}
            </Button>
          </div>
        )}
        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={handleModalClose} disabled={!!bulkJobPoll.activeJobId}>
            {gCopy.cancel}
          </Button>
          <Button
            variant="primary"
            loading={adding}
            disabled={selected.size === 0 || adding || !!bulkJobPoll.activeJobId}
            onClick={() => void handleAdd()}
          >
            {gCopy.addContacts} {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const REMOVE_MEMBERS_BATCH = 200

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ContactGroupDetailPage() {
  const { copy } = usePortalLocale()
  const cCopy = copy.contacts
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
  const [memberSearchInput, setMemberSearchInput] = useState("")
  const [debouncedMemberSearch, setDebouncedMemberSearch] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false)
  const [addMembersOpen, setAddMembersOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ContactGroupMember | null>(null)
  const [removing, setRemoving] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
  const [bulkRemoveConfirmOpen, setBulkRemoveConfirmOpen] = useState(false)
  const [bulkRemoving, setBulkRemoving] = useState(false)
  const memberBulkPoll = useContactBulkJobPoll()

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

  useEffect(() => {
    void fetchGroup()
  }, [fetchGroup])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMemberSearch(memberSearchInput), 300)
    return () => clearTimeout(t)
  }, [memberSearchInput])

  const fetchMembersFirstPage = useCallback(async () => {
    setLoadingMembers(true)
    try {
      const data = await apiClient.contactGroups.listMembers(groupId, {
        limit: 50,
        search: debouncedMemberSearch.trim() || undefined,
      })
      setMembers(data.contacts)
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
      setTotal(data.total)
    } catch {
      toast.error(gCopy.saveFailed)
    } finally {
      setLoadingMembers(false)
    }
  }, [groupId, debouncedMemberSearch, gCopy.saveFailed])

  useEffect(() => {
    void fetchMembersFirstPage()
  }, [fetchMembersFirstPage])

  useEffect(() => {
    setSelectedMemberIds(new Set())
  }, [debouncedMemberSearch])

  const handleLoadMore = async () => {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const data = await apiClient.contactGroups.listMembers(groupId, {
        limit: 50,
        cursor: nextCursor,
        search: debouncedMemberSearch.trim() || undefined,
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
      setSelectedMemberIds((prev) => {
        const n = new Set(prev)
        n.delete(removeTarget.id)
        return n
      })
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

  const memberRowIds = useMemo(() => members.map((m) => m.id), [members])
  const allMembersSelected =
    memberRowIds.length > 0 && memberRowIds.every((id) => selectedMemberIds.has(id))

  const toggleSelectMember = (id: string) => {
    if (memberBulkPoll.activeJobId) return
    setSelectedMemberIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const toggleSelectAllMembers = () => {
    if (memberBulkPoll.activeJobId) return
    if (allMembersSelected) setSelectedMemberIds(new Set())
    else setSelectedMemberIds(new Set(memberRowIds))
  }

  const handleCancelMemberBulk = async () => {
    try {
      await memberBulkPoll.cancel()
      toast.success(gCopy.addMembersBulkCancelled)
    } catch {
      toast.error(gCopy.addMembersBulkCancelFailed)
    }
    setSelectedMemberIds(new Set())
    void fetchMembersFirstPage()
    void fetchGroup()
  }

  const executeBulkRemove = async () => {
    const ids = Array.from(selectedMemberIds)
    if (ids.length === 0) return
    setBulkRemoveConfirmOpen(false)
    setBulkRemoving(true)
    let totalRemoved = 0
    let aborted = false
    let fatalError = false
    let anyAsyncBulk = false
    const BULK_ID = GROUP_MEMBER_BULK_REMOVE_TOAST_ID
    try {
      for (let i = 0; i < ids.length; i += REMOVE_MEMBERS_BATCH) {
        const chunk = ids.slice(i, i + REMOVE_MEMBERS_BATCH)
        const hasMoreAfterThis = i + REMOVE_MEMBERS_BATCH < ids.length
        const res = await apiClient.contactGroups.removeMembers(groupId, chunk)
        if (isContactBulkJobAccepted(res)) {
          anyAsyncBulk = true
          toast.loading(gCopy.removeMembersBulkRunning, { id: BULK_ID })
          setBulkRemoving(false)
          await new Promise<void>((resolve) => {
            memberBulkPoll.start(
              res.jobId,
              {
                onProgress: (p) => {
                  toast.loading(
                    gCopy.removeMembersBulkProgress
                      .replace("{{percent}}", String(p.progress))
                      .replace("{{status}}", p.status),
                    { id: BULK_ID },
                  )
                },
                onComplete: (progress) => {
                  const st = (progress.status ?? "").toLowerCase()
                  if (st === "failed" || st === "error") {
                    toast.error(gCopy.removeMemberFailed, { id: BULK_ID })
                    aborted = true
                    fatalError = true
                  } else if (st === "cancelled" || st === "canceled") {
                    toast.info(gCopy.addMembersBulkEndedCancelled, { id: BULK_ID })
                    aborted = true
                  } else {
                    const rm =
                      progress.summary?.removed ?? progress.processedCount ?? chunk.length
                    totalRemoved += rm
                    if (hasMoreAfterThis) {
                      toast.loading(gCopy.removeMembersBulkRunning, { id: BULK_ID })
                    }
                  }
                  resolve()
                },
              },
              { variant: "groupRemove" },
            )
          })
          if (aborted) {
            setSelectedMemberIds(new Set())
            void fetchMembersFirstPage()
            void fetchGroup()
            return
          }
          setBulkRemoving(true)
        } else {
          totalRemoved += res.removed
        }
      }
      if (totalRemoved > 0) {
        if (anyAsyncBulk) {
          toast.success(
            gCopy.removeMembersBulkDone.replace("{{count}}", String(totalRemoved)),
            { id: BULK_ID },
          )
        } else {
          toast.success(gCopy.removeMembersBulkDone.replace("{{count}}", String(totalRemoved)))
        }
      } else if (anyAsyncBulk && !fatalError && !aborted) {
        toast.dismiss(BULK_ID)
      }
      setSelectedMemberIds(new Set())
      void fetchMembersFirstPage()
      void fetchGroup()
    } catch {
      toast.error(gCopy.removeMemberFailed)
    } finally {
      setBulkRemoving(false)
    }
  }

  const memberIds = new Set(members.map((m) => m.id))

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
          value={memberSearchInput}
          onChange={(e) => setMemberSearchInput(e.target.value)}
          placeholder={gCopy.searchMembersPlaceholder}
          className="flex-1 min-w-0 sm:max-w-sm"
        />
        <Button variant="primary" onClick={() => setAddMembersOpen(true)}>
          <UserAdd01Icon className="w-4 h-4" />
          {gCopy.addContacts}
        </Button>
      </div>

      {memberBulkPoll.activeJobId ? (
        <div className="space-y-2 rounded-xl border border-border-strong bg-bg-subtle p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text">{gCopy.removeMembersBulkRunning}</p>
              <p className="text-xs text-text-muted mt-0.5 font-mono">
                {gCopy.removeMembersBulkProgress
                  .replace("{{percent}}", String(memberBulkPoll.snapshot.progress))
                  .replace("{{status}}", memberBulkPoll.snapshot.status)}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              loading={memberBulkPoll.cancelling}
              onClick={() => void handleCancelMemberBulk()}
            >
              {gCopy.addMembersBulkCancel}
            </Button>
          </div>
          <Link
            href={`/contacts/bulk-jobs/${memberBulkPoll.activeJobId}`}
            className="inline-block text-xs font-medium text-primary-ink hover:underline"
          >
            {cCopy.trackBulkJobLink}
          </Link>
        </div>
      ) : null}

      {selectedMemberIds.size > 0 && !memberBulkPoll.activeJobId ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 bg-primary-subtle border border-primary/30 rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <CheckmarkCircle01Icon className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-text">
              {renderWithStrongCount(
                selectedMemberIds.size === 1 ? gCopy.bulkRemoveSelectedOne : gCopy.bulkRemoveSelectedMany,
                selectedMemberIds.size,
              )}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={bulkRemoving}
              onClick={() => setSelectedMemberIds(new Set())}
            >
              {cCopy.deselectAll}
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={bulkRemoving}
              onClick={() => setBulkRemoveConfirmOpen(true)}
            >
              {gCopy.bulkRemoveButton}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Members table */}
      <Card>
        {loadingMembers && members.length === 0 ? (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4 w-10">
                      <input
                        type="checkbox"
                        disabled
                        className="h-4 w-4 rounded border-border-strong accent-primary cursor-not-allowed"
                      />
                    </th>
                    {[gCopy.table.name, gCopy.table.phone, gCopy.table.tags, gCopy.table.addedAt, ""].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{[1, 2, 3].map((i) => <SkeletonTableRow key={i} cols={6} />)}</tbody>
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
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4 w-10">
                      <input
                        type="checkbox"
                        checked={allMembersSelected}
                        onChange={toggleSelectAllMembers}
                        disabled={!!memberBulkPoll.activeJobId || bulkRemoving || loadingMembers}
                        className="h-4 w-4 rounded border-border-strong accent-primary cursor-pointer disabled:cursor-not-allowed"
                      />
                    </th>
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
                          disabled={!!memberBulkPoll.activeJobId || bulkRemoving}
                          className="h-4 w-4 rounded border-border-strong accent-primary cursor-pointer disabled:cursor-not-allowed"
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
                <div key={member.id} className="py-3 flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.has(member.id)}
                    onChange={() => toggleSelectMember(member.id)}
                    disabled={!!memberBulkPoll.activeJobId || bulkRemoving}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-border-strong accent-primary cursor-pointer disabled:cursor-not-allowed"
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
            fetchMembersFirstPage()
          }}
          onClose={() => setAddMembersOpen(false)}
        />
      )}

      {/* Bulk remove confirmation */}
      <Modal
        open={bulkRemoveConfirmOpen}
        onClose={() => setBulkRemoveConfirmOpen(false)}
        title={gCopy.bulkRemoveConfirmTitle}
      >
        <p className="text-sm text-text-body mb-6">{gCopy.bulkRemoveConfirmIntro}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setBulkRemoveConfirmOpen(false)}>{gCopy.cancel}</Button>
          <Button variant="danger" loading={bulkRemoving} onClick={() => void executeBulkRemove()}>
            {gCopy.bulkRemoveButton}
          </Button>
        </div>
      </Modal>

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
