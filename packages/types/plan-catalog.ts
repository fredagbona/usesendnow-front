/** Portal + marketing plan catalog v2 (spec 11 / 38). */

export const PLAN_DISPLAY_ORDER = ["free", "pro", "max"] as const

export type DisplayPlanCode = (typeof PLAN_DISPLAY_ORDER)[number]

export const DISPLAY_PLAN_CODES = new Set<string>(PLAN_DISPLAY_ORDER)

export const CHECKOUT_PLAN_CODES = new Set<string>(["pro", "max"])

/** Rank for upgrade/downgrade UI (legacy starter/plus map to pro/max). */
export function planDisplayRank(code: string): number {
  const normalized =
    code === "plus" ? "max" : code === "starter" ? "pro" : code
  const idx = PLAN_DISPLAY_ORDER.indexOf(normalized as DisplayPlanCode)
  return idx >= 0 ? idx : -1
}

export function isDisplayPlanCode(code: string): boolean {
  return DISPLAY_PLAN_CODES.has(code)
}

export function isCheckoutPlanCode(code: string): boolean {
  return CHECKOUT_PLAN_CODES.has(code)
}

/** Fallback contact-group caps when API omits `limits.maxContactGroups`. */
export const PLAN_CONTACT_GROUP_LIMITS: Record<string, number | null> = {
  free: 10,
  pro: 50,
  max: null,
  starter: 10,
  plus: null,
}
