"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useApiKeys } from "@/hooks/useApiKeys"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { formatRelativeDate, formatDate } from "@/lib/format"
import type { ApiKey, ApiKeyUsage } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import PlanGateBanner from "@/components/ui/PlanGateBanner"
import EmptyState from "@/components/ui/EmptyState"
import CodeSnippet from "@/components/ui/CodeSnippet"
import { SkeletonTableRow } from "@/components/ui/Skeleton"
import { Key01Icon, AlertDiamondIcon, Copy01Icon, CheckmarkCircle01Icon } from "hugeicons-react"
import { portalBrand } from "@/lib/brand"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"



// ─── Quick Start dark block ────────────────────────────────────────────────────

function QuickStartBlock() {
  const { copy } = usePortalLocale()
  const apiCopy = copy.apiKeys
  const snippet = apiCopy.quickStartCurlSnippet
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-neutral-dark rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">{apiCopy.quickTitle}</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">{apiCopy.quickDescription}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-dark-hover hover:bg-[#334155] text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          {copied
            ? <><CheckmarkCircle01Icon className="w-3.5 h-3.5 text-primary" /> {apiCopy.copied}</>
            : <><Copy01Icon className="w-3.5 h-3.5" /> {apiCopy.copy}</>
          }
        </button>
      </div>
      <pre className="text-xs font-mono text-[#E2E8F0] leading-relaxed overflow-x-auto">
        <code>
          {snippet.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line.startsWith("  -H") || line.startsWith("  -d") || line.startsWith("    ") || line.startsWith("  }") || line === "  }'" ? (
                <span className="text-[#94A3B8]">{line}</span>
              ) : line.includes("msgf_live_your_api_key_here") ? (
                <span>
                  {line.split("msgf_live_")[0]}
                  <span className="text-primary">msgf_live_</span>
                  <span className="text-[#FCD34D]">your_api_key_here</span>
                  {line.split("msgf_live_your_api_key_here")[1]}
                </span>
              ) : (
                line
              )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

function getUsageShare(requestCount: number, total: number) {
  if (total <= 0) return 0
  return Math.round((requestCount / total) * 100)
}

export default function ApiKeysPage() {
  const { locale, copy } = usePortalLocale()
  const apiCopy = copy.apiKeys
  const isFr = locale === "fr"
  const { apiKeys, usage, periodKey, totalRequests, loading, error, addApiKey, removeApiKey } = useApiKeys()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [secretModal, setSecretModal] = useState<{ secret: string; keyPrefix: string } | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  const usageById = new Map(usage.map((entry) => [entry.id, entry]))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    setCreating(true)
    try {
      const data = await apiClient.apiKeys.create(newKeyName.trim())
      addApiKey({
        id: data.id,
        name: data.name,
        keyPrefix: data.keyPrefix,
        lastUsedAt: null,
        revokedAt: null,
        createdAt: data.createdAt,
      } as ApiKey)
      setCreateModalOpen(false)
      setNewKeyName("")
      setSecretModal({ secret: data.secret, keyPrefix: data.keyPrefix })
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "API_KEYS_NOT_AVAILABLE_ON_PLAN") {
          toast.error(apiCopy.toast.notAvailableOnPlan)
        } else if (err.code === "MAX_API_KEYS_REACHED") {
          toast.error(apiCopy.toast.maxReached)
        } else {
          toast.error(apiCopy.toast.createFailed)
        }
      }
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setRevoking(revokeTarget.id)
    try {
      await apiClient.apiKeys.revoke(revokeTarget.id)
      removeApiKey(revokeTarget.id)
      toast.success(apiCopy.toast.revoked)
      setRevokeTarget(null)
    } catch {
      toast.error(apiCopy.toast.revokeFailed)
    } finally {
      setRevoking(null)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
      title={apiCopy.pageTitle}
      description={apiCopy.pageDescription}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={portalBrand.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-bg px-4 py-2 text-sm font-(family-name:--font-geist-sans) font-bold uppercase tracking-[0.08em] text-text transition-colors hover:bg-bg-subtle"
            >
              {apiCopy.docs}
            </a>
            <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
              {apiCopy.newKey}
            </Button>
          </div>
        }
      />


      {/* Quick start — dark code block */}
      <QuickStartBlock />

      <Card>
        {error && (
          <div className="mb-4 text-sm text-error-hover">
            {apiCopy.loadError}
          </div>
        )}
        {loading ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {apiCopy.tableHeadersLoading.map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => <SkeletonTableRow key={i} cols={6} />)}
            </tbody>
          </table>
        ) : apiKeys.length === 0 ? (
          <EmptyState
            icon={<Key01Icon className="w-8 h-8" />}
            title={apiCopy.emptyTitle}
            description={apiCopy.emptyDescription}
            ctaLabel={apiCopy.newKey}
            onCta={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  {apiCopy.usageSummary}
                </p>
                <p className="text-sm text-text-body mt-1">
                  {totalRequests.toLocaleString(isFr ? "fr-FR" : "en-US")} {apiCopy.requestsOnPeriod} {periodKey ?? apiCopy.thisMonth}
                </p>
              </div>
              <p className="text-xs text-text-muted">
                {apiCopy.activeKeys} : {apiKeys.length}
              </p>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {apiCopy.tableHeaders.map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide pb-3 pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => {
                  const usageItem = usageById.get(key.id)
                  const requestCount = usageItem?.requestCount ?? 0
                  const usageShare = getUsageShare(requestCount, totalRequests)
                  const isRevoked = Boolean(usageItem?.revokedAt ?? key.revokedAt)
                  return (
                    <tr key={key.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                      <td className="py-3 pr-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-text">{key.name}</span>
                            <span
                              className={[
                                "inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                                isRevoked
                                  ? "border-error/30 bg-error-subtle text-error-hover"
                                  : "border-primary/20 bg-primary-subtle text-primary-ink",
                              ].join(" ")}
                            >
                              {isRevoked ? apiCopy.statusRevoked : apiCopy.statusActive}
                            </span>
                          </div>
                          <code className="inline-flex text-xs font-mono bg-bg-subtle border border-border px-2 py-0.5 rounded">
                            {key.keyPrefix}
                          </code>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="space-y-2">
                          <div className="text-sm text-text-secondary">
                            {requestCount.toLocaleString(isFr ? "fr-FR" : "en-US")} {apiCopy.requests}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <span className="inline-flex border border-border bg-bg-subtle px-2 py-0.5 rounded">
                              {usageShare}% {apiCopy.monthlyTrafficShare}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-secondary">
                        {usageItem?.lastRequestAt ? formatRelativeDate(usageItem.lastRequestAt) : apiCopy.none}
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-secondary">
                        {usageItem?.lastUsedAt ?? key.lastUsedAt ? formatRelativeDate(usageItem?.lastUsedAt ?? key.lastUsedAt!) : apiCopy.never}
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-secondary">{formatDate(key.createdAt)}</td>
                      <td className="py-3">
                        <Button
                          variant="outlined"
                          size="sm"
                          className="text-error-hover border-error hover:bg-error-subtle"
                          loading={revoking === key.id}
                          onClick={() => setRevokeTarget({ id: key.id, name: key.name })}
                        >
                          {apiCopy.revoke}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create modal */}
      <Modal
        open={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setNewKeyName("") }}
        title={apiCopy.createModal.title}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={apiCopy.createModal.name}
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder={apiCopy.createModal.placeholder}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              {apiCopy.createModal.cancel}
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              {apiCopy.createModal.create}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Secret reveal modal */}
      <Modal
        open={!!secretModal}
        onClose={() => setSecretModal(null)}
        title={apiCopy.createdModal.title}
        maxWidth="max-w-lg"
      >
        {secretModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-warning-subtle border border-warning/30 rounded-xl">
              <AlertDiamondIcon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning-text">
                {apiCopy.createdModal.warning}
              </p>
            </div>
            <CodeSnippet value={secretModal.secret} />
            <div className="flex justify-end pt-1">
              <Button variant="primary" onClick={() => setSecretModal(null)}>
                {apiCopy.createdModal.confirm}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Revoke confirmation */}
      <Modal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title={apiCopy.revokeModal.title}
      >
        {revokeTarget && (
          <>
            <p className="text-sm text-text-body mb-6">
              {apiCopy.revokeModal.promptPrefix} <strong className="text-text">{revokeTarget.name}</strong> ? {apiCopy.revokeModal.promptSuffix}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRevokeTarget(null)}>
                {apiCopy.revokeModal.cancel}
              </Button>
              <Button variant="danger" loading={revoking === revokeTarget.id} onClick={handleRevoke}>
                {apiCopy.revoke}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  )
}
