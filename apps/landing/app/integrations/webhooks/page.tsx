import type { Metadata } from "next"
import { Navbar } from "../../../components/sections/Navbar"
import { Footer } from "../../../components/sections/Footer"
import { MarketingPageShell } from "../../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title: "MsgFlash - Webhooks",
    description:
      locale === "en"
        ? "Wire in external events."
        : "Branchez les événements externes.",
  }
}

export default async function WebhooksIntegrationPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const points =
    locale === "en"
      ? ["External events", "Realtime updates", "Workflow wiring"]
      : ["Événements externes", "Mises à jour temps réel", "Branchement de workflows"]

  return (
    <>
      <Navbar />
      <main className="bg-[#FCFAF4]">
        <MarketingPageShell
          eyebrow={locale === "en" ? "Integration" : "Intégration"}
          title="Webhooks"
          description={locale === "en" ? "Wire in external events." : "Branchez les événements externes."}
        >
          <div className="grid gap-4 md:grid-cols-3">
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
