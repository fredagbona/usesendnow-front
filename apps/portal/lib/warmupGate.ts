import type { InstanceHealth } from "@usesendnow/types"

/** True when the instance health API suggests showing the warmup guidance modal (entry pages or future uses). */
export function shouldShowWarmupWarningBeforeSend(health: InstanceHealth): boolean {
  return health.safetyState !== "stable" || health.safetyScore > 60
}
