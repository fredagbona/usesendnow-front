import type { Metadata } from "next"
import { CodeSquareIcon, ArrowRight01Icon } from "hugeicons-react"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { Button } from "../../components/ui/Button"
import { landingBrand } from "../../lib/brand"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"

const copy = {
  fr: {
    metaTitle: "Cas d'usage MsgFlash — ce que nos utilisateurs construisent",
    metaDescription: "Découvrez des cas d'usage concrets MsgFlash : e-commerce, SaaS, agences, santé, événements et logistique.",
    eyebrow: "Cas d'usage",
    title: "Cas d'usage MsgFlash — ce que nos utilisateurs construisent",
    subtitle: "Pas de théorie. Des implémentations concrètes avec du code, des résultats, et des limites.",
    primary: "Voir les tarifs",
    secondary: "Lire la documentation",
    cases: [
      {
        title: "E-commerce — Notifications de commande",
        label: "Use Case 1",
        problem: "Les emails de confirmation ont un taux d'ouverture de 20%. Les SMS coûtent cher. Vous voulez informer vos clients sans payer une fortune.",
        solution:
          "Webhook Shopify → n8n → MsgFlash → WhatsApp\n\n```javascript\n{\n  \"to\": \"{{$json.customer.phone}}\",\n  \"type\": \"text\",\n  \"message\": \"✅ Commande #{{$json.order_number}} confirmée !\\n\\n📦 Livraison prévue : {{$json.delivery_date}}\\n🚚 Suivi : {{$json.tracking_url}}\\n\\nDes questions ? Répondez à ce message.\",\n  \"instanceId\": \"shopify-prod\"\n}\n```",
        result: "Taux d'ouverture ~95%, coût bas, mise en place rapide.",
        limits: ["Pas de catalogue produit intégré", "Pas de paiement in-chat", "Le client doit avoir opt-in"],
        snippet: "Webhook Shopify → n8n → MsgFlash → WhatsApp",
      },
      {
        title: "SaaS — Alertes monitoring & DevOps",
        label: "Use Case 2",
        problem: "Votre serveur tombe à 3h du matin. L'email d'alerte est noyé dans la boîte de réception. Vous voulez être réveillé immédiatement.",
        solution:
          "Datadog/UptimeRobot → webhook → MsgFlash API → WhatsApp\n\n```bash\ncurl -X POST https://api.msgflash.com/v1/messages \\\n  -H \"Authorization: Bearer $MSGFLASH_TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"to\": \"+33612345678\",\n    \"type\": \"text\",\n    \"message\": \"🚨 ALERTE CRITIQUE\\n\\nServeur: prod-db-01\\nStatus: DOWN\\nError: Connection timeout\\nTime: 2026-05-07 03:24 UTC\\n\\nDashboard: https://status.monapp.com\",\n    \"instanceId\": \"monitoring\"\n  }'\n```",
        result: "Temps de réaction < 2 minutes.",
        limits: ["Pas d'escalade automatique native", "Pas d'intégration PagerDuty native"],
        snippet: "Datadog/UptimeRobot → webhook → MsgFlash API",
      },
      {
        title: "Agences — Multi-comptes clients",
        label: "Use Case 3",
        problem: "Vous gérez plusieurs clients, plusieurs numéros et plusieurs contextes. Vous voulez un cadre propre.",
        solution:
          "Un compte par client, ou une instance dédiée par opération. Les tags et les groupes permettent d'isoler les flux sans multiplier les outils.",
        result: "Moins de confusion, plus de contrôle, onboarding plus rapide.",
        limits: ["Gouvernance à définir", "Bonnes pratiques d'accès à mettre en place"],
        snippet: "Instances + groupes + tags",
      },
      {
        title: "Santé — Rappels de rendez-vous",
        label: "Use Case 4",
        problem: "Les patients oublient leurs rendez-vous et les no-shows coûtent cher.",
        solution:
          "Un CRM ou un agenda envoie un rappel WhatsApp avec date, heure et lien de confirmation. Les équipes réduisent les oublis sans ajouter de canal compliqué.",
        result: "Moins de no-shows et plus de confirmations.",
        limits: ["Sujet sensible sur la conformité", "Opt-in indispensable"],
        snippet: "CRM → MsgFlash → Rappel WhatsApp",
      },
      {
        title: "Événementiel — Communication participants",
        label: "Use Case 5",
        problem: "Les changements de dernière minute n'arrivent pas à tout le monde.",
        solution:
          "Envoyez les infos de session, les changements de salle et les instructions pratiques par WhatsApp, avec suivi des statuts pour savoir qui a reçu quoi.",
        result: "Une meilleure diffusion des informations utiles.",
        limits: ["Gestion de gros volumes à cadrer", "Opt-in recommandé"],
        snippet: "Événement → Broadcast WhatsApp",
      },
      {
        title: "Logistique — Suivi de livraison",
        label: "Use Case 6",
        problem: "Les clients demandent sans cesse où est leur colis.",
        solution:
          "À chaque changement de statut, un message WhatsApp informe le client avec son numéro de suivi et les dernières étapes.",
        result: "Moins de tickets support et plus de visibilité.",
        limits: ["Connexion aux systèmes logistiques à prévoir"],
        snippet: "Transporteur → MsgFlash → Notification",
      },
    ],
    summaryTitle: "Résumé des cas d'usage",
    summaryRows: [
      { useCase: "E-commerce", trigger: "Achat / abandon de panier", benefit: "Plus de récupération" },
      { useCase: "SaaS", trigger: "Incident / alerte", benefit: "Réaction plus rapide" },
      { useCase: "Agences", trigger: "Flux multi-clients", benefit: "Plus de gouvernance" },
      { useCase: "Santé", trigger: "Rendez-vous", benefit: "Moins de no-shows" },
      { useCase: "Événementiel", trigger: "Info participant", benefit: "Diffusion utile" },
      { useCase: "Logistique", trigger: "Changement de statut", benefit: "Moins de tickets" },
    ],
  },
  en: {
    metaTitle: "MsgFlash use cases — what users are building",
    metaDescription: "Explore concrete MsgFlash use cases: e-commerce, SaaS, agencies, health, events, and logistics.",
    eyebrow: "Use cases",
    title: "MsgFlash use cases — what users are building",
    subtitle: "No theory. Concrete implementations with code, outcomes, and limits.",
    primary: "See pricing",
    secondary: "Read the docs",
    cases: [
      {
        title: "E-commerce — Order notifications",
        label: "Use Case 1",
        problem: "Confirmation emails have a 20% open rate. SMS is expensive. You want to inform customers without paying a fortune.",
        solution:
          "Shopify webhook → n8n → MsgFlash → WhatsApp\n\n```javascript\n{\n  \"to\": \"{{$json.customer.phone}}\",\n  \"type\": \"text\",\n  \"message\": \"✅ Order #{{$json.order_number}} confirmed !\\n\\n📦 Delivery expected: {{$json.delivery_date}}\\n🚚 Tracking: {{$json.tracking_url}}\\n\\nQuestions? Reply to this message.\",\n  \"instanceId\": \"shopify-prod\"\n}\n```",
        result: "~95% open rate, low cost, fast setup.",
        limits: ["No native product catalog", "No in-chat payment", "Customer opt-in required"],
        snippet: "Shopify webhook → n8n → MsgFlash → WhatsApp",
      },
      {
        title: "SaaS — Monitoring & DevOps alerts",
        label: "Use Case 2",
        problem: "Your server goes down at 3 a.m. The alert email is buried in the inbox. You want to be woken up immediately.",
        solution:
          "Datadog/UptimeRobot → webhook → MsgFlash API → WhatsApp\n\n```bash\ncurl -X POST https://api.msgflash.com/v1/messages \\\n  -H \"Authorization: Bearer $MSGFLASH_TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"to\": \"+33612345678\",\n    \"type\": \"text\",\n    \"message\": \"🚨 CRITICAL ALERT\\n\\nServer: prod-db-01\\nStatus: DOWN\\nError: Connection timeout\\nTime: 2026-05-07 03:24 UTC\\n\\nDashboard: https://status.monapp.com\",\n    \"instanceId\": \"monitoring\"\n  }'\n```",
        result: "Response time under 2 minutes.",
        limits: ["No native escalation", "No native PagerDuty integration"],
        snippet: "Datadog/UptimeRobot → webhook → MsgFlash API",
      },
      {
        title: "Agencies — Multi-client operations",
        label: "Use Case 3",
        problem: "You manage multiple clients, numbers, and contexts. You need a clean operating model.",
        solution:
          "One account per client, or one instance per operation. Tags and groups help isolate flows without multiplying tools.",
        result: "Less confusion, more control, faster onboarding.",
        limits: ["Governance to define", "Access best practices to set up"],
        snippet: "Instances + groups + tags",
      },
      {
        title: "Health — Appointment reminders",
        label: "Use Case 4",
        problem: "Patients forget appointments and no-shows are costly.",
        solution:
          "A CRM or calendar sends a WhatsApp reminder with time, date, and a confirmation link. Teams reduce missed appointments without adding a complex channel.",
        result: "Fewer no-shows and more confirmations.",
        limits: ["Sensitive compliance context", "Opt-in required"],
        snippet: "CRM → MsgFlash → WhatsApp reminder",
      },
      {
        title: "Events — Participant communication",
        label: "Use Case 5",
        problem: "Last-minute changes do not reach everyone.",
        solution:
          "Send session details, room changes, and practical instructions over WhatsApp, with status tracking to know who received what.",
        result: "Better delivery of useful information.",
        limits: ["Large volume management to plan", "Opt-in recommended"],
        snippet: "Event → WhatsApp broadcast",
      },
      {
        title: "Logistics — Delivery tracking",
        label: "Use Case 6",
        problem: "Customers keep asking where their parcel is.",
        solution:
          "On every status change, a WhatsApp message updates the customer with their tracking number and latest step.",
        result: "Fewer support tickets and more visibility.",
        limits: ["Logistics system integration required"],
        snippet: "Carrier → MsgFlash → Notification",
      },
    ],
    summaryTitle: "Use case summary",
    summaryRows: [
      { useCase: "E-commerce", trigger: "Purchase / cart abandonment", benefit: "More recovery" },
      { useCase: "SaaS", trigger: "Incident / alert", benefit: "Faster reaction" },
      { useCase: "Agencies", trigger: "Multi-client flows", benefit: "More governance" },
      { useCase: "Health", trigger: "Appointment", benefit: "Fewer no-shows" },
      { useCase: "Events", trigger: "Participant update", benefit: "Useful distribution" },
      { useCase: "Logistics", trigger: "Status change", benefit: "Fewer tickets" },
    ],
  },
} as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return locale === "en"
    ? { title: copy.en.metaTitle, description: copy.en.metaDescription }
    : { title: copy.fr.metaTitle, description: copy.fr.metaDescription }
}

export default async function UseCasesPage() {
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
              <Button href={landingBrand.homeAnchors.pricing} showArrow>
                {page.primary}
              </Button>
              <Button href={landingBrand.docsUrl} variant="secondary">
                {page.secondary}
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            {page.cases.map((item) => (
              <article key={item.title} className="border border-white/8 bg-[#121212] p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.08em] text-[#FFD600]">
                      {item.label}
                    </p>
                    <h2 className="mt-2 font-(family-name:--font-geist-sans) text-xl font-black uppercase leading-tight tracking-[-0.04em] text-[#F0F0F0]">
                      {item.title}
                    </h2>
                  </div>
                  <CodeSquareIcon className="h-6 w-6 flex-none text-[#FFD600]" />
                </div>

                <div className="mt-5 space-y-5">
                  <div>
                    <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.08em] text-[#BDBDBD]">
                      {locale === "en" ? "Problem" : "Le problème"}
                    </p>
                    <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-7 text-[#B7B7B7]">{item.problem}</p>
                  </div>
                  <div>
                    <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.08em] text-[#BDBDBD]">
                      {locale === "en" ? "Solution" : "La solution MsgFlash"}
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded-2xl border border-white/8 bg-black/40 p-4 font-mono text-xs leading-6 text-[#E6E6E6]">
                      {item.solution}
                    </pre>
                  </div>
                  <div>
                    <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.08em] text-[#BDBDBD]">
                      {locale === "en" ? "Typical result" : "Résultat typique"}
                    </p>
                    <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-7 text-[#B7B7B7]">{item.result}</p>
                  </div>
                  <div>
                    <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.08em] text-[#BDBDBD]">
                      {locale === "en" ? "Limits" : "Les limites"}
                    </p>
                    <ul className="mt-2 space-y-2 text-sm leading-7 text-[#B7B7B7]">
                      {item.limits.map((limit) => (
                        <li key={limit} className="flex gap-2">
                          <ArrowRight01Icon className="mt-1 h-4 w-4 flex-none text-[#FFD600]" />
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden border border-white/8 bg-[#121212]">
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
              <ArrowRight01Icon className="h-5 w-5 text-[#FFD600]" />
              <h2 className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                {page.summaryTitle}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-[#F0F0F0]">
                  <tr>
                    <th className="px-4 py-4 font-(family-name:--font-geist-sans) text-xs uppercase tracking-[0.08em]">
                      {locale === "en" ? "Use case" : "Cas d'usage"}
                    </th>
                    <th className="px-4 py-4 font-(family-name:--font-geist-sans) text-xs uppercase tracking-[0.08em]">
                      {locale === "en" ? "Trigger" : "Déclencheur"}
                    </th>
                    <th className="px-4 py-4 font-(family-name:--font-geist-sans) text-xs uppercase tracking-[0.08em]">
                      {locale === "en" ? "Benefit" : "Bénéfice"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.summaryRows.map((row) => (
                    <tr key={row.useCase} className="border-t border-white/8">
                      <td className="px-4 py-4 text-[#F0F0F0]">{row.useCase}</td>
                      <td className="px-4 py-4 text-[#B7B7B7]">{row.trigger}</td>
                      <td className="px-4 py-4 text-[#B7B7B7]">{row.benefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl border border-white/8 bg-[#121212] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="font-(family-name:--font-geist-sans) text-[1.7rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.1rem]">
                  {page.subtitle}
                </h2>
                <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-7 text-[#A7A7A7]">
                  {locale === "en"
                    ? "Start with pricing, then use the docs to connect your first workflow."
                    : "Commencez par les tarifs, puis utilisez la documentation pour brancher votre premier workflow."}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button href={landingBrand.homeAnchors.pricing} showArrow>
                  {page.primary}
                </Button>
                <Button href={landingBrand.docsUrl} variant="secondary">
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
