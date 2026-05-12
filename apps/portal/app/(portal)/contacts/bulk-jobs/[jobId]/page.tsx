"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import type { ContactBulkJobProgress } from "@usesendnow/types"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { useContactBulkJobPoll } from "@/hooks/useContactBulkJobPoll"
import { fadeIn } from "@/lib/animations"
import { ArrowLeft01Icon } from "hugeicons-react"

export default function ContactBulkJobDetailPage() {
  const params = useParams<{ jobId: string }>()
  const jobId = typeof params.jobId === "string" ? params.jobId : ""
  const router = useRouter()
  const { copy } = usePortalLocale()
  const c = copy.contacts
  const { start, stop, cancel, snapshot, activeJobId, cancelling } = useContactBulkJobPoll()
  const [lastProgress, setLastProgress] = useState<ContactBulkJobProgress | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!jobId) return
    start(
      jobId,
      {
        onProgress: (p) => setLastProgress(p),
        onComplete: (p) => {
          setLastProgress(p)
          setFinished(true)
        },
      },
      { variant: "delete" },
    )
    return () => {
      stop()
    }
  }, [jobId, start, stop])

  const progress = lastProgress
  const pct = progress?.progress ?? snapshot.progress
  const status = progress?.status ?? snapshot.status
  const summary = progress?.summary

  const handleCancel = async () => {
    try {
      await cancel()
      toast.success(c.bulkJobCancelled)
      setFinished(true)
    } catch {
      toast.error(c.groups.addMembersBulkCancelFailed)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 max-w-2xl">
      <PageHeader
        title={copy.titles.bulkJobDetail}
        description={c.bulkJobPageDescription}
        action={
          <Button variant="ghost" size="sm" onClick={() => router.push("/contacts")}>
            <ArrowLeft01Icon className="w-4 h-4 mr-1.5" />
            {copy.contacts.importDetail.back}
          </Button>
        }
      />

      <Card className="p-5 space-y-4">
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{c.bulkJobIdLabel}</p>
          <p className="text-sm font-mono text-text mt-1 break-all">{jobId || "—"}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{c.bulkJobOperation}</p>
            <p className="text-sm text-text mt-1">{progress?.operation ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{c.bulkJobStatus}</p>
            <p className="text-sm text-text mt-1 font-mono">{status}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5">{c.bulkJobProgressLabel}</p>
          <div className="h-2 w-full rounded-full bg-bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1 tabular-nums">{pct}%</p>
        </div>

        {summary && Object.keys(summary).length > 0 ? (
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5">{c.bulkJobSummary}</p>
            <pre className="text-xs font-mono text-text-body bg-bg-subtle border border-border rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(summary, null, 2)}
            </pre>
          </div>
        ) : null}

        {progress?.error ? (
          <p className="text-sm text-error">{progress.error}</p>
        ) : null}

        {finished ? (
          <p className="text-sm text-text-secondary">{c.bulkJobDoneHint}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {activeJobId ? (
            <Button variant="secondary" size="sm" loading={cancelling} onClick={() => void handleCancel()}>
              {c.groups.addMembersBulkCancel}
            </Button>
          ) : null}
          {progress?.groupId ? (
            <Link
              href={`/contacts/groups/${progress.groupId}`}
              className="text-sm font-medium text-primary-ink hover:underline"
            >
              {c.bulkJobGoToGroup}
            </Link>
          ) : null}
        </div>
      </Card>
    </motion.div>
  )
}
