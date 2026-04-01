"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowDown01Icon,
  UserIcon,
  Logout02Icon,
  Invoice01Icon,
  Menu01Icon,
  Moon02Icon,
  Sun01Icon,
} from "hugeicons-react"
import { clearToken } from "@/lib/auth"
import type { User } from "@usesendnow/types"
import Avatar from "@/components/ui/Avatar"
import { usePortalTheme } from "@/components/ui/ThemeProvider"
import GlobalSearch from "@/components/layout/GlobalSearch"

interface TopNavProps {
  user?: User | null
  planName?: string
  onMobileMenu?: () => void
}

export default function TopNav({ user, planName = "Gratuit", onMobileMenu }: TopNavProps) {
  const router = useRouter()
  const { theme, toggleTheme } = usePortalTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    clearToken()
    router.push("/login")
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <header className="sticky top-0 z-30 h-14 bg-bg backdrop-blur border-b border-border flex items-center gap-4 px-4 md:px-6 shrink-0">
      {/* Mobile hamburger */}
      {onMobileMenu && (
        <button
          onClick={onMobileMenu}
          className="md:hidden p-1.5 rounded-xl hover:bg-bg-subtle transition-colors text-text-muted hover:text-text cursor-pointer shrink-0"
        >
          <Menu01Icon className="w-5 h-5" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={toggleTheme}
          className="hidden lg:inline-flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2 text-xs font-medium text-text-secondary hover:bg-bg-subtle hover:text-text transition-colors cursor-pointer"
          title={theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre"}
        >
          {theme === "dark" ? (
            <Sun01Icon className="w-4 h-4" />
          ) : (
            <Moon02Icon className="w-4 h-4" />
          )}
          <span>{theme === "dark" ? "Clair" : "Sombre"}</span>
        </button>
      </div>

      <GlobalSearch />

      {/* Right spacer */}
      <div className="flex-1 flex items-center justify-end gap-3">
        {/* Divider */}
        <div className="h-5 w-px bg-border" />

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={[
              "flex items-center gap-2 px-2 py-1.5 rounded-none transition-all duration-150 cursor-pointer",
              dropdownOpen ? "bg-primary-subtle" : "hover:bg-primary-subtle",
            ].join(" ")}
          >
            {user ? (
              <Avatar
                avatarUrl={user.avatarUrl}
                fullName={user.fullName}
                alt={user.displayName ?? user.fullName}
                className="w-7 h-7 rounded-full bg-border shrink-0 ring-2 ring-primary/10 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-bg-muted flex items-center justify-center shrink-0 ring-2 ring-primary/10">
                <UserIcon className="w-4 h-4 text-text-muted" />
              </div>
            )}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-text leading-tight">
                {user ? (user.displayName ?? user.fullName) : "—"}
              </p>
              <p className="text-[10px] text-text-muted leading-tight">{planName}</p>
            </div>
            <ArrowDown01Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-bg border border-border-strong rounded-none shadow-[4px_4px_0px_0px_rgba(10,10,10,0.14)] overflow-hidden z-50">
              <div className="flex items-center gap-2.5 px-3 py-3 bg-bg-subtle border-b border-border">
                {user && (
                  <Avatar
                    avatarUrl={user.avatarUrl}
                    fullName={user.fullName}
                    alt={user.displayName ?? user.fullName}
                    className="w-8 h-8 rounded-full shrink-0 bg-border object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text truncate">
                    {user ? (user.displayName ?? user.fullName) : "—"}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
              </div>

              <div className="p-1">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-text-body hover:bg-bg-subtle hover:text-text transition-colors duration-150"
                >
                  <UserIcon className="w-4 h-4 text-text-secondary" />
                  Profil
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-text-body hover:bg-bg-subtle hover:text-text transition-colors duration-150"
                >
                  <Invoice01Icon className="w-4 h-4 text-text-secondary" />
                  Facturation
                </Link>
              </div>

              <div className="border-t border-border p-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-error-hover hover:bg-error-subtle transition-colors duration-150 cursor-pointer"
                >
                  <Logout02Icon className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
