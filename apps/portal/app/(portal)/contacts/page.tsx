"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useContactsList } from "@/hooks/useContactsList"
import { useContactGroups } from "@/hooks/useContactGroups"
import { useContactImports } from "@/hooks/useContactImports"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { renderWithStrongCount, renderWithStrongName } from "@/lib/render-copy-placeholders"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { useContactBulkJobPoll } from "@/hooks/useContactBulkJobPoll"
import { formatDate } from "@/lib/format"
import type { Contact, ContactGroup, SubscriptionResponse, ImportResult, ContactSort } from "@usesendnow/types"
import { isContactBulkJobAccepted } from "@usesendnow/types"
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
  Delete01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
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
  const { copy } = usePortalLocale()
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
        toast.success(copy.contacts.contactAdded)
      } else {
        result = await apiClient.contacts.update(contact!.id, payload)
        toast.success(copy.contacts.contactUpdated)
      }
      onSuccess(result)
      onClose()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "CONFLICT") {
          setError(copy.contacts.conflict)
        } else {
          setError(copy.contacts.importFailed)
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
      title={mode === "create" ? copy.contacts.addContact : copy.contacts.editContact}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={copy.contacts.contactTableName}
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          autoFocus
        />
        <Input
          label={copy.contacts.phone}
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="+33612345678"
          required
        />
        <Input
          label={copy.contacts.tags}
          value={form.tags}
          onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
          placeholder="vip, newsletter"
          hint={copy.contacts.tagsHint}
        />
        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {copy.contacts.cancel}
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {mode === "create" ? copy.contacts.addContact : copy.contacts.saveContact}
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
  const { copy } = usePortalLocale()
  const iw = copy.contacts.importWizard
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
      setError(copy.contacts.csvInvalid)
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError(copy.contacts.fileTooLarge)
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
          setError(copy.contacts.csvInvalid)
        } else if (err.code === "CSV_TOO_LARGE") {
          setError(copy.contacts.csvTooLarge)
        } else if (err.code === "NOT_FOUND") {
          setError(copy.contacts.importGroupNotFound)
        } else {
          setError(copy.contacts.importFailed)
        }
      }
    } finally {
      setImporting(false)
    }
  }

  const downloadSample = () => {
    const csv = "phone,name,tags\n+33612345000,Jean Dupont,vip|france\n+33612345001,Claire Martin,client\n+33612345678,Luc Bernard,"
    const blob = new Blob([csv], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "sample-contacts.csv"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <Modal open onClose={onClose} title={copy.contacts.importContacts}>
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
          {step === "upload" ? copy.contacts.importChooseFile : step === "preview" ? copy.contacts.importPreview : copy.contacts.importResult}
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
                <p className="text-sm font-medium text-text">{iw.dropzoneClick}</p>
                <p className="text-xs text-text-muted mt-1">{iw.dropzoneSizeHint}</p>
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
            {copy.contacts.sampleFile}
          </button>

          <div>
            <label className="block text-sm font-medium text-text-body mb-1.5">
              {iw.assignGroupLabel}
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">{iw.noGroupOption}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-text-muted">
            {iw.expectedFormatLabel}{" "}
            <code className="font-mono bg-bg-subtle px-1 rounded">phone,name,tags</code>
          </p>

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={onClose}>{copy.contacts.cancel}</Button>
            <Button variant="primary" disabled={!file} onClick={() => file && setStep("preview")}>
              {iw.next}
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-body">
              {renderWithStrongCount(
                totalRows === 1 ? iw.rowsDetectedOne : iw.rowsDetectedMany,
                totalRows,
              )}
            </p>
            {totalRows > 500 && (
              <div className="flex items-center gap-1.5 text-xs text-warning">
                <InformationCircleIcon className="w-4 h-4" />
                {iw.largeFileWarning}
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
            <Button variant="secondary" onClick={() => setStep("upload")}>{copy.contacts.importBack}</Button>
            <Button variant="primary" loading={importing} onClick={handleImport}>
              {copy.contacts.importContactsButton}
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
                  {renderWithStrongCount(
                    (() => {
                      const n = result.importedCount ?? 0
                      return n === 1 ? iw.resultImportedOne : iw.resultImportedMany
                    })(),
                    result.importedCount ?? 0,
                  )}
                </div>
                {(result.updatedCount ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-text-body">
                    <InformationCircleIcon className="w-4 h-4 text-primary" />
                    {renderWithStrongCount(iw.resultUpdated, result.updatedCount ?? 0)}
                  </div>
                )}
                {(result.invalidCount ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-error">
                    <AlertCircleIcon className="w-4 h-4" />
                    {renderWithStrongCount(
                      (() => {
                        const n = result.invalidCount ?? 0
                        return n === 1 ? iw.invalidOne : iw.invalidMany
                      })(),
                      result.invalidCount ?? 0,
                    )}
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
                    {renderWithStrongCount(
                      showErrors ? iw.errorsToggleHide : iw.errorsToggleShow,
                      result.errors!.length,
                    )}
                  </button>
                  {showErrors && (
                    <div className="mt-2 border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-bg-subtle border-b border-border">
                            <th className="px-3 py-2 text-left text-text-secondary">{iw.errorsTableLine}</th>
                            <th className="px-3 py-2 text-left text-text-secondary">{iw.errorsTablePhone}</th>
                            <th className="px-3 py-2 text-left text-text-secondary">{iw.errorsTableReason}</th>
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
              <p className="text-sm font-medium text-text">{iw.asyncTitle}</p>
              <p className="text-xs text-text-secondary">
                {iw.asyncImportIdLabel}{" "}
                <code className="font-mono">{result.importId}</code>
              </p>
              <p className="text-xs text-text-secondary">
                {iw.asyncCloseHint}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button variant="primary" onClick={onClose}>{iw.close}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

const ADD_MEMBERS_BATCH = 200

function AddSelectionToGroupModal({
  open,
  groups,
  selectedCount,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean
  groups: ContactGroup[]
  selectedCount: number
  loading: boolean
  onClose: () => void
  onConfirm: (groupId: string) => void | Promise<void>
}) {
  const { copy } = usePortalLocale()
  const [groupId, setGroupId] = useState("")

  useEffect(() => {
    if (open) setGroupId("")
  }, [open])

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} title={copy.contacts.addToGroupModalTitle}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          {renderWithStrongCount(
            selectedCount === 1 ? copy.contacts.bulkSelectedOne : copy.contacts.bulkSelectedMany,
            selectedCount,
          )}
        </p>
        {groups.length === 0 ? (
          <p className="text-sm text-text-muted">{copy.contacts.addToGroupNoGroups}</p>
        ) : (
          <label className="flex flex-col gap-1 text-xs text-text-secondary">
            <span>{copy.contacts.addToGroupGroupLabel}</span>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="border border-border-strong rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">{copy.contacts.addToGroupPlaceholder}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {copy.contacts.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={loading}
            disabled={!groupId || groups.length === 0}
            onClick={() => void onConfirm(groupId)}
          >
            {copy.contacts.addToGroupSubmit}
          </Button>
        </div>
      </div>
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

// ─── Main Page ─────────────────────────────────────────────────────────────────

type Tab = "contacts" | "imports"

export default function ContactsPage() {
  const router = useRouter()
  const { copy } = usePortalLocale()
  const importStatusLabel = (status: string) => {
    const labels = copy.contacts.importStatus
    return labels[status as keyof typeof labels] ?? status
  }
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [tab, setTab] = useState<Tab>("contacts")
  const [search, setSearch] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return params.get("search") ?? ""
    }
    return ""
  })
  const [sort, setSort] = useState<ContactSort>("createdAt_desc")
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Contact | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importPickerGroups, setImportPickerGroups] = useState<ContactGroup[]>([])
  const [addToGroupOpen, setAddToGroupOpen] = useState(false)
  const [addToGroupSubmitting, setAddToGroupSubmitting] = useState(false)
  const [addToGroupPickerGroups, setAddToGroupPickerGroups] = useState<ContactGroup[]>([])
  const [exporting, setExporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const {
    contacts,
    loading,
    total,
    pageIndex,
    pageSize,
    canGoPrev,
    canGoNext,
    goNextPage,
    goPrevPage,
    rangeStart,
    rangeEnd,
    refetch: refetchContacts,
    addContact,
    updateContact,
    removeContact,
  } = useContactsList(search, sort)
  const { groups, total: groupTotal } = useContactGroups()
  const { imports, loading: importsLoading } = useContactImports()
  const bulkJobPoll = useContactBulkJobPoll()

  useEffect(() => {
    if (!importOpen) return
    let cancelled = false
    async function loadAll() {
      const acc: ContactGroup[] = []
      let cursor: string | undefined
      try {
        for (;;) {
          const r = await apiClient.contactGroups.list({ limit: 100, cursor })
          acc.push(...r.groups)
          if (!r.hasMore || !r.nextCursor) break
          cursor = r.nextCursor ?? undefined
        }
        if (!cancelled) setImportPickerGroups(acc)
      } catch {
        if (!cancelled) setImportPickerGroups([])
      }
    }
    void loadAll()
    return () => {
      cancelled = true
    }
  }, [importOpen])

  useEffect(() => {
    if (!addToGroupOpen) return
    let cancelled = false
    async function loadAll() {
      const acc: ContactGroup[] = []
      let cursor: string | undefined
      try {
        for (;;) {
          const r = await apiClient.contactGroups.list({ limit: 100, cursor })
          acc.push(...r.groups)
          if (!r.hasMore || !r.nextCursor) break
          cursor = r.nextCursor ?? undefined
        }
        if (!cancelled) setAddToGroupPickerGroups(acc)
      } catch {
        if (!cancelled) setAddToGroupPickerGroups([])
      }
    }
    void loadAll()
    return () => {
      cancelled = true
    }
  }, [addToGroupOpen])

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(typeof window !== "undefined" && window.scrollY > 400)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Contact groups lookup map
  const [contactGroups, setContactGroups] = useState<Map<string, Array<{ id: string; name: string; color?: string }>>>(new Map())

  useEffect(() => {
    apiClient.billing.getSubscription().then(setSubscription).catch(() => {})
  }, [])

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
  const groupCount = groupTotal

  const contactIds = useMemo(() => contacts.map((c) => c.id), [contacts])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [pageIndex, sort])

  const allSelected = contacts.length > 0 && contactIds.every((id) => selectedIds.has(id))

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
    try {
      await apiClient.contacts.delete(deleteTarget.id)
      removeContact(deleteTarget.id)
      toast.success(copy.contacts.contactDeleted)
      setDeleteTarget(null)
    } catch {
      toast.error(copy.contacts.deleteFailed)
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    const toastId = toast.loading(copy.contacts.exportLoading)
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
      toast.error(copy.contacts.exportFailed)
    } finally {
      setExporting(false)
    }
  }

  // ─── Selection helpers ────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contactIds))
    }
  }

  const handleCancelBulkJob = async () => {
    const wasGroupAdd = bulkJobPoll.variant === "groupAdd"
    try {
      await bulkJobPoll.cancel()
      toast.success(
        wasGroupAdd ? copy.contacts.groups.addMembersBulkCancelled : copy.contacts.bulkJobCancelled,
      )
    } catch {
      toast.error(copy.contacts.bulkJobCancelFailed)
    }
    setSelectedIds(new Set())
    await refetchContacts()
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    const ids = Array.from(selectedIds)
    try {
      const result = await apiClient.contacts.deleteMany(ids)
      if (isContactBulkJobAccepted(result)) {
        toast.info(copy.contacts.bulkJobStarted)
        bulkJobPoll.start(
          result.jobId,
          {
            onComplete: (progress) => {
              const st = (progress.status ?? "").toLowerCase()
              if (st === "failed" || st === "error") {
                toast.error(copy.contacts.bulkJobFailed)
              } else if (st === "cancelled" || st === "canceled") {
                toast.info(copy.contacts.bulkJobEndedCancelled)
              } else {
                const count = progress.summary?.deleted ?? progress.processedCount ?? ids.length
                toast.success(copy.contacts.bulkJobDoneDeleted.replace("{{count}}", String(count)))
              }
              setSelectedIds(new Set())
              void refetchContacts()
            },
          },
          { variant: "delete" },
        )
        return
      }

      ids.forEach((id) => removeContact(id))
      if (result.notFound && result.notFound.length > 0) {
        toast.warning(
          copy.contacts.bulkDeletePartial
            .replace("{{deleted}}", String(result.deletedCount))
            .replace("{{notFound}}", String(result.notFound.length)),
        )
      } else {
        const tpl =
          result.deletedCount === 1
            ? copy.contacts.bulkDeleteSuccessOne
            : copy.contacts.bulkDeleteSuccessMany
        toast.success(tpl.replace("{{count}}", String(result.deletedCount)))
      }
      setSelectedIds(new Set())
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "VALIDATION_ERROR") {
          toast.error(copy.contacts.bulkDeleteErrorValidation)
        } else if (err.code === "FORBIDDEN") {
          toast.error(copy.contacts.bulkDeleteErrorForbidden)
        } else {
          toast.error(copy.contacts.bulkDeleteErrorGeneric)
        }
      } else {
        toast.error(copy.contacts.bulkDeleteErrorGeneric)
      }
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleAddSelectionToGroup = async (groupId: string) => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0 || !groupId) return
    const gCopy = copy.contacts.groups
    setAddToGroupSubmitting(true)
    let totalAdded = 0
    let aborted = false
    let fatalError = false
    try {
      for (let i = 0; i < ids.length; i += ADD_MEMBERS_BATCH) {
        const chunk = ids.slice(i, i + ADD_MEMBERS_BATCH)
        const res = await apiClient.contactGroups.addMembers(groupId, chunk)
        if (isContactBulkJobAccepted(res)) {
          toast.info(gCopy.addMembersBulkStarted)
          setAddToGroupSubmitting(false)
          await new Promise<void>((resolve) => {
            bulkJobPoll.start(
              res.jobId,
              {
                onComplete: (progress) => {
                  const st = (progress.status ?? "").toLowerCase()
                  if (st === "failed" || st === "error") {
                    toast.error(gCopy.addMembersFailed)
                    aborted = true
                    fatalError = true
                  } else if (st === "cancelled" || st === "canceled") {
                    toast.info(gCopy.addMembersBulkEndedCancelled)
                    aborted = true
                  } else {
                    const added = progress.summary?.added ?? progress.processedCount ?? chunk.length
                    totalAdded += added
                  }
                  resolve()
                },
              },
              { variant: "groupAdd" },
            )
          })
          if (aborted) break
          setAddToGroupSubmitting(true)
        } else {
          totalAdded += res.added
        }
      }
      if (!fatalError && !aborted && totalAdded > 0) {
        const tpl = totalAdded === 1 ? gCopy.addMembersSuccessOne : gCopy.addMembersSuccessMany
        toast.success(tpl.replace("{{count}}", String(totalAdded)))
      }
      setAddToGroupOpen(false)
      setSelectedIds(new Set())
      void refetchContacts()
    } catch {
      toast.error(copy.contacts.addToGroupFailed)
    } finally {
      setAddToGroupSubmitting(false)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title={copy.contacts.pageTitle}
        description={
          total > 0
            ? renderWithStrongCount(
                total === 1 ? copy.contacts.headerCountOne : copy.contacts.headerCountMany,
                total,
              )
            : copy.contacts.pageDescription
        }
        action={
          <div className="flex items-center flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/contacts/groups")}
            >
              <UserMultiple02Icon className="w-4 h-4" />
              {copy.contacts.navGroups}
              {maxContactGroups !== -1 && (
                <span className="ml-1 text-xs text-text-muted">
                  {groupCount}/{maxContactGroups}
                </span>
              )}
            </Button>
            <Button variant="secondary" loading={exporting} onClick={handleExport}>
              <Download01Icon className="w-4 h-4" />
              {copy.contacts.exportCsv}
            </Button>
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              <Upload01Icon className="w-4 h-4" />
              {copy.contacts.importCsv}
            </Button>
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              {copy.contacts.newContact}
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-muted rounded-xl w-fit mb-5">
        {([
          { value: "contacts", label: copy.contacts.pageTitle },
          { value: "imports", label: copy.contacts.tabImports },
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
          <div className="mb-5 flex flex-col sm:flex-row gap-3 sm:items-end">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={copy.contacts.searchPlaceholder}
              className="max-w-sm flex-1"
            />
            <label className="flex flex-col gap-1 text-xs text-text-secondary shrink-0">
              <span>{copy.contacts.sortLabel}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ContactSort)}
                className="border border-border-strong rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-40"
              >
                <option value="createdAt_desc">{copy.contacts.sortCreatedDesc}</option>
                <option value="name_asc">{copy.contacts.sortNameAsc}</option>
              </select>
            </label>
          </div>

          <Card>
            {bulkJobPoll.activeJobId && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 mb-4 rounded-xl border border-border-strong bg-bg-subtle">
                <div>
                  <p className="text-sm font-medium text-text">
                    {bulkJobPoll.variant === "groupAdd"
                      ? copy.contacts.groups.addMembersBulkRunning
                      : copy.contacts.bulkJobRunning}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 font-mono">
                    {(bulkJobPoll.variant === "groupAdd"
                      ? copy.contacts.groups.addMembersBulkProgress
                      : copy.contacts.bulkJobProgress)
                      .replace("{{percent}}", String(bulkJobPoll.snapshot.progress))
                      .replace("{{status}}", bulkJobPoll.snapshot.status)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={bulkJobPoll.cancelling}
                  onClick={() => void handleCancelBulkJob()}
                >
                  {bulkJobPoll.variant === "groupAdd"
                    ? copy.contacts.groups.addMembersBulkCancel
                    : copy.contacts.bulkJobCancel}
                </Button>
              </div>
            )}
            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between px-5 py-3 bg-primary-subtle border border-primary/30 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <CheckmarkCircle01Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-text">
                    {renderWithStrongCount(
                      selectedIds.size === 1
                        ? copy.contacts.bulkSelectedOne
                        : copy.contacts.bulkSelectedMany,
                      selectedIds.size,
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setSelectedIds(new Set())}>
                    {copy.contacts.deselectAll}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!!bulkJobPoll.activeJobId}
                    onClick={() => setAddToGroupOpen(true)}
                  >
                    {copy.contacts.bulkAddToGroup}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={bulkDeleting}
                    disabled={!!bulkJobPoll.activeJobId}
                    onClick={handleBulkDelete}
                  >
                    <Delete01Icon className="w-4 h-4 mr-1.5" />
                    {copy.contacts.deleteAction}
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
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
                        {[copy.contacts.contactTableName, copy.contacts.contactTablePhone, copy.contacts.contactTableTags, copy.contacts.contactTableGroups, copy.contacts.contactTableCreatedAt, ""].map((h) => (
                          <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>{[1, 2, 3].map((i) => <SkeletonTableRow key={i} cols={7} />)}</tbody>
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
            ) : contacts.length === 0 ? (
              <EmptyState
                icon={<UserGroupIcon className="w-8 h-8" />}
                title={search ? copy.contacts.noContactFound : copy.contacts.emptyTitle}
                description={search ? "" : copy.contacts.emptyDescription}
                ctaLabel={search ? undefined : copy.contacts.newContact}
                onCta={search ? undefined : () => setCreateOpen(true)}
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
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-border-strong accent-primary cursor-pointer"
                          />
                        </th>
                        {[copy.contacts.contactTableName, copy.contacts.contactTablePhone, copy.contacts.contactTableTags, copy.contacts.contactTableGroups, copy.contacts.contactTableCreatedAt, ""].map((h) => (
                          <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => {
                        const cGroups = contactGroups.get(contact.id) ?? []
                        return (
                          <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                            <td className="py-3 pr-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(contact.id)}
                                onChange={() => toggleSelect(contact.id)}
                                className="h-4 w-4 rounded border-border-strong accent-primary cursor-pointer"
                              />
                            </td>
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
                                <Button size="sm" variant="secondary" onClick={() => setEditTarget(contact)}>{copy.contacts.editAction}</Button>
                                <Button size="sm" variant="danger" loading={deleting === contact.id} onClick={() => setDeleteTarget(contact)}>{copy.contacts.deleteAction}</Button>
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
                  {contacts.map((contact) => {
                    const cGroups = contactGroups.get(contact.id) ?? []
                    return (
                      <div key={contact.id} className="py-3">
                        <div className="flex items-start gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(contact.id)}
                            onChange={() => toggleSelect(contact.id)}
                            className="h-4 w-4 mt-1 rounded border-border-strong accent-primary cursor-pointer shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text truncate">{contact.name}</p>
                            <p className="text-xs font-mono text-text-muted">{contact.phone}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button size="sm" variant="secondary" onClick={() => setEditTarget(contact)}>{copy.contacts.editAction}</Button>
                            <Button size="sm" variant="danger" loading={deleting === contact.id} onClick={() => setDeleteTarget(contact)}>{copy.contacts.deleteAction}</Button>
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

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 py-3 border-t border-border">
                  <p className="text-sm text-text-muted tabular-nums">
                    {copy.contacts.paginationSummary
                      .replace("{{start}}", String(rangeStart))
                      .replace("{{end}}", String(rangeEnd))
                      .replace("{{total}}", String(total))}
                    <span className="mx-2 text-border-strong">·</span>
                    {copy.contacts.paginationPage.replace("{{page}}", String(pageIndex + 1))}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!canGoPrev || loading}
                      onClick={goPrevPage}
                      title={copy.contacts.paginationPrev}
                    >
                      <ArrowLeft01Icon className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!canGoNext || loading}
                      onClick={goNextPage}
                      title={copy.contacts.paginationNext}
                    >
                      <ArrowRight01Icon className="w-4 h-4" />
                    </Button>
                  </div>
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
                      {[
                        copy.contacts.importTableDate,
                        copy.contacts.importTableStatus,
                        copy.contacts.importTableRows,
                        copy.contacts.importTableImported,
                        copy.contacts.importTableUpdated,
                        copy.contacts.importTableInvalid,
                      ].map((h) => (
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
              title={copy.contacts.importEmptyTitle}
              description={copy.contacts.importEmptyDescription}
              ctaLabel={copy.contacts.importCsv}
              onCta={() => setImportOpen(true)}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        copy.contacts.importTableDate,
                        copy.contacts.importTableStatus,
                        copy.contacts.importTableRows,
                        copy.contacts.importTableImported,
                        copy.contacts.importTableUpdated,
                        copy.contacts.importTableInvalid,
                      ].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {imports.map((imp) => (
                      <tr
                        key={imp.id}
                        role="link"
                        tabIndex={0}
                        className="border-b border-border last:border-0 hover:bg-bg-subtle cursor-pointer"
                        onClick={() => router.push(`/contacts/imports/${imp.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            router.push(`/contacts/imports/${imp.id}`)
                          }
                        }}
                      >
                        <td className="py-3 pr-4 text-sm text-text-muted whitespace-nowrap">{formatDate(imp.createdAt)}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={IMPORT_STATUS_VARIANT[imp.status] ?? "neutral"} pulse={imp.status === "processing"}>
                            {importStatusLabel(imp.status)}
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
                  <div
                    key={imp.id}
                    role="link"
                    tabIndex={0}
                    className="py-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-bg-subtle -mx-1 px-1 rounded-lg"
                    onClick={() => router.push(`/contacts/imports/${imp.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        router.push(`/contacts/imports/${imp.id}`)
                      }
                    }}
                  >
                    <div>
                      <div className="mb-1">
                        <Badge variant={IMPORT_STATUS_VARIANT[imp.status] ?? "neutral"} pulse={imp.status === "processing"}>
                          {importStatusLabel(imp.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted">{formatDate(imp.createdAt)}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {copy.contacts.importMobileSummary
                          .replace("{{rows}}", String(imp.totalRows))
                          .replace("{{imported}}", String(imp.importedCount))
                          .replace("{{invalid}}", String(imp.invalidCount))}
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

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={copy.contacts.deleteContact}>
        {deleteTarget && (
          <>
            <p className="text-sm text-text-body mb-2">
              {renderWithStrongName(copy.contacts.deleteContactConfirm, deleteTarget.name)}
            </p>
            <p className="text-sm text-text-secondary mb-6">
              {copy.contacts.deleteContactConsequence}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>{copy.contacts.cancel}</Button>
              <Button variant="danger" loading={!!deleting} onClick={handleDelete}>{copy.contacts.deleteAction}</Button>
            </div>
          </>
        )}
      </Modal>

      {importOpen && (
        <ImportModal
          groups={importPickerGroups.length > 0 ? importPickerGroups : groups}
          onSuccess={() => {}}
          onClose={() => setImportOpen(false)}
        />
      )}

      <AddSelectionToGroupModal
        open={addToGroupOpen}
        groups={addToGroupPickerGroups.length > 0 ? addToGroupPickerGroups : groups}
        selectedCount={selectedIds.size}
        loading={addToGroupSubmitting}
        onClose={() => {
          if (!addToGroupSubmitting && !bulkJobPoll.activeJobId) setAddToGroupOpen(false)
        }}
        onConfirm={handleAddSelectionToGroup}
      />

      {tab === "contacts" && showBackToTop && (
        <button
          type="button"
          className="fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-bg shadow-lg text-text-secondary hover:bg-bg-subtle hover:text-text transition-colors cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title={copy.contacts.backToTop}
        >
          <ArrowUp01Icon className="h-5 w-5" />
        </button>
      )}
    </motion.div>
  )
}
