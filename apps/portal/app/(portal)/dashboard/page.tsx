"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { formatRelativeDate } from "@/lib/format"
import { apiClient } from "@usesendnow/api-client"
import type { SubscriptionResponse, Message, Campaign, Plan, PlanLimits } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import QuotaBar from "@/components/ui/QuotaBar"
import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton"
import {
  Message01Icon,
  Megaphone01Icon,
  SmartPhone01Icon,
  Key01Icon,
  AlertDiamondIcon,
  WebhookIcon,
} from "hugeicons-react"

const MESSAGE_STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "purple" | "error"> = {
  queued: "neutral",
  sent: "blue",
  delivered: "success",
  read: "purple",
  failed: "error",
}

const MESSAGE_STATUS_LABEL: Record<string, string> = {
  queued: "En file",
  sent: "Envoyé",
  delivered: "Livré",
  read: "Lu",
  failed: "Échoué",
}

const CAMPAIGN_STATUS_VARIANT: Record<string, "neutral" | "yellow" | "blue" | "orange" | "success" | "error"> = {
  draft: "neutral",
  scheduled: "yellow",
  running: "blue",
  paused: "orange",
  paused_quota: "orange",
  paused_plan: "orange",
  completed: "success",
  failed: "error",
}

const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifié",
  running: "En cours",
  paused: "En pause",
  paused_quota: "En pause (quota)",
  paused_plan: "En pause (plan)",
  completed: "Terminé",
  failed: "Échoué",
}

function getFallbackPlan(code: string): Plan {
  return {
    code,
    name: code === "free" ? "Gratuit" : code,
    priceMonthly: 0,
    maxInstances: 0,
    monthlyOutboundQuota: 0,
    monthlyApiRequestQuota: 0,
    maxApiKeys: 0,
    maxWebhookEndpoints: 0,
    canUseCampaigns: false,
    canUseStatuses: false,
    limits: {
      maxInstances: 0,
      maxApiKeys: 0,
      maxWebhookEndpoints: 0,
      monthlyOutboundQuota: 0,
      monthlyApiRequestQuota: 0,
    },
    features: {
      campaigns: false,
      statuses: false,
      voiceNotes: false,
      webhooks: false,
    },
  }
}

function getPlanLimits(plan: Plan): PlanLimits {
  return {
    maxInstances: plan.maxInstances ?? plan.limits?.maxInstances ?? 0,
    maxApiKeys: plan.maxApiKeys ?? plan.limits?.maxApiKeys ?? 0,
    maxWebhookEndpoints: plan.maxWebhookEndpoints ?? plan.limits?.maxWebhookEndpoints ?? 0,
    monthlyOutboundQuota: plan.monthlyOutboundQuota ?? plan.limits?.monthlyOutboundQuota ?? 0,
    monthlyApiRequestQuota: plan.monthlyApiRequestQuota ?? plan.limits?.monthlyApiRequestQuota ?? 0,
  }
}

function StatTile({
  icon,
  iconBg,
  iconColor,
  value,
  suffix,
  label,
  trend,
  loading,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: number
  suffix?: string
  label: string
  trend?: { label: string; positive?: boolean }
  loading: boolean
}) {
  return (
    <Card elevated>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <div className={`w-5 h-5 ${iconColor}`}>{icon}</div>
        </div>
        {trend && !loading && (
          <span className={[
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend.positive
              ? "bg-primary-subtle text-primary-text"
              : "bg-bg-muted text-text-muted",
          ].join(" ")}>
            {trend.label}
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24 mb-1" />
      ) : (
        <p className="text-2xl font-bold text-text mb-0.5 tracking-tight">
          {value.toLocaleString("fr-FR")}
          {suffix && (
            <span className="text-sm font-normal text-text-muted ml-1">{suffix}</span>
          )}
        </p>
      )}
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [sub, msgs, camps] = await Promise.all([
          apiClient.billing.getSubscription(),
          apiClient.messages.list({ limit: 5 }),
          apiClient.campaigns.list(),
        ])
        setSubscription(sub)
        setMessages(msgs.messages)
        setCampaigns(camps.slice(0, 3))
      } catch {
        // show partial data
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const sub = subscription?.subscription
  const usage = subscription?.usage
  const currentPlanCode = sub?.plan?.code ?? "free"
  const currentPlan = sub?.plan ?? getFallbackPlan(currentPlanCode)
  const limits = getPlanLimits(currentPlan)

  const outboundPercent =
    usage && limits.monthlyOutboundQuota > 0
      ? Math.round(((usage.effectiveOutboundUsage ?? 0) / limits.monthlyOutboundQuota) * 100)
      : 0

  const noConnectedInstances = !loading && usage && usage.activeInstancesCount === 0

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-8">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre activité WhatsApp"
      />

      {/* No instance alert */}
      {noConnectedInstances && (
        <div className="flex items-center gap-3 p-4 bg-warning-subtle border border-warning/30 rounded-2xl">
          <AlertDiamondIcon className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-text flex-1">
            Aucune instance WhatsApp connectée.{" "}
            <button
              onClick={() => router.push("/instances")}
              className="text-primary-ink font-medium hover:underline"
            >
              Connecter maintenant →
            </button>
          </p>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={<Message01Icon className="w-5 h-5" />}
          iconBg="bg-primary-subtle"
          iconColor="text-primary"
          value={usage?.effectiveOutboundUsage ?? 0}
          suffix={`/ ${limits.monthlyOutboundQuota.toLocaleString("fr-FR")}`}
          label="Messages ce mois"
          trend={usage ? {
            label: (usage.effectiveOutboundUsage ?? 0) > 0 ? "Actif" : "Aucun envoi",
            positive: (usage.effectiveOutboundUsage ?? 0) > 0,
          } : undefined}
          loading={loading}
        />
        <StatTile
          icon={<SmartPhone01Icon className="w-5 h-5" />}
          iconBg="bg-[#EFF6FF]"
          iconColor="text-[#3B82F6]"
          value={usage?.activeInstancesCount ?? 0}
          suffix={`/ ${limits.maxInstances}`}
          label="Instances actives"
          trend={usage ? {
            label: (usage.activeInstancesCount ?? 0) > 0 ? "En ligne" : "Hors ligne",
            positive: (usage.activeInstancesCount ?? 0) > 0,
          } : undefined}
          loading={loading}
        />
        <StatTile
          icon={<WebhookIcon className="w-5 h-5" />}
          iconBg="bg-[#FFF7ED]"
          iconColor="text-[#F97316]"
          value={usage?.apiRequestsCount ?? 0}
          label="Requêtes API ce mois"
          trend={{ label: "Ce mois" }}
          loading={loading}
        />
        <StatTile
          icon={<Megaphone01Icon className="w-5 h-5" />}
          iconBg="bg-[#FAF5FF]"
          iconColor="text-[#A855F7]"
          value={campaigns.filter((c) => c.status === "running").length}
          label="Campagnes en cours"
          trend={campaigns.length > 0 ? {
            label: `${campaigns.length} total`,
            positive: campaigns.filter((c) => c.status === "running").length > 0,
          } : undefined}
          loading={loading}
        />
      </div>

     

      {/* Quota card — shown only when >= 70% */}
      {!loading && usage && outboundPercent >= 70 && (
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-text">
              Utilisation — Plan {currentPlan.name}
            </h2>
            {outboundPercent >= 90 && (
              <span className="text-xs text-error-hover font-semibold">
                {outboundPercent >= 100 ? "Quota épuisé" : "Quota presque épuisé"}
              </span>
            )}
          </div>
          <div className="space-y-4">
            <QuotaBar
              label="Messages & Statuts"
              used={usage.effectiveOutboundUsage ?? 0}
              total={limits.monthlyOutboundQuota}
            />
            <QuotaBar
              label="Requêtes API"
              used={usage.apiRequestsCount ?? 0}
              total={limits.monthlyApiRequestQuota}
            />
          </div>
          {subscription?.period && (
            <p className="text-xs text-text-muted mt-4">
              Quota réinitialisé le{" "}
              {new Date(subscription.period.end).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </Card>
      )}

      {/* Recent content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-text">Messages récents</h2>
            <button
              onClick={() => router.push("/messages")}
              className="text-xs text-primary-ink hover:text-text hover:underline font-medium"
            >
              Tout voir →
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center mx-auto mb-3">
                <Message01Icon className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-sm text-text-secondary">Aucun message envoyé.</p>
              <button
                onClick={() => router.push("/messages")}
                className="text-sm text-primary-ink mt-1 hover:text-text hover:underline"
              >
                Envoyer le premier message
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => router.push(`/messages/${msg.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-subtle transition-colors text-left"
                >
                  <Badge variant={MESSAGE_STATUS_VARIANT[msg.status] ?? "neutral"}>
                    {MESSAGE_STATUS_LABEL[msg.status] ?? msg.status}
                  </Badge>
                  <span className="text-sm text-text-body flex-1 truncate font-mono">
                    {msg.to}
                  </span>
                  <span className="text-xs text-text-muted shrink-0">
                    {formatRelativeDate(msg.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-text">Campagnes récentes</h2>
            <button
              onClick={() => router.push("/campaigns")}
              className="text-xs text-primary-ink hover:text-text hover:underline font-medium"
            >
              Tout voir →
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center mx-auto mb-3">
                <Megaphone01Icon className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-sm text-text-secondary">Aucune campagne pour l&apos;instant.</p>
              <button
                onClick={() => router.push("/campaigns")}
                className="text-sm text-primary-ink mt-1 hover:text-text hover:underline"
              >
                Créer une campagne
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              {campaigns.map((camp) => (
                <button
                  key={camp.id}
                  onClick={() => router.push(`/campaigns/${camp.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-subtle transition-colors text-left"
                >
                  <Badge
                    variant={CAMPAIGN_STATUS_VARIANT[camp.status] ?? "neutral"}
                    pulse={camp.status === "running"}
                  >
                    {CAMPAIGN_STATUS_LABEL[camp.status] ?? camp.status}
                  </Badge>
                  <span className="text-sm text-text-body flex-1 truncate">
                    {camp.name}
                  </span>
                  <span className="text-xs text-text-muted shrink-0">
                    {camp.stats.sent} /{" "}
                    {(camp.stats.queued ?? 0) + camp.stats.sent + camp.stats.failed}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <h2 className="text-sm font-semibold text-text mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => router.push("/messages")}>
            <Message01Icon className="w-4 h-4" />
            Envoyer un message
          </Button>
          <Button variant="secondary" onClick={() => router.push("/campaigns")}>
            <Megaphone01Icon className="w-4 h-4" />
            Nouvelle campagne
          </Button>
          <Button variant="secondary" onClick={() => router.push("/instances")}>
            <SmartPhone01Icon className="w-4 h-4" />
            Connecter WhatsApp
          </Button>
          <Button variant="secondary" onClick={() => router.push("/api-keys")}>
            <Key01Icon className="w-4 h-4" />
            Générer une clé API
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
