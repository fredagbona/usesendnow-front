import type { Metadata } from "next"
import { Navbar } from "../../../components/sections/Navbar"
import { Footer } from "../../../components/sections/Footer"
import { MarketingPageShell } from "../../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return { title: locale === "en" ? "MsgFlash - Teams" : "MsgFlash - Équipes", description: locale === "en" ? "Workspaces, roles, permissions and members." : "Workspaces, rôles, permissions et membres." }
}

export default async function TeamsPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const points = locale === "en" ? ["Workspaces", "Roles", "Permissions", "Members"] : ["Workspaces", "Rôles", "Permissions", "Membres"]
  return (<><Navbar /><main className="bg-[#FCFAF4]"><MarketingPageShell eyebrow={locale === 'en' ? 'Product' : 'Produit'} title={locale === 'en' ? 'Teams' : 'Équipes'} description={locale === 'en' ? 'Collaborate safely across accounts.' : 'Collaborez proprement entre comptes.'}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{points.map((point) => <div key={point} className="rounded-sm border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(23,21,21,0.06)]"><p className="text-sm leading-6 text-[#625B54]">{point}</p></div>)}</div></MarketingPageShell></main><Footer /></>)
}
