import type { Metadata } from "next"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { Button } from "../../components/ui/Button"
import { landingBrand } from "../../lib/brand"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"
import { getLandingV2Copy } from "../../lib/landing-v2-copy"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title: locale === "en" ? "MsgFlash - Use cases" : "MsgFlash - Cas d'usage",
    description: locale === "en" ? "Automated WhatsApp use cases for business flows." : "Cas d'usage WhatsApp automatisés pour les flows métier.",
  }
}

export default async function UseCasesPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const copy = getLandingV2Copy(locale)

  return (
    <>
      <Navbar />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-(family-name:--font-geist-sans) text-5xl font-semibold tracking-[-0.05em] text-[#171515]">
            {copy.pages.useCases.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#625B54]">{copy.pages.useCases.subtitle}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {copy.pages.useCases.cards.map((card) => (
              <a key={card.href} href={card.href} className="rounded-sm border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(23,21,21,0.06)]">
                <h2 className="font-(family-name:--font-geist-sans) text-xl font-semibold text-[#171515]">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#625B54]">{card.text}</p>
              </a>
            ))}
          </div>
          <div className="mt-10">
            <Button href={`${landingBrand.appUrl}/signup`} showArrow>
              {locale === "en" ? "Start free" : "Commencer gratuitement"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
