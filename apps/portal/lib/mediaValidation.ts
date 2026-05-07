import type { RepeatType, UploadedMedia } from "@usesendnow/types"

export function isTemporaryMediaExpiredForScheduledAt(uploadedMedia: UploadedMedia | null, scheduledAt: string): boolean {
  if (!uploadedMedia || !scheduledAt) return false

  const scheduled = new Date(scheduledAt)
  const expires = new Date(uploadedMedia.expiresAt)

  return Number.isFinite(scheduled.getTime()) && Number.isFinite(expires.getTime()) && scheduled.getTime() > expires.getTime()
}

export function isTemporaryMediaBlockedForRecurring(uploadedMedia: UploadedMedia | null, repeat: RepeatType): boolean {
  return Boolean(uploadedMedia) && repeat !== "none"
}
