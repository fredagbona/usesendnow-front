"use client"

import Script from "next/script"

interface CalendlyEmbedProps {
  url: string
  className?: string
}

export function CalendlyEmbed({ url, className = "" }: CalendlyEmbedProps) {
  return (
    <>
      <div
        className={`calendly-inline-widget w-full ${className}`}
        data-url={url}
        style={{ minWidth: "100%", height: "620px" }}
      />
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
    </>
  )
}
