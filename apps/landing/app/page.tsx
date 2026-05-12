import type { Metadata } from "next";
import { Navbar } from "../components/sections/Navbar";
import { HeroSection } from "../components/sections/HeroSection";
import { LogosBar } from "../components/sections/LogosBar";
import { FeaturesGrid } from "../components/sections/FeaturesGrid";
import { HowItWorks } from "../components/sections/HowItWorks";
import { WordPressSection } from "../components/sections/WordPressSection";
import { Pricing } from "../components/sections/Pricing";
import { FAQ } from "../components/sections/FAQ";
import { FinalCTA } from "../components/sections/FinalCTA";
import { Footer } from "../components/sections/Footer";
import { detectLandingLocaleFromHeaders } from "../lib/landing-locale.server";
import { getLandingMessages } from "../lib/landing-i18n-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title:
      locale === "en"
        ? "msgflash — WhatsApp API for Developers | REST, Webhooks, n8n, Zapier, Make"
        : "msgflash — API WhatsApp pour développeurs | REST, webhooks, n8n, Zapier, Make",
    description:
      locale === "en"
        ? "Send WhatsApp messages via REST API without a heavy BSP workflow. WhatsApp webhook integration, QR code onboarding, and automation with n8n, Zapier, and Make. Free tier available."
        : "Envoyez des messages WhatsApp via une API REST sans parcours BSP lourd. Intégration webhooks, connexion QR code et automation avec n8n, Zapier et Make. Offre gratuite disponible.",
  }
}

export default async function Home() {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <section className="border-t border-white/8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-(family-name:--font-geist-sans) text-xl font-black uppercase tracking-[-0.03em] text-[#F0F0F0] sm:text-2xl">
              {messages.homeSeo.developerH2}
            </h2>
          </div>
        </section>
        <LogosBar />
        <FeaturesGrid />
        <section className="border-t border-white/8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-(family-name:--font-geist-sans) text-xl font-black uppercase tracking-[-0.03em] text-[#F0F0F0] sm:text-2xl">
              {messages.homeSeo.integrationH2}
            </h2>
            <p className="mt-4 max-w-3xl font-(family-name:--font-poppins) text-sm leading-7 text-[#A3A3A3] sm:text-base">
              {messages.homeSeo.integrationBody}
            </p>
          </div>
        </section>
        <HowItWorks />
        <WordPressSection />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
