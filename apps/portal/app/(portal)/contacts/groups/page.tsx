"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useContactGroups } from "@/hooks/useContactGroups"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { ContactGroup } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Alert from "@/components/ui/Alert"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { UserMultiple02Icon, ArrowLeft01Icon } from "hugeicons-react"

const PRESET_COLORS = ["#FFD600", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899"]

// ─── Group Modal ───────────────────────────────────────────────────────────────

function GroupModal({
  mode,
  group,
  onSuccess,
  onClose,
}: {
  mode: "create" | "edit"
  group?: ContactGroup
  onSuccess: (g: ContactGroup) => void
  onClose: () => void
}) {
  const [name, setName] = useState(group?.name ?? "")
  const [description, setDescription] = useState(group?.description ?? "")
  const [color, setColor] = useState(group?.color ?? PRESET_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "create") {
        const created = await apiClient.contactGroups.create({ name: name.trim(), description: description.trim() || undefined, color })
        onSuccess(created)
        toast.success("Groupe créé")
      } else {
        const updated = await apiClient.contactGroups.update(group!.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        })
        onSuccess(updated)
        toast.success("Groupe mis à jour")
      }
      onClose()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "MAX_CONTACT_GROUPS_REACHED") {
          setError("Limite de groupes atteinte. Mettez à niveau votre plan.")
        } else if (err.code === "CONFLICT") {
          setError(`Un groupe nommé "${name.trim()}" existe déjà.`)
        } else {
          setError("Impossible d'enregistrer le groupe.")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={mode === "create" ? "Nouveau groupe" : "Modifier le groupe"}
    >
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
            placeholder="Description du groupe..."
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-150"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-body mb-2">
            Couleur
          </label>
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
              title="Couleur personnalisée"
            />
          </div>
        </div>
        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" loading={loading}>
            {mode === "create" ? "Créer le groupe" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Delete Group Modal ────────────────────────────────────────────────────────

function DeleteGroupModal({
  groupName,
  contactCount,
  loading,
  onConfirm,
  onCancel,
}: {
  groupName: string
  contactCount: number
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open onClose={onCancel} title="Supprimer le groupe">
      <p className="text-sm text-text-body mb-2">
        Supprimer <strong className="text-text">{groupName}</strong> ?
      </p>
      <p className="text-sm text-text-secondary mb-6">
        Les {contactCount} contact{contactCount !== 1 ? "s" : ""} dans ce groupe ne seront PAS supprimés — uniquement le groupe.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>Supprimer</Button>
      </div>
    </Modal>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ContactGroupsPage() {
  const router = useRouter()
  const { groups, total, loading, addGroup, updateGroup, removeGroup } = useContactGroups()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ContactGroup | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContactGroup | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.contactGroups.delete(deleteTarget.id)
      removeGroup(deleteTarget.id)
      toast.success("Groupe supprimé")
      setDeleteTarget(null)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "NOT_FOUND") {
        toast.error("Groupe introuvable.")
        setDeleteTarget(null)
      } else {
        toast.error("Impossible de supprimer le groupe.")
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title="Groupes de contacts"
        description={`${total} groupe${total !== 1 ? "s" : ""}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/contacts")}>
              <ArrowLeft01Icon className="w-4 h-4" />
              Retour
            </Button>
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              Nouveau groupe
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<UserMultiple02Icon className="w-8 h-8" />}
          title="Aucun groupe pour l'instant."
          description="Créez votre premier groupe pour organiser vos contacts."
          ctaLabel="Nouveau groupe"
          onCta={() => setCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: group.color ? `${group.color}20` : "#F3F4F6" }}
                >
                  <UserMultiple02Icon
                    className="w-5 h-5"
                    style={{ color: group.color ?? "#6B7280" }}
                  />
                </div>
                <span className="text-xs text-text-muted">{formatDate(group.createdAt)}</span>
              </div>
              <h3 className="text-sm font-semibold text-text mb-1 truncate">{group.name}</h3>
              {group.description && (
                <p className="text-xs text-text-secondary mb-2 line-clamp-2">{group.description}</p>
              )}
              <p className="text-xs text-text-muted mb-4">
                {group.contactCount} contact{group.contactCount !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => router.push(`/contacts/groups/${group.id}`)}
                >
                  Voir
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setEditTarget(group)}>
                  Modifier
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteTarget(group)}>
                  Supprimer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {createOpen && (
        <GroupModal
          mode="create"
          onSuccess={addGroup}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {editTarget && (
        <GroupModal
          mode="edit"
          group={editTarget}
          onSuccess={(g) => { updateGroup(g); setEditTarget(null) }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteGroupModal
          groupName={deleteTarget.name}
          contactCount={deleteTarget.contactCount}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </motion.div>
  )
}
