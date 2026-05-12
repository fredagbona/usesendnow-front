"use client"

import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import { useWorkspace } from "@/components/workspace/WorkspaceContext"

export interface WorkspaceMenuSectionProps {
  onClose: () => void
}

/** Workspace label in the user menu (personal account only while Teams is hidden). */
export function WorkspaceMenuSection({ onClose }: WorkspaceMenuSectionProps) {
  const { copy } = usePortalLocale()
  const w = copy.workspaceMenu
  const { workspace, setPersonalWorkspace } = useWorkspace()

  return (
    <div className="border-b border-border py-1">
      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {w.sectionLabel}
      </p>
      <div className="max-h-44 overflow-y-auto">
        <button
          type="button"
          onClick={() => {
            setPersonalWorkspace()
            onClose()
          }}
          className={[
            "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors cursor-pointer",
            workspace.mode === "personal"
              ? "bg-primary-subtle text-primary-text"
              : "text-text-body hover:bg-bg-subtle",
          ].join(" ")}
        >
          <span>{w.personalAccount}</span>
        </button>
      </div>
    </div>
  )
}
