"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  defaultPortalWorkspace,
  readPortalWorkspace,
  writePortalWorkspace,
  type PortalWorkspaceState,
} from "@/lib/workspace-storage"

interface WorkspaceContextValue {
  workspace: PortalWorkspaceState
  setPersonalWorkspace: () => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<PortalWorkspaceState>(defaultPortalWorkspace)

  useEffect(() => {
    const stored = readPortalWorkspace()
    if (stored.mode === "team") {
      writePortalWorkspace(defaultPortalWorkspace)
      setWorkspace(defaultPortalWorkspace)
    } else {
      setWorkspace(stored)
    }
  }, [])

  const setPersonalWorkspace = useCallback(() => {
    const next = defaultPortalWorkspace
    writePortalWorkspace(next)
    setWorkspace(next)
    router.refresh()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("msgflash:workspace-changed"))
    }
  }, [router])

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      setPersonalWorkspace,
    }),
    [workspace, setPersonalWorkspace],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider")
  }
  return ctx
}
