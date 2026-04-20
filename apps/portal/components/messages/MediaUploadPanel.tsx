"use client"

import { Delete02Icon, Upload01Icon } from "hugeicons-react"
import { formatFullDate } from "@/lib/format"
import { ACCEPTED_LABELS, ACCEPTED_MIME, FILE_LIMITS, GLOBAL_MAX_FILE_SIZE, formatBytes } from "@/lib/messageComposer"
import type { MessageType, UploadedMedia } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

interface MediaUploadPanelProps {
  type: MessageType
  uploading: boolean
  uploadProgress: number
  uploadedMedia: UploadedMedia | null
  mediaNotice: string | null
  mediaError: string | null
  scheduledAt: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

export function MediaUploadPanel({
  type,
  uploading,
  uploadProgress,
  uploadedMedia,
  mediaNotice,
  mediaError,
  scheduledAt,
  fileInputRef,
  onFileChange,
  onRemove,
}: MediaUploadPanelProps) {
  const { copy } = usePortalLocale()
  const mbUnit = copy.common.bytesMegabyte
  const m = copy.messages.mediaUpload
  const maxSize = FILE_LIMITS[type] ?? GLOBAL_MAX_FILE_SIZE
  const fieldLabel =
    (m.mediaFieldLabel as Record<string, string>)[type] ?? type
  const accepted = ACCEPTED_LABELS[type] ?? ""

  const fileDetailsLine = uploadedMedia
    ? m.fileDetails
        .replace("{{size}}", formatBytes(uploadedMedia.sizeBytes, mbUnit))
        .replace("{{mime}}", uploadedMedia.type)
        .replace("{{date}}", formatFullDate(uploadedMedia.expiresAt))
    : ""

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-body">{fieldLabel}</label>
      <div className="rounded-2xl border border-dashed border-border-strong bg-bg-subtle p-5">
        {uploading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-text">{m.uploading}</p>
              <span className="text-sm font-semibold text-primary-ink">{uploadProgress}%</span>
            </div>
            <progress className="h-3 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" max={100} value={uploadProgress} />
            <p className="text-xs text-text-secondary">{m.uploadingHint}</p>
          </div>
        ) : uploadedMedia ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{uploadedMedia.originalName}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {fileDetailsLine}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg hover:text-text"
                >
                  {m.replace}
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-lg border border-border p-2 text-text-muted transition-colors hover:bg-bg hover:text-error"
                >
                  <Delete02Icon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-5 text-text-secondary">
              <p>{m.tempHostNotice}</p>
              <p className="mt-1">{m.publicLinkNotice}</p>
              {scheduledAt && (
                <p className="mt-1">{m.scheduleExpiryWarning}</p>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center gap-2 py-4 text-center"
          >
            <div className="rounded-2xl border border-border bg-bg p-3 text-text-muted">
              <Upload01Icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-primary-ink">{m.chooseFile}</span>
            <span className="text-xs text-text-muted">
              {m.acceptedMax.replace("{{accepted}}", accepted).replace("{{size}}", formatBytes(maxSize, mbUnit))}
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_MIME[type]?.join(",") ?? undefined}
          onChange={onFileChange}
        />
      </div>
      {mediaNotice && <p className="text-xs text-warning">{mediaNotice}</p>}
      {mediaError && <p className="text-xs text-error">{mediaError}</p>}
    </div>
  )
}
