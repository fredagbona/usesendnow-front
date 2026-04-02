import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { Metadata } from "next"
import { landingBrand } from "../../lib/brand"

export const metadata: Metadata = {
  title: "Conditions d'utilisation - MsgFlash",
  description: "Conditions générales d'utilisation de la plateforme msgflash.",
}

const SECTIONS = [
  {
    title: "1. Acceptation des conditions",
    content: `En accédant à la plateforme msgflash ou en utilisant nos services, vous acceptez d'être lié par les présentes Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.

Ces conditions s'appliquent à tous les utilisateurs de la plateforme, qu'ils soient visiteurs, clients ou partenaires.`,
  },
  {
    title: "2. Description des services",
    content: `msgflash fournit une infrastructure API permettant l'envoi et la réception de messages WhatsApp dans le cadre d'applications métier. Nos services incluent notamment :

— L'accès à une API REST pour l'automatisation de messages WhatsApp
— La gestion d'instances WhatsApp connectées
— L'envoi de campagnes de messages
— La gestion de contacts et de modèles de messages
— Des webhooks pour la réception d'événements en temps réel`,
  },
  {
    title: "3. Conditions d'accès",
    content: `Pour utiliser nos services, vous devez :

— Être une personne morale ou physique ayant la capacité juridique de conclure des contrats
— Fournir des informations exactes et à jour lors de l'inscription
— Maintenir la confidentialité de vos identifiants de connexion
— Être responsable de toute activité effectuée sous votre compte

msgflash se réserve le droit de refuser l'accès à ses services ou de résilier un compte à tout moment, en cas de violation des présentes conditions.`,
  },
  {
    title: "4. Utilisation acceptable",
    content: `Vous vous engagez à utiliser la plateforme msgflash uniquement à des fins légales et conformément aux présentes conditions. Il est strictement interdit de :

— Envoyer des messages non sollicités (spam) ou du contenu à caractère frauduleux
— Violer les Conditions d'utilisation de WhatsApp / Meta
— Utiliser la plateforme pour diffuser des contenus illégaux, diffamatoires ou discriminatoires
— Tenter d'accéder de manière non autorisée à d'autres comptes ou systèmes
— Utiliser des robots, scrapers ou autres outils automatisés à des fins abusives
— Revendre ou redistribuer les services sans autorisation écrite préalable

Toute violation de cette politique entraînera la suspension ou la résiliation immédiate du compte.`,
  },
  {
    title: "5. Tarification et facturation",
    content: `Les tarifs applicables sont ceux affichés sur notre page de tarification au moment de votre souscription. Nous nous réservons le droit de modifier nos tarifs avec un préavis de 30 jours.

Les abonnements sont facturés mensuellement ou annuellement selon l'option choisie. Le paiement est dû à l'avance pour chaque période de facturation.

En cas de non-paiement, nous nous réservons le droit de suspendre l'accès aux services après un délai de 7 jours suivant la date d'échéance.`,
  },
  {
    title: "6. Propriété intellectuelle",
    content: `Tous les droits de propriété intellectuelle relatifs à la plateforme msgflash, incluant les logiciels, interfaces, marques, logos et documentation, sont et demeurent la propriété exclusive de msgflash.

Aucune licence ni droit de propriété intellectuelle ne vous est accordé, sauf le droit limité d'utiliser les services conformément aux présentes conditions.`,
  },
  {
    title: "7. Disponibilité et maintenance",
    content: `Nous nous efforçons de maintenir la disponibilité de nos services 24h/24, 7j/7. Cependant, nous ne garantissons pas une disponibilité ininterrompue.

Des interventions de maintenance planifiées pourront entraîner des interruptions temporaires. Nous nous engageons à notifier les utilisateurs à l'avance autant que possible.

msgflash ne saurait être tenu responsable des interruptions de service dues à des événements hors de notre contrôle (force majeure, pannes réseau, défaillances de tiers).`,
  },
  {
    title: "8. Limitation de responsabilité",
    content: `Dans toute la mesure permise par la loi applicable, msgflash ne sera pas responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ni des pertes de profits, de données ou d'opportunités commerciales, résultant de l'utilisation ou de l'impossibilité d'utiliser nos services.

Notre responsabilité totale envers vous pour tout dommage ne dépassera pas le montant que vous avez payé à msgflash au cours des 3 derniers mois précédant l'événement donnant lieu à la réclamation.`,
  },
  {
    title: "9. Résiliation",
    content: `Vous pouvez résilier votre compte à tout moment depuis votre tableau de bord ou en contactant notre support. La résiliation prend effet à la fin de la période de facturation en cours.

Nous nous réservons le droit de résilier votre compte immédiatement en cas de violation des présentes conditions, sans remboursement.

À la résiliation, vos données seront conservées pendant 30 jours puis supprimées définitivement.`,
  },
  {
    title: "10. Modifications des conditions",
    content: `Nous nous réservons le droit de modifier les présentes Conditions d'utilisation à tout moment. Les modifications seront publiées sur cette page avec la date de mise à jour.

En continuant à utiliser nos services après publication des modifications, vous acceptez les nouvelles conditions. Si vous n'acceptez pas les modifications, vous devez cesser d'utiliser nos services et résilier votre compte.`,
  },
  {
    title: "11. Droit applicable",
    content: `Les présentes Conditions d'utilisation sont régies par le droit applicable dans le pays d'établissement de msgflash.

Tout litige relatif à l'interprétation ou l'exécution des présentes conditions sera soumis à la juridiction compétente du lieu de notre siège social.`,
  },
  {
    title: "12. Contact",
    content: `Pour toute question relative aux présentes Conditions d'utilisation, vous pouvez nous contacter à :

Email : ${landingBrand.helloEmail}
Formulaire de contact : ${landingBrand.domain}/contact`,
  },
]

export default function ConditionsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#0A0A0A] text-[#F0F0F0]">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.14),rgba(10,10,10,0)_36%),#0A0A0A] px-6 pb-16 pt-32">
          <div className="mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 border border-[#FFD600]/30 bg-[#FFD600]/8 px-3 py-1.5 font-(family-name:--font-poppins) text-[11px] uppercase tracking-[0.14em] text-[#FFD600]">
              Légal
            </div>
            <h1 className="mt-6 font-(family-name:--font-geist-sans) text-4xl font-black uppercase tracking-[-0.05em] text-[#F0F0F0] sm:text-5xl md:text-6xl">
              Conditions d&apos;utilisation
            </h1>
            <p className="mt-5 max-w-3xl font-(family-name:--font-poppins) text-base leading-7 text-[#B7B7B7]">
              Ce document définit le cadre contractuel d’utilisation de msgflash, les règles
              d’accès à la plateforme et les obligations applicables à tous les utilisateurs.
            </p>
            <p className="mt-4 font-(family-name:--font-poppins) text-sm uppercase tracking-[0.12em] text-[#7E7E7E]">
              Dernière mise à jour : 28 mars 2026
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-5 border border-white/8 bg-[#121212] p-6 lg:sticky lg:top-24">
              <div>
                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.1em] text-[#FFD600]">
                  Conditions
                </p>
                <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-6 text-[#9B9B9B]">
                  Un cadre clair sur l’accès à la plateforme, l’usage autorisé, la facturation et la responsabilité.
                </p>
              </div>
              <div className="border-t border-white/8 pt-5">
                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.1em] text-[#F0F0F0]">
                  Contact
                </p>
                <a
                  href={`mailto:${landingBrand.helloEmail}`}
                  className="mt-3 inline-block font-(family-name:--font-poppins) text-sm text-[#FFD600] transition-colors hover:text-[#FFF0A6]"
                >
                  {landingBrand.helloEmail}
                </a>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="border border-white/8 bg-[#111111] p-6 sm:p-8">
                <p className="font-(family-name:--font-poppins) text-base leading-7 text-[#C9C9C9]">
                  Les présentes Conditions d&apos;utilisation régissent votre accès et votre utilisation
                  de la plateforme msgflash. Veuillez les lire attentivement avant d&apos;utiliser nos services.
                </p>
              </div>

              {SECTIONS.map((section) => (
                <section key={section.title} className="border border-white/8 bg-[#111111] p-6 sm:p-8">
                  <h2 className="mb-4 font-(family-name:--font-geist-sans) text-xl font-black uppercase tracking-[-0.03em] text-[#F0F0F0] sm:text-2xl">
                    {section.title}
                  </h2>
                  <div className="whitespace-pre-line font-(family-name:--font-poppins) text-sm leading-7 text-[#B8B8B8]">
                    {section.content}
                  </div>
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
