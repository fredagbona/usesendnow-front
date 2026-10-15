import type { Metadata } from "next"
import { Navbar } from "../../../components/sections/Navbar"
import { Footer } from "../../../components/sections/Footer"
import { MarketingPageShell } from "../../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title: "MsgFlash - API",
    description:
      locale === "en"
        ? "Authentication, sending, webhooks, SDKs and examples."
        : "Authentification, envoi, webhooks, SDKs et exemples.",
  }
}

export default async function ApiPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const points =
    locale === "en"
      ? ["Authentication", "Sending messages", "Webhooks", "SDKs", "Examples", "Rate limits"]
      : ["Authentification", "Envoi de messages", "Webhooks", "SDKs", "Exemples", "Rate limits"]

  return (
    <>
      <Navbar />
      <main className="bg-[#FCFAF4]">
        <MarketingPageShell
          eyebrow={locale === "en" ? "Product" : "Produit"}
          title="API"
          description={locale === "en" ? "Developer entry point." : "Point d'entrée développeur."}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {points.map((point) => (
              <div
                key={point}
                className="rounded-sm border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(23,21,21,0.06)]"
              >
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
