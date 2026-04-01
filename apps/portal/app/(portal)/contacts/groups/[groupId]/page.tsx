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
} from "hugeicons-react"

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
      toast.success("Groupe mis à jour")
      onClose()
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "CONFLICT") {
        setError(`Un groupe nommé "${name.trim()}" existe déjà.`)
      } else {
        setError("Impossible de mettre à jour le groupe.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Modifier le groupe">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          maxLength={100}
        />
        <div>
          <label className="block text-sm font-medium text-text-body mb-1.5">
            Description (optionnel)
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
          <label className="block text-sm font-medium text-text-body mb-2">Couleur</label>
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
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" loading={loading}>Enregistrer</Button>
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
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const res = await apiClient.contactGroups.addMembers(groupId, [...selected])
      toast.success(`${res.added} contact${res.added !== 1 ? "s" : ""} ajouté${res.added !== 1 ? "s" : ""}`)
      onSuccess(res.added)
      onClose()
    } catch {
      setError("Impossible d'ajouter les contacts.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Ajouter des contacts au groupe" maxWidth="max-w-lg">
      <div className="space-y-4">
        <Input
          placeholder="Rechercher par nom ou numéro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="max-h-64 overflow-y-auto border border-border rounded-xl divide-y divide-border">
          {loadingContacts ? (
            <div className="p-4 text-sm text-text-secondary text-center">Chargement…</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-text-secondary text-center">Aucun contact disponible.</div>
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
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={adding} disabled={selected.size === 0} onClick={handleAdd}>
            Ajouter {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ContactGroupDetailPage() {
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
        toast.error("Groupe introuvable.")
        router.push("/contacts/groups")
      }
    } finally {
      setLoadingGroup(false)
    }
  }, [groupId, router])

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
      toast.error("Impossible de charger les membres.")
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
      toast.success("Contact retiré du groupe")
      setRemoveTarget(null)
    } catch {
      toast.error("Impossible de retirer le contact.")
    } finally {
      setRemoving(false)
    }
  }

  const handleDeleteGroup = async () => {
    setDeletingGroup(true)
    try {
      await apiClient.contactGroups.delete(groupId)
      toast.success("Groupe supprimé")
      router.push("/contacts/groups")
    } catch {
      toast.error("Impossible de supprimer le groupe.")
      setDeletingGroup(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    const toastId = toast.loading("Export en cours…")
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
      toast.error("Impossible d'exporter le groupe.")
    } finally {
      setExporting(false)
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
        description={`${total} contact${total !== 1 ? "s" : ""}${group.description ? ` · ${group.description}` : ""}`}
        action={
          <div className="flex items-center flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/contacts/groups")}>
              <ArrowLeft01Icon className="w-4 h-4" />
              Retour
            </Button>
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: group.color ?? "#6B7280" }}
            />
            <Button variant="secondary" loading={exporting} onClick={handleExport}>
              <Download01Icon className="w-4 h-4" />
              Exporter
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Modifier
            </Button>
            <Button variant="danger" onClick={() => setDeleteGroupOpen(true)}>
              Supprimer
            </Button>
          </div>
        }
      />

      {/* Search + Add */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher dans les membres..."
          className="flex-1 min-w-0 sm:max-w-sm"
        />
        <Button variant="primary" onClick={() => setAddMembersOpen(true)}>
          <UserAdd01Icon className="w-4 h-4" />
          Ajouter des contacts
        </Button>
      </div>

      {/* Members table */}
      <Card>
        {loadingMembers && members.length === 0 ? (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Nom", "Téléphone", "Tags", "Ajouté le", ""].map((h) => (
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
            title="Aucun contact dans ce groupe."
            description="Ajoutez des contacts pour commencer."
            ctaLabel="Ajouter des contacts"
            onCta={() => setAddMembersOpen(true)}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Nom", "Téléphone", "Tags", "Ajouté le", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
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
                        <Button size="sm" variant="ghost" onClick={() => setRemoveTarget(member)}>Retirer</Button>
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
                  <Button size="sm" variant="ghost" onClick={() => setRemoveTarget(member)}>Retirer</Button>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" loading={loadingMore} onClick={handleLoadMore}>
                  Charger plus
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
        <Modal open onClose={() => setDeleteGroupOpen(false)} title="Supprimer le groupe">
          <p className="text-sm text-text-body mb-2">
            Supprimer <strong className="text-text">{group.name}</strong> ?
          </p>
          <p className="text-sm text-text-secondary mb-6">
            Les {group.contactCount} contact{group.contactCount !== 1 ? "s" : ""} dans ce groupe ne seront PAS supprimés — uniquement le groupe.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteGroupOpen(false)}>Annuler</Button>
            <Button variant="danger" loading={deletingGroup} onClick={handleDeleteGroup}>Supprimer</Button>
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
      <Modal open={!!removeTarget} onClose={() => setRemoveTarget(null)} title="Retirer du groupe">
        {removeTarget && (
          <>
            <p className="text-sm text-text-body mb-6">
              Retirer <strong className="text-text">{removeTarget.name}</strong> du groupe{" "}
              <strong className="text-text">{group.name}</strong> ?
              Le contact ne sera pas supprimé.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRemoveTarget(null)}>Annuler</Button>
              <Button variant="danger" loading={removing} onClick={handleRemoveMember}>Retirer</Button>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  )
}
