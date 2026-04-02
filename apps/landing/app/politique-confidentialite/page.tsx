import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { Metadata } from "next"
import { landingBrand } from "../../lib/brand"

export const metadata: Metadata = {
  title: "Politique de confidentialité - MsgFlash",
  description: "Politique de confidentialité et protection des données personnelles de msgflash.",
}

const SECTIONS = [
  {
    title: "1. Introduction",
    content: `msgflash s'engage à protéger la vie privée de ses utilisateurs et à traiter leurs données personnelles avec transparence, conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois locales applicables.

La présente Politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme.`,
  },
  {
    title: "2. Données collectées",
    content: `Nous collectons les catégories de données suivantes :

Données d'identification
— Nom complet, adresse email, numéro de téléphone
— Informations de profil (nom d'entreprise, secteur d'activité)

Données de connexion et d'usage
— Adresse IP, type de navigateur, système d'exploitation
— Pages visitées, fonctionnalités utilisées, horodatages des connexions

Données de facturation
— Informations de paiement (traitées et sécurisées par nos prestataires de paiement)
— Historique des transactions et des abonnements

Données métier (générées par votre usage)
— Contacts WhatsApp, messages envoyés et reçus, modèles de messages
— Logs d'API, événements webhook, statistiques de campagnes`,
  },
  {
    title: "3. Finalités du traitement",
    content: `Vos données sont traitées pour les finalités suivantes :

— Fourniture et amélioration de nos services
— Gestion de votre compte et de votre abonnement
— Support client et réponse à vos demandes
— Facturation et prévention des fraudes
— Envoi de communications relatives à votre compte (alertes, mises à jour importantes)
— Analyse statistique agrégée pour l'amélioration de la plateforme
— Respect de nos obligations légales et réglementaires

Nous ne vendons jamais vos données personnelles à des tiers.`,
  },
  {
    title: "4. Base légale du traitement",
    content: `Nous traitons vos données sur les bases légales suivantes :

Exécution du contrat : traitement nécessaire à la fourniture de nos services suite à votre inscription.

Intérêts légitimes : amélioration de la plateforme, prévention des fraudes, sécurité des systèmes.

Consentement : pour les communications marketing optionnelles, que vous pouvez retirer à tout moment.

Obligation légale : pour répondre à des obligations légales ou réglementaires applicables.`,
  },
  {
    title: "5. Conservation des données",
    content: `Nous conservons vos données personnelles aussi longtemps que nécessaire aux finalités décrites ci-dessus :

— Données de compte : conservées pendant toute la durée de votre abonnement + 30 jours après résiliation
— Logs et données d'usage : 12 mois glissants
— Données de facturation : 7 ans (obligation légale comptable)
— Données de support : 3 ans à compter de la clôture du ticket

À l'expiration de ces délais, vos données sont supprimées ou anonymisées de manière irréversible.`,
  },
  {
    title: "6. Partage des données",
    content: `Nous pouvons partager vos données avec les catégories de tiers suivantes, dans le strict respect des finalités décrites :

Prestataires de services : hébergement cloud, traitement des paiements, outils d'analyse — uniquement sous contrat de traitement des données.

Partenaires d'infrastructure : Meta / WhatsApp pour le routage des messages, dans le cadre des API officielles.

Autorités compétentes : uniquement sur réquisition légale dûment justifiée.

Nous exigeons de tous nos sous-traitants des garanties contractuelles équivalentes aux nôtres en matière de protection des données.`,
  },
  {
    title: "7. Transferts internationaux",
    content: `Vos données peuvent être traitées dans des pays situés hors de votre pays de résidence. Dans ce cas, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types de la Commission Européenne, décisions d'adéquation, ou mécanismes équivalents) pour assurer un niveau de protection adéquat.`,
  },
  {
    title: "8. Sécurité des données",
    content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre l'accès non autorisé, la perte, la destruction ou l'altération :

— Chiffrement des données en transit (TLS 1.3) et au repos (AES-256)
— Contrôles d'accès stricts basés sur les rôles (RBAC)
— Journalisation et surveillance des accès
— Audits de sécurité réguliers
— Plan de réponse aux incidents de sécurité

En cas de violation de données susceptible d'affecter vos droits, nous vous en informerons dans les délais légaux applicables.`,
  },
  {
    title: "9. Vos droits",
    content: `Conformément à la réglementation applicable, vous disposez des droits suivants sur vos données personnelles :

Droit d'accès : obtenir la confirmation que nous traitons vos données et en recevoir une copie.

Droit de rectification : corriger des données inexactes ou incomplètes vous concernant.

Droit à l'effacement : demander la suppression de vos données (sous réserve des obligations légales).

Droit à la limitation : demander la suspension temporaire du traitement dans certains cas.

Droit à la portabilité : recevoir vos données dans un format structuré et lisible par machine.

Droit d'opposition : vous opposer au traitement basé sur nos intérêts légitimes.

Droit de retrait du consentement : retirer votre consentement à tout moment pour les traitements fondés sur celui-ci.

Pour exercer ces droits, contactez-nous à : ${landingBrand.privacyEmail}`,
  },
  {
    title: "10. Cookies",
    content: `Nous utilisons des cookies et technologies similaires pour faire fonctionner notre plateforme et améliorer votre expérience.

Cookies essentiels : nécessaires au fonctionnement du service (session, authentification). Toujours actifs.

Cookies analytiques : mesure d'audience anonymisée pour comprendre l'utilisation de la plateforme. Soumis à votre consentement.

Vous pouvez configurer vos préférences de cookies via votre navigateur ou notre bandeau de consentement.`,
  },
  {
    title: "11. Modifications de la politique",
    content: `Nous pouvons mettre à jour la présente Politique de confidentialité pour refléter des évolutions de nos pratiques ou des changements réglementaires.

En cas de modification significative, nous vous en informerons par email ou via une notification dans l'application, avec un préavis raisonnable avant l'entrée en vigueur des changements.`,
  },
  {
    title: "12. Contact et réclamations",
    content: `Pour toute question relative à notre politique de confidentialité ou pour exercer vos droits :

Email : ${landingBrand.privacyEmail}
Formulaire de contact : ${landingBrand.domain}/contact

Si vous estimez que le traitement de vos données porte atteinte à vos droits, vous avez le droit d'introduire une réclamation auprès de l'autorité de protection des données compétente dans votre pays.`,
  },
]

export default function PolitiqueConfidentialitePage() {
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
              Politique de confidentialité
            </h1>
            <p className="mt-5 max-w-3xl font-(family-name:--font-poppins) text-base leading-7 text-[#B7B7B7]">
              Nous expliquons ici quelles données msgflash traite, pourquoi elles sont utilisées et
              quelles garanties de sécurité et de transparence encadrent leur traitement.
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
                  Confidentialité
                </p>
                <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-6 text-[#9B9B9B]">
                  Un résumé clair de notre cadre de collecte, conservation, sécurité et exercice des droits.
                </p>
              </div>
              <div className="border-t border-white/8 pt-5">
                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.1em] text-[#F0F0F0]">
                  Contact dédié
                </p>
                <a
                  href={`mailto:${landingBrand.privacyEmail}`}
                  className="mt-3 inline-block font-(family-name:--font-poppins) text-sm text-[#FFD600] transition-colors hover:text-[#FFF0A6]"
                >
                  {landingBrand.privacyEmail}
                </a>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="border border-white/8 bg-[#111111] p-6 sm:p-8">
                <p className="font-(family-name:--font-poppins) text-base leading-7 text-[#C9C9C9]">
                  Chez msgflash, nous prenons la protection de vos données personnelles très au sérieux.
                  Cette politique détaille quelles données nous collectons, pourquoi elles sont traitées
                  et comment elles sont protégées.
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
