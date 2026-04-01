"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useContacts } from "@/hooks/useContacts"
import { useContactGroups } from "@/hooks/useContactGroups"
import { useContactImports } from "@/hooks/useContactImports"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { formatDate } from "@/lib/format"
import type { Contact, ContactGroup, SubscriptionResponse, ImportResult } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Alert from "@/components/ui/Alert"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonTableRow } from "@/components/ui/Skeleton"
import {
  UserGroupIcon,
  Upload01Icon,
  Download01Icon,
  UserMultiple02Icon,
  InformationCircleIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
} from "hugeicons-react"

// ─── Contact Modal ─────────────────────────────────────────────────────────────

interface ContactFormState {
  name: string
  phone: string
  tags: string
}

function ContactModal({
  open,
  mode,
  contact,
  onSuccess,
  onClose,
}: {
  open: boolean
  mode: "create" | "edit"
  contact?: Contact
  onSuccess: (c: Contact) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<ContactFormState>({
    name: contact?.name ?? "",
    phone: contact?.phone ?? "",
    tags: contact?.tags.join(", ") ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }
      let result: Contact
      if (mode === "create") {
        result = await apiClient.contacts.create(payload)
        toast.success("Contact ajouté")
      } else {
        result = await apiClient.contacts.update(contact!.id, payload)
        toast.success("Contact mis à jour")
      }
      onSuccess(result)
      onClose()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "CONFLICT") {
          setError("Un contact avec ce numéro existe déjà.")
        } else {
          setError("Impossible d'enregistrer le contact.")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Ajouter un contact" : "Modifier le contact"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          autoFocus
        />
        <Input
          label="Téléphone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="+22912345678"
          required
        />
        <Input
          label="Tags (optionnel)"
          value={form.tags}
          onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
          placeholder="vip, newsletter"
          hint="Séparés par des virgules"
        />
        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {mode === "create" ? "Ajouter le contact" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Import Modal ──────────────────────────────────────────────────────────────

type ImportStep = "upload" | "preview" | "result"

function ImportModal({
  groups,
  onSuccess,
  onClose,
}: {
  groups: ContactGroup[]
  onSuccess: (result: ImportResult) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<ImportStep>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [groupId, setGroupId] = useState("")
  const [previewRows, setPreviewRows] = useState<string[][]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  const parsePreview = useCallback((f: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((l) => l.trim())
      setTotalRows(Math.max(0, lines.length - 1))
      const rows = lines.slice(0, 4).map((l) => l.split(","))
      setPreviewRows(rows)
    }
    reader.readAsText(f)
  }, [])

  const handleFileChange = (f: File) => {
    if (!f.name.endsWith(".csv")) {
      setError("Seuls les fichiers .csv sont acceptés.")
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Le fichier dépasse 5MB.")
      return
    }
    setError(null)
    setFile(f)
    parsePreview(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFileChange(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setError(null)
    try {
      const res = await apiClient.contacts.import(file, groupId || undefined)
      setResult(res)
      setStep("result")
      onSuccess(res)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "CSV_INVALID_FORMAT") {
          setError("Fichier CSV invalide. Vérifiez les en-têtes et l'encodage.")
        } else if (err.code === "CSV_TOO_LARGE") {
          setError("Fichier trop grand. Max 5MB et 10 000 lignes.")
        } else if (err.code === "NOT_FOUND") {
          setError("Le groupe sélectionné est introuvable.")
        } else {
          setError("Impossible d'importer le fichier.")
        }
      }
    } finally {
      setImporting(false)
    }
  }

  const downloadSample = () => {
    const csv = "phone,name,tags\n+22901000000,Kouassi Amara,vip|benin\n+22501000000,Fatou Diallo,client\n+33612345678,Jean Dupont,"
    const blob = new Blob([csv], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "sample-contacts.csv"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <Modal open onClose={onClose} title="Importer des contacts CSV">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(["upload", "preview", "result"] as ImportStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={[
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
              step === s ? "bg-primary text-white" : "bg-bg-muted text-text-secondary",
            ].join(" ")}>
              {i + 1}
            </div>
            {i < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
        <span className="text-xs text-text-secondary ml-2">
          {step === "upload" ? "Choisir le fichier" : step === "preview" ? "Aperçu" : "Résultat"}
        </span>
      </div>

      {step === "upload" && (
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => document.getElementById("csv-file-input")?.click()}
          >
            <Upload01Icon className="w-8 h-8 text-text-muted mx-auto mb-3" />
            {file ? (
              <p className="text-sm font-medium text-text">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-text">Glissez un fichier CSV ou cliquez</p>
                <p className="text-xs text-text-muted mt-1">Max 5MB · Format .csv uniquement</p>
              </>
            )}
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }}
            />
          </div>

          <button
            type="button"
            onClick={downloadSample}
            className="text-xs text-primary-ink hover:text-text hover:underline"
          >
            Télécharger un exemple CSV
          </button>

          <div>
            <label className="block text-sm font-medium text-text-body mb-1.5">
              Assigner à un groupe (optionnel)
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Aucun groupe</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-text-muted">
            Format attendu : <code className="font-mono bg-bg-subtle px-1 rounded">phone,name,tags</code>
          </p>

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button variant="primary" disabled={!file} onClick={() => file && setStep("preview")}>
              Suivant
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-body">
              <strong>{totalRows}</strong> ligne{totalRows !== 1 ? "s" : ""} détectée{totalRows !== 1 ? "s" : ""}
            </p>
            {totalRows > 500 && (
              <div className="flex items-center gap-1.5 text-xs text-warning">
                <InformationCircleIcon className="w-4 h-4" />
                Fichier volumineux : l&apos;import tournera en arrière-plan
              </div>
            )}
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-xs">
              <tbody>
                {previewRows.map((row, ri) => (
                  <tr key={ri} className={ri === 0 ? "bg-bg-subtle font-semibold" : "border-t border-border"}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-text-body truncate max-w-[150px]">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setStep("upload")}>Retour</Button>
            <Button variant="primary" loading={importing} onClick={handleImport}>
              Importer
            </Button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-4">
          {result.mode === "sync" ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckmarkCircle01Icon className="w-4 h-4" />
                  {result.importedCount} contact{(result.importedCount ?? 0) !== 1 ? "s" : ""} importé{(result.importedCount ?? 0) !== 1 ? "s" : ""}
                </div>
                {(result.updatedCount ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-text-body">
                    <InformationCircleIcon className="w-4 h-4 text-primary" />
                    {result.updatedCount} mis à jour
                  </div>
                )}
                {(result.invalidCount ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-error">
                    <AlertCircleIcon className="w-4 h-4" />
                    {result.invalidCount} invalide{(result.invalidCount ?? 0) !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {(result.errors?.length ?? 0) > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowErrors((v) => !v)}
                    className="text-xs text-primary-ink hover:text-text hover:underline"
                  >
                    {showErrors ? "Masquer" : "Voir"} les erreurs ({result.errors!.length})
                  </button>
                  {showErrors && (
                    <div className="mt-2 border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-bg-subtle border-b border-border">
                            <th className="px-3 py-2 text-left text-text-secondary">Ligne</th>
                            <th className="px-3 py-2 text-left text-text-secondary">Téléphone</th>
                            <th className="px-3 py-2 text-left text-text-secondary">Raison</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.errors!.map((e, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="px-3 py-2 text-text-muted">{e.line}</td>
                              <td className="px-3 py-2 font-mono text-text-body">{e.phone}</td>
                              <td className="px-3 py-2 text-text-secondary">{e.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center py-4 text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center">
                <Upload01Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-text">Import en cours…</p>
              <p className="text-xs text-text-secondary">
                Import ID : <code className="font-mono">{result.importId}</code>
              </p>
              <p className="text-xs text-text-secondary">
                Vous pouvez fermer cette fenêtre. Suivez le statut dans l&apos;onglet Imports.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button variant="primary" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Import Status Badge ───────────────────────────────────────────────────────

const IMPORT_STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "error"> = {
  pending:    "neutral",
  processing: "blue",
  done:       "success",
  failed:     "error",
}

const IMPORT_STATUS_LABEL: Record<string, string> = {
  pending:    "En attente",
  processing: "En cours",
  done:       "Terminé",
  failed:     "Échoué",
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type Tab = "contacts" | "imports"

export default function ContactsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { contacts, loading, addContact, updateContact, removeContact } = useContacts()
  const { groups } = useContactGroups()
  const { imports, loading: importsLoading } = useContactImports()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [tab, setTab] = useState<Tab>("contacts")
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Contact | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Contact groups lookup map
  const [contactGroups, setContactGroups] = useState<Map<string, Array<{ id: string; name: string; color?: string }>>>(new Map())

  useEffect(() => {
    apiClient.billing.getSubscription().then(setSubscription).catch(() => {})
  }, [])

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "")
  }, [searchParams])

  // Load groups for each contact (batch)
  useEffect(() => {
    if (contacts.length === 0) return
    const map = new Map<string, Array<{ id: string; name: string; color?: string }>>()
    contacts.forEach((c) => {
      apiClient.contacts.getGroups(c.id)
        .then((res) => {
          map.set(c.id, res.groups)
          setContactGroups(new Map(map))
        })
        .catch(() => {})
    })
  }, [contacts])

  const maxContactGroups = subscription?.subscription?.plan?.limits?.maxContactGroups ?? -1
  const groupCount = groups.length

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts
    const q = search.toLowerCase()
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }, [contacts, search])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
    try {
      await apiClient.contacts.delete(deleteTarget.id)
      removeContact(deleteTarget.id)
      toast.success("Contact supprimé")
      setDeleteTarget(null)
    } catch {
      toast.error("Impossible de supprimer le contact.")
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    const toastId = toast.loading("Export en cours…")
    try {
      const { blob, filename } = await apiClient.contacts.export()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
      toast.dismiss(toastId)
    } catch {
      toast.dismiss(toastId)
      toast.error("Impossible d'exporter les contacts.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title="Contacts"
        description={`${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
        action={
          <div className="flex items-center flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/contacts/groups")}
            >
              <UserMultiple02Icon className="w-4 h-4" />
              Groupes
              {maxContactGroups !== -1 && (
                <span className="ml-1 text-xs text-text-muted">
                  {groupCount}/{maxContactGroups}
                </span>
              )}
            </Button>
            <Button variant="secondary" loading={exporting} onClick={handleExport}>
              <Download01Icon className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              <Upload01Icon className="w-4 h-4" />
              Import CSV
            </Button>
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              Ajouter un contact
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-muted rounded-xl w-fit mb-5">
        {([
          { value: "contacts", label: "Contacts" },
          { value: "imports",  label: "Imports" },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={[
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-100 cursor-pointer",
              tab === value
                ? "bg-bg text-text border border-border shadow-sm"
                : "text-text-secondary hover:text-text",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "contacts" && (
        <>
          <div className="mb-5">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou numéro..."
              className="max-w-sm"
            />
          </div>

          <Card>
            {loading ? (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Nom", "Téléphone", "Tags", "Groupes", "Créé le", ""].map((h) => (
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
                        <div className="h-4 w-32 bg-bg-muted rounded" />
                        <div className="h-3 w-24 bg-bg-muted rounded" />
                      </div>
                      <div className="h-7 w-16 bg-bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              </>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<UserGroupIcon className="w-8 h-8" />}
                title={search ? "Aucun contact trouvé." : "Aucun contact pour l'instant."}
                description={search ? "" : "Ajoutez votre premier contact."}
                ctaLabel={search ? undefined : "Ajouter un contact"}
                onCta={search ? undefined : () => setCreateOpen(true)}
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Nom", "Téléphone", "Tags", "Groupes", "Créé le", ""].map((h) => (
                          <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((contact) => {
                        const cGroups = contactGroups.get(contact.id) ?? []
                        return (
                          <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                            <td className="py-3 pr-4 text-sm font-semibold text-text">{contact.name}</td>
                            <td className="py-3 pr-4 text-sm font-mono text-text-body whitespace-nowrap">{contact.phone}</td>
                            <td className="py-3 pr-4">
                              <div className="flex flex-wrap gap-1">
                                {contact.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="neutral">{tag}</Badge>
                                ))}
                                {contact.tags.length > 3 && <Badge variant="neutral">+{contact.tags.length - 3}</Badge>}
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex flex-wrap gap-1">
                                {cGroups.slice(0, 2).map((g) => (
                                  <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => router.push(`/contacts/groups/${g.id}`)}
                                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition-colors hover:opacity-80 whitespace-nowrap"
                                    style={{ backgroundColor: g.color ? `${g.color}20` : "#F3F4F6", color: g.color ?? "#6B7280" }}
                                  >
                                    {g.name}
                                  </button>
                                ))}
                                {cGroups.length > 2 && <span className="text-xs text-text-muted">+{cGroups.length - 2}</span>}
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-sm text-text-muted whitespace-nowrap">{formatDate(contact.createdAt)}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="secondary" onClick={() => setEditTarget(contact)}>Modifier</Button>
                                <Button size="sm" variant="danger" loading={deleting === contact.id} onClick={() => setDeleteTarget(contact)}>Supprimer</Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden divide-y divide-border">
                  {filtered.map((contact) => {
                    const cGroups = contactGroups.get(contact.id) ?? []
                    return (
                      <div key={contact.id} className="py-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text truncate">{contact.name}</p>
                            <p className="text-xs font-mono text-text-muted">{contact.phone}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button size="sm" variant="secondary" onClick={() => setEditTarget(contact)}>Modifier</Button>
                            <Button size="sm" variant="danger" loading={deleting === contact.id} onClick={() => setDeleteTarget(contact)}>×</Button>
                          </div>
                        </div>
                        {(contact.tags.length > 0 || cGroups.length > 0) && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {contact.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="neutral">{tag}</Badge>
                            ))}
                            {contact.tags.length > 2 && <Badge variant="neutral">+{contact.tags.length - 2}</Badge>}
                            {cGroups.slice(0, 1).map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => router.push(`/contacts/groups/${g.id}`)}
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium hover:opacity-80"
                                style={{ backgroundColor: g.color ? `${g.color}20` : "#F3F4F6", color: g.color ?? "#6B7280" }}
                              >
                                {g.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </Card>
        </>
      )}

      {tab === "imports" && (
        <Card>
          {importsLoading ? (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Date", "Statut", "Lignes", "Importés", "Mis à jour", "Invalides"].map((h) => (
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
                    <div className="h-5 w-16 bg-bg-muted rounded-full" />
                    <div className="flex-1 h-4 bg-bg-muted rounded" />
                  </div>
                ))}
              </div>
            </>
          ) : imports.length === 0 ? (
            <EmptyState
              icon={<Upload01Icon className="w-8 h-8" />}
              title="Aucun import pour l'instant."
              description="Importez des contacts depuis un fichier CSV."
              ctaLabel="Import CSV"
              onCta={() => setImportOpen(true)}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Date", "Statut", "Lignes", "Importés", "Mis à jour", "Invalides"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {imports.map((imp) => (
                      <tr key={imp.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                        <td className="py-3 pr-4 text-sm text-text-muted whitespace-nowrap">{formatDate(imp.createdAt)}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={IMPORT_STATUS_VARIANT[imp.status] ?? "neutral"} pulse={imp.status === "processing"}>
                            {IMPORT_STATUS_LABEL[imp.status] ?? imp.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-sm text-text-body">{imp.totalRows}</td>
                        <td className="py-3 pr-4 text-sm text-text-body">{imp.importedCount}</td>
                        <td className="py-3 pr-4 text-sm text-text-body">{imp.updatedCount}</td>
                        <td className="py-3 pr-4 text-sm text-text-body">{imp.invalidCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-border">
                {imports.map((imp) => (
                  <div key={imp.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1">
                        <Badge variant={IMPORT_STATUS_VARIANT[imp.status] ?? "neutral"} pulse={imp.status === "processing"}>
                          {IMPORT_STATUS_LABEL[imp.status] ?? imp.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted">{formatDate(imp.createdAt)}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {imp.totalRows} lignes · {imp.importedCount} importés · {imp.invalidCount} invalides
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Modals */}
      <ContactModal
        open={createOpen}
        mode="create"
        onSuccess={addContact}
        onClose={() => setCreateOpen(false)}
      />

      {editTarget && (
        <ContactModal
          open={!!editTarget}
          mode="edit"
          contact={editTarget}
          onSuccess={(c) => { updateContact(c); setEditTarget(null) }}
          onClose={() => setEditTarget(null)}
        />
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Supprimer le contact">
        {deleteTarget && (
          <>
            <p className="text-sm text-text-body mb-6">
              Supprimer <strong className="text-text">{deleteTarget.name}</strong> ?
              Ce contact sera retiré de tous les tags et campagnes.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
              <Button variant="danger" loading={!!deleting} onClick={handleDelete}>Supprimer</Button>
            </div>
          </>
        )}
      </Modal>

      {importOpen && (
        <ImportModal
          groups={groups}
          onSuccess={() => {}}
          onClose={() => setImportOpen(false)}
        />
      )}
    </motion.div>
  )
}
