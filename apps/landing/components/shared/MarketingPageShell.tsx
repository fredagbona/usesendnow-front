import type { ReactNode } from "react"

interface MarketingPageShellProps {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
}

export function MarketingPageShell({ eyebrow, title, description, children }: MarketingPageShellProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {eyebrow ? (
          <p className="font-(family-name:--font-geist-sans) text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A18A00]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 max-w-4xl font-(family-name:--font-geist-sans) text-[clamp(2.6rem,5vw,4.8rem)] font-semibold tracking-[-0.06em] text-[#171515]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-3xl font-(family-name:--font-poppins) text-lg leading-8 text-[#625B54]">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  )
}
