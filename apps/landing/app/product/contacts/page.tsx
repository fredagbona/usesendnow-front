import type { Metadata } from "next"
import { Navbar } from "../../../components/sections/Navbar"
import { Footer } from "../../../components/sections/Footer"
import { MarketingPageShell } from "../../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return { title: locale === "en" ? "MsgFlash - Contacts" : "MsgFlash - Contacts", description: locale === "en" ? "Manage lists, groups, segments, imports and tags." : "Gérez listes, groupes, segments, imports et tags." }
}

export default async function ContactsPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const points = locale === "en" ? ["Lists", "Groups", "Segments", "Imports", "Tags"] : ["Listes", "Groupes", "Segments", "Imports", "Tags"]
  return (<><Navbar /><main className="bg-[#FCFAF4]"><MarketingPageShell eyebrow={locale === 'en' ? 'Product' : 'Produit'} title={locale === 'en' ? 'Contacts' : 'Contacts'} description={locale === 'en' ? 'Manage your audience cleanly.' : 'Gérez votre audience proprement.'}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{points.map((point) => <div key={point} className="rounded-sm border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(23,21,21,0.06)]"><p className="text-sm leading-6 text-[#625B54]">{point}</p></div>)}</div></MarketingPageShell></main><Footer /></>)
}
