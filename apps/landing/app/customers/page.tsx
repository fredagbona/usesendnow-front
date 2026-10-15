import type { Metadata } from "next"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { MarketingPageShell } from "../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> { const locale = await detectLandingLocaleFromHeaders(); return { title: locale === 'en' ? 'MsgFlash - Customers' : 'MsgFlash - Clients', description: locale === 'en' ? 'Testimonials, industries and case studies.' : 'Témoignages, secteurs et cas clients.' } }
export default async function CustomersPage() { const locale = await detectLandingLocaleFromHeaders(); const points = locale === 'en' ? ['Testimonials', 'Industries', 'Case studies'] : ['Témoignages', 'Secteurs', 'Cas clients']; return (<><Navbar /><main className="bg-[#FCFAF4]"><MarketingPageShell eyebrow={locale === 'en' ? 'Proof' : 'Preuve'} title={locale === 'en' ? 'Customers' : 'Clients'} description={locale === 'en' ? 'Social proof and results.' : 'Preuve sociale et résultats.'}><div className="grid gap-4 md:grid-cols-3">{points.map((point) => <div key={point} className="rounded-sm border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(23,21,21,0.06)]"><p className="text-sm leading-6 text-[#625B54]">{point}</p></div>)}</div></MarketingPageShell></main><Footer /></>) }
