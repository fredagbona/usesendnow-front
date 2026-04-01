"use client"

import Image from "next/image"
import { landingBrand } from "../../lib/brand"

interface BrandMarkProps {
  className?: string
  textClassName?: string
}

export function BrandMark({
  className = "",
  textClassName = "",
}: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/favicon-96x96.png"
        alt={`${landingBrand.name} icon`}
        width={22}
        height={22}
        className="shrink-0 rounded-sm"
      />
      <span className={`font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.12em] ${textClassName}`}>
        {landingBrand.name}
      </span>
    </div>
  )
}
