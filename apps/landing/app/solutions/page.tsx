import type { Metadata } from "next"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { MarketingPageShell } from "../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return { title: locale === "en" ? "MsgFlash - Solutions" : "MsgFlash - Solutions", description: locale === "en" ? "Solutions by business type." : "Solutions par type d'activité." }
}

export default async function SolutionsPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const cards = locale === "en"
    ? [
        { title: "WooCommerce", href: "/solutions/woocommerce", text: "Abandoned carts, order updates, shipping, reviews, upsells." },
        { title: "SaaS", href: "/solutions/saas", text: "OTP, invoices, subscriptions, failed payments, onboarding." },
        { title: "Agencies", href: "/solutions/agencies", text: "Multi-client workspaces, campaigns, permissions, reports." },
        { title: "Appointments", href: "/solutions/appointments", text: "Reminders, bookings, confirmations, rescheduling." },
        { title: "Sales", href: "/solutions/sales", text: "Lead follow-up, quotes, qualification and closing." },
      ]
    : [
        { title: "WooCommerce", href: "/solutions/woocommerce", text: "Paniers abandonnés, commandes, expédition, avis, upsells." },
        { title: "SaaS", href: "/solutions/saas", text: "OTP, factures, abonnements, échecs de paiement, onboarding." },
        { title: "Agences", href: "/solutions/agencies", text: "Workspaces multi-clients, campagnes, permissions, rapports." },
        { title: "Rendez-vous", href: "/solutions/appointments", text: "Rappels, réservations, confirmations, replanification." },
        { title: "Sales", href: "/solutions/sales", text: "Relance leads, devis, qualification et closing." },
      ]
  return (<><Navbar /><main className="bg-[#FCFAF4]"><MarketingPageShell eyebrow={locale === 'en' ? 'Solutions' : 'Solutions'} title={locale === 'en' ? 'Solutions' : 'Solutions'} description={locale === 'en' ? 'Organized by customer problem.' : 'Organisé par problème client.'}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map((card) => <a key={card.href} href={card.href} className="rounded-sm border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,21,21,0.06)]"><h2 className="font-(family-name:--font-geist-sans) text-xl font-semibold text-[#171515]">{card.title}</h2><p className="mt-2 text-sm leading-6 text-[#625B54]">{card.text}</p></a>)}</div></MarketingPageShell></main><Footer /></>)
}
