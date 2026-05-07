"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import Avatar from "boring-avatars"
import {
  Activity03Icon,
  Analytics01Icon,
  ArrowDown01Icon,
  Clock01Icon,
  Home01Icon,
  Key01Icon,
  Logout02Icon,
  Megaphone01Icon,
  Moon02Icon,
  Sun01Icon,
  UserGroupIcon,
  UserMultiple02Icon,
} from "hugeicons-react"
import { Button } from "@usesendnow/ui"
import { clearAdminToken } from "@/lib/admin-auth"
import { useAdminTheme } from "@/components/ui/ThemeProvider"

interface AdminShellProps {
  children: React.ReactNode
  adminName?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/overview", label: "Overview", icon: Home01Icon },
  { href: "/users", label: "Users", icon: UserGroupIcon },
  { href: "/teams", label: "Teams", icon: UserMultiple02Icon },
  { href: "/request-logs", label: "Request Logs", icon: Clock01Icon },
  { href: "/api-usage", label: "API Usage", icon: Key01Icon },
  { href: "/analytics/messages", label: "Messages Analytics", icon: Analytics01Icon },
  { href: "/analytics/campaigns", label: "Campaigns Analytics", icon: Megaphone01Icon },
  { href: "/actions", label: "Actions", icon: Activity03Icon },
]

export function AdminShell({ children, adminName }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useAdminTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const activePath = useMemo(() => pathname ?? "", [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-bg-subtle">
      <aside className={`flex h-full flex-col border-r border-border bg-bg transition-all ${collapsed ? "w-16" : "w-64"}`}>
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          {!collapsed && <span className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase text-text">MsgFlash Admin</span>}
          <Button variant="secondary" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? ">" : "<"}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const active = activePath === item.href || activePath.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "mb-1 flex items-center gap-2 rounded-none px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em]",
                  active ? "bg-primary-subtle text-primary-ink" : "text-text-secondary hover:bg-bg-subtle",
                ].join(" ")}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={() => setProfileOpen((value) => !value)}
            className="flex w-full items-center gap-2 rounded-none px-2 py-2 hover:bg-bg-subtle"
          >
            <Avatar
              size={28}
              name={adminName ?? "Admin"}
              variant="beam"
              colors={["#F0CE37", "#FAF7EF", "#2B3626", "#6B7280", "#E5E7EB"]}
            />
            {!collapsed ? (
              <>
                <span className="min-w-0 flex-1 truncate text-left text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
                  {adminName ?? "Admin"}
                </span>
                <ArrowDown01Icon className={`h-4 w-4 text-text-secondary transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </>
            ) : null}
          </button>
          {profileOpen && !collapsed ? (
            <div className="mt-1 border border-border bg-bg-subtle p-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary hover:bg-bg"
                onClick={() => {
                  clearAdminToken()
                  router.push("/login")
                }}
              >
                <Logout02Icon className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-bg px-4">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">Internal Operations Console</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === "dark" ? <Sun01Icon className="h-4 w-4" /> : <Moon02Icon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
