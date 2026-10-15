import type { Metadata } from "next"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title: locale === "en" ? "MsgFlash - Security" : "MsgFlash - Sécurité",
    description: locale === "en" ? "MsgFlash instance health and sending guidance." : "Santé des instances MsgFlash et recommandations d’envoi.",
  }
}

export default async function SecurityPage() {
  const locale = await detectLandingLocaleFromHeaders()
  return (
    <>
      <Navbar />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-(family-name:--font-geist-sans) text-5xl font-semibold tracking-[-0.05em] text-[#171515]">
            {locale === "en" ? "Instance health & safety" : "Santé et sécurité des instances"}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#625B54]">
            {locale === "en"
              ? "This page explains how MsgFlash monitors connected numbers and protects sending quality."
              : "Cette page explique comment MsgFlash surveille les numéros connectés et protège la qualité des envois."}
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
