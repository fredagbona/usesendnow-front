import type { Metadata } from "next"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { MarketingPageShell } from "../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return { title: locale === "en" ? "MsgFlash - Integrations" : "MsgFlash - Intégrations", description: locale === "en" ? "Connect the tools you already use." : "Connectez les outils que vous utilisez déjà." }
}

export default async function IntegrationsPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const cards = locale === "en"
    ? [
        { title: "WooCommerce", href: "/integrations/woocommerce", text: "Commerce automations and order flows." },
        { title: "WordPress", href: "/integrations/wordpress", text: "Plugin-based setup for WordPress sites." },
        { title: "API", href: "/integrations/api", text: "Build directly from your backend." },
        { title: "Webhooks", href: "/integrations/webhooks", text: "Wire in external events." },
      ]
    : [
        { title: "WooCommerce", href: "/integrations/woocommerce", text: "Automatisations e-commerce et commandes." },
        { title: "WordPress", href: "/integrations/wordpress", text: "Mise en place via plugin WordPress." },
        { title: "API", href: "/integrations/api", text: "Intégrez directement depuis votre backend." },
        { title: "Webhooks", href: "/integrations/webhooks", text: "Branchez les événements externes." },
      ]
  return (<><Navbar /><main className="bg-[#FCFAF4]"><MarketingPageShell eyebrow={locale === 'en' ? 'Integrations' : 'Intégrations'} title={locale === 'en' ? 'Integrations' : 'Intégrations'} description={locale === 'en' ? 'Connect the tools you already use.' : 'Connectez les outils que vous utilisez déjà.'}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <a key={card.href} href={card.href} className="rounded-sm border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,21,21,0.06)]"><h2 className="font-(family-name:--font-geist-sans) text-xl font-semibold text-[#171515]">{card.title}</h2><p className="mt-2 text-sm leading-6 text-[#625B54]">{card.text}</p></a>)}</div></MarketingPageShell></main><Footer /></>)
}
