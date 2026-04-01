export interface CustomVariableEntry {
  key: string
  value: string
}

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\s*\}\}/g
const AUTOMATIC_VARIABLE_PREFIXES = ["contact.", "user.", "instance."] as const

export function parseTemplateVariables(body: string | null | undefined): string[] {
  if (!body) return []

  const matches = [...body.matchAll(VARIABLE_PATTERN)]
  return [...new Set(matches.map((match) => match[1]))]
}

export function isCustomVariable(variable: string) {
  return variable.startsWith("custom.")
}

export function isAutomaticVariable(variable: string) {
  return AUTOMATIC_VARIABLE_PREFIXES.some((prefix) => variable.startsWith(prefix))
}

export function getCustomVariableKey(variable: string) {
  return variable.replace(/^custom\./, "")
}

export function getContextVariables(variables: string[]) {
  return variables.filter((variable) => !isCustomVariable(variable))
}

export function getCustomVariables(variables: string[]) {
  return variables.filter(isCustomVariable)
}

export function getAutomaticVariables(variables: string[]) {
  return variables.filter(isAutomaticVariable)
}

export function entriesToVariableMap(entries: CustomVariableEntry[]) {
  return entries.reduce<Record<string, string | number>>((acc, entry) => {
    const key = entry.key.trim()
    if (!key) return acc

    const rawValue = entry.value.trim()
    const numericValue = Number(rawValue)
    acc[key] = rawValue !== "" && !Number.isNaN(numericValue) && /^-?\d+(\.\d+)?$/.test(rawValue)
      ? numericValue
      : rawValue
    return acc
  }, {})
}

export function variableMapToEntries(
  variables: Record<string, string | number> | null | undefined,
  templateVariables: string[] = []
): CustomVariableEntry[] {
  if (!variables) {
    return getCustomVariables(templateVariables).map((variable) => ({
      key: getCustomVariableKey(variable),
      value: "",
    }))
  }

  const entries = Object.entries(variables).map(([key, value]) => ({
    key,
    value: String(value),
  }))

  if (entries.length > 0) return entries

  return getCustomVariables(templateVariables).map((variable) => ({
    key: getCustomVariableKey(variable),
    value: "",
  }))
}
