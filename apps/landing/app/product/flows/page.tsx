import type { Metadata } from "next"
import { Navbar } from "../../../components/sections/Navbar"
import { Footer } from "../../../components/sections/Footer"
import { MarketingPageShell } from "../../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title: locale === "en" ? "MsgFlash - Flows" : "MsgFlash - Flows",
    description:
      locale === "en"
        ? "Build reusable flows from business events."
        : "Construisez des flows réutilisables à partir d'événements métier.",
  }
}

export default async function FlowsPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const points = locale === "en" ? ["Triggers", "Conditions", "Actions", "Templates"] : ["Déclencheurs", "Conditions", "Actions", "Templates"]

  return (
    <>
      <Navbar />
      <main className="bg-[#FCFAF4]">
        <MarketingPageShell
          eyebrow={locale === "en" ? "Product" : "Produit"}
          title={locale === "en" ? "Flows" : "Flows"}
          description={
            locale === "en"
              ? "Build reusable flows from business events."
              : "Construisez des flows réutilisables à partir d'événements métier."
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            {points.map((point) => (
              <div key={point} className="rounded-sm border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(23,21,21,0.06)]">
                <p className="text-sm leading-6 text-[#625B54]">{point}</p>
              </div>
            ))}
          </div>
        </MarketingPageShell>
      </main>
      <Footer />
    </>
  )
}
