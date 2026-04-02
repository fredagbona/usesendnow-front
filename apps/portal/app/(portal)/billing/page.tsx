"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { useBilling } from "@/hooks/useBilling"
import { usePayments } from "@/hooks/usePayments"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import { toast } from "@/lib/toast"
import { formatDate, formatMonthYear } from "@/lib/format"
import type { Plan } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import { SkeletonCard } from "@/components/ui/Skeleton"
import {
  Tick01Icon,
  Cancel01Icon,
  AlertDiamondIcon,
  AlertCircleIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  InvoiceIcon,
  InformationCircleIcon,
} from "hugeicons-react"

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const PLAN_ORDER = ["free", "starter", "pro", "plus"]
const PLAN_MARKETING: Record<string, { price: string; features: string[] }> = {
  free: {
    price: "0€",
    features: [
      "1 instance",
      "20 messages / statuts par mois",
      "1 000 requêtes API / mois",
      "0 clé API",
      "0 endpoint webhook",
      "2 groupes de contacts",
      "Campagnes : non",
      "Notes vocales : oui",
    ],
  },
  starter: {
    price: "9€",
    features: [
      "1 instance",
      "5 000 messages / statuts par mois",
      "20 000 requêtes API / mois",
      "3 clés API",
      "3 endpoints webhook",
      "10 groupes de contacts",
      "Campagnes : oui",
      "Notes vocales : oui",
    ],
  },
  pro: {
    price: "19€",
    features: [
      "5 instances",
      "25 000 messages / statuts par mois",
      "100 000 requêtes API / mois",
      "5 clés API",
      "10 endpoints webhook",
      "50 groupes de contacts",
      "Campagnes : oui",
      "Notes vocales : oui",
    ],
  },
  plus: {
    price: "39€",
    features: [
      "20 instances",
      "150 000 messages / statuts par mois",
      "500 000 requêtes API / mois",
      "10 clés API",
      "50 endpoints webhook",
      "Groupes de contacts illimités",
      "Campagnes : oui",
      "Notes vocales : oui",
    ],
  },
}

function formatPrice(priceMonthly: number | undefined): string {
  if (!priceMonthly || priceMonthly === 0) return "0€ / mois"
  return `${(priceMonthly / 100).toLocaleString("fr-FR")}€ / mois`
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

function getPlanLimits(plan: Plan) {
  return {
    maxInstances:           plan.maxInstances           ?? plan.limits?.maxInstances           ?? 0,
    monthlyOutboundQuota:   plan.monthlyOutboundQuota   ?? plan.limits?.monthlyOutboundQuota   ?? 0,
    monthlyApiRequestQuota: plan.monthlyApiRequestQuota ?? plan.limits?.monthlyApiRequestQuota ?? 0,
    maxApiKeys:             plan.maxApiKeys             ?? plan.limits?.maxApiKeys             ?? 0,
    maxWebhookEndpoints:    plan.maxWebhookEndpoints    ?? plan.limits?.maxWebhookEndpoints    ?? 0,
  }
}

function planName(code: string, plans: Plan[]): string {
  return plans.find(p => p.code === code)?.name ?? code
}

function getFallbackPlan(code: string): Plan {
  return {
    code,
    name: planName(code, []),
    priceMonthly: 0,
    maxInstances: 0,
    monthlyOutboundQuota: 0,
    monthlyApiRequestQuota: 0,
    maxApiKeys: 0,
    maxWebhookEndpoints: 0,
    canUseCampaigns: false,
    canUseStatuses: false,
    features: {
      campaigns: false,
      statuses: false,
      voiceNotes: false,
      webhooks: false,
    },
  }
}

/* ─── Status badge config ─────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { variant: "success" | "info" | "warning" | "error" | "neutral"; label: string }> = {
  active:    { variant: "success", label: "Actif" },
  trialing:  { variant: "info",    label: "Essai" },
  past_due:  { variant: "warning", label: "Paiement en retard" },
  cancelled: { variant: "warning", label: "Annulé" },
  expired:   { variant: "error",   label: "Expiré" },
}

/* ─── Usage stat card ─────────────────────────────────────────────────────── */

function UsageCard({ label, used, total }: { label: string; used: number; total: number }) {
  const isUnlimited = total <= 0 || total >= 999999
  const percent = isUnlimited ? 0 : Math.min(Math.round((used / total) * 100), 100)
  const barColor = percent >= 90 ? "#EF4444" : percent >= 70 ? "#F59E0B" : "#FFD600"
  return (
    <div className="bg-bg border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</p>
      <div>
        <span className="text-2xl font-bold text-text">{used.toLocaleString("fr-FR")}</span>
        <span className="text-sm text-text-muted ml-1">
          {isUnlimited ? "/ Illimité" : `/ ${total.toLocaleString("fr-FR")}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="space-y-1">
          <div className="w-full bg-bg-muted rounded-full h-1.5">
            <div className="h-1.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: barColor }} />
          </div>
          <p className="text-xs text-text-muted">{percent}% utilisé</p>
        </div>
      )}
    </div>
  )
}

/* ─── Plan card ───────────────────────────────────────────────────────────── */

function PlanCard({
  plan,
  isCurrent,
  isUpgrade,
  isDowngrade,
  isScheduled,
  actioning,
  onSelect,
}: {
  plan: Plan
  isCurrent: boolean
  isUpgrade: boolean
  isDowngrade: boolean
  isScheduled: boolean   // this plan is the scheduled downgrade target
  actioning: string | null
  onSelect: (plan: Plan) => void
}) {
  const marketing = PLAN_MARKETING[plan.code] ?? {
    price: formatPrice(plan.priceMonthly),
    description: "Plan disponible pour votre compte.",
    features: [],
  }

  return (
    <div className={[
      "bg-bg border rounded-2xl p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]",
      isCurrent ? "border-primary ring-1 ring-primary"
        : isScheduled ? "border-warning ring-1 ring-warning"
        : "border-border",
    ].join(" ")}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text">{plan.name}</h3>
        {isCurrent && <Badge variant="success">Actuel</Badge>}
        {isScheduled && <Badge variant="warning">Programmé</Badge>}
      </div>

      <p className="text-xl font-bold text-text mb-4">
        {marketing.price}
      </p>

      <ul className="space-y-2 mb-5 text-sm flex-1">
        {marketing.features.map((feature) => (
          <PlanFeatureRow key={feature} label={feature} ok={!feature.endsWith(": non")} />
        ))}
      </ul>

      {isCurrent ? (
        <Button variant="secondary" size="sm" disabled className="w-full justify-center">
          Plan actuel
        </Button>
      ) : plan.code === "free" ? null : (
        <Button
          variant={isUpgrade ? "primary" : "secondary"}
          size="sm"
          loading={actioning === plan.code}
          onClick={() => onSelect(plan)}
          className="w-full justify-center"
        >
          {isUpgrade ? "Mettre à niveau" : "Rétrograder"}
        </Button>
      )}
    </div>
  )
}

function PlanFeatureRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {ok
        ? <Tick01Icon className="w-4 h-4 text-primary shrink-0" />
        : <Cancel01Icon className="w-4 h-4 text-border-strong shrink-0" />}
      <span className={ok ? "text-text-body" : "text-text-muted"}>{label}</span>
    </li>
  )
}

/* ─── Main billing content ────────────────────────────────────────────────── */

function BillingPageContent() {
  const searchParams = useSearchParams()
  const { subscription, plans, loading, error, refetch } = useBilling()
  const { payments, page, totalPages, loading: paymentsLoading, goToPage } = usePayments()
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelScheduledModalOpen, setCancelScheduledModalOpen] = useState(false)
  const [actioning, setActioning] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancellingScheduled, setCancellingScheduled] = useState(false)
  const handledParams = useRef(false)

  const sub = subscription?.subscription
  const usage = subscription?.usage
  const periodStart = subscription?.period?.start ?? sub?.currentPeriodStart
  const periodEnd = subscription?.period?.end ?? sub?.currentPeriodEnd
  const currentPlanCode = sub?.plan?.code ?? "free"
  const currentPlanIdx = PLAN_ORDER.indexOf(currentPlanCode)

  const currentPlan =
    sub?.plan ??
    plans.find((plan) => plan.code === currentPlanCode) ??
    getFallbackPlan(currentPlanCode)
  const limits = getPlanLimits(currentPlan)

  const sortedPlans = [...plans].sort(
    (a, b) => PLAN_ORDER.indexOf(a.code) - PLAN_ORDER.indexOf(b.code)
  )

  const hasScheduledChange = !!sub?.scheduledAction
  const scheduledAction = sub?.scheduledAction ?? null
  const scheduledPlan = sub?.scheduledPlan ?? null
  const scheduledPlanAt = sub?.scheduledPlanAt ?? null

  // Handle Dodo return URL params
  useEffect(() => {
    if (handledParams.current) return
    const success = searchParams.get("success")
    const cancelled = searchParams.get("cancelled")

    if (success === "true") {
      handledParams.current = true
      window.history.replaceState({}, "", "/billing")
      toast.success("Paiement reçu ! Mise à jour du plan en cours...")
      setTimeout(async () => {
        await refetch()
        toast.success("Votre plan a été mis à jour.")
      }, 2000)
    }

    if (cancelled === "true") {
      handledParams.current = true
      window.history.replaceState({}, "", "/billing")
      toast.info("Paiement annulé. Votre plan n'a pas changé.")
    }
  }, [searchParams, refetch])

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.code === "free") return
    const planIdx = PLAN_ORDER.indexOf(plan.code)
    const isUpgrade = planIdx > currentPlanIdx

    setActioning(plan.code)
    try {
      if (isUpgrade) {
        // Upgrade → Dodo checkout (redirect)
        const { checkoutUrl } = await apiClient.billing.checkout(plan.code)
        window.location.href = checkoutUrl
      } else {
        // Downgrade → schedule at end of period
        await apiClient.billing.downgrade(plan.code)
        await refetch()
        toast.success(`Rétrogradation vers ${plan.name} programmée à la fin de la période.`)
        setPlanModalOpen(false)
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "DOWNGRADE_ALREADY_SCHEDULED") {
          toast.error("Un changement de plan est déjà programmé.")
        } else if (err.code === "INVALID_PLAN_CHANGE") {
          toast.error("Ce changement de plan n'est pas possible. Pour passer au plan gratuit, utilisez l'annulation.")
        } else if (err.code === "SUBSCRIPTION_INACTIVE") {
          toast.error("Aucun abonnement actif.")
        } else if (err.code === "NOT_FOUND") {
          toast.error("Ce plan n'est pas disponible.")
        } else if (err.code === "INTERNAL_ERROR") {
          toast.error("Le paiement est temporairement indisponible. Réessayez plus tard.")
        } else {
          toast.error("Impossible de changer de plan. Réessayez.")
        }
      }
    } finally {
      setActioning(null)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await apiClient.billing.cancel()
      await refetch()
      toast.success(`Abonnement annulé — accès${currentPlan.name ? ` au plan ${currentPlan.name}` : ""} conservé jusqu'à la fin de la période.`)
      setCancelModalOpen(false)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "ALREADY_ON_FREE_PLAN") {
          toast.error("Vous êtes déjà sur le plan gratuit.")
        } else if (err.code === "SUBSCRIPTION_INACTIVE") {
          toast.error("Aucun abonnement actif.")
        } else if (err.code === "UNAUTHORIZED") {
          return
        } else {
          toast.error("Impossible d'annuler l'abonnement. Réessayez.")
        }
      }
    } finally {
      setCancelling(false)
    }
  }

  const handleCancelScheduledChange = async () => {
    setCancellingScheduled(true)
    try {
      await apiClient.billing.cancelScheduledChange()
      await refetch()
      toast.success("Le changement programmé a été annulé.")
      setCancelScheduledModalOpen(false)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "NO_SCHEDULED_CHANGE") {
        toast.error("Aucun changement programmé à annuler.")
      } else {
        toast.error("Impossible d'annuler le changement. Réessayez.")
      }
    } finally {
      setCancellingScheduled(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium text-text mb-1">
          Impossible de charger les données de facturation
        </p>
        <p className="text-sm text-text-secondary mb-4">{error}</p>
        <Button variant="secondary" onClick={refetch}>Réessayer</Button>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[sub?.status ?? "active"] ?? STATUS_CONFIG.active
  const isFree = currentPlanCode === "free"
  const canCancel = !isFree && sub?.status === "active" && !hasScheduledChange && sub?.billingProvider === "dodo"

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-8 max-w-4xl">
      <PageHeader
        title="Facturation"
        description="Gérez votre plan et suivez votre consommation mensuelle."
      />

      {/* ── Alertes statut ──────────────────────────────────────────────── */}
      {sub?.status === "past_due" && (
        <div className="flex items-start gap-3 p-4 bg-warning-subtle border border-warning/30 rounded-2xl">
          <AlertDiamondIcon className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning-text">Paiement en retard</p>
            <p className="text-sm text-warning-text/80 mt-0.5">
              Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement pour conserver l&apos;accès à votre plan.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setPlanModalOpen(true)} className="shrink-0">
            Mettre à jour
          </Button>
        </div>
      )}

      {sub?.status === "expired" && (
        <div className="flex items-start gap-3 p-4 bg-error-subtle border border-error/30 rounded-2xl">
          <AlertCircleIcon className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-error-hover">Abonnement expiré</p>
            <p className="text-sm text-error-hover/80 mt-0.5">
              Votre abonnement a expiré. Choisissez un plan pour continuer à utiliser la plateforme.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setPlanModalOpen(true)} className="shrink-0">
            Choisir un plan
          </Button>
        </div>
      )}

      {/* ── Bannière changement programmé ───────────────────────────────── */}
      {scheduledAction === "downgrade" && scheduledPlan && scheduledPlanAt && (
        <div className="flex items-center gap-3 p-4 bg-warning-subtle border border-warning/30 rounded-2xl">
          <InformationCircleIcon className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-warning-text flex-1">
            Votre plan passera de{" "}
            <strong>{currentPlan.name}</strong> → <strong>{planName(scheduledPlan, plans)}</strong>{" "}
            le <strong>{formatDate(scheduledPlanAt)}</strong>.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => setCancelScheduledModalOpen(true)}
          >
            Annuler ce changement
          </Button>
        </div>
      )}

      {(scheduledAction === "cancel" || (sub?.cancelAtPeriodEnd && !scheduledAction)) && periodEnd && (
        <div className="flex items-center gap-3 p-4 bg-warning-subtle border border-warning/30 rounded-2xl">
          <AlertDiamondIcon className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-warning-text flex-1">
            Votre abonnement sera résilié le <strong>{formatDate(periodEnd)}</strong>. Vous passerez au plan Gratuit.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => setCancelScheduledModalOpen(true)}
          >
            Annuler la résiliation
          </Button>
        </div>
      )}

      {/* ── Plan actuel ─────────────────────────────────────────────────── */}
      {(sub || currentPlan) && (
        <div>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Plan actuel
          </h2>
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-lg font-bold text-text">{currentPlan.name}</span>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  {scheduledAction === "cancel" && <Badge variant="warning">Résiliation programmée</Badge>}
                  {scheduledAction === "downgrade" && scheduledPlan && (
                    <Badge variant="warning">Rétrogradation → {planName(scheduledPlan, plans)}</Badge>
                  )}
                </div>
                {periodEnd && (
                  <p className="text-sm text-text-secondary">
                    {scheduledAction === "cancel" ? "Expire le" : "Renouvellement :"}{" "}
                    <span className="font-medium text-text">{formatDate(periodEnd)}</span>
                  </p>
                )}
                {currentPlan.priceMonthly !== undefined && currentPlan.priceMonthly > 0 && (
                  <p className="text-sm text-text-muted">{formatPrice(currentPlan.priceMonthly)}</p>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setPlanModalOpen(true)}>
                Changer de plan
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Usage du mois ───────────────────────────────────────────────── */}
      {usage && limits && periodStart && (
        <div>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Usage — <span className="capitalize">{formatMonthYear(periodStart)}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UsageCard label="Messages"    used={usage.messagesCount ?? 0}  total={limits.monthlyOutboundQuota} />
            <UsageCard label="Statuts"     used={usage.statusesCount ?? 0}  total={limits.monthlyOutboundQuota} />
            <UsageCard label="Requêtes API" used={usage.apiRequestsCount ?? 0}   total={limits.monthlyApiRequestQuota} />
          </div>
        </div>
      )}

      {/* ── Historique des paiements ─────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Historique des paiements
        </h2>
        <Card className="p-0 overflow-hidden">
          {paymentsLoading ? (
            <div className="px-6 py-10 text-center text-sm text-text-muted">Chargement…</div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <InvoiceIcon className="w-8 h-8 text-text-muted mb-3" />
              <p className="text-sm font-medium text-text">Aucun paiement enregistré pour le moment</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Date", "Plan", "Période", "Montant", "Statut"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-bg-subtle transition-colors">
                        <td className="px-6 py-4 text-sm text-text-body whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-text whitespace-nowrap">{payment.planName}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                          {formatDate(payment.periodStart)} → {formatDate(payment.periodEnd)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-text whitespace-nowrap">
                          {formatAmount(payment.amount, payment.currency)}
                        </td>
                        <td className="px-6 py-4">
                          {payment.status === "succeeded" ? (
                            <Badge variant="success"><Tick01Icon className="w-3 h-3" /> Réussi</Badge>
                          ) : payment.status === "failed" ? (
                            <Badge variant="error"><Cancel01Icon className="w-3 h-3" /> Échoué</Badge>
                          ) : payment.status === "refunded" ? (
                            <Badge variant="neutral">Remboursé</Badge>
                          ) : (
                            <Badge variant="warning">En attente</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-border">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-text">{formatAmount(payment.amount, payment.currency)}</span>
                        {payment.status === "succeeded" ? (
                          <Badge variant="success">Réussi</Badge>
                        ) : payment.status === "failed" ? (
                          <Badge variant="error">Échoué</Badge>
                        ) : payment.status === "refunded" ? (
                          <Badge variant="neutral">Remboursé</Badge>
                        ) : (
                          <Badge variant="warning">En attente</Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary">{payment.planName}</p>
                      <p className="text-xs text-text-muted mt-0.5">{formatDate(payment.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-text-muted">Page {page} sur {totalPages}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowLeft01Icon className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={[
                      "w-7 h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                      p === page ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-subtle hover:text-text",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowRight01Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Annuler l'abonnement ─────────────────────────────────────────── */}
      {canCancel && (
        <div className="border border-error/30 bg-error-subtle rounded-2xl p-6">
          <h2 className="text-base font-semibold text-text mb-1">Annuler l&apos;abonnement</h2>
          <p className="text-sm text-text-secondary mb-4">
            Vous conserverez l&apos;accès{currentPlan.name ? ` au plan ${currentPlan.name}` : ""} jusqu&apos;au{" "}
            {periodEnd ? formatDate(periodEnd) : "la fin de votre période"}, puis passerez au plan Gratuit.
          </p>
          <Button variant="danger" onClick={() => setCancelModalOpen(true)}>
            Annuler l&apos;abonnement
          </Button>
        </div>
      )}

      {/* ── Modal — Changer de plan ───────────────────────────────────────── */}
      <Modal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Changer de plan"
        description="Choisissez le plan adapté à vos besoins."
        maxWidth="max-w-4xl"
      >
        {sortedPlans.length > 0 ? (
          <>
            {hasScheduledChange && (
              <div className="flex items-center gap-3 p-3 bg-warning-subtle border border-warning/30 rounded-xl mb-4">
                <InformationCircleIcon className="w-4 h-4 text-warning shrink-0" />
                <p className="text-sm text-warning-text flex-1">
                  {scheduledAction === "downgrade" && scheduledPlan
                    ? `Rétrogradation vers ${planName(scheduledPlan, plans)} programmée. Un upgrade annulera ce changement automatiquement.`
                    : "Résiliation programmée. Un upgrade annulera la résiliation automatiquement."}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0"
                  loading={cancellingScheduled}
                  onClick={handleCancelScheduledChange}
                >
                  Annuler le changement
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sortedPlans.map((plan) => {
                const planIdx = PLAN_ORDER.indexOf(plan.code)
                return (
                  <PlanCard
                    key={plan.code}
                    plan={plan}
                    isCurrent={plan.code === currentPlanCode}
                    isUpgrade={planIdx > currentPlanIdx}
                    isDowngrade={planIdx < currentPlanIdx && plan.code !== "free"}
                    isScheduled={plan.code === scheduledPlan}
                    actioning={actioning}
                    onSelect={handleSelectPlan}
                  />
                )
              })}
            </div>
           
          </>
        ) : (
          <p className="text-sm text-text-secondary text-center py-8">Impossible de charger les plans. Réessayez.</p>
        )}
      </Modal>

      {/* ── Modal — Confirmer annulation ────────────────────────────────── */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Annuler l'abonnement"
        description="Cette action programmera la résiliation à la fin de la période."
      >
        <p className="text-sm text-text-body mb-6">
          Votre abonnement sera annulé à la fin de la période en cours
          {periodEnd ? ` (${formatDate(periodEnd)})` : ""}. Vous conserverez l&apos;accès
          {currentPlan.name ? ` au plan ${currentPlan.name}` : ""} jusqu&apos;à cette date,
          puis vous serez automatiquement basculé sur le plan gratuit.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
            Conserver le plan
          </Button>
          <Button variant="danger" loading={cancelling} onClick={handleCancel}>
            Confirmer l&apos;annulation
          </Button>
        </div>
      </Modal>

      {/* ── Modal — Confirmer annulation du changement programmé ────────── */}
      <Modal
        open={cancelScheduledModalOpen}
        onClose={() => setCancelScheduledModalOpen(false)}
        title={scheduledAction === "cancel" ? "Annuler la résiliation" : "Annuler le changement de plan"}
      >
        <p className="text-sm text-text-body mb-6">
          {scheduledAction === "cancel"
            ? `Votre abonnement restera actif sur le plan ${currentPlan.name ?? "actuel"}.`
            : scheduledAction === "downgrade" && scheduledPlan
              ? `La rétrogradation vers ${planName(scheduledPlan, plans)} sera annulée. Votre plan ${currentPlan.name ?? "actuel"} restera actif.`
              : "Ce changement programmé sera annulé."}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelScheduledModalOpen(false)}>
            Retour
          </Button>
          <Button variant="primary" loading={cancellingScheduled} onClick={handleCancelScheduledChange}>
            Confirmer
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}

/* ─── Page wrapper (Suspense for useSearchParams) ─────────────────────────── */

export default function BillingPage() {
  return (
    <Suspense>
      <BillingPageContent />
    </Suspense>
  )
}
