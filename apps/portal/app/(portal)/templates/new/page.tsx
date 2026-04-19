"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { fadeIn } from "@/lib/animations"
import { parseTemplateVariables } from "@/lib/templateEngine"
import type { TemplateType } from "@usesendnow/types"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import Alert from "@/components/ui/Alert"
import Badge from "@/components/ui/Badge"
import { TemplateVariableGuide } from "@/components/templates/TemplateVariableGuide"
import { apiClient, ApiClientError } from "@usesendnow/api-client"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import {
  ArrowLeft01Icon,
  File01Icon,
  InformationCircleIcon,
  UserIcon,
  BubbleChatIcon,
  Settings02Icon,
  Megaphone01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
} from "hugeicons-react"

const TEMPLATE_TYPES: TemplateType[] = ["text", "image", "video", "audio", "document"]

const TYPE_LABEL: Record<TemplateType, string> = {
  text: "Texte",
  image: "Image",
  video: "Vidéo",
  audio: "Audio",
  document: "Document",
}

const AUTO_VARIABLES = [
  { namespace: "contact.*", icon: BubbleChatIcon, fields: ["contact.name", "contact.firstName", "contact.phone", "contact.tags", "contact.meta.*"], desc: "Données du contact" },
  { namespace: "user.*", icon: UserIcon, fields: ["user.fullName", "user.email", "user.phone"], desc: "Vos données utilisateur" },
  { namespace: "instance.*", icon: Settings02Icon, fields: ["instance.name"], desc: "Données de l'instance" },
]

const EXAMPLES = [
  {
    label: "Relance personnalisée",
    body: "Bonjour {{contact.firstName}}, vous avez laissé un article dans votre panier. Utilisez {{custom.code}} pour 10% de réduction.",
  },
  {
    label: "Confirmation de commande",
    body: "Merci {{contact.firstName}} ! Votre commande {{custom.orderId}} de {{custom.amount}}€ est confirmée. Livraison prévue le {{custom.deliveryDate}}.",
  },
  {
    label: "Note de service",
    body: "Bonjour à tous, l'instance {{instance.name}} sera en maintenance le {{custom.date}}. Merci de votre compréhension.",
  },
]

export default function NewTemplatePage() {
  const { copy } = usePortalLocale()
  const tNew = copy.templates.new
  const router = useRouter()
  const [name, setName] = useState("")
  const [type, setType] = useState<TemplateType>("text")
  const [body, setBody] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const detectedVariables = useMemo(() => parseTemplateVariables(body), [body])
  const requiresMedia = type !== "text"

  const customVars = useMemo(
    () => detectedVariables.filter((v) => v.startsWith("custom.")),
    [detectedVariables]
  )
  const contextVars = useMemo(
    () => detectedVariables.filter((v) => v.startsWith("contact.") || v.startsWith("user.") || v.startsWith("instance.")),
    [detectedVariables]
  )

  const canSubmit =
    name.trim().length > 0 &&
    (type === "text" ? body.trim().length > 0 : true) &&
    (requiresMedia ? mediaUrl.trim().length > 0 : true)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.templates.create({
        name: name.trim(),
        type,
        body: body.trim() || null,
        mediaUrl: type === "text" ? null : mediaUrl.trim() || null,
      })
      toast.success(tNew.created)
      router.push(`/templates/${response.id}`)
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TEMPLATE_INVALID") {
        setError(tNew.invalid)
      } else if (err instanceof ApiClientError && err.code === "VALIDATION_ERROR") {
        setError(tNew.requiredFields)
      } else {
        setError(tNew.saveFailed)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-6xl">
      <PageHeader
        title={tNew.title}
        description={tNew.description}
        action={
          <Button variant="secondary" onClick={() => router.push("/templates")}>
            <ArrowLeft01Icon className="w-4 h-4 mr-1.5" />
            {tNew.back}
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Variable syntax guide — top of page */}
        <Card className="space-y-4 border-primary/20 bg-primary-subtle">
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-text">{tNew.variableSyntax}</h3>
          </div>
          <p className="text-sm text-text-secondary">
            {tNew.variableSyntaxDescription}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {AUTO_VARIABLES.map(({ namespace, icon: Icon, fields, desc }) => (
              <div key={namespace} className="bg-bg border border-border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-text-secondary" />
                  <code className="text-xs font-mono font-bold text-text">{namespace}</code>
                </div>
                <p className="text-xs text-text-muted mb-2">{desc}</p>
                <div className="flex flex-wrap gap-1">
                  {fields.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setBody((prev) => prev + (prev.length > 0 && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "") + `{{${f}}}`)
                      }}
                      className="text-[10px] font-mono bg-bg-subtle border border-border px-1.5 py-0.5 rounded hover:border-primary hover:text-primary transition-colors"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-bg border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone01Icon className="w-4 h-4 text-text-secondary" />
              <code className="text-xs font-mono font-bold text-text">custom.*</code>
              <span className="text-xs text-text-muted">— {tNew.customVariables}</span>
            </div>
            <p className="text-xs text-text-secondary">
              {tNew.customVariablesDescription}
            </p>
          </div>
        </Card>

        {/* Examples accordion */}
        <Card>
          <button
            type="button"
            onClick={() => setShowExamples((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <BubbleChatIcon className="w-5 h-5 text-text-secondary" />
              <h3 className="text-sm font-semibold text-text">{tNew.examplesTitle}</h3>
            </div>
            <span className="text-xs text-text-secondary">{showExamples ? tNew.hide : tNew.show}</span>
          </button>

          {showExamples && (
            <div className="mt-4 space-y-3">
              {EXAMPLES.map((ex) => {
                const isCopied = copied === ex.body
                return (
                  <div key={ex.label} className="bg-bg-subtle border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-text">{ex.label}</p>
                      <button
                        type="button"
                        onClick={() => handleCopy(ex.body)}
                        className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors"
                      >
                        {isCopied ? (
                          <><CheckmarkCircle01Icon className="w-3.5 h-3.5 text-primary" /> {tNew.copied}</>
                        ) : (
                          <><Copy01Icon className="w-3.5 h-3.5" /> {tNew.copy}</>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-text-secondary leading-relaxed break-words whitespace-pre-wrap">{ex.body}</p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Basic info */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <File01Icon className="w-5 h-5 text-text-secondary" />
            <h3 className="text-base font-medium text-text">{tNew.infoTitle}</h3>
          </div>

          <Input
            label={tNew.templateName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Relance panier abandonné"
            required
            autoFocus
          />

          <Select label={copy.templates.type} value={type} onChange={(e) => setType(e.target.value as TemplateType)}>
            {TEMPLATE_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </Select>

          {requiresMedia && (
            <Input
              label={tNew.mediaUrl}
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://cdn.msgflash.com/assets/promo.jpg"
              required
            />
          )}
        </Card>

        {/* Body */}
        <Card className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-text mb-1">
              {tNew.bodyTitle}
            </h3>
            <p className="text-xs text-text-secondary mb-3">
              {tNew.bodyDescription}
            </p>
          </div>

          <Textarea
            label={requiresMedia ? copy.templates.bodyOptional : copy.templates.body}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required={!requiresMedia}
            rows={8}
            placeholder={tNew.bodyPlaceholder}
          />

          {/* Detected variables */}
          {detectedVariables.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="w-4 h-4 text-text-secondary" />
                <p className="text-sm font-medium text-text-body">{tNew.variablesDetected} ({detectedVariables.length})</p>
              </div>

              {contextVars.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1.5">
                    <CheckmarkCircle01Icon className="w-3.5 h-3.5 inline mr-1" />
                    {tNew.autoResolved}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {contextVars.map((v) => (
                      <Badge key={v} variant="neutral">{v}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {customVars.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1.5">
                    <Megaphone01Icon className="w-3.5 h-3.5 inline mr-1" />
                    {tNew.toProvideOnSend}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {customVars.map((v) => (
                      <Badge key={v} variant="warning">{v}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {detectedVariables.length === 0 && body.length > 0 && (
            <p className="text-xs text-text-muted">
              {tNew.noVariablesDetected}
            </p>
          )}

          <TemplateVariableGuide variables={detectedVariables} />
        </Card>

        {/* Actions */}
        {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

        <div className="flex items-center justify-between">
          {!canSubmit && (
            <p className="text-sm text-text-secondary">
              {tNew.submitHint}
            </p>
          )}
          <div className="flex gap-3 ml-auto">
            <Button type="button" variant="secondary" onClick={() => router.push("/templates")}>{tNew.cancel}</Button>
            <Button type="submit" variant="primary" loading={loading} disabled={!canSubmit}>
              {tNew.create}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  )
}
