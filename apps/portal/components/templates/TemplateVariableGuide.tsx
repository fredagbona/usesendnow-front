"use client"

import { useMemo } from "react"
import Badge from "@/components/ui/Badge"
import { getAutomaticVariables, getCustomVariables } from "@/lib/templateEngine"

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
  title = "Variables supportées",
}: TemplateVariableGuideProps) {
  const automaticVariables = useMemo(() => getAutomaticVariables(variables), [variables])
  const customVariables = useMemo(() => getCustomVariables(variables), [variables])

  return (
    <div className="space-y-3 rounded-xl border border-border bg-bg-subtle p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-body">{title}</p>
        <p className="text-xs text-text-secondary">
          Format: <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-text">{"{{namespace.variable}}"}</code>
        </p>
        <p className="text-xs text-text-secondary">
          Exemples{" "}
          {VARIABLE_EXAMPLES.map((example, index) => (
            <span key={example}>
              <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-text">{example}</code>
              {index < VARIABLE_EXAMPLES.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-text-body">Détectées dans ce template</p>
        <div className="space-y-2">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">Variables automatiques</p>
            <VariableBadges
              variables={automaticVariables}
              emptyLabel="Aucune variable contact.*, user.* ou instance.* détectée."
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">Variables à fournir lors de l’envoi</p>
            <VariableBadges
              variables={customVariables}
              emptyLabel="Aucune variable custom.* détectée."
            />
          </div>
        </div>
      </div>

      <div className="space-y-1 text-xs text-text-muted">
        <p>Les variables contact.*, user.* et instance.* sont remplies automatiquement par le backend.</p>
        <p>Les variables custom.* devront être renseignées plus tard lors du preview, de l’envoi d’un message ou de la création d’une campagne.</p>
        <p>Le backend détecte et recalcule automatiquement les variables.</p>
      </div>
    </div>
  )
}
