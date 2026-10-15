import type { Metadata } from "next"
import { Navbar } from "../../../components/sections/Navbar"
import { Footer } from "../../../components/sections/Footer"
import { MarketingPageShell } from "../../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title: "MsgFlash - WooCommerce",
    description:
      locale === "en"
        ? "Cart recovery, order updates, shipping, reviews, upsells."
        : "Paniers abandonnés, commandes, expédition, avis, upsells.",
  }
}

export default async function WooCommerceSolutionPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const points =
    locale === "en"
      ? ["Abandoned cart recovery", "Order updates", "Shipping notifications", "Reviews", "Upsells"]
      : ["Relance panier", "Mises à jour commande", "Notifications expédition", "Avis", "Upsells"]

  return (
    <>
      <Navbar />
      <main className="bg-[#FCFAF4]">
        <MarketingPageShell
          eyebrow={locale === "en" ? "Solutions" : "Solutions"}
          title="WooCommerce"
          description={
            locale === "en"
              ? "Drive revenue with WhatsApp automation."
              : "Générez du revenu avec l'automatisation WhatsApp."
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
