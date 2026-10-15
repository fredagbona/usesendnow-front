import type { Metadata } from "next"
import { Navbar } from "../../../components/sections/Navbar"
import { Footer } from "../../../components/sections/Footer"
import { MarketingPageShell } from "../../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return { title: locale === "en" ? "MsgFlash - Analytics" : "MsgFlash - Analytics", description: locale === "en" ? "Delivery, read rate, performance and ROI." : "Livraison, lecture, performance et ROI." }
}

export default async function AnalyticsPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const points = locale === "en" ? ["Delivery", "Read rate", "Performance", "ROI"] : ["Livraison", "Taux de lecture", "Performance", "ROI"]
  return (<><Navbar /><main className="bg-[#FCFAF4]"><MarketingPageShell eyebrow={locale === 'en' ? 'Product' : 'Produit'} title={locale === 'en' ? 'Analytics' : 'Analytics'} description={locale === 'en' ? 'Measure what matters.' : 'Mesurez ce qui compte.'}><div className="grid gap-4 md:grid-cols-2">{points.map((point) => <div key={point} className="rounded-sm border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(23,21,21,0.06)]"><p className="text-sm leading-6 text-[#625B54]">{point}</p></div>)}</div></MarketingPageShell></main><Footer /></>)
}
