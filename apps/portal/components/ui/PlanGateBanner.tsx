"use client"

import { InformationCircleIcon } from "hugeicons-react"
import Button from "./Button"
import { useRouter } from "next/navigation"

interface PlanGateBannerProps {
  message: string
}

export default function PlanGateBanner({ message }: PlanGateBannerProps) {
  const router = useRouter()
  return (
    <div className="flex items-center gap-4 p-5 bg-primary-subtle border border-border-strong rounded-none shadow-[4px_4px_0px_0px_rgba(10,10,10,0.12)]">
      <div className="w-9 h-9 rounded-none bg-bg border border-border-strong flex items-center justify-center shrink-0">
        <InformationCircleIcon className="w-5 h-5 text-text" />
      </div>
      <p className="text-sm text-text flex-1">{message}</p>
      <Button variant="primary" size="sm" onClick={() => router.push("/billing")}>
        Mettre à niveau
      </Button>
    </div>
  )
}
