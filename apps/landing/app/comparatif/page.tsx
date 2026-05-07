import type { Metadata } from "next"
import { CheckmarkCircle01Icon, Cancel01Icon } from "hugeicons-react"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { Button } from "../../components/ui/Button"
import { landingBrand } from "../../lib/brand"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"

type ComparisonRow = {
  criterion: string
  msgflash: string
  twilio: string
  dialog360: string
  wati: string
}

const copy = {
  fr: {
    metaTitle: "MsgFlash vs Twilio, 360dialog, Wati : le comparatif honnête (2026)",
    metaDescription:
      "Comparatif transparent entre MsgFlash, Twilio, 360dialog et Wati : prix, setup, webhooks, risques et usages réels.",
    eyebrow: "Comparatif",
    title: "MsgFlash vs Twilio, 360dialog, Wati : le comparatif honnête (2026)",
    subtitle:
      "Pas de bullshit. On montre où on gagne, où on perd, et pourquoi certains choisissent l'API officielle malgré le prix.",
    primary: "Voir les risques",
    secondary: "Tester gratuitement",
    tableHeaders: ["Critère", "MsgFlash", "Twilio", "360dialog", "Wati"],
    rows: [
      { criterion: "Prix mensuel", msgflash: "9 € à 79 €", twilio: "0 $ + 0.005 $ / msg", dialog360: "49 € / mois + Meta", wati: "49 $ / mois + Meta" },
      { criterion: "Coût par message (France)", msgflash: "Inclus dans l'abonnement", twilio: "~0.143 $ marketing + 0.005 $ markup", dialog360: "~0.143 $ marketing + 0.005 $ markup", wati: "Meta pass-through + plan" },
      { criterion: "Setup", msgflash: "2 min (QR code)", twilio: "1-2 semaines (validation)", dialog360: "1-2 semaines (validation)", wati: "< 1 heure" },
      { criterion: "Validation Meta", msgflash: "Non requise", twilio: "Requise", dialog360: "Requise", wati: "Requise" },
      { criterion: "Green tick", msgflash: "Non", twilio: "Oui", dialog360: "Oui", wati: "Oui" },
      { criterion: "Templates pré-approuvés", msgflash: "Non", twilio: "Oui", dialog360: "Oui", wati: "Oui" },
      { criterion: "Webhooks", msgflash: "Livraison, réponses, erreurs", twilio: "Complets", dialog360: "Complets", wati: "Basiques" },
      { criterion: "n8n / Zapier / Make", msgflash: "Natif", twilio: "Via HTTP", dialog360: "Non", wati: "Limité" },
      { criterion: "SLA / Uptime", msgflash: "99% (Pro+)", twilio: "99.99%", dialog360: "99.9%", wati: "99.9%" },
      { criterion: "Support", msgflash: "Discord + Email", twilio: "Enterprise", dialog360: "Email", wati: "Chat" },
      { criterion: "Ban risk", msgflash: "Moyen (numéro dédié recommandé)", twilio: "Faible", dialog360: "Faible", wati: "Faible" },
      { criterion: "Idéal pour", msgflash: "Devs, makers, automations", twilio: "Enterprise, devs custom", dialog360: "Devs API-first", wati: "SMB no-code" },
    ] as ComparisonRow[],
    winTitle: "Quand choisir MsgFlash",
    winPoints: [
      "Vous voulez shipper aujourd'hui, pas dans 2 semaines",
      "Vous envoyez < 25 000 messages/mois",
      "Vous intégrez n8n, Zapier, ou votre backend custom",
      "Vous préférez un coût fixe prévisible aux surprises de facturation Meta",
      "Vous utilisez WhatsApp pour des notifications transactionnelles et partiellement pour du marketing massif",
    ],
    loseTitle: "Quand NE PAS choisir MsgFlash",
    losePoints: [
      "Vous avez besoin du green tick vérifié",
      "Vous opérez dans la santé ou la finance",
      "Vous ne pouvez pas vous permettre de perdre un numéro",
      "Vous avez besoin de templates pré-approuvés pour des campagnes marketing régulières",
    ],
    faqTitle: "FAQ Comparatif",
    faqItems: [
      { question: "Puis-je passer de MsgFlash à Twilio plus tard ?", answer: "Oui, mais vous devrez re-valider votre numéro chez Meta et recréer vos templates. Prévoyez 2 semaines de transition." },
      { question: "MsgFlash est-il illégal ?", answer: "Non. Nous utilisons le protocole WhatsApp Web. Ce n'est pas officiel, ce n'est pas illégal. C'est un gris technique que WhatsApp tolère pour l'instant." },
      { question: "Pourquoi 360dialog coûte 49 € / mois sans interface ?", answer: "Parce qu'ils paient Meta pour être BSP officiel. Vous payez cette certification, pas la technologie." },
    ],
  },
  en: {
    metaTitle: "MsgFlash vs Twilio, 360dialog, Wati: the honest comparison (2026)",
    metaDescription: "A transparent comparison of MsgFlash, Twilio, 360dialog and Wati: pricing, setup, webhooks, risks, and real-world usage.",
    eyebrow: "Comparison",
    title: "MsgFlash vs Twilio, 360dialog, Wati: the honest comparison (2026)",
    subtitle: "No fluff. We show where we win, where we lose, and why some teams still choose the official API despite the price.",
    primary: "See the risks",
    secondary: "Start free",
    tableHeaders: ["Criterion", "MsgFlash", "Twilio", "360dialog", "Wati"],
    rows: [
      { criterion: "Monthly price", msgflash: "€0 to €39", twilio: "$0 + $0.005 / msg", dialog360: "€49 / month + Meta", wati: "$49 / month + Meta" },
      { criterion: "Cost per message (France)", msgflash: "Included in the subscription", twilio: "~$0.143 marketing + $0.005 markup", dialog360: "~$0.143 marketing + $0.005 markup", wati: "Meta pass-through + plan" },
      { criterion: "Setup", msgflash: "2 min (QR code)", twilio: "1-2 weeks (validation)", dialog360: "1-2 weeks (validation)", wati: "< 1 hour" },
      { criterion: "Meta validation", msgflash: "Not required", twilio: "Required", dialog360: "Required", wati: "Required" },
      { criterion: "Green tick", msgflash: "No", twilio: "Yes", dialog360: "Yes", wati: "Yes" },
      { criterion: "Pre-approved templates", msgflash: "No", twilio: "Yes", dialog360: "Yes", wati: "Yes" },
      { criterion: "Webhooks", msgflash: "Delivery, replies, errors", twilio: "Full", dialog360: "Full", wati: "Basic" },
      { criterion: "n8n / Zapier / Make", msgflash: "Native", twilio: "Via HTTP", dialog360: "No", wati: "Limited" },
      { criterion: "SLA / Uptime", msgflash: "99% (Pro+)", twilio: "99.99%", dialog360: "99.9%", wati: "99.9%" },
      { criterion: "Support", msgflash: "Discord + Email", twilio: "Enterprise", dialog360: "Email", wati: "Chat" },
      { criterion: "Ban risk", msgflash: "Medium (dedicated number recommended)", twilio: "Low", dialog360: "Low", wati: "Low" },
      { criterion: "Best for", msgflash: "Devs, makers, automations", twilio: "Enterprise, custom devs", dialog360: "API-first devs", wati: "SMB no-code" },
    ] as ComparisonRow[],
    winTitle: "When to choose MsgFlash",
    winPoints: [
      "You want to ship today, not in 2 weeks",
      "You send < 25,000 messages/month",
      "You integrate n8n, Zapier, or your custom backend",
      "You prefer predictable fixed pricing over Meta billing surprises",
      "You use WhatsApp for transactional notifications and some broad marketing",
    ],
    loseTitle: "When NOT to choose MsgFlash",
    losePoints: [
      "You need a verified green tick",
      "You operate in health or finance",
      "You cannot afford to lose a number",
      "You need pre-approved templates for regular marketing campaigns",
    ],
    faqTitle: "Comparison FAQ",
    faqItems: [
      { question: "Can I move from MsgFlash to Twilio later?", answer: "Yes, but you will need to re-validate your number with Meta and recreate your templates. Plan for a 2-week transition." },
      { question: "Is MsgFlash illegal?", answer: "No. We use the WhatsApp Web protocol. It is not official, but it is not illegal. It is a technical gray area that WhatsApp currently tolerates." },
      { question: "Why does 360dialog cost €49 / month without a UI?", answer: "Because they pay Meta to be an official BSP. You are paying for certification, not the technology." },
    ],
  },
} as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return locale === "en"
    ? { title: copy.en.metaTitle, description: copy.en.metaDescription }
    : { title: copy.fr.metaTitle, description: copy.fr.metaDescription }
}

export default async function ComparatifPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const page = locale === "en" ? copy.en : copy.fr

  return (
    <>
      <Navbar />
      <main className="bg-[#0A0A0A] text-[#F0F0F0]">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.12),rgba(10,10,10,0)_42%),#0A0A0A] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
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
              <Button href="/risques" showArrow>
                {page.primary}
              </Button>
              <Button href={`${landingBrand.appUrl}/signup`} variant="secondary">
                {page.secondary}
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden border border-white/8 bg-[#121212]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-[#F0F0F0]">
                  <tr>
                    {page.tableHeaders.map((header) => (
                      <th key={header} className="px-4 py-4 font-(family-name:--font-geist-sans) text-xs uppercase tracking-[0.08em]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {page.rows.map((row) => (
                    <tr key={row.criterion} className="border-t border-white/8">
                      <td className="px-4 py-4 font-(family-name:--font-geist-sans) text-[#F0F0F0]">{row.criterion}</td>
                      <td className="px-4 py-4 text-[#FFD600]">{row.msgflash}</td>
                      <td className="px-4 py-4 text-[#B8B8B8]">{row.twilio}</td>
                      <td className="px-4 py-4 text-[#B8B8B8]">{row.dialog360}</td>
                      <td className="px-4 py-4 text-[#B8B8B8]">{row.wati}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl border border-[#FFD600]/20 bg-[linear-gradient(180deg,rgba(255,214,0,0.08),rgba(18,18,18,0.98))] p-6 sm:p-8">
            <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.14em] text-[#FFD600]">
              Warmup
            </p>
            <h2 className="mt-3 font-(family-name:--font-geist-sans) text-2xl font-black uppercase tracking-[-0.04em] text-[#F0F0F0]">
              {locale === "en" ? "What no one else does: MsgFlash warmup" : "Ce que personne d'autre ne fait : le warmup MsgFlash"}
            </h2>
            <p className="mt-4 max-w-3xl font-(family-name:--font-poppins) text-sm leading-7 text-[#B7B7B7]">
              {locale === "en"
                ? "A first version of safety and warmup that scores the health of the instance, starts on first connected, and warns you before risky sends."
                : "Une première version de safety et warmup qui score la santé de l'instance, démarre au premier connected et vous alerte avant les envois risqués."}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                locale === "en" ? "SafetyScore 0-100" : "SafetyScore 0-100",
                locale === "en" ? "5 states: new → restricted" : "5 états : new → restricted",
                locale === "en" ? "Warnings only V1" : "Warnings only V1",
                locale === "en" ? "Warm / cold / unknown split" : "Distinction warm / cold / unknown",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-[#0F0F0F] px-4 py-4 text-sm text-[#D5D5D5]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            <article className="border border-white/8 bg-[#121212] p-6 sm:p-8">
              <div className="inline-flex rounded-full border border-[#FFD600]/20 bg-[#FFD600]/10 px-3 py-1 font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.08em] text-[#FFD600]">
                {page.winTitle}
              </div>
              <div className="mt-5 space-y-3">
                {page.winPoints.map((point) => (
                  <div key={point} className="flex gap-3 text-sm leading-7 text-[#B7B7B7]">
                    <CheckmarkCircle01Icon className="mt-1 h-4 w-4 flex-none text-[#FFD600]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="border border-white/8 bg-[#121212] p-6 sm:p-8">
              <div className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                {page.loseTitle}
              </div>
              <div className="mt-5 space-y-3">
                {page.losePoints.map((point) => (
                  <div key={point} className="flex gap-3 text-sm leading-7 text-[#B7B7B7]">
                    <Cancel01Icon className="mt-1 h-4 w-4 flex-none text-[#FFA94D]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="border-y border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-(family-name:--font-geist-sans) text-2xl font-black uppercase tracking-[-0.04em] text-[#F0F0F0]">
              {page.faqTitle}
            </h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {page.faqItems.map((item) => (
                <article key={item.question} className="border border-white/8 bg-[#121212] p-6">
                  <h3 className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#FFD600]">
                    {item.question}
                  </h3>
                  <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-7 text-[#B7B7B7]">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl border border-white/8 bg-[#121212] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-(family-name:--font-geist-sans) text-[1.7rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.1rem]">
                  {locale === "en" ? "Ready to connect WhatsApp to your product?" : "Prêt à connecter WhatsApp à votre produit ?"}
                </h2>
                <p className="mt-3 max-w-2xl font-(family-name:--font-poppins) text-sm leading-7 text-[#A7A7A7]">
                  {page.subtitle}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button href="/risques" showArrow>
                  {page.primary}
                </Button>
                <Button href={`${landingBrand.appUrl}/signup`} variant="secondary">
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
