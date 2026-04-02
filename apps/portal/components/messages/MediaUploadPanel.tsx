"use client"

import { Delete02Icon, Upload01Icon } from "hugeicons-react"
import { formatFullDate } from "@/lib/format"
import { ACCEPTED_LABELS, ACCEPTED_MIME, FILE_LIMITS, GLOBAL_MAX_FILE_SIZE, MEDIA_FIELD_LABEL, formatBytes } from "@/lib/messageComposer"
import type { MessageType, UploadedMedia } from "@usesendnow/types"

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
  const maxSize = FILE_LIMITS[type] ?? GLOBAL_MAX_FILE_SIZE

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-body">{MEDIA_FIELD_LABEL[type]}</label>
      <div className="rounded-2xl border border-dashed border-border-strong bg-bg-subtle p-5">
        {uploading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-text">Upload en cours...</p>
              <span className="text-sm font-semibold text-primary-ink">{uploadProgress}%</span>
            </div>
            <progress className="h-3 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" max={100} value={uploadProgress} />
            <p className="text-xs text-text-secondary">Le fichier est envoyé vers l’hébergement temporaire sécurisé.</p>
          </div>
        ) : uploadedMedia ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{uploadedMedia.originalName}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {formatBytes(uploadedMedia.sizeBytes)} · {uploadedMedia.type} · expire le {formatFullDate(uploadedMedia.expiresAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg hover:text-text"
                >
                  Remplacer
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
              <p>Le fichier est hébergé temporairement et supprimé automatiquement après expiration.</p>
              <p className="mt-1">Le lien généré est public. N’uploadez pas de document sensible.</p>
              {scheduledAt && (
                <p className="mt-1">Si la date prévue dépasse l’expiration, l’envoi peut échouer.</p>
              )}
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 py-4 text-center">
            <div className="rounded-2xl border border-border bg-bg p-3 text-text-muted">
              <Upload01Icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-primary-ink">Choisir un fichier</span>
            <span className="text-xs text-text-muted">
              {ACCEPTED_LABELS[type]} · max {formatBytes(maxSize)}
            </span>
          </label>
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
