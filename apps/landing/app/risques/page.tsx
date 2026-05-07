import type { Metadata } from "next"
import { AlertCircleIcon } from "hugeicons-react"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { Button } from "../../components/ui/Button"
import { landingBrand } from "../../lib/brand"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"

const copy = {
  fr: {
    metaTitle: "Risques MsgFlash — ce qu'il faut savoir avant de démarrer",
    metaDescription:
      "Nous listons clairement les risques, limites et mitigations de MsgFlash : ban, green tick, templates, dépendance protocole.",
    eyebrow: "Risques",
    title: "Les risques de MsgFlash — qu'on ne vous cache rien",
    subtitle: "Nous ne sommes pas l'API officielle. Voici ce que ça signifie concrètement, et comment minimiser les risques.",
    primary: "Tester gratuitement",
    secondary: "Voir le comparatif",
    risks: [
      {
        title: "Risque 1 : Bannissement du numéro",
        label: "🟡",
        description:
          "WhatsApp détecte les comportements automatisés (envoi massif, messages identiques, activité 24/7 depuis un IP serveur) et bannit le numéro.",
        mitigation: ["Utilisez un numéro dédié", "Variez le contenu", "Respectez les horaires", "Laissez des délais", "Limitez le volume"],
      },
      {
        title: "Risque 2 : Pas de green tick vérifié",
        label: "🟡",
        description:
          "Le green tick certifie que votre numéro appartient à votre marque. Il augmente la confiance des clients, mais n'est pas disponible via MsgFlash.",
        mitigation: ["Réservez MsgFlash aux usages où la vérification n'est pas critique", "Préférez l'API officielle pour les marques publiques ou régulées"],
      },
      {
        title: "Risque 3 : Pas de templates pré-approuvés",
        label: "🟡",
        description:
          "L'API officielle oblige à soumettre chaque message marketing à Meta pour validation. MsgFlash supprime cette attente, mais augmente votre responsabilité opérationnelle.",
        mitigation: ["Évitez le spam", "Restez sur des usages transactionnels", "Contrôlez la qualité et la fréquence"],
      },
      {
        title: "Risque 4 : Dépendance au protocole WhatsApp Web",
        label: "🟡",
        description:
          "MsgFlash repose sur le protocole WhatsApp Web. Si Meta change ce protocole, nous devons adapter la stack rapidement.",
        mitigation: ["Monitoring 24/7", "Tests sur les versions bêta", "Communication transparente", "Backup technique"],
      },
    ],
    mythTitle: "Ce qui n'est pas un risque",
    mythRows: [
      { myth: "C'est illégal", reality: "Non. Nous utilisons le protocole WhatsApp Web." },
      { myth: "Vos données sont volées", reality: "Non. Nous ne stockons pas le contenu, seulement les métadonnées utiles." },
      { myth: "Meta va vous poursuivre", reality: "Non. Meta bannit les numéros, elle ne poursuit pas les utilisateurs de librairies tierces." },
    ],
    closingTitle: "Notre recommandation finale",
    closingText:
      "Utilisez MsgFlash si vous acceptez le risque de ban comme coût de faire business, si vous avez un numéro dédié, et si vous voulez itérer vite. N'utilisez pas MsgFlash si votre numéro WhatsApp est critique ou si vous avez besoin du green tick.",
  },
  en: {
    metaTitle: "MsgFlash risks — what you need to know before you start",
    metaDescription: "We clearly list the risks, limits, and mitigations of MsgFlash: bans, green tick, templates, and protocol dependency.",
    eyebrow: "Risks",
    title: "MsgFlash risks — nothing hidden",
    subtitle: "We are not the official API. Here is what that means in practice, and how to minimize the risks.",
    primary: "Start free",
    secondary: "See the comparison",
    risks: [
      {
        title: "Risk 1: Number bans",
        label: "🟡",
        description:
          "WhatsApp detects automated behavior (bulk sends, identical content, 24/7 activity from a server IP) and bans the number.",
        mitigation: ["Use a dedicated number", "Vary message content", "Respect quiet hours", "Leave delays", "Limit volume"],
      },
      {
        title: "Risk 2: No verified green tick",
        label: "🟡",
        description:
          "The green tick certifies that your number belongs to your brand. It boosts trust, but it is not available through MsgFlash.",
        mitigation: ["Use MsgFlash where verification is not critical", "Prefer the official API for public or regulated brands"],
      },
      {
        title: "Risk 3: No pre-approved templates",
        label: "🟡",
        description:
          "The official API requires every marketing message to be submitted to Meta for approval. MsgFlash removes that wait, but increases your operational responsibility.",
        mitigation: ["Avoid spam", "Stay transactional", "Control quality and frequency"],
      },
      {
        title: "Risk 4: WhatsApp Web protocol dependency",
        label: "🟡",
        description:
          "MsgFlash relies on the WhatsApp Web protocol. If Meta changes it, we need to adapt the stack quickly.",
        mitigation: ["24/7 monitoring", "Beta release testing", "Transparent communication", "Technical backup"],
      },
    ],
    mythTitle: "What is not a risk",
    mythRows: [
      { myth: "It is illegal", reality: "No. We use the WhatsApp Web protocol." },
      { myth: "Your data is stolen", reality: "No. We do not store message content, only useful metadata." },
      { myth: "Meta will sue you", reality: "No. Meta bans numbers; it does not sue users of third-party libraries." },
    ],
    closingTitle: "Our final recommendation",
    closingText:
      "Use MsgFlash if you accept ban risk as the cost of doing business, if you have a dedicated number, and if you want to iterate quickly. Do not use MsgFlash if your WhatsApp number is critical or if you need a green tick.",
  },
} as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return locale === "en"
    ? { title: copy.en.metaTitle, description: copy.en.metaDescription }
    : { title: copy.fr.metaTitle, description: copy.fr.metaDescription }
}

export default async function RisksPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const page = locale === "en" ? copy.en : copy.fr

  return (
    <>
      <Navbar />
      <main className="bg-[#0A0A0A] text-[#F0F0F0]">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.14),rgba(10,10,10,0)_42%),#0A0A0A] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.14em] text-[#FFD600]">
              {page.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-(family-name:--font-geist-sans) text-[2.2rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[3.2rem] lg:text-[3.8rem]">
              {page.title}
            </h1>
            <p className="mt-6 max-w-3xl font-(family-name:--font-poppins) text-base leading-7 text-[#A7A7A7]">
              {page.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={`${landingBrand.appUrl}/signup`} showArrow>
                {page.primary}
              </Button>
              <Button href="/comparatif" variant="secondary">
                {page.secondary}
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl border border-[#FFD600]/20 bg-[linear-gradient(180deg,rgba(255,214,0,0.08),rgba(18,18,18,0.98))] p-6 sm:p-8">
            <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.14em] text-[#FFD600]">
              Warmup
            </p>
            <h2 className="mt-3 font-(family-name:--font-geist-sans) text-2xl font-black uppercase tracking-[-0.04em] text-[#F0F0F0]">
              {locale === "en" ? "Your first line of defense: MsgFlash warmup" : "Votre première ligne de défense : le warmup MsgFlash"}
            </h2>
            <p className="mt-4 max-w-3xl font-(family-name:--font-poppins) text-sm leading-7 text-[#B7B7B7]">
              {locale === "en"
                ? "The system scores the instance, starts on first connected, and warns you instead of blocking sends in V1."
                : "Le système score l'instance, démarre au premier connected et vous alerte au lieu de bloquer les envois en V1."}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                locale === "en" ? "SafetyScore + status" : "SafetyScore + état",
                locale === "en" ? "Warnings only V1" : "Warnings only V1",
                locale === "en" ? "No hard block in sends" : "Pas de blocage dur des envois",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-[#0F0F0F] px-4 py-4 text-sm text-[#D5D5D5]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            {page.risks.map((risk) => (
              <article key={risk.title} className="border border-white/8 bg-[#121212] p-6 sm:p-8">
                <div className="inline-flex rounded-full border border-[#FFD600]/20 bg-[#FFD600]/10 px-3 py-1 font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.08em] text-[#FFD600]">
                  {risk.label} {risk.title}
                </div>
                <p className="mt-4 font-(family-name:--font-poppins) text-sm leading-7 text-[#B7B7B7]">{risk.description}</p>
                <div className="mt-5 border-t border-white/8 pt-5">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                    {locale === "en" ? "Mitigations" : "Comment minimiser"}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[#B7B7B7]">
                    {risk.mitigation.map((item) => (
                      <li key={item} className="flex gap-2">
                        <AlertCircleIcon className="mt-1 h-4 w-4 flex-none text-[#FFD600]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-(family-name:--font-geist-sans) text-2xl font-black uppercase tracking-[-0.04em] text-[#F0F0F0]">
              {page.mythTitle}
            </h2>
            <div className="mt-8 overflow-hidden border border-white/8 bg-[#121212]">
              <div className="grid grid-cols-1 divide-y divide-white/8">
                {page.mythRows.map((row) => (
                  <div key={row.myth} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:p-6">
                    <div>
                      <p className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#FFD600]">
                        {row.myth}
                      </p>
                    </div>
                    <p className="font-(family-name:--font-poppins) text-sm leading-7 text-[#B7B7B7]">{row.reality}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl border border-white/8 bg-[#121212] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="font-(family-name:--font-geist-sans) text-[1.7rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.1rem]">
                  {page.closingTitle}
                </h2>
                <p className="mt-4 font-(family-name:--font-poppins) text-sm leading-7 text-[#A7A7A7]">{page.closingText}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button href={`${landingBrand.appUrl}/signup`} showArrow>
                  {page.primary}
                </Button>
                <Button href="/comparatif" variant="secondary">
                  {page.secondary}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
