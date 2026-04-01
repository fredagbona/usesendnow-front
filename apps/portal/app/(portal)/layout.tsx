"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import Sidebar, { MobileDrawer } from "@/components/layout/Sidebar"
import TopNav from "@/components/layout/TopNav"
import { apiClient } from "@usesendnow/api-client"
import type { Plan, SubscriptionResponse, User } from "@usesendnow/types"

function getFallbackPlan(code: string): Pick<Plan, "code" | "name" | "monthlyOutboundQuota" | "limits"> {
  return {
    code,
    name: code === "free" ? "Gratuit" : code,
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

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [checked, setChecked] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
    setChecked(true)
    Promise.all([
      apiClient.billing.getSubscription(),
      apiClient.auth.me(),
    ]).then(([sub, me]) => {
      setSubscription(sub)
      setUser(me)
    }).catch(() => {})
  }, [router])

  if (!checked) {
    return null
  }

  const sub = subscription?.subscription
  const currentPlanCode = sub?.plan?.code ?? "free"
  const plan = sub?.plan ?? getFallbackPlan(currentPlanCode)
  const planName = plan.name
  const outboundTotal = plan.monthlyOutboundQuota ?? plan.limits?.monthlyOutboundQuota

  return (
    <div className="flex min-h-screen bg-bg-subtle overflow-x-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          outboundUsed={subscription?.usage?.effectiveOutboundUsage}
          outboundTotal={outboundTotal}
          planName={planName}
          user={user}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        planName={planName}
      />

      <div
        className={[
          "flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-200",
          collapsed ? "md:ml-16" : "md:ml-60",
        ].join(" ")}
      >
        <TopNav
          user={user}
          planName={planName}
          onMobileMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
