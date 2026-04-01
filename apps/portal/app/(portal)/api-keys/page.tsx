"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { useApiKeys } from "@/hooks/useApiKeys"
import { apiClient } from "@usesendnow/api-client"
import { ApiClientError } from "@usesendnow/api-client"
import { formatRelativeDate, formatDate } from "@/lib/format"
import type { SubscriptionResponse } from "@usesendnow/types"
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

// ─── Quick Start dark block ────────────────────────────────────────────────────

const SNIPPET = `curl -X POST https://api.msgflash.com/v1/messages/send \\
  -H "x-api-key: msgf_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "to": "+22901000000",
    "type": "text",
    "text": "Bonjour"
  }'
`

function QuickStartBlock() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPET.replace(/••••••••••••/g, "VOTRE_CLE_API"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-neutral-dark rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Intégration rapide</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">Envoyez votre premier message en quelques secondes</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-dark-hover hover:bg-[#334155] text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          {copied
            ? <><CheckmarkCircle01Icon className="w-3.5 h-3.5 text-primary" /> Copié</>
            : <><Copy01Icon className="w-3.5 h-3.5" /> Copier</>
          }
        </button>
      </div>
      <pre className="text-xs font-mono text-[#E2E8F0] leading-relaxed overflow-x-auto">
        <code>
          {SNIPPET.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line.startsWith("  -H") || line.startsWith("  -d") || line.startsWith("    ") || line.startsWith("  }") || line === "  }'" ? (
                <span className="text-[#94A3B8]">{line}</span>
              ) : line.includes("usn_live_") ? (
                <span>
                  {line.split("usn_live_")[0]}
                  <span className="text-primary">usn_live_</span>
                  <span className="text-[#FCD34D]">••••••••••••</span>
                  {line.split("usn_live_••••••••••••")[1]}
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
  const { apiKeys, usage, periodKey, totalRequests, loading, error, addApiKey, removeApiKey } = useApiKeys()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [secretModal, setSecretModal] = useState<{ secret: string; keyPrefix: string } | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  const usageById = new Map(usage.map((entry) => [entry.id, entry]))

  useEffect(() => {
    apiClient.billing.getSubscription()
      .then((sub) => {
        setSubscription(sub)
        const maxApiKeys =
          sub?.subscription?.plan?.limits?.maxApiKeys ??
          sub?.subscription?.plan?.maxApiKeys ??
          0
        if (maxApiKeys === 0) {
          setPlanBlocked(true)
        }
      })
      .catch(() => {})
  }, [])

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
      })
      setCreateModalOpen(false)
      setNewKeyName("")
      setSecretModal({ secret: data.secret, keyPrefix: data.keyPrefix })
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "API_KEYS_NOT_AVAILABLE_ON_PLAN") {
          setCreateModalOpen(false)
          setPlanBlocked(true)
        } else if (err.code === "MAX_API_KEYS_REACHED") {
          setCreateModalOpen(false)
          toast.error("Vous avez atteint la limite de clés API. Révoquez une clé existante ou changez de plan.")
        } else {
          toast.error("Impossible de créer la clé API.")
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
      toast.success("Clé API révoquée")
      setRevokeTarget(null)
    } catch {
      toast.error("Impossible de révoquer la clé.")
    } finally {
      setRevoking(null)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <PageHeader
        title="Clés API"
        description="Gérez vos clés d'accès pour l'API publique."
        action={
          !planBlocked && (
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={portalBrand.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border bg-bg px-4 py-2 text-sm font-(family-name:--font-geist-sans) font-bold uppercase tracking-[0.08em] text-text transition-colors hover:bg-bg-subtle"
              >
                Documentation API
              </a>
              <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                Nouvelle clé API
              </Button>
            </div>
          )
        }
      />

      {planBlocked && (
        <div className="mb-6">
          <PlanGateBanner message="Les clés API ne sont pas disponibles sur le plan Gratuit. Changez de plan pour accéder à l'API." />
        </div>
      )}

      {/* Quick start — dark code block */}
      {!planBlocked && (
        <QuickStartBlock />
      )}

      {!planBlocked && (
        <Card>
          {error && (
            <div className="mb-4 text-sm text-error-hover">
              Impossible de charger les clés API.
            </div>
          )}
          {loading ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Nom", "Préfixe", "Requêtes (mois)", "Dernière utilisation", "Créée le", "Actions"].map((h) => (
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
              title="Aucune clé API pour le moment."
              description="Créez votre première clé."
              ctaLabel="Nouvelle clé API"
              onCta={() => setCreateModalOpen(true)}
            />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Résumé d'utilisation
                  </p>
                  <p className="text-sm text-text-body mt-1">
                    {totalRequests.toLocaleString("fr-FR")} requêtes sur {periodKey ?? "ce mois-ci"}
                  </p>
                </div>
                <p className="text-xs text-text-muted">
                  Clés actives : {apiKeys.length}
                </p>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Clé", "Usage ce mois", "Dernière requête", "Dernière utilisation", "Créée le", "Actions"].map((h) => (
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
                                {isRevoked ? "Révoquée" : "Active"}
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
                              {requestCount.toLocaleString("fr-FR")} requêtes
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                              <span className="inline-flex border border-border bg-bg-subtle px-2 py-0.5 rounded">
                                {usageShare}% du trafic mensuel
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-text-secondary">
                          {usageItem?.lastRequestAt ? formatRelativeDate(usageItem.lastRequestAt) : "Aucune"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-text-secondary">
                          {usageItem?.lastUsedAt ?? key.lastUsedAt ? formatRelativeDate(usageItem?.lastUsedAt ?? key.lastUsedAt!) : "Jamais"}
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
                            Révoquer
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
      )}

      {/* Create modal */}
      <Modal
        open={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setNewKeyName("") }}
        title="Nouvelle clé API"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nom"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="ex. Application de production"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              Créer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Secret reveal modal */}
      <Modal
        open={!!secretModal}
        onClose={() => setSecretModal(null)}
        title="Clé API créée"
        maxWidth="max-w-lg"
      >
        {secretModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-warning-subtle border border-warning/30 rounded-xl">
              <AlertDiamondIcon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning-text">
                C&apos;est la seule fois où cette clé sera affichée. Copiez-la maintenant.
              </p>
            </div>
            <CodeSnippet value={secretModal.secret} />
            <div className="flex justify-end pt-1">
              <Button variant="primary" onClick={() => setSecretModal(null)}>
                J&apos;ai copié la clé
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Revoke confirmation */}
      <Modal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Révoquer la clé API"
      >
        {revokeTarget && (
          <>
            <p className="text-sm text-text-body mb-6">
              Voulez-vous vraiment révoquer <strong className="text-text">{revokeTarget.name}</strong> ? Toute application qui utilise cette clé cessera de fonctionner immédiatement.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRevokeTarget(null)}>
                Annuler
              </Button>
              <Button variant="danger" loading={revoking === revokeTarget.id} onClick={handleRevoke}>
                Révoquer
              </Button>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  )
}
