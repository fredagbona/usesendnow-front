import Card from "@/components/ui/Card"

interface SendStatusPanelProps {
  uploadProgress: number
  uploadStatus: string
  sendStatus: string
  mediaExpiresAt?: string | null
}

export function SendStatusPanel({
  uploadProgress,
  uploadStatus,
  sendStatus,
  mediaExpiresAt,
}: SendStatusPanelProps) {
  return (
    <Card className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Progression</p>
        <h3 className="mt-2 text-lg font-semibold uppercase text-text">Suivi d’envoi</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-text-secondary">Upload média</span>
          <span className="font-medium text-text">{uploadStatus}</span>
        </div>
        <progress className="h-3 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" max={100} value={Math.max(0, Math.min(100, uploadProgress))} />
      </div>

      <div className="rounded-xl border border-border bg-bg-subtle p-4">
        <p className="text-sm font-medium text-text">Statut de l’action</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{sendStatus}</p>
        {mediaExpiresAt && (
          <p className="mt-3 text-xs text-warning">
            Le média temporaire doit rester valide jusqu’à l’envoi effectif.
          </p>
        )}
      </div>
    </Card>
  )
}
