"use client"

import { useEffect, useState } from "react"
import type { Plan, SubscriptionResponse } from "@usesendnow/types"
import { apiClient } from "@usesendnow/api-client"
import Sidebar, { MobileDrawer } from "@/components/layout/Sidebar"
import PortalTitleManager from "@/components/layout/PortalTitleManager"
import TopNav from "@/components/layout/TopNav"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { useWorkspace } from "@/components/workspace/WorkspaceContext"

function getFallbackPlan(
  code: string,
  freePlanDisplayName: string,
): Pick<Plan, "code" | "name" | "monthlyOutboundQuota" | "limits"> {
  return {
    code,
    name: code === "free" ? freePlanDisplayName : code,
    monthlyOutboundQuota: 0,
    limits: {
      maxInstances: 0,
      maxApiKeys: 0,
      maxWebhookEndpoints: 0,
      monthlyOutboundQuota: 0,
      monthlyApiRequestQuota: 0,
    },
  }
}

export default function PortalAppChrome({ children }: { children: React.ReactNode }) {
  const { copy } = usePortalLocale()
  const { me, subscriptionLayout, workspaceBootstrapLoading } = useWorkspace()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [billingFallback, setBillingFallback] = useState<SubscriptionResponse | null>(null)

  const subscription = subscriptionLayout ?? billingFallback
  const sub = subscription?.subscription
  const currentPlanCode = sub?.plan?.code ?? "free"
  const plan = sub?.plan ?? getFallbackPlan(currentPlanCode, copy.profile.planFallbackFree)
  const planName = plan.name
  const outboundTotal = plan.monthlyOutboundQuota ?? plan.limits?.monthlyOutboundQuota

  useEffect(() => {
    if (workspaceBootstrapLoading) return
    if (subscriptionLayout) return
    void apiClient.billing.getSubscription().then(setBillingFallback).catch(() => {})
  }, [workspaceBootstrapLoading, subscriptionLayout])

  return (
    <div className="flex flex-col min-h-screen bg-bg-subtle overflow-x-hidden">
      <PortalTitleManager />
      <div className="flex flex-1 min-h-0 min-w-0">
        <div className="hidden md:block">
          <Sidebar
            outboundUsed={subscription?.usage?.effectiveOutboundUsage}
            outboundTotal={outboundTotal}
            planName={planName}
            user={me}
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
          />
        </div>

        <MobileDrawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          planName={planName}
        />

        <div
          className={[
            "flex-1 min-w-0 flex flex-col min-h-0 transition-all duration-200",
            collapsed ? "md:ml-16" : "md:ml-60",
          ].join(" ")}
        >
          <TopNav user={me} planName={planName} onMobileMenu={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 md:p-8 w-full min-w-0 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}
