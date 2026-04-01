"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search01Icon,
  ArrowRight01Icon,
  Home01Icon,
  SmartPhone01Icon,
  Message01Icon,
  Megaphone01Icon,
  UserGroupIcon,
} from "hugeicons-react"
import { useGlobalSearch, type GlobalSearchCategory, type GlobalSearchResult } from "@/hooks/useGlobalSearch"

const CATEGORY_LABEL: Record<GlobalSearchCategory, string> = {
  page: "Page",
  instance: "Instance",
  message: "Message",
  campaign: "Campagne",
  contact: "Contact",
  group: "Groupe",
}

function ResultIcon({ category }: { category: GlobalSearchCategory }) {
  switch (category) {
    case "page":
      return <Home01Icon className="w-4 h-4" />
    case "instance":
      return <SmartPhone01Icon className="w-4 h-4" />
    case "message":
      return <Message01Icon className="w-4 h-4" />
    case "campaign":
      return <Megaphone01Icon className="w-4 h-4" />
    case "contact":
    case "group":
      return <UserGroupIcon className="w-4 h-4" />
  }
}

export default function GlobalSearch() {
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const { results, loading, error } = useGlobalSearch(query)

  const visibleResults = useMemo(() => results.slice(0, 10), [results])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, visibleResults.length])

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }

    document.addEventListener("mousedown", handlePointer)
    document.addEventListener("keydown", handleShortcut)

    return () => {
      document.removeEventListener("mousedown", handlePointer)
      document.removeEventListener("keydown", handleShortcut)
    }
  }, [])

  const navigateTo = (item: GlobalSearchResult) => {
    setQuery("")
    setOpen(false)
    router.push(item.href)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true)
    }

    if (!visibleResults.length) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % visibleResults.length)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((current) => (current - 1 + visibleResults.length) % visibleResults.length)
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      navigateTo(visibleResults[activeIndex])
      return
    }

    if (event.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const shouldShowDropdown = open && (query.trim().length > 0 || loading || !!error)

  return (
    <div ref={wrapperRef} className="relative">
      <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        placeholder="Recherche globale…"
        className="w-56 sm:w-72 lg:w-96 pl-8 pr-10 py-2 text-sm bg-bg-subtle border border-border rounded-none placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-border-strong transition-all duration-200"
      />
      <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center text-[10px] text-text-muted font-medium border border-border rounded-none px-1 py-0.5 bg-bg-muted select-none">
        ⌘K
      </kbd>

      {shouldShowDropdown && (
        <div className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-2xl border border-border bg-bg shadow-[0_16px_40px_rgba(0,0,0,0.18)] z-50">
          <div className="border-b border-border px-4 py-3 text-xs text-text-muted">
            {query.trim().length < 2
              ? "Tapez au moins 2 caractères pour lancer la recherche globale."
              : "Recherche dans les pages, instances, messages, campagnes, contacts et groupes."}
          </div>

          {loading && query.trim().length >= 2 ? (
            <div className="px-4 py-6 text-sm text-text-secondary">Recherche en cours…</div>
          ) : error ? (
            <div className="px-4 py-6 text-sm text-error-hover">{error}</div>
          ) : visibleResults.length === 0 && query.trim().length >= 2 ? (
            <div className="px-4 py-6 text-sm text-text-secondary">Aucun résultat.</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {visibleResults.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigateTo(item)}
                  className={[
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-b border-border last:border-b-0",
                    index === activeIndex ? "bg-bg-subtle" : "hover:bg-bg-subtle",
                  ].join(" ")}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-subtle text-text-secondary">
                    <ResultIcon category={item.category} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text truncate">{item.title}</span>
                      <span className="rounded-full bg-bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-muted">
                        {CATEGORY_LABEL[item.category]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary truncate">{item.description}</p>
                  </div>
                  <ArrowRight01Icon className="mt-1 w-4 h-4 shrink-0 text-text-muted" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
