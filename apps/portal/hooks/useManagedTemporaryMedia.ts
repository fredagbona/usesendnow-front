"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import type { MessageType, UploadedMedia } from "@usesendnow/types"
import { ACCEPTED_LABELS, ACCEPTED_MIME, FILE_LIMITS, GLOBAL_MAX_FILE_SIZE, formatBytes } from "@/lib/messageComposer"

export interface ManagedMediaListCopy {
  mediaVoiceTooLong: string
  mediaFileTooLargePrefix: string
  formatUnsupportedPrefix: string
  mediaReplaceNotice: string
  mediaTypeNotAllowed: string
  mediaTooLarge: string
  mediaUploadFailed: string
}

interface UseManagedTemporaryMediaOptions {
  mediaType: MessageType
  listCopy: ManagedMediaListCopy
  bytesMegabyte: string
  onUploadSuccess: (media: UploadedMedia) => void
  onClear: () => void
  onTeamAccessDenied?: () => void
}

export function useManagedTemporaryMedia({
  mediaType,
  listCopy,
  bytesMegabyte,
  onUploadSuccess,
  onClear,
  onTeamAccessDenied,
}: UseManagedTemporaryMediaOptions) {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaNotice, setMediaNotice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedMediaRef = useRef<UploadedMedia | null>(null)
  const shouldCleanupMediaRef = useRef(false)

  useEffect(() => {
    uploadedMediaRef.current = uploadedMedia
  }, [uploadedMedia])

  useEffect(() => {
    return () => {
      if (!shouldCleanupMediaRef.current || !uploadedMediaRef.current) return
      void apiClient.media.delete(uploadedMediaRef.current.id).catch(() => {})
    }
  }, [])

  const resetMediaState = useCallback(() => {
    setUploadedMedia(null)
    setUploading(false)
    setUploadProgress(0)
    setMediaError(null)
    setMediaNotice(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const releaseUploadedMedia = useCallback(() => {
    if (!uploadedMediaRef.current) return
    void apiClient.media.delete(uploadedMediaRef.current.id).catch(() => {})
    shouldCleanupMediaRef.current = false
  }, [])

  const uploadMediaFile = useCallback(
    async (file: File, nextType?: MessageType) => {
      const targetType = nextType ?? mediaType
      const maxSize = FILE_LIMITS[targetType] ?? GLOBAL_MAX_FILE_SIZE
      setMediaError(null)
      setMediaNotice(null)

      if (file.size > GLOBAL_MAX_FILE_SIZE || file.size > maxSize) {
        setMediaError(
          targetType === "voice_note"
            ? listCopy.mediaVoiceTooLong
            : `${listCopy.mediaFileTooLargePrefix} ${formatBytes(maxSize, bytesMegabyte)}.`,
        )
        return
      }

      const accepted = ACCEPTED_MIME[targetType] ?? []
      if (accepted.length > 0 && !accepted.includes(file.type)) {
        setMediaError(`${listCopy.formatUnsupportedPrefix} ${ACCEPTED_LABELS[targetType] ?? ""}.`)
        return
      }

      if (uploadedMediaRef.current) {
        void apiClient.media.delete(uploadedMediaRef.current.id).catch(() => {})
        setMediaNotice(listCopy.mediaReplaceNotice)
      }

      shouldCleanupMediaRef.current = true
      setUploading(true)
      setUploadProgress(0)

      try {
        const media = await apiClient.media.upload(file, setUploadProgress)
        setUploadedMedia(media)
        onUploadSuccess(media)
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.code === "MEDIA_TYPE_NOT_ALLOWED") setMediaError(listCopy.mediaTypeNotAllowed)
          else if (err.code === "MEDIA_TOO_LARGE") setMediaError(listCopy.mediaTooLarge)
          else if (err.code === "TEAM_ACCESS_DENIED") {
            onTeamAccessDenied?.()
            setMediaError(listCopy.mediaUploadFailed)
          } else setMediaError(listCopy.mediaUploadFailed)
        } else {
          setMediaError(listCopy.mediaUploadFailed)
        }
        setUploadedMedia(null)
        shouldCleanupMediaRef.current = false
      } finally {
        setUploading(false)
      }
    },
    [bytesMegabyte, listCopy, mediaType, onClear, onTeamAccessDenied, onUploadSuccess],
  )

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      try {
        await uploadMediaFile(file)
      } finally {
        event.target.value = ""
      }
    },
    [uploadMediaFile],
  )

  const handleRemoveFile = useCallback(() => {
    releaseUploadedMedia()
    onClear()
    resetMediaState()
  }, [onClear, releaseUploadedMedia, resetMediaState])

  return {
    uploadedMedia,
    uploading,
    uploadProgress,
    mediaError,
    mediaNotice,
    fileInputRef,
    uploadMediaFile,
    handleFileSelect,
    handleRemoveFile,
    resetMediaState,
    releaseUploadedMedia,
    shouldCleanupMediaRef,
    setMediaError,
    setMediaNotice,
  }
}
