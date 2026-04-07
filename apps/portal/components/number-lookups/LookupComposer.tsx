"use client"

import { useState, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import type { Instance } from "@usesendnow/types"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import {
  Search01Icon,
  AlertCircleIcon,
  Upload01Icon,
  Download01Icon,
  File02Icon,
} from "hugeicons-react"
import { parsePhoneCsv, generatePhoneCsvTemplate, csvBlob } from "@/lib/csvParser"

interface LookupComposerProps {
  instances: Instance[]
  selectedInstanceId: string
  onInstanceChange: (id: string) => void
  onSubmit: (instanceId: string, numbers: string[]) => void
  submitting: boolean
}

export default function LookupComposer({
  instances,
  selectedInstanceId,
  onInstanceChange,
  onSubmit,
  submitting,
}: LookupComposerProps) {
  const [rawInput, setRawInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const numbers = useMemo(() => {
    return rawInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }, [rawInput])

  const isLargeBatch = numbers.length >= 1000
  const isValid = numbers.length > 0 && selectedInstanceId !== ""

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit(selectedInstanceId, numbers)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === "string") {
        const parsed = parsePhoneCsv(text)
        setRawInput(parsed.join("\n"))
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  const handleDownloadTemplate = () => {
    const content = generatePhoneCsvTemplate()
    const blob = csvBlob(content)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "phone-numbers-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-bg border border-border rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(10,10,10,0.10)]">
      <h3 className="text-base font-medium text-text mb-5">Vérifier des numéros</h3>

      <div className="space-y-4">
        <Select
          label="Instance"
          value={selectedInstanceId}
          onChange={(e) => onInstanceChange(e.target.value)}
          hint="Choisissez une instance connectée pour exécuter le lookup."
        >
          <option value="">— Sélectionner une instance —</option>
          {instances.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name} ({inst.status})
            </option>
          ))}
        </Select>

        <Textarea
          label="Numéros de téléphone"
          placeholder="+41791234567
+81476222311
+33612345000"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          rows={8}
          hint={`${numbers.length} numéro${numbers.length !== 1 ? "s" : ""} détecté${numbers.length !== 1 ? "s" : ""}`}
        />

        {/* Import section */}
        <div className="flex flex-wrap items-center gap-2 border border-border rounded-xl p-3 bg-bg-subtle">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload01Icon className="w-4 h-4 mr-1.5" />
            Importer un CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownloadTemplate}>
            <Download01Icon className="w-4 h-4 mr-1.5" />
            Télécharger le template
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-text-muted ml-auto">
            <File02Icon className="w-3.5 h-3.5" />
            <span>1 colonne : <code className="font-mono bg-bg px-1 rounded">phone</code></span>
          </div>
        </div>

        {isLargeBatch && (
          <div className="flex items-start gap-2 p-3 bg-warning-subtle border border-warning/30 rounded-xl">
            <AlertCircleIcon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-warning-text">
              Volume important détecté (≥ 1000 numéros). Le lookup s'exécutera en arrière-plan.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            size="sm"
            loading={submitting}
            disabled={!isValid || submitting}
            onClick={handleSubmit}
          >
            <Search01Icon className="w-4 h-4 mr-1.5" />
            Lancer le lookup
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
