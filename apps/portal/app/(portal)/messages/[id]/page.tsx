"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { useMessage } from "@/hooks/useMessages"
import { formatFullDate } from "@/lib/format"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import CodeSnippet from "@/components/ui/CodeSnippet"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { ArrowLeft01Icon, AlertDiamondIcon } from "hugeicons-react"

const STATUS_VARIANT: Record<string, "neutral" | "blue" | "success" | "purple" | "error"> = {
  queued: "neutral",
  sent: "blue",
  delivered: "success",
  read: "purple",
  failed: "error",
}

const STATUS_LABEL: Record<string, string> = {
  queued: "En file",
  sent: "Envoyé",
  delivered: "Livré",
  read: "Lu",
  failed: "Échoué",
}

const TYPE_LABEL: Record<string, string> = {
  text: "Texte",
  image: "Image",
  video: "Vidéo",
  audio: "Audio",
  voice_note: "Message vocal",
  document: "Document",
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-border last:border-0">
      <span className="w-44 shrink-0 text-sm text-text-secondary">{label}</span>
      <div className="flex-1 text-sm text-text">{children}</div>
    </div>
  )
}

export default function MessageDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { message, loading, error } = useMessage(id)

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !message) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-text-secondary">Message introuvable.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/messages")}>
          Retour aux messages
        </Button>
      </div>
    )
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title="Détails du message"
        action={
          <div className="flex items-center gap-3">
            {message.meta?.templateId && <Badge variant="warning">Template</Badge>}
            <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>
              {STATUS_LABEL[message.status] ?? message.status}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => router.push("/messages")}>
              <ArrowLeft01Icon className="w-4 h-4" />
              Retour
            </Button>
          </div>
        }
      />

      {message.status === "failed" && message.error && (
        <div className="flex items-start gap-3 p-4 border border-error/30 rounded-2xl bg-error-subtle">
          <AlertDiamondIcon className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-error-hover">
              {message.meta?.templateId ? "Template rendering failed" : "Échec d&apos;envoi"}
            </p>
            <p className="text-sm text-text-body mt-0.5">{message.error}</p>
          </div>
        </div>
      )}

      <Card>
        <DetailRow label="Statut">
          <Badge variant={STATUS_VARIANT[message.status] ?? "neutral"}>
            {STATUS_LABEL[message.status] ?? message.status}
          </Badge>
        </DetailRow>
        <DetailRow label="Type">
          <Badge variant="neutral">{TYPE_LABEL[message.type] ?? message.type}</Badge>
        </DetailRow>
        <DetailRow label="Destinataire">
          <span className="font-mono">{message.to}</span>
        </DetailRow>
        <DetailRow label="Instance">
          <span className="font-mono text-xs">{message.instanceId}</span>
        </DetailRow>
        {message.providerMessageId && (
          <DetailRow label="ID fournisseur">
            <CodeSnippet value={message.providerMessageId} />
          </DetailRow>
        )}
        <DetailRow label="Contenu">
          {message.type === "text" && message.body ? (
            <span>{message.body}</span>
          ) : message.mediaUrl ? (
            <a
              href={message.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-ink hover:text-text hover:underline break-all"
            >
              {message.mediaUrl}
            </a>
          ) : (
            <span className="text-text-muted">[{TYPE_LABEL[message.type] ?? message.type}]</span>
          )}
        </DetailRow>
        <DetailRow label="Créé le">{formatFullDate(message.createdAt)}</DetailRow>
        <DetailRow label="Mis à jour le">{formatFullDate(message.updatedAt)}</DetailRow>
        {message.campaignId && (
          <DetailRow label="Campagne">
            <button
              onClick={() => router.push(`/campaigns/${message.campaignId}`)}
              className="text-primary-ink hover:text-text hover:underline text-sm"
            >
              Voir la campagne →
            </button>
          </DetailRow>
        )}
        {message.contactId && (
          <DetailRow label="Contact">
            <span className="font-mono text-xs">{message.contactId}</span>
          </DetailRow>
        )}
      </Card>

      {message.meta?.templateId && (
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-text">Template Render</h2>
          <DetailRow label="Template ID">
            <span className="font-mono text-xs">{message.meta.templateId}</span>
          </DetailRow>
          <DetailRow label="Used variables">
            {message.meta.usedVariables?.length
              ? (
                <div className="flex flex-wrap gap-1.5">
                  {message.meta.usedVariables.map((variable) => (
                    <Badge key={variable} variant="blue">{variable}</Badge>
                  ))}
                </div>
              )
              : <span className="text-text-muted">Aucune</span>}
          </DetailRow>
          {message.meta.missingVariables?.length ? (
            <DetailRow label="Missing variables">
              <div className="flex flex-wrap gap-1.5">
                {message.meta.missingVariables.map((variable) => (
                  <Badge key={variable} variant="warning">{variable}</Badge>
                ))}
              </div>
            </DetailRow>
          ) : null}
          {message.meta.code && (
            <DetailRow label="Render code">
              <CodeSnippet value={message.meta.code} />
            </DetailRow>
          )}
        </Card>
      )}
    </motion.div>
  )
}
