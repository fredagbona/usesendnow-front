import type { Metadata } from "next";
import { Navbar } from "../components/sections/Navbar";
import { HeroSection } from "../components/sections/HeroSection";
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
        ? "msgflash — WhatsApp API for makers who do not wait on Meta"
        : "msgflash — WhatsApp API pour les makers qui n'attendent pas Meta",
    description:
      locale === "en"
        ? "Connect your number in 2 minutes and send your first WhatsApp messages via API in 5 minutes. No BSP approval, no hidden fees, starting at €9/month."
        : "Connectez votre numéro en 2 minutes et envoyez vos premiers messages WhatsApp via API en 5 minutes. Sans validation BSP, sans frais cachés, à partir de 9€/mois.",
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
            <div className="grid gap-4 sm:grid-cols-3">
              {messages.hero.proof.map((item) => (
                <div key={item} className="border border-white/8 bg-[#121212] px-4 py-4">
                  <p className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.06em] text-[#FFD600]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
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
