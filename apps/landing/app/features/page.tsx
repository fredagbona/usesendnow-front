import type { Metadata } from "next"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title: locale === "en" ? "MsgFlash - Features" : "MsgFlash - Fonctionnalités",
    description: locale === "en" ? "MsgFlash features." : "Fonctionnalités MsgFlash.",
  }
}

export default async function FeaturesPage() {
  const locale = await detectLandingLocaleFromHeaders()
  return (
    <>
      <Navbar />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-(family-name:--font-geist-sans) text-5xl font-semibold tracking-[-0.05em] text-[#171515]">
            {locale === "en" ? "Features" : "Fonctionnalités"}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#625B54]">
            {locale === "en"
              ? "This page will host the detailed feature inventory."
              : "Cette page accueillera l’inventaire détaillé des fonctionnalités."}
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
