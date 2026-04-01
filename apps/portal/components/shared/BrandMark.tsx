"use client"

import Image from "next/image"
import { portalBrand } from "@/lib/brand"

interface BrandMarkProps {
  compact?: boolean
  className?: string
  textClassName?: string
}

export default function BrandMark({
  compact = false,
  className = "",
  textClassName = "",
}: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/favicon-96x96.png"
        alt={`${portalBrand.name} icon`}
        width={compact ? 20 : 24}
        height={compact ? 20 : 24}
        className="shrink-0 rounded-sm"
      />
      {!compact && (
        <span className={`font-bold tracking-tight lowercase ${textClassName}`}>
          {portalBrand.name}
        </span>
      )}
    </div>
  )
}
