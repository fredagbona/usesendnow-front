"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import PageHeader from "@/components/layout/PageHeader"
import LookupComposer from "@/components/number-lookups/LookupComposer"
import LookupSummaryCards from "@/components/number-lookups/LookupSummaryCards"
import LookupResultsTabs from "@/components/number-lookups/LookupResultsTabs"
import LookupHistoryTable from "@/components/number-lookups/LookupHistoryTable"
import ImportContactsPanel from "@/components/number-lookups/ImportContactsPanel"
import { useNumberLookups } from "@/hooks/useNumberLookups"
import { useInstances } from "@/hooks/useInstances"
import { useContactGroups } from "@/hooks/useContactGroups"
import { SkeletonCard } from "@/components/ui/Skeleton"

export default function NumberLookupsPage() {
  const { instances, loading: instancesLoading } = useInstances()
  const { groups, loading: groupsLoading } = useContactGroups()
  const {
    lookups,
    activeLookup,
    loading: lookupsLoading,
    submitting,
    importing,
    submitLookup,
    viewLookup,
    importContacts,
    setActiveLookup,
  } = useNumberLookups()

  const [selectedInstanceId, setSelectedInstanceId] = useState("")

  const handleSubmit = async (instanceId: string, numbers: string[]) => {
    await submitLookup(instanceId, numbers)
  }

  const handleImport = async (groupId?: string, tag?: string) => {
    if (!activeLookup) return false
    return importContacts(activeLookup.id, groupId, tag)
  }

  const handleViewLookup = async (id: string) => {
    await viewLookup(id)
  }

  const handleImportFromHistory = async (id: string) => {
    // Set as active lookup and trigger import flow
    const lookup = lookups.find((l) => l.id === id)
    if (lookup) {
      setActiveLookup(lookup)
      await importContacts(id)
    }
  }

  if (lookupsLoading || instancesLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const result = activeLookup?.result
  const hasResult = result && result.onWhatsApp.length + result.notOnWhatsApp.length + result.invalid.length > 0

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-8 max-w-4xl">
      <PageHeader
        title="Number Lookups"
        description="Vérifiez si des numéros sont présents sur WhatsApp et importez-les comme contacts."
      />

      {/* Composer */}
      <LookupComposer
        instances={instances}
        selectedInstanceId={selectedInstanceId}
        onInstanceChange={setSelectedInstanceId}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Active lookup results */}
      {activeLookup && activeLookup.status === "done" && result && (
        <div className="space-y-6">
          <LookupSummaryCards
            requested={activeLookup.requestedCount}
            checked={activeLookup.checkedCount || activeLookup.normalizedCount}
            onWhatsApp={activeLookup.onWhatsAppCount}
            notOnWhatsApp={activeLookup.notOnWhatsAppCount}
            invalid={activeLookup.invalidCount}
          />

          <LookupResultsTabs
            onWhatsApp={result.onWhatsApp}
            notOnWhatsApp={result.notOnWhatsApp}
            invalid={result.invalid}
          />

          {hasResult && (
            <ImportContactsPanel
              lookupId={activeLookup.id}
              onImport={handleImport}
              importing={importing}
              groups={groups}
              onValidCount={activeLookup.onWhatsAppCount}
            />
          )}
        </div>
      )}

      {/* Polling indicator */}
      {activeLookup && (activeLookup.status === "pending" || activeLookup.status === "processing") && (
        <div className="bg-bg border border-border rounded-2xl p-6 text-center">
          <p className="text-sm text-text-secondary">
            Lookup en cours de traitement… Les résultats seront disponibles dans quelques instants.
          </p>
          {activeLookup.progress !== undefined && (
            <div className="mt-3 w-full bg-bg-muted rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(activeLookup.progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-sm font-medium text-text mb-4">Historique</h2>
        <LookupHistoryTable
          lookups={lookups}
          onView={handleViewLookup}
          onImport={handleImportFromHistory}
          importingId={importing ? activeLookup?.id ?? null : null}
        />
      </div>
    </motion.div>
  )
}
