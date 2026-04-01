"use client"

import { useEffect, useState } from "react"
import { getAvatarUrl } from "@/lib/avatar"

interface AvatarProps {
  avatarUrl?: string | null
  fullName: string
  alt: string
  className: string
}

export default function Avatar({
  avatarUrl,
  fullName,
  alt,
  className,
}: AvatarProps) {
  const fallbackUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(fullName)}`
  const [src, setSrc] = useState(getAvatarUrl(avatarUrl, fullName))

  useEffect(() => {
    setSrc(getAvatarUrl(avatarUrl, fullName))
  }, [avatarUrl, fullName])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => {
        if (src !== fallbackUrl) {
          setSrc(fallbackUrl)
        }
      }}
    />
  )
}
