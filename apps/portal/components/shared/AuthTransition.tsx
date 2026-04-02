"use client"

import BrandMark from "@/components/shared/BrandMark"

interface AuthTransitionProps {
  title: string
  description: string
}

export default function AuthTransition({ title, description }: AuthTransitionProps) {
  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.16),rgba(10,10,10,0)_30%),linear-gradient(180deg,#141414_0%,#0A0A0A_100%)]">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/18 blur-3xl pointer-events-none" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <BrandMark textClassName="text-xl text-primary" />

        <div className="mt-10 flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
          <svg className="h-9 w-9 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div className="mt-8 max-w-2xl space-y-4">
          <h1 className="font-(family-name:--font-geist-sans) text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
            {title}
          </h1>
          <p className="font-(family-name:--font-poppins) text-base leading-8 text-white/60 sm:text-lg">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
