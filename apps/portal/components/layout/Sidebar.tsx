"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home01Icon,
  SmartPhone01Icon,
  Message01Icon,
  Megaphone01Icon,
  UserGroupIcon,
  File01Icon,
  WebhookIcon,
  Key01Icon,
  CreditCardIcon,
  ArrowLeft01Icon,
  Cancel01Icon,
} from "hugeicons-react"
import type { User } from "@usesendnow/types"
import BrandMark from "@/components/shared/BrandMark"

const NAV_ITEMS = [
  { label: "Tableau de bord", href: "/dashboard", icon: Home01Icon },
  { label: "Instances",       href: "/instances",  icon: SmartPhone01Icon },
  { label: "Messages",        href: "/messages",   icon: Message01Icon },
  { label: "Campagnes",       href: "/campaigns",  icon: Megaphone01Icon },
  { label: "Contacts",        href: "/contacts",   icon: UserGroupIcon },
  { label: "Modèles",         href: "/templates",  icon: File01Icon },
  { label: "Webhooks",        href: "/webhooks",   icon: WebhookIcon },
] as const

const BOTTOM_ITEMS = [
  { label: "Clés API",   href: "/api-keys", icon: Key01Icon },
  { label: "Abonnement", href: "/billing",  icon: CreditCardIcon },
] as const

interface SidebarProps {
  outboundUsed?: number
  outboundTotal?: number
  planName?: string
  user?: User | null
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({
  outboundUsed = 0,
  outboundTotal = 0,
  planName = "Gratuit",
  collapsed,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const isUnlimited = outboundTotal <= 0 || outboundTotal >= 999999
  const remaining = isUnlimited ? null : outboundTotal - outboundUsed
  const percent = isUnlimited ? 0 : Math.min(Math.round((outboundUsed / outboundTotal) * 100), 100)
  const barColor =
    percent >= 90 ? "var(--color-error)" :
    percent >= 70 ? "var(--color-warning)" :
    "var(--color-primary)"

  const navItem = (active: boolean, center = false) =>
    [
      "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150",
      center ? "justify-center" : "",
      active
        ? "bg-primary-subtle text-primary-text shadow-[inset_0_0_0_1px_rgba(10,10,10,0.18)]"
        : "text-text-secondary hover:bg-primary-subtle hover:text-text",
    ].join(" ")

  return (
    <aside
      className={[
        "fixed left-0 top-0 h-full bg-bg border-r border-border flex flex-col z-40 transition-all duration-200 shadow-[4px_0_0_0_rgba(10,10,10,0.08)]",
        collapsed ? "w-16" : "w-60",
      ].join(" ")}
    >
      {/* Logo + toggle */}
      <div className="h-14 flex items-center border-b border-border px-3 shrink-0">
        {collapsed ? (
          <div className="flex w-full items-center justify-center">
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-bg-subtle transition-colors cursor-pointer"
              title="Développer"
            >
              <BrandMark compact textClassName="text-text text-xs" />
            </button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <BrandMark textClassName="text-sm text-text" />
            <button
              onClick={onToggle}
              className="p-1.5 rounded-xl hover:bg-bg-subtle transition-colors cursor-pointer text-text-muted hover:text-text"
              title="Réduire"
            >
              <ArrowLeft01Icon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={navItem(active, collapsed)}
                >
                  <item.icon
                    className={[
                      "w-4 h-4 shrink-0",
                      active
                        ? "text-text [html[data-theme='dark']_&]:text-primary"
                        : "text-text-secondary [html[data-theme='dark']_&]:text-text-muted",
                    ].join(" ")}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="my-2 mx-1 border-t border-border" />

        <ul className="space-y-0.5">
          {BOTTOM_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={navItem(active, collapsed)}
                >
                  <item.icon
                    className={[
                      "w-4 h-4 shrink-0",
                      active
                        ? "text-text [html[data-theme='dark']_&]:text-primary"
                        : "text-text-secondary [html[data-theme='dark']_&]:text-text-muted",
                    ].join(" ")}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-2 space-y-2">
        {/* Quota — expanded */}
        {!collapsed && !isUnlimited && outboundTotal > 0 && (
          <div className="px-1 pb-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-muted">Messages restants</span>
              <span className="text-xs font-semibold" style={{ color: barColor }}>
                {remaining?.toLocaleString("fr-FR")}
              </span>
            </div>
            <div className="w-full bg-bg-muted rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        )}

        {/* Quota — collapsed dot */}
        {collapsed && !isUnlimited && outboundTotal > 0 && (
          <div
            className="flex justify-center py-1"
            title={`${remaining?.toLocaleString("fr-FR")} messages restants`}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: barColor }} />
          </div>
        )}

        {/* Plan badge — expanded */}
        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-bg-subtle border border-border flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary truncate mr-2">{planName}</span>
            <Link
              href="/billing"
              className="text-xs font-semibold text-primary-ink hover:text-text transition-colors shrink-0"
            >
              Mettre à niveau
            </Link>
          </div>
        )}

        {/* Plan dot — collapsed */}
        {collapsed && (
          <Link
            href="/billing"
            title={`Mettre à niveau — Plan ${planName}`}
            className="flex justify-center py-1.5"
          >
            <div className="w-2 h-2 rounded-full bg-primary" />
          </Link>
        )}
      </div>
    </aside>
  )
}

// ─── Mobile Drawer ─────────────────────────────────────────────────────────────

export function MobileDrawer({
  open,
  onClose,
  planName = "Gratuit",
}: {
  open: boolean
  onClose: () => void
  planName?: string
}) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 h-full w-72 bg-bg border-r border-border z-50 flex flex-col shadow-2xl">
        <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
          <div className="space-y-1">
            <BrandMark textClassName="text-sm text-text" />
            <p className="pl-8 text-[10px] text-text-muted uppercase tracking-widest leading-tight">
              Console
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-bg-subtle transition-colors text-text-muted hover:text-text cursor-pointer"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={[
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-primary-subtle text-primary-text shadow-[inset_0_0_0_1px_rgba(10,10,10,0.18)]"
                        : "text-text-secondary hover:bg-primary-subtle hover:text-text",
                    ].join(" ")}
                  >
                    <item.icon
                      className={[
                        "w-5 h-5 shrink-0",
                        active
                          ? "text-text [html[data-theme='dark']_&]:text-primary"
                          : "text-text-secondary [html[data-theme='dark']_&]:text-text-muted",
                      ].join(" ")}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="my-2 mx-1 border-t border-border" />

          <ul className="space-y-0.5">
            {BOTTOM_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={[
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-primary-subtle text-primary-text shadow-[inset_0_0_0_1px_rgba(10,10,10,0.18)]"
                        : "text-text-secondary hover:bg-primary-subtle hover:text-text",
                    ].join(" ")}
                  >
                    <item.icon
                      className={[
                        "w-5 h-5 shrink-0",
                        active
                          ? "text-text [html[data-theme='dark']_&]:text-primary"
                          : "text-text-secondary [html[data-theme='dark']_&]:text-text-muted",
                      ].join(" ")}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-bg-subtle border border-border flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">{planName}</span>
            <Link
              href="/billing"
              onClick={onClose}
              className="text-sm font-semibold text-primary-ink hover:text-text transition-colors"
            >
              Mettre à niveau
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
