import type { MessageType } from "@usesendnow/types"

export const GLOBAL_MAX_FILE_SIZE = 16 * 1024 * 1024

export const FILE_LIMITS: Partial<Record<MessageType, number>> = {
  image: 5 * 1024 * 1024,
  video: 16 * 1024 * 1024,
  document: 10 * 1024 * 1024,
  audio: 16 * 1024 * 1024,
  voice_note: 16 * 1024 * 1024,
}

export const ACCEPTED_MIME: Partial<Record<MessageType, string[]>> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/mp4", "video/3gpp"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  audio: ["audio/mpeg", "audio/ogg", "audio/mp4", "audio/aac", "audio/amr"],
  voice_note: ["audio/mpeg", "audio/ogg", "audio/webm", "audio/mp4", "audio/aac", "audio/amr"],
}

export const ACCEPTED_LABELS: Partial<Record<MessageType, string>> = {
  image: "JPEG, PNG, WEBP, GIF",
  video: "MP4, 3GPP",
  document: "PDF, DOC, DOCX, XLS, XLSX",
  audio: "MP3, OGG, MP4 audio, AAC, AMR",
  voice_note: "MP3, OGG, WEBM audio, MP4 audio, AAC, AMR",
}

export const MEDIA_FIELD_LABEL: Partial<Record<MessageType, string>> = {
  image: "Image",
  video: "Vidéo",
  document: "Document",
  audio: "Fichier audio",
  voice_note: "Note vocale",
}

export const TYPE_LABEL: Record<string, string> = {
  text: "Texte",
  image: "Image",
  video: "Vidéo",
  audio: "Audio",
  voice_note: "Note vocale",
  document: "Document",
}

export const FILE_UPLOAD_TYPES: MessageType[] = ["image", "video", "audio", "voice_note", "document"]

export function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`
}
