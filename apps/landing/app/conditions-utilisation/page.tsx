import type { Metadata } from "next"
import { Footer } from "../../components/sections/Footer"
import { Navbar } from "../../components/sections/Navbar"
import { landingBrand } from "../../lib/brand"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"
import { getLandingMessages } from "../../lib/landing-i18n-data"

type LegalSection = { title: string; content: string }

const CONDITIONS_FR: LegalSection[] = [
  { title: "1. Acceptation des conditions", content: "En accédant à la plateforme msgflash ou en utilisant nos services, vous acceptez d'être lié par les présentes Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.\n\nCes conditions s'appliquent à tous les utilisateurs de la plateforme, qu'ils soient visiteurs, clients ou partenaires." },
  { title: "2. Description des services", content: "msgflash fournit une infrastructure API permettant l'envoi et la réception de messages WhatsApp dans le cadre d'applications métier. Nos services incluent notamment :\n\n— L'accès à une API REST pour l'automatisation de messages WhatsApp\n— La gestion d'instances WhatsApp connectées\n— L'envoi de campagnes de messages\n— La gestion de contacts et de modèles de messages\n— Des webhooks pour la réception d'événements en temps réel" },
  { title: "3. Conditions d'accès", content: "Pour utiliser nos services, vous devez :\n\n— Être une personne morale ou physique ayant la capacité juridique de conclure des contrats\n— Fournir des informations exactes et à jour lors de l'inscription\n— Maintenir la confidentialité de vos identifiants de connexion\n— Être responsable de toute activité effectuée sous votre compte\n\nmsgflash se réserve le droit de refuser l'accès à ses services ou de résilier un compte à tout moment, en cas de violation des présentes conditions." },
  { title: "4. Utilisation acceptable", content: "Vous vous engagez à utiliser la plateforme msgflash uniquement à des fins légales et conformément aux présentes conditions. Il est strictement interdit de :\n\n— Envoyer des messages non sollicités (spam) ou du contenu à caractère frauduleux\n— Violer les Conditions d'utilisation de WhatsApp / Meta\n— Utiliser la plateforme pour diffuser des contenus illégaux, diffamatoires ou discriminatoires\n— Tenter d'accéder de manière non autorisée à d'autres comptes ou systèmes\n— Utiliser des robots, scrapers ou autres outils automatisés à des fins abusives\n— Revendre ou redistribuer les services sans autorisation écrite préalable\n\nToute violation de cette politique entraînera la suspension ou la résiliation immédiate du compte." },
  { title: "5. Tarification et facturation", content: "Les tarifs applicables sont ceux affichés sur notre page de tarification au moment de votre souscription. Nous nous réservons le droit de modifier nos tarifs avec un préavis de 30 jours.\n\nLes abonnements sont facturés mensuellement ou annuellement selon l'option choisie. Le paiement est dû à l'avance pour chaque période de facturation.\n\nEn cas de non-paiement, nous nous réservons le droit de suspendre l'accès aux services après un délai de 7 jours suivant la date d'échéance." },
  { title: "6. Propriété intellectuelle", content: "Tous les droits de propriété intellectuelle relatifs à la plateforme msgflash, incluant les logiciels, interfaces, marques, logos et documentation, sont et demeurent la propriété exclusive de msgflash.\n\nAucune licence ni droit de propriété intellectuelle ne vous est accordé, sauf le droit limité d'utiliser les services conformément aux présentes conditions." },
  { title: "7. Disponibilité et maintenance", content: "Nous nous efforçons de maintenir la disponibilité de nos services 24h/24, 7j/7. Cependant, nous ne garantissons pas une disponibilité ininterrompue.\n\nDes interventions de maintenance planifiées pourront entraîner des interruptions temporaires. Nous nous engageons à notifier les utilisateurs à l'avance autant que possible.\n\nmsgflash ne saurait être tenu responsable des interruptions de service dues à des événements hors de notre contrôle (force majeure, pannes réseau, défaillances de tiers)." },
  { title: "8. Limitation de responsabilité", content: "Dans toute la mesure permise par la loi applicable, msgflash ne sera pas responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ni des pertes de profits, de données ou d'opportunités commerciales, résultant de l'utilisation ou de l'impossibilité d'utiliser nos services.\n\nNotre responsabilité totale envers vous pour tout dommage ne dépassera pas le montant que vous avez payé à msgflash au cours des 3 derniers mois précédant l'événement donnant lieu à la réclamation." },
  { title: "9. Résiliation", content: "Vous pouvez résilier votre compte à tout moment depuis votre tableau de bord ou en contactant notre support. La résiliation prend effet à la fin de la période de facturation en cours.\n\nNous nous réservons le droit de résilier votre compte immédiatement en cas de violation des présentes conditions, sans remboursement.\n\nÀ la résiliation, vos données seront conservées pendant 30 jours puis supprimées définitivement." },
  { title: "10. Modifications des conditions", content: "Nous nous réservons le droit de modifier les présentes Conditions d'utilisation à tout moment. Les modifications seront publiées sur cette page avec la date de mise à jour.\n\nEn continuant à utiliser nos services après publication des modifications, vous acceptez les nouvelles conditions. Si vous n'acceptez pas les modifications, vous devez cesser d'utiliser nos services et résilier votre compte." },
  { title: "11. Droit applicable", content: "Les présentes Conditions d'utilisation sont régies par le droit applicable dans le pays d'établissement de msgflash.\n\nTout litige relatif à l'interprétation ou l'exécution des présentes conditions sera soumis à la juridiction compétente du lieu de notre siège social." },
  { title: "12. Contact", content: `Pour toute question relative aux présentes Conditions d'utilisation, vous pouvez nous contacter à :\n\nEmail : ${landingBrand.helloEmail}\nFormulaire de contact : ${landingBrand.domain}/contact` },
]

const CONDITIONS_EN: LegalSection[] = [
  { title: "1. Acceptance of terms", content: "By accessing the msgflash platform or using our services, you agree to be bound by these Terms of Use. If you do not agree, please do not use our services.\n\nThese terms apply to all platform users, including visitors, customers, and partners." },
  { title: "2. Service description", content: "msgflash provides an API infrastructure for sending and receiving WhatsApp messages in business applications. Our services include:\n\n— Access to a REST API for WhatsApp message automation\n— Management of connected WhatsApp instances\n— Sending message campaigns\n— Contact and template management\n— Webhooks for real-time event delivery" },
  { title: "3. Access requirements", content: "To use our services, you must:\n\n— Be a legal entity or individual with the legal capacity to enter into contracts\n— Provide accurate and up-to-date information during signup\n— Keep your login credentials confidential\n— Be responsible for all activity under your account\n\nmsgflash reserves the right to refuse access to its services or terminate an account at any time in case of breach of these terms." },
  { title: "4. Acceptable use", content: "You agree to use the msgflash platform only for lawful purposes and in accordance with these terms. It is strictly prohibited to:\n\n— Send unsolicited messages (spam) or fraudulent content\n— Violate WhatsApp / Meta terms of use\n— Use the platform to distribute illegal, defamatory, or discriminatory content\n— Attempt unauthorized access to other accounts or systems\n— Use bots, scrapers, or other automated tools in an abusive manner\n— Resell or redistribute the services without prior written authorization\n\nAny violation of this policy may result in immediate suspension or termination of the account." },
  { title: "5. Pricing and billing", content: "Applicable prices are those shown on our pricing page at the time of subscription. We reserve the right to change our pricing with 30 days' notice.\n\nSubscriptions are billed monthly or annually depending on the selected option. Payment is due in advance for each billing period.\n\nIn case of non-payment, we may suspend access to the services after a 7-day grace period from the due date." },
  { title: "6. Intellectual property", content: "All intellectual property rights relating to the msgflash platform, including software, interfaces, trademarks, logos, and documentation, remain the exclusive property of msgflash.\n\nNo license or intellectual property right is granted except the limited right to use the services in accordance with these terms." },
  { title: "7. Availability and maintenance", content: "We strive to keep our services available 24/7. However, we do not guarantee uninterrupted availability.\n\nPlanned maintenance may cause temporary interruptions. We will notify users in advance whenever possible.\n\nmsgflash is not responsible for service interruptions caused by events outside our control (force majeure, network outages, third-party failures)." },
  { title: "8. Limitation of liability", content: "To the fullest extent permitted by applicable law, msgflash shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or business opportunities arising from the use or inability to use our services.\n\nOur total liability to you for any damage shall not exceed the amount you paid to msgflash during the 3 months preceding the event giving rise to the claim." },
  { title: "9. Termination", content: "You may terminate your account at any time from your dashboard or by contacting support. Termination takes effect at the end of the current billing period.\n\nWe reserve the right to terminate your account immediately in case of a breach of these terms, without refund.\n\nUpon termination, your data will be retained for 30 days and then permanently deleted." },
  { title: "10. Changes to the terms", content: "We reserve the right to modify these Terms of Use at any time. Changes will be published on this page with an updated date.\n\nBy continuing to use our services after changes are published, you accept the new terms. If you do not agree, you must stop using the services and terminate your account." },
  { title: "11. Governing law", content: "These Terms of Use are governed by the laws applicable in the country where msgflash is established.\n\nAny dispute relating to the interpretation or enforcement of these terms shall be submitted to the competent court of the location of our registered office." },
  { title: "12. Contact", content: `For any question regarding these Terms of Use, you can contact us at:\n\nEmail: ${landingBrand.helloEmail}\nContact form: ${landingBrand.domain}/contact` },
]

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)
  return { title: `${messages.conditions.title} - MsgFlash`, description: messages.conditions.subtitle }
}

export default async function ConditionsPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)
  const sections = locale === "en" ? CONDITIONS_EN : CONDITIONS_FR

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#0A0A0A] text-[#F0F0F0]">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.14),rgba(10,10,10,0)_36%),#0A0A0A] px-6 pb-16 pt-32">
          <div className="mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 border border-[#FFD600]/30 bg-[#FFD600]/8 px-3 py-1.5 font-(family-name:--font-poppins) text-[11px] uppercase tracking-[0.14em] text-[#FFD600]">
              {messages.legal.badge}
            </div>
            <h1 className="mt-6 font-(family-name:--font-geist-sans) text-4xl font-black uppercase tracking-[-0.05em] text-[#F0F0F0] sm:text-5xl md:text-6xl">
              {messages.conditions.title}
            </h1>
            <p className="mt-5 max-w-3xl font-(family-name:--font-poppins) text-base leading-7 text-[#B7B7B7]">
              {messages.conditions.subtitle}
            </p>
            <p className="mt-4 font-(family-name:--font-poppins) text-sm uppercase tracking-[0.12em] text-[#7E7E7E]">
              {messages.conditions.lastUpdated}
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-5 border border-white/8 bg-[#121212] p-6 lg:sticky lg:top-24">
              <div>
                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.1em] text-[#FFD600]">{messages.conditions.sideTitle}</p>
                <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-6 text-[#9B9B9B]">{messages.conditions.sideText}</p>
              </div>
              <div className="border-t border-white/8 pt-5">
                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.1em] text-[#F0F0F0]">{messages.legal.contact}</p>
                <a href={`mailto:${landingBrand.helloEmail}`} className="mt-3 inline-block font-(family-name:--font-poppins) text-sm text-[#FFD600] transition-colors hover:text-[#FFF0A6]">{landingBrand.helloEmail}</a>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="border border-white/8 bg-[#111111] p-6 sm:p-8">
                <p className="font-(family-name:--font-poppins) text-base leading-7 text-[#C9C9C9]">{messages.conditions.intro}</p>
              </div>

              {sections.map((section) => (
                <section key={section.title} className="border border-white/8 bg-[#111111] p-6 sm:p-8">
                  <h2 className="mb-4 font-(family-name:--font-geist-sans) text-xl font-black uppercase tracking-[-0.03em] text-[#F0F0F0] sm:text-2xl">{section.title}</h2>
                  <div className="whitespace-pre-line font-(family-name:--font-poppins) text-sm leading-7 text-[#B8B8B8]">{section.content}</div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
