import type { InstanceHealth } from "@usesendnow/types"

/** True when instance health suggests showing the warmup guidance modal (e.g. after selecting an instance). */
export function shouldShowWarmupWarningBeforeSend(health: InstanceHealth): boolean {
  return health.safetyState !== "stable" || health.safetyScore > 60
}
