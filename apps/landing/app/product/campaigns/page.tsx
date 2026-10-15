import type { Metadata } from "next"
import { Navbar } from "../../../components/sections/Navbar"
import { Footer } from "../../../components/sections/Footer"
import { MarketingPageShell } from "../../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return { title: locale === "en" ? "MsgFlash - Campaigns" : "MsgFlash - Campagnes", description: locale === "en" ? "Broadcasts, scheduling, segmentation, media and analytics." : "Diffusions, planification, segmentation, médias et analytics." }
}

export default async function CampaignsProductPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const points = locale === "en"
    ? ["Broadcasts and scheduling", "Segmentation and audiences", "Rich media and templates", "Tracking and performance"]
    : ["Diffusions et planification", "Segmentation et audiences", "Médias riches et templates", "Suivi et performance"]
  return (<><Navbar /><main className="bg-[#FCFAF4]"><MarketingPageShell eyebrow={locale === 'en' ? 'Product' : 'Produit'} title={locale === 'en' ? 'Campaigns' : 'Campagnes'} description={locale === 'en' ? 'Run WhatsApp campaigns with control.' : 'Lancez des campagnes WhatsApp avec contrôle.'}><div className="grid gap-4 md:grid-cols-2">{points.map((point) => <div key={point} className="rounded-sm border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(23,21,21,0.06)]"><p className="text-sm leading-6 text-[#625B54]">{point}</p></div>)}</div></MarketingPageShell></main><Footer /></>)
}
