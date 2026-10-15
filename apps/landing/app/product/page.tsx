import type { Metadata } from "next"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { MarketingPageShell } from "../../components/shared/MarketingPageShell"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"

const copy = {
  en: { title: "WhatsApp flows platform", description: "Five product pillars, one platform, one conversion path.", eyebrow: "Product" },
  fr: { title: "Plateforme de flows WhatsApp", description: "Cinq piliers produit, une seule plateforme, un seul chemin de conversion.", eyebrow: "Produit" },
} as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return { title: locale === "en" ? "MsgFlash - Product" : "MsgFlash - Produit", description: locale === "en" ? copy.en.description : copy.fr.description }
}

export default async function ProductPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const page = locale === "en" ? copy.en : copy.fr

  const cards = locale === "en"
    ? [
        { title: "Campaigns", text: "Broadcasts, scheduling, segmentation, media and analytics.", href: "/product/campaigns" },
        { title: "Flows", text: "Triggers, conditions, actions and reusable flows.", href: "/product/flows" },
        { title: "Contacts", text: "Lists, groups, segments, imports and tags.", href: "/product/contacts" },
        { title: "API", text: "Authentication, sending, webhooks, SDKs and examples.", href: "/product/api" },
        { title: "Analytics", text: "Delivery, read rate, performance and ROI.", href: "/product/analytics" },
        { title: "Teams", text: "Workspaces, roles, permissions and members.", href: "/product/teams" },
      ]
    : [
        { title: "Campagnes", text: "Diffusions, planification, segmentation, médias et analytics.", href: "/product/campaigns" },
        { title: "Flows", text: "Triggers, conditions, actions et flows réutilisables.", href: "/product/flows" },
        { title: "Contacts", text: "Listes, groupes, segments, imports et tags.", href: "/product/contacts" },
        { title: "API", text: "Authentification, envoi, webhooks, SDKs et exemples.", href: "/product/api" },
        { title: "Analytics", text: "Livraison, taux de lecture, performance et ROI.", href: "/product/analytics" },
        { title: "Équipes", text: "Workspaces, rôles, permissions et membres.", href: "/product/teams" },
      ]

  return (
    <>
      <Navbar />
      <main className="bg-[#FCFAF4]">
        <MarketingPageShell eyebrow={page.eyebrow} title={page.title} description={page.description}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <a key={card.href} href={card.href} className="rounded-sm border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,21,21,0.06)] transition-transform duration-300 hover:-translate-y-0.5">
                <h2 className="font-(family-name:--font-geist-sans) text-xl font-semibold text-[#171515]">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#625B54]">{card.text}</p>
              </a>
            ))}
          </div>
        </MarketingPageShell>
      </main>
      <Footer />
    </>
  )
}
