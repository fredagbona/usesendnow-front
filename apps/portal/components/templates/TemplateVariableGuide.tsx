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
  title = "Variables supportées",
}: TemplateVariableGuideProps) {
  const { locale } = usePortalLocale()
  const automaticVariables = useMemo(() => getAutomaticVariables(variables), [variables])
  const customVariables = useMemo(() => getCustomVariables(variables), [variables])

  return (
    <div className="space-y-3 rounded-xl border border-border bg-bg-subtle p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-body">{title}</p>
        <p className="text-xs text-text-secondary">
          {locale === "fr" ? "Format" : "Format"}: <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-text">{"{{namespace.variable}}"}</code>
        </p>
        <p className="text-xs text-text-secondary">
          {locale === "fr" ? "Exemples" : "Examples"}{" "}
          {VARIABLE_EXAMPLES.map((example, index) => (
            <span key={example}>
              <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-text">{example}</code>
              {index < VARIABLE_EXAMPLES.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-text-body">{locale === "fr" ? "Détectées dans ce template" : "Detected in this template"}</p>
        <div className="space-y-2">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{locale === "fr" ? "Variables automatiques" : "Automatic variables"}</p>
            <VariableBadges
              variables={automaticVariables}
              emptyLabel={locale === "fr" ? "Aucune variable contact.*, user.* ou instance.* détectée." : "No contact.*, user.* or instance.* variables detected."}
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{locale === "fr" ? "Variables à fournir lors de l’envoi" : "Variables to provide when sending"}</p>
            <VariableBadges
              variables={customVariables}
              emptyLabel={locale === "fr" ? "Aucune variable custom.* détectée." : "No custom.* variables detected."}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1 text-xs text-text-muted">
        <p>{locale === "fr" ? "Les variables contact.*, user.* et instance.* sont remplies automatiquement par le backend." : "contact.*, user.* and instance.* variables are filled automatically by the backend."}</p>
        <p>{locale === "fr" ? "Les variables custom.* devront être renseignées plus tard lors du preview, de l’envoi d’un message ou de la création d’une campagne." : "custom.* variables must be provided later during preview, message sending, or campaign creation."}</p>
        <p>{locale === "fr" ? "Le backend détecte et recalcule automatiquement les variables." : "The backend detects and recalculates variables automatically."}</p>
      </div>
    </div>
  )
}
