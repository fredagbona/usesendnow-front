"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Button from "@/components/ui/Button"
import Alert from "@/components/ui/Alert"

type RecorderState = "idle" | "recording" | "review"

interface VoiceRecorderPanelProps {
  uploading: boolean
  onUpload: (file: File) => Promise<void>
  onResetUploadState: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function supportsMediaRecorder(): boolean {
  return typeof window !== "undefined" && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined"
}

export function VoiceRecorderPanel({ uploading, onUpload, onResetUploadState }: VoiceRecorderPanelProps) {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  const mimeType = useMemo(() => {
    if (typeof MediaRecorder === "undefined") return "audio/ogg"
    if (MediaRecorder.isTypeSupported("audio/ogg")) return "audio/ogg"
    if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm"
    return "audio/webm"
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [audioUrl])

  const resetReview = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    stopTracks()
    setAudioUrl(null)
    setAudioBlob(null)
    setSeconds(0)
    setRecorderState("idle")
    setError(null)
    onResetUploadState()
  }

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleStartRecording = async () => {
    setError(null)
    onResetUploadState()
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setAudioBlob(null)
    setSeconds(0)

    if (!supportsMediaRecorder()) {
      setError("L’enregistrement vocal n’est pas supporté sur ce navigateur.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onerror = () => {
        setError("Connexion au micro perdue. Enregistrement annulé.")
        stopTracks()
        setRecorderState("idle")
      }

      recorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          setError("Nous n’entendons rien. Vérifiez le volume de votre micro.")
          stopTracks()
          setRecorderState("idle")
          return
        }

        const blob = new Blob(chunksRef.current, { type: mimeType })
        const objectUrl = URL.createObjectURL(blob)
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
        }
        setAudioBlob(blob)
        setAudioUrl(objectUrl)
        setRecorderState("review")
        stopTracks()
      }

      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          setError("Connexion au micro perdue. Enregistrement annulé.")
          stopRecording()
          resetReview()
        }
      })

      recorder.start()
      setRecorderState("recording")
      setSeconds(0)
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Accès micro refusé. Veuillez autoriser le micro dans les paramètres de votre navigateur pour enregistrer.")
        } else if (err.name === "NotFoundError") {
          setError("Aucun microphone détecté. Branchez un périphérique pour continuer.")
        } else if (err.name === "NotReadableError") {
          setError("Le microphone est déjà utilisé par une autre application.")
        } else {
          setError("Impossible de démarrer l’enregistrement vocal.")
        }
      } else {
        setError("Impossible de démarrer l’enregistrement vocal.")
      }
    }
  }

  const handleCancelRecording = () => {
    chunksRef.current = []
    stopRecording()
    stopTracks()
    setSeconds(0)
    setRecorderState("idle")
    setError(null)
    onResetUploadState()
  }

  const handleUploadVoiceNote = async () => {
    if (!audioBlob) return
    const extension = mimeType.includes("ogg") ? "ogg" : "webm"
    const file = new File([audioBlob], `voice-note-${Date.now()}.${extension}`, { type: mimeType })

    try {
      await onUpload(file)
    } catch {
      return
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-bg-subtle p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text">Note vocale</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Enregistrez votre voix, réécoutez-la puis uploadez-la avant l’envoi final.
          </p>
        </div>
        <div className="rounded-full border border-border bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          {formatDuration(seconds)}
        </div>
      </div>

      {error && <Alert variant="warning" message={error} onClose={() => setError(null)} />}

      {recorderState === "idle" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="primary" onClick={handleStartRecording}>
            Démarrer l’enregistrement
          </Button>
          <p className="text-xs text-text-secondary">Le micro ne sera demandé qu’au clic, comme requis par Safari iOS.</p>
        </div>
      )}

      {recorderState === "recording" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-error" />
            <p className="text-sm font-medium text-text">Enregistrement en cours...</p>
          </div>
          <div className="flex items-end gap-1.5">
            {([
              "h-3",
              "h-6",
              "h-3",
              "h-8",
              "h-5",
              "h-7",
              "h-2",
              "h-6",
            ] as const).map((heightClass, index) => (
              <span
                key={`${heightClass}-${index}`}
                className={`w-2 rounded-full bg-primary/80 animate-pulse ${heightClass}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={handleCancelRecording}>Annuler</Button>
            <Button type="button" variant="outlined" onClick={stopRecording}>Stop</Button>
          </div>
        </div>
      )}

      {recorderState === "review" && audioUrl && (
        <div className="space-y-4">
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={resetReview}>Supprimer</Button>
            <Button type="button" variant="outlined" onClick={handleStartRecording}>Réenregistrer</Button>
            <Button type="button" variant="primary" onClick={handleUploadVoiceNote} loading={uploading}>
              Uploader la note
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
