import type { InstanceHealth } from "@usesendnow/types"

/** Pre-submit warmup guidance (V1): warn when the instance is not stable or the score is elevated */
export function shouldShowWarmupWarningBeforeSend(health: InstanceHealth): boolean {
  return health.safetyState !== "stable" || health.safetyScore > 60
}
