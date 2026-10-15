import type { Metadata } from "next"
import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  FlowConnectionIcon,
} from "hugeicons-react"
import { Navbar } from "../../../components/sections/Navbar"
import { Footer } from "../../../components/sections/Footer"
import { Button } from "../../../components/ui/Button"
import { detectLandingLocaleFromHeaders } from "../../../lib/landing-locale.server"
import { getLandingV2Copy } from "../../../lib/landing-v2-copy"
import { landingBrand } from "../../../lib/brand"

const announcementUrl = `${landingBrand.marketingUrl}/announcements/business-event-automation`

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()

  return {
    title: locale === "fr" ? "MsgFlash évolue vers la Business Event Automation" : "MsgFlash is evolving into Business Event Automation",
    description:
      locale === "fr"
        ? "Découvrez comment MsgFlash transforme les événements de votre entreprise en communications WhatsApp automatiques."
        : "See how MsgFlash turns business events into automatic WhatsApp communication.",
    alternates: { canonical: announcementUrl },
  }
}

interface ArticleSectionProps {
  id: string
  index: string
  title: string
  children: React.ReactNode
}

function ArticleSection({ id, index, title, children }: ArticleSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-black/15 py-14 sm:py-20">
      <div className="flex items-start gap-4 sm:gap-8">
        <span className="pt-1 font-(family-name:--font-geist-sans) text-xs font-bold tracking-[0.18em] text-[#A18A00]">{index}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-(family-name:--font-geist-sans) text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-[#171515] sm:text-5xl">
            {title}
          </h2>
          <div className="mt-7 font-(family-name:--font-poppins) text-base leading-8 text-[#625B54] sm:text-lg sm:leading-[1.9]">{children}</div>
        </div>
      </div>
    </section>
  )
}

interface ContentsProps {
  label: string
  items: Array<{ id: string; title: string }>
}

function Contents({ label, items }: ContentsProps) {
  return (
    <nav aria-label={label} className="border-t border-black/15 pt-5 lg:sticky lg:top-28 lg:border-t-0 lg:border-l lg:pl-7">
      <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.16em] text-[#A18A00]">{label}</p>
      <ol className="mt-5 space-y-3">
        {items.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="group flex gap-3 font-(family-name:--font-poppins) text-sm leading-6 text-[#625B54] transition-colors hover:text-[#171515]">
              <span className="font-(family-name:--font-geist-sans) text-xs font-semibold text-[#A18A00]">0{index + 1}</span>
              <span className="group-hover:underline">{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

interface ShareLinkProps {
  label: string
}

function ShareLink({ label }: ShareLinkProps) {
  return (
    <a
      href={announcementUrl}
      aria-label={label}
      className="inline-flex items-center gap-2 font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-[0.12em] text-[#625B54] transition-colors hover:text-[#171515]"
    >
      <Copy01Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  )
}

export default async function BusinessEventAutomationPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const copy = getLandingV2Copy(locale).announcement
  const contents = [
    { id: "why", title: copy.whyTitle },
    { id: "events", title: copy.eventTitle },
    { id: "core", title: copy.whatStaysTitle },
    { id: "available", title: copy.availableTitle },
    { id: "rollout", title: copy.rolloutLabel },
    { id: "pricing", title: copy.pricingTitle },
    { id: "existing-users", title: copy.existingUsersTitle },
  ]

  return (
    <>
      <Navbar />
      <main className="bg-[#FCFAF4] text-[#171515]">
        <article className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
          <header className="border-b border-black/15 py-20 sm:py-28 lg:py-32">
            <div className="max-w-6xl">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-(family-name:--font-geist-sans) text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A18A00]">
                <span>{copy.eyebrow}</span>
                <span className="inline-flex items-center gap-2 text-[#7A7268]">
                  <Calendar03Icon className="h-4 w-4" aria-hidden="true" />
                  {copy.date}
                </span>
              </div>
              <h1 className="mt-8 max-w-5xl font-(family-name:--font-geist-sans) text-[clamp(3.25rem,8vw,7.75rem)] font-semibold leading-[0.88] tracking-[-0.085em]">
                {copy.title}
              </h1>
              <p className="mt-10 max-w-3xl font-(family-name:--font-poppins) text-xl leading-9 text-[#625B54] sm:text-2xl sm:leading-10">
                {copy.lead}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button href={landingBrand.appUrl} showArrow>{copy.primaryCta}</Button>
                <Button href="/#pricing" variant="secondary">{copy.secondaryCta}</Button>
                <ShareLink label={copy.shareLabel} />
              </div>
            </div>
          </header>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-20">
            <div className="max-w-3xl">
              <ArticleSection id="why" index="01" title={copy.whyTitle}>
                <p>{copy.why}</p>
              </ArticleSection>

              <ArticleSection id="events" index="02" title={copy.eventTitle}>
                <p>{copy.eventBody}</p>
                <div className="mt-9 border-l-2 border-[#25D366] pl-5">
                  {copy.eventSteps.map((step, index) => (
                    <div key={step} className="flex gap-4 border-b border-black/10 py-4 first:pt-0 last:border-0 last:pb-0">
                      <span className="font-(family-name:--font-geist-sans) text-sm font-bold text-[#A18A00]">0{index + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </ArticleSection>

              <ArticleSection id="core" index="03" title={copy.whatStaysTitle}>
                <div className="flex gap-4">
                  <FlowConnectionIcon className="mt-1 h-6 w-6 shrink-0 text-[#25D366]" aria-hidden="true" />
                  <p>{copy.whatStays}</p>
                </div>
              </ArticleSection>

              <ArticleSection id="available" index="04" title={copy.availableTitle}>
                <p>{copy.availableLead}</p>
                <ul className="mt-8 space-y-4">
                  {copy.available.map((item) => (
                    <li key={item} className="flex gap-3 border-b border-black/10 pb-4 last:border-0">
                      <CheckmarkCircle02Icon className="mt-1 h-5 w-5 shrink-0 text-[#25D366]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ArticleSection>

              <ArticleSection id="rollout" index="05" title={copy.rolloutLabel}>
                <div className="border-l-2 border-[#FFD600] pl-5">
                  <p className="font-(family-name:--font-geist-sans) font-semibold text-[#171515]">{copy.rolloutLead}</p>
                  <p className="mt-5">{copy.rollout}</p>
                </div>
              </ArticleSection>

              <ArticleSection id="pricing" index="06" title={copy.pricingTitle}>
                <p>{copy.pricingLead}</p>
                <p className="mt-5">{copy.pricing}</p>
                <div className="mt-9 grid gap-0 border border-black/15 sm:grid-cols-2">
                  {[
                    { name: "Starter", price: "19 € / mois", trial: locale === "fr" ? "Essai unique de 7 jours" : "One seven-day trial" },
                    { name: "Growth", price: "39 € / mois", trial: locale === "fr" ? "Essai unique de 7 jours" : "One seven-day trial" },
                  ].map((plan) => (
                    <div key={plan.name} className="border-b border-black/15 bg-white p-6 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                      <p className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.12em]">{plan.name}</p>
                      <p className="mt-4 font-(family-name:--font-geist-sans) text-3xl font-bold tracking-[-0.04em]">{plan.price}</p>
                      <p className="mt-2 text-sm text-[#625B54]">{plan.trial}</p>
                    </div>
                  ))}
                </div>
              </ArticleSection>

              <ArticleSection id="existing-users" index="07" title={copy.existingUsersTitle}>
                <p>{copy.existingUsers}</p>
              </ArticleSection>

              <footer className="border-t border-black/15 py-14 sm:py-20">
                <p className="font-(family-name:--font-poppins) text-lg leading-8 text-[#625B54]">{copy.closing}</p>
                <div className="mt-8 flex flex-wrap gap-6">
                  <a href={landingBrand.appUrl} className="inline-flex items-center gap-2 font-(family-name:--font-geist-sans) text-sm font-semibold hover:text-[#A18A00]">
                    {copy.primaryCta}
                    <ArrowRight01Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a href="/#pricing" className="inline-flex items-center gap-2 font-(family-name:--font-geist-sans) text-sm font-semibold hover:text-[#A18A00]">
                    {copy.secondaryCta}
                    <ArrowRight01Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </footer>
            </div>

            <aside className="order-first pt-10 lg:order-none lg:pt-20">
              <Contents label={copy.contentsLabel} items={contents} />
            </aside>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
