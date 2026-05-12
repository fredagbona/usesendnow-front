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
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
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
const PLAN_CONTACT_GROUP_LIMITS: Record<string, number | null> = {
  free: 2,
  starter: 10,
  pro: 50,
  plus: null,
}

function formatPrice(priceMonthly: number | undefined, locale: "fr" | "en", billingCopy: ReturnType<typeof usePortalLocale>["copy"]["billing"]): string {
  if (!priceMonthly || priceMonthly === 0) return `0 ${billingCopy.priceUnit}`
  return `${(priceMonthly / 100).toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} ${billingCopy.priceUnit}`
}

function formatUsdValue(
  amount: number | undefined,
  locale: "fr" | "en",
  billingCopy: ReturnType<typeof usePortalLocale>["copy"]["billing"],
): string {
  if (amount === undefined || amount === null) return ""
  const formatted = amount.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")
  return billingCopy.priceSecondaryEur.replace("{{amount}}", formatted)
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "XOF" ? "EUR" : currency,
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

function getPlanDisplayPrice(plan: Plan, locale: "fr" | "en", billingCopy: ReturnType<typeof usePortalLocale>["copy"]["billing"]) {
  if (plan.priceEur !== undefined) {
    return {
      primary: formatUsdValue(plan.priceEur, locale, billingCopy),
      secondary: "",
    }
  }

  if (plan.priceFcfa !== undefined) {
    return {
      primary: formatUsdValue(plan.priceFcfa, locale, billingCopy),
      secondary: "",
    }
  }

  if (plan.currency === "XOF" && plan.priceMonthly !== undefined) {
    const usd = plan.priceMonthly / 100
    return {
      primary: formatUsdValue(usd, locale, billingCopy),
      secondary: "",
    }
  }

  return {
    primary: formatPrice(plan.priceMonthly, locale, billingCopy),
    secondary: "",
  }
}

function getPlanFeatures(plan: Plan, locale: "fr" | "en", billingCopy: ReturnType<typeof usePortalLocale>["copy"]["billing"]): string[] {
  const limits = getPlanLimits(plan)
  const displayedMonthlyOutboundQuota =
    plan.code === "starter" ? 5000 : limits.monthlyOutboundQuota
  const features = plan.features ?? {
    campaigns: plan.canUseCampaigns ?? false,
    statuses: plan.canUseStatuses ?? false,
    voiceNotes: false,
    webhooks: false,
  }
  const contactGroupsLimit = PLAN_CONTACT_GROUP_LIMITS[plan.code]
  const contactGroups =
    contactGroupsLimit === null
      ? billingCopy.contactGroupsUnlimited
      : typeof contactGroupsLimit === "number"
        ? `${contactGroupsLimit} ${billingCopy.contactGroupsSuffix}`
        : undefined

  return [
    `${limits.maxInstances} ${limits.maxInstances > 1 ? billingCopy.instances : billingCopy.instance}`,
    `${displayedMonthlyOutboundQuota.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} ${billingCopy.messagesPerMonth}`,
    `${limits.monthlyApiRequestQuota.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} ${billingCopy.apiRequests}`,
    `${limits.maxApiKeys} ${limits.maxApiKeys > 1 ? billingCopy.apiKeys : billingCopy.apiKey}`,
    `${limits.maxWebhookEndpoints} ${limits.maxWebhookEndpoints > 1 ? billingCopy.webhookEndpoints : billingCopy.webhookEndpoint}`,
    contactGroups,
    `${billingCopy.features.campaigns} : ${features.campaigns ? billingCopy.yes : billingCopy.no}`,
    `${billingCopy.features.statuses} : ${features.statuses ? billingCopy.yes : billingCopy.no}`,
    `${billingCopy.features.webhooks} : ${features.webhooks ? billingCopy.yes : billingCopy.no}`,
    `${billingCopy.features.voiceNotes} : ${features.voiceNotes ? billingCopy.yes : billingCopy.no}`,
  ].filter((feature): feature is string => Boolean(feature))
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

function getStatusConfig(billingCopy: ReturnType<typeof usePortalLocale>["copy"]["billing"]) {
  return {
    active: { variant: "success", label: billingCopy.planStatusActive },
    trialing: { variant: "info", label: billingCopy.planStatusTrial },
    past_due: { variant: "warning", label: billingCopy.planStatusPastDue },
    cancelled: { variant: "warning", label: billingCopy.planStatusCancelled },
    expired: { variant: "error", label: billingCopy.planStatusExpired },
  } as const
}

/* ─── Usage stat card ─────────────────────────────────────────────────────── */

function UsageCard({ label, used, total }: { label: string; used: number; total: number }) {
  const { copy, locale } = usePortalLocale()
  const billingCopy = copy.billing
  const isUnlimited = total <= 0 || total >= 999999
  const percent = isUnlimited ? 0 : Math.min(Math.round((used / total) * 100), 100)
  const barColor = percent >= 90 ? "#EF4444" : percent >= 70 ? "#F59E0B" : "#FFD600"
  return (
    <div className="bg-bg border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</p>
      <div>
        <span className="text-2xl font-bold text-text">{used.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}</span>
        <span className="text-sm text-text-muted ml-1">
          {isUnlimited ? `/ ${billingCopy.unlimited}` : `/ ${total.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="space-y-1">
          <div className="w-full bg-bg-muted rounded-full h-1.5">
            <div className="h-1.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: barColor }} />
          </div>
          <p className="text-xs text-text-muted">{percent}% {billingCopy.percentUsed}</p>
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
  const { copy, locale } = usePortalLocale()
  const billingCopy = copy.billing
  const pricing = getPlanDisplayPrice(plan, locale, billingCopy)
  const features = getPlanFeatures(plan, locale, billingCopy)

  return (
    <div className={[
      "bg-bg border rounded-2xl p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]",
      isCurrent ? "border-primary ring-1 ring-primary"
        : isScheduled ? "border-warning ring-1 ring-warning"
        : "border-border",
    ].join(" ")}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text">{plan.name}</h3>
        {isCurrent && <Badge variant="success">{billingCopy.currentBadge}</Badge>}
        {isScheduled && <Badge variant="warning">{billingCopy.scheduledBadge}</Badge>}
      </div>

      <p className="text-xl font-bold text-text mb-4">
        {pricing.primary}
      </p>
      {pricing.secondary && (
        <p className="text-xs text-text-muted -mt-3 mb-4">
          {pricing.secondary}
        </p>
      )}

      <ul className="space-y-2 mb-5 text-sm flex-1">
        {features.map((feature) => (
          <PlanFeatureRow key={feature} label={feature} ok={!feature.endsWith(`: ${billingCopy.no}`)} />
        ))}
      </ul>

      {isCurrent ? (
        <Button variant="secondary" size="sm" disabled className="w-full justify-center">
          {billingCopy.currentPlanButton}
        </Button>
      ) : plan.code === "free" ? null : (
        <Button
          variant={isUpgrade ? "primary" : "secondary"}
          size="sm"
          loading={actioning === plan.code}
          onClick={() => onSelect(plan)}
          className="w-full justify-center"
        >
          {isUpgrade ? copy.topnav.upgrade : billingCopy.downgrade}
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
  const { copy, locale } = usePortalLocale()
  const billingCopy = copy.billing
  const { subscription, plans, loading, error, refetch } = useBilling()
  const { payments, page, totalPages, loading: paymentsLoading, goToPage, paymentsTeamOwnerOnly } = usePayments()
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
  const currentPlanDisplayPrice = getPlanDisplayPrice(currentPlan, locale, billingCopy)

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
      toast.success(billingCopy.toast.paymentReceived)
      setTimeout(async () => {
        await refetch()
        toast.success(billingCopy.toast.planUpdated)
      }, 2000)
    }

    if (cancelled === "true") {
      handledParams.current = true
      window.history.replaceState({}, "", "/billing")
      toast.info(billingCopy.toast.paymentCancelled)
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
        toast.success(billingCopy.toast.downgradeScheduled.replace("{{planName}}", plan.name))
        setPlanModalOpen(false)
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "DOWNGRADE_ALREADY_SCHEDULED") {
          toast.error(billingCopy.toast.changeAlreadyScheduled)
        } else if (err.code === "INVALID_PLAN_CHANGE") {
          toast.error(billingCopy.toast.invalidPlanChange)
        } else if (err.code === "SUBSCRIPTION_INACTIVE") {
          toast.error(billingCopy.toast.noActiveSubscription)
        } else if (err.code === "NOT_FOUND") {
          toast.error(billingCopy.toast.planUnavailable)
        } else if (err.code === "INTERNAL_ERROR") {
          toast.error(billingCopy.toast.paymentTemporarilyUnavailable)
        } else if (err.code === "BILLING_TEAM_MUTATION_FORBIDDEN") {
          toast.error(billingCopy.toast.teamMutationForbidden)
        } else {
          toast.error(billingCopy.toast.changeFailed)
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
      toast.success(
        currentPlan.name
          ? billingCopy.toast.cancelSuccessWithPlan.replace("{{planName}}", currentPlan.name)
          : billingCopy.toast.cancelSuccess,
      )
      setCancelModalOpen(false)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "ALREADY_ON_FREE_PLAN") {
          toast.error(billingCopy.toast.alreadyOnFree)
        } else if (err.code === "SUBSCRIPTION_INACTIVE") {
          toast.error(billingCopy.toast.noActiveSubscription)
        } else if (err.code === "UNAUTHORIZED") {
          return
        } else if (err.code === "BILLING_TEAM_MUTATION_FORBIDDEN") {
          toast.error(billingCopy.toast.teamMutationForbidden)
        } else {
          toast.error(billingCopy.toast.cancelFailed)
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
      toast.success(billingCopy.toast.scheduledCancelled)
      setCancelScheduledModalOpen(false)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "NO_SCHEDULED_CHANGE") {
          toast.error(billingCopy.toast.noScheduledChange)
        } else if (err.code === "BILLING_TEAM_MUTATION_FORBIDDEN") {
          toast.error(billingCopy.toast.teamMutationForbidden)
        } else {
          toast.error(billingCopy.toast.scheduledCancelFailed)
        }
      } else {
        toast.error(billingCopy.toast.scheduledCancelFailed)
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
        <p className="text-sm font-medium text-text mb-1">{billingCopy.loadErrorTitle}</p>
        <p className="text-sm text-text-secondary mb-4">{error}</p>
        <Button variant="secondary" onClick={refetch}>{copy.common.retry}</Button>
      </div>
    )
  }

  const statusConfigMap = getStatusConfig(billingCopy)
  const statusConfig = statusConfigMap[sub?.status as keyof typeof statusConfigMap] ?? statusConfigMap.active
  const isFree = currentPlanCode === "free"
  const canCancel = !isFree && sub?.status === "active" && !hasScheduledChange && sub?.billingProvider === "dodo"

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-8 max-w-4xl">
      <PageHeader
        title={copy.billing.pageTitle}
        description={copy.billing.pageDescription}
      />

      {/* ── Alertes statut ──────────────────────────────────────────────── */}
      {sub?.status === "past_due" && (
        <div className="flex items-start gap-3 p-4 bg-warning-subtle border border-warning/30 rounded-2xl">
          <AlertDiamondIcon className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning-text">{billingCopy.alerts.pastDueTitle}</p>
            <p className="text-sm text-warning-text/80 mt-0.5">
              {billingCopy.alerts.pastDueDescription}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setPlanModalOpen(true)} className="shrink-0">
            {billingCopy.updatePayment}
          </Button>
        </div>
      )}

      {sub?.status === "expired" && (
        <div className="flex items-start gap-3 p-4 bg-error-subtle border border-error/30 rounded-2xl">
          <AlertCircleIcon className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-error-hover">{billingCopy.alerts.expiredTitle}</p>
            <p className="text-sm text-error-hover/80 mt-0.5">
              {billingCopy.alerts.expiredDescription}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setPlanModalOpen(true)} className="shrink-0">
            {billingCopy.choosePlan}
          </Button>
        </div>
      )}

      {/* ── Bannière changement programmé ───────────────────────────────── */}
      {scheduledAction === "downgrade" && scheduledPlan && scheduledPlanAt && (
        <div className="flex items-center gap-3 p-4 bg-warning-subtle border border-warning/30 rounded-2xl">
          <InformationCircleIcon className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-warning-text flex-1">
            {billingCopy.scheduledDowngradeNoticePrefix}{" "}
            <strong>{currentPlan.name}</strong> → <strong>{planName(scheduledPlan, plans)}</strong>{" "}
            {billingCopy.scheduledDowngradeNoticeOn} <strong>{formatDate(scheduledPlanAt)}</strong>.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => setCancelScheduledModalOpen(true)}
          >
            {billingCopy.cancelScheduledChange}
          </Button>
        </div>
      )}

      {(scheduledAction === "cancel" || (sub?.cancelAtPeriodEnd && !scheduledAction)) && periodEnd && (
        <div className="flex items-center gap-3 p-4 bg-warning-subtle border border-warning/30 rounded-2xl">
          <AlertDiamondIcon className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-warning-text flex-1">
            {billingCopy.scheduledCancelNoticePrefix} <strong>{formatDate(periodEnd)}</strong>. {billingCopy.scheduledCancelNoticeSuffix}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => setCancelScheduledModalOpen(true)}
          >
            {billingCopy.cancelTermination}
          </Button>
        </div>
      )}

      {/* ── Plan actuel ─────────────────────────────────────────────────── */}
      {(sub || currentPlan) && (
        <div>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            {billingCopy.currentPlan}
          </h2>
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-lg font-bold text-text">{currentPlan.name}</span>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  {scheduledAction === "cancel" && <Badge variant="warning">{billingCopy.cancelScheduledBadge}</Badge>}
                  {scheduledAction === "downgrade" && scheduledPlan && (
                    <Badge variant="warning">{billingCopy.downgradeScheduledBadgePrefix} {planName(scheduledPlan, plans)}</Badge>
                  )}
                </div>
                {periodEnd && (
                  <p className="text-sm text-text-secondary">
                    {scheduledAction === "cancel" ? billingCopy.expiresOn : billingCopy.renewsOn}{" "}
                    <span className="font-medium text-text">{formatDate(periodEnd)}</span>
                  </p>
                )}
                <p className="text-sm text-text-muted">
                  {currentPlanDisplayPrice.primary} {currentPlanDisplayPrice.secondary}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setPlanModalOpen(true)}>
                {billingCopy.changePlan}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Usage du mois ───────────────────────────────────────────────── */}
      {usage && limits && periodStart && (
        <div>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            {billingCopy.usageTitle} — <span className="capitalize">{formatMonthYear(periodStart)}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UsageCard label={billingCopy.messages} used={usage.messagesCount ?? 0} total={limits.monthlyOutboundQuota} />
            <UsageCard label={billingCopy.statuses} used={usage.statusesCount ?? 0} total={limits.monthlyOutboundQuota} />
            <UsageCard label={billingCopy.apiRequests} used={usage.apiRequestsCount ?? 0} total={limits.monthlyApiRequestQuota} />
          </div>
        </div>
      )}

      {/* ── Historique des paiements ─────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
          {billingCopy.paymentHistory}
        </h2>
        <Card className="p-0 overflow-hidden">
          {paymentsLoading ? (
            <div className="px-6 py-10 text-center text-sm text-text-muted">{billingCopy.loadingPayments}</div>
          ) : paymentsTeamOwnerOnly ? (
            <div className="flex gap-3 px-6 py-8 text-left">
              <InformationCircleIcon className="w-5 h-5 shrink-0 text-text-muted mt-0.5" aria-hidden />
              <p className="text-sm text-text-secondary leading-relaxed">{billingCopy.paymentsHistoryTeamOwnerOnly}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <InvoiceIcon className="w-8 h-8 text-text-muted mb-3" />
              <p className="text-sm font-medium text-text">{billingCopy.noPayments}</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {billingCopy.paymentTableHeaders.map((h) => (
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
                            <Badge variant="success"><Tick01Icon className="w-3 h-3" /> {billingCopy.paymentStatusSucceeded}</Badge>
                          ) : payment.status === "failed" ? (
                            <Badge variant="error"><Cancel01Icon className="w-3 h-3" /> {billingCopy.paymentStatusFailed}</Badge>
                          ) : payment.status === "refunded" ? (
                            <Badge variant="neutral">{billingCopy.paymentStatusRefunded}</Badge>
                          ) : (
                            <Badge variant="warning">{billingCopy.paymentStatusPending}</Badge>
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
                          <Badge variant="success">{billingCopy.paymentStatusSucceeded}</Badge>
                        ) : payment.status === "failed" ? (
                          <Badge variant="error">{billingCopy.paymentStatusFailed}</Badge>
                        ) : payment.status === "refunded" ? (
                          <Badge variant="neutral">{billingCopy.paymentStatusRefunded}</Badge>
                        ) : (
                          <Badge variant="warning">{billingCopy.paymentStatusPending}</Badge>
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
              <p className="text-xs text-text-muted">{billingCopy.pageOf} {page} {billingCopy.of} {totalPages}</p>
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
          <h2 className="text-base font-semibold text-text mb-1">{billingCopy.cancelSubscriptionTitle}</h2>
          <p className="text-sm text-text-secondary mb-4">
            {billingCopy.cancelSubscriptionKeepAccessPrefix}
            {currentPlan.name ? ` ${currentPlan.name}` : ""} {billingCopy.cancelSubscriptionUntilPrefix}{" "}
            {periodEnd ? formatDate(periodEnd) : billingCopy.cancelSubscriptionUntilFallback}, {billingCopy.cancelSubscriptionThenFree}
          </p>
          <Button variant="danger" onClick={() => setCancelModalOpen(true)}>
            {billingCopy.cancelSubscriptionCta}
          </Button>
        </div>
      )}

      {/* ── Modal — Changer de plan ───────────────────────────────────────── */}
      <Modal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title={billingCopy.modals.changePlanTitle}
        description={billingCopy.modals.changePlanDescription}
        maxWidth="max-w-4xl"
      >
        {sortedPlans.length > 0 ? (
          <>
            {hasScheduledChange && (
              <div className="flex items-center gap-3 p-3 bg-warning-subtle border border-warning/30 rounded-xl mb-4">
                <InformationCircleIcon className="w-4 h-4 text-warning shrink-0" />
                <p className="text-sm text-warning-text flex-1">
                  {scheduledAction === "downgrade" && scheduledPlan
                    ? `${billingCopy.modals.scheduledDowngradeUpgradeHintPrefix} ${planName(scheduledPlan, plans)} ${billingCopy.modals.scheduledDowngradeUpgradeHintSuffix}`
                    : billingCopy.modals.scheduledCancelUpgradeHint}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0"
                  loading={cancellingScheduled}
                  onClick={handleCancelScheduledChange}
                >
                  {billingCopy.cancelChange}
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
          <p className="text-sm text-text-secondary text-center py-8">{billingCopy.modals.noPlans}</p>
        )}
      </Modal>

      {/* ── Modal — Confirmer annulation ────────────────────────────────── */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={billingCopy.modals.cancelTitle}
        description={billingCopy.modals.cancelDescription}
      >
        <p className="text-sm text-text-body mb-6">
          {billingCopy.modals.cancelPeriodTextPrefix}
          {periodEnd ? ` (${formatDate(periodEnd)})` : ""}. {billingCopy.modals.cancelPeriodTextSuffix}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
            {billingCopy.modals.keepPlan}
          </Button>
          <Button variant="danger" loading={cancelling} onClick={handleCancel}>
            {billingCopy.modals.confirmCancel}
          </Button>
        </div>
      </Modal>

      {/* ── Modal — Confirmer annulation du changement programmé ────────── */}
      <Modal
        open={cancelScheduledModalOpen}
        onClose={() => setCancelScheduledModalOpen(false)}
        title={scheduledAction === "cancel" ? billingCopy.modals.cancelTerminationTitle : billingCopy.modals.cancelScheduledTitle}
      >
        <p className="text-sm text-text-body mb-6">
          {scheduledAction === "cancel"
            ? `${billingCopy.modals.scheduledCancelKeepPlanPrefix} ${currentPlan.name ?? billingCopy.modals.currentPlanFallback}.`
            : scheduledAction === "downgrade" && scheduledPlan
              ? `${billingCopy.modals.scheduledDowngradeCancelPrefix} ${planName(scheduledPlan, plans)} ${billingCopy.modals.scheduledDowngradeCancelSuffix} ${currentPlan.name ?? billingCopy.modals.currentPlanFallback} ${billingCopy.modals.scheduledDowngradeCancelSuffix2}`
              : billingCopy.modals.scheduledChangeCancelled}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelScheduledModalOpen(false)}>
            {billingCopy.modals.back}
          </Button>
          <Button variant="primary" loading={cancellingScheduled} onClick={handleCancelScheduledChange}>
            {billingCopy.modals.confirm}
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
