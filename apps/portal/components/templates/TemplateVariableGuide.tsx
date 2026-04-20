"use client"

import { useMemo } from "react"
import Badge from "@/components/ui/Badge"
import { getAutomaticVariables, getCustomVariables } from "@/lib/templateEngine"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

const VARIABLE_EXAMPLES = [
  "{{contact.firstName}}",
  "{{contact.name}}",
  "{{user.fullName}}",
  "{{instance.name}}",
  "{{custom.code}}",
]

interface VariableBadgesProps {
  variables: string[]
  emptyLabel: string
}

function VariableBadges({ variables, emptyLabel }: VariableBadgesProps) {
  if (variables.length === 0) {
    return <p className="text-xs text-text-muted">{emptyLabel}</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {variables.map((variable) => (
        <Badge key={variable} variant={variable.startsWith("custom.") ? "warning" : "blue"}>
          {variable}
        </Badge>
      ))}
    </div>
  )
}

interface TemplateVariableGuideProps {
  variables: string[]
  title?: string
}

export function TemplateVariableGuide({
  variables,
  title,
}: TemplateVariableGuideProps) {
  const { copy } = usePortalLocale()
  const g = copy.templates.variableGuide
  const automaticVariables = useMemo(() => getAutomaticVariables(variables), [variables])
  const customVariables = useMemo(() => getCustomVariables(variables), [variables])
  const displayTitle = title ?? g.defaultTitle

  return (
    <div className="space-y-3 rounded-xl border border-border bg-bg-subtle p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-body">{displayTitle}</p>
        <p className="text-xs text-text-secondary">
          {g.formatLabel}: <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-text">{"{{namespace.variable}}"}</code>
        </p>
        <p className="text-xs text-text-secondary">
          {g.examplesLabel}{" "}
          {VARIABLE_EXAMPLES.map((example, index) => (
            <span key={example}>
              <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-text">{example}</code>
              {index < VARIABLE_EXAMPLES.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-text-body">{g.detectedTitle}</p>
        <div className="space-y-2">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{g.autoHeading}</p>
            <VariableBadges
              variables={automaticVariables}
              emptyLabel={g.autoEmpty}
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{g.customHeading}</p>
            <VariableBadges
              variables={customVariables}
              emptyLabel={g.customEmpty}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1 text-xs text-text-muted">
        <p>{g.footnoteAuto}</p>
        <p>{g.footnoteCustom}</p>
        <p>{g.footnoteBackend}</p>
      </div>
    </div>
  )
}
