import type { Metadata } from "next"
import { Footer } from "../../components/sections/Footer"
import { Navbar } from "../../components/sections/Navbar"
import { landingBrand } from "../../lib/brand"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"
import { getLandingMessages } from "../../lib/landing-i18n-data"

type LegalSection = { title: string; content: string }

const PRIVACY_FR: LegalSection[] = [
  { title: "1. Introduction", content: "msgflash s'engage à protéger la vie privée de ses utilisateurs et à traiter leurs données personnelles avec transparence, conformément au RGPD et aux lois locales applicables.\n\nLa présente Politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme." },
  { title: "2. Données collectées", content: "Nous collectons les catégories de données suivantes :\n\nDonnées d'identification\n— Nom complet, adresse email, numéro de téléphone\n— Informations de profil (nom d'entreprise, secteur d'activité)\n\nDonnées de connexion et d'usage\n— Adresse IP, type de navigateur, système d'exploitation\n— Pages visitées, fonctionnalités utilisées, horodatages des connexions\n\nDonnées de facturation\n— Informations de paiement (traitées et sécurisées par nos prestataires de paiement)\n— Historique des transactions et des abonnements\n\nDonnées métier (générées par votre usage)\n— Contacts WhatsApp, messages envoyés et reçus, modèles de messages\n— Logs d'API, événements webhook, statistiques de campagnes" },
  { title: "3. Finalités du traitement", content: "Vos données sont traitées pour les finalités suivantes :\n\n— Fourniture et amélioration de nos services\n— Gestion de votre compte et de votre abonnement\n— Support client et réponse à vos demandes\n— Facturation et prévention des fraudes\n— Envoi de communications relatives à votre compte (alertes, mises à jour importantes)\n— Analyse statistique agrégée pour l'amélioration de la plateforme\n— Respect de nos obligations légales et réglementaires\n\nNous ne vendons jamais vos données personnelles à des tiers." },
  { title: "4. Base légale du traitement", content: "Nous traitons vos données sur les bases légales suivantes :\n\nExécution du contrat : traitement nécessaire à la fourniture de nos services suite à votre inscription.\n\nIntérêts légitimes : amélioration de la plateforme, prévention des fraudes, sécurité des systèmes.\n\nConsentement : pour les communications marketing optionnelles, que vous pouvez retirer à tout moment.\n\nObligation légale : pour répondre à des obligations légales ou réglementaires applicables." },
  { title: "5. Conservation des données", content: "Nous conservons vos données personnelles aussi longtemps que nécessaire aux finalités décrites ci-dessus :\n\n— Données de compte : conservées pendant toute la durée de votre abonnement + 30 jours après résiliation\n— Logs et données d'usage : 12 mois glissants\n— Données de facturation : 7 ans (obligation légale comptable)\n— Données de support : 3 ans à compter de la clôture du ticket\n\nÀ l'expiration de ces délais, vos données sont supprimées ou anonymisées de manière irréversible." },
  { title: "6. Partage des données", content: "Nous pouvons partager vos données avec les catégories de tiers suivantes, dans le strict respect des finalités décrites :\n\nPrestataires de services : hébergement cloud, traitement des paiements, outils d'analyse — uniquement sous contrat de traitement des données.\n\nPartenaires d'infrastructure : Meta / WhatsApp pour le routage des messages, dans le cadre des API officielles.\n\nAutorités compétentes : uniquement sur réquisition légale dûment justifiée.\n\nNous exigeons de tous nos sous-traitants des garanties contractuelles équivalentes aux nôtres en matière de protection des données." },
  { title: "7. Transferts internationaux", content: "Vos données peuvent être traitées dans des pays situés hors de votre pays de résidence. Dans ce cas, nous nous assurons que des garanties appropriées sont en place pour assurer un niveau de protection adéquat." },
  { title: "8. Sécurité des données", content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre l'accès non autorisé, la perte, la destruction ou l'altération :\n\n— Chiffrement des données en transit et au repos\n— Contrôles d'accès stricts basés sur les rôles\n— Journalisation et surveillance des accès\n— Audits de sécurité réguliers\n— Plan de réponse aux incidents de sécurité\n\nEn cas de violation de données susceptible d'affecter vos droits, nous vous en informerons dans les délais légaux applicables." },
  { title: "9. Vos droits", content: "Conformément à la réglementation applicable, vous disposez des droits suivants sur vos données personnelles :\n\nDroit d'accès, de rectification, d'effacement, de limitation, de portabilité, d'opposition et de retrait du consentement.\n\nPour exercer ces droits, contactez-nous à : support@msgflash.com" },
  { title: "10. Cookies", content: "Nous utilisons des cookies et technologies similaires pour faire fonctionner notre plateforme et améliorer votre expérience.\n\nCookies essentiels : nécessaires au fonctionnement du service (session, authentification). Toujours actifs.\n\nCookies analytiques : mesure d'audience anonymisée pour comprendre l'utilisation de la plateforme. Soumis à votre consentement." },
  { title: "11. Modifications de la politique", content: "Nous pouvons mettre à jour la présente Politique de confidentialité pour refléter des évolutions de nos pratiques ou des changements réglementaires.\n\nEn cas de modification significative, nous vous en informerons par email ou via une notification dans l'application." },
  { title: "12. Contact et réclamations", content: `Email : support@msgflash.com\nFormulaire de contact : ${landingBrand.domain}/contact\n\nSi vous estimez que le traitement de vos données porte atteinte à vos droits, vous avez le droit d'introduire une réclamation auprès de l'autorité compétente.` },
]

const PRIVACY_EN: LegalSection[] = [
  { title: "1. Introduction", content: "msgflash is committed to protecting user privacy and handling personal data transparently, in accordance with the GDPR and applicable local laws.\n\nThis Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform." },
  { title: "2. Data collected", content: "We collect the following categories of data:\n\nIdentification data\n— Full name, email address, phone number\n— Profile information (company name, industry)\n\nLogin and usage data\n— IP address, browser type, operating system\n— Visited pages, used features, login timestamps\n\nBilling data\n— Payment information (processed and secured by our payment providers)\n— Transaction and subscription history\n\nBusiness data (generated by your usage)\n— WhatsApp contacts, sent and received messages, message templates\n— API logs, webhook events, campaign statistics" },
  { title: "3. Purposes of processing", content: "Your data is processed for the following purposes:\n\n— Providing and improving our services\n— Managing your account and subscription\n— Customer support and responding to requests\n— Billing and fraud prevention\n— Sending account-related communications\n— Aggregated statistical analysis to improve the platform\n— Compliance with legal and regulatory obligations\n\nWe never sell your personal data to third parties." },
  { title: "4. Legal basis", content: "We process your data based on the following legal grounds:\n\nPerformance of a contract, legitimate interests, consent, and legal obligation." },
  { title: "5. Data retention", content: "We retain your personal data as long as necessary for the purposes described above.\n\n— Account data: kept for the duration of your subscription + 30 days after termination\n— Logs and usage data: rolling 12 months\n— Billing data: 7 years\n— Support data: 3 years from ticket closure" },
  { title: "6. Data sharing", content: "We may share your data with service providers, infrastructure partners such as Meta / WhatsApp for official routing, and competent authorities when legally required.\n\nWe require all processors to provide contractual safeguards equivalent to ours regarding data protection." },
  { title: "7. International transfers", content: "Your data may be processed in countries outside your country of residence. In such cases, we ensure that appropriate safeguards are in place to provide an adequate level of protection." },
  { title: "8. Data security", content: "We implement appropriate technical and organizational measures to protect your data from unauthorized access, loss, destruction, or alteration.\n\nIf a data breach is likely to affect your rights, we will notify you within the legally required timeframe." },
  { title: "9. Your rights", content: "You have the rights of access, rectification, erasure, restriction, portability, objection, and withdrawal of consent.\n\nTo exercise these rights, contact us at: support@msgflash.com" },
  { title: "10. Cookies", content: "We use cookies and similar technologies to operate our platform and improve your experience.\n\nEssential cookies are always active; analytics cookies are subject to your consent." },
  { title: "11. Policy changes", content: "We may update this Privacy Policy to reflect changes in our practices or regulatory requirements.\n\nIf the changes are material, we will notify you by email or in-app notification." },
  { title: "12. Contact and complaints", content: `Email: support@msgflash.com\nContact form: ${landingBrand.domain}/contact\n\nIf you believe your data processing rights are being violated, you have the right to lodge a complaint with the competent authority.` },
]

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)
  return { title: `${messages.privacy.title} - MsgFlash`, description: messages.privacy.subtitle }
}

export default async function PolitiqueConfidentialitePage() {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)
  const sections = locale === "en" ? PRIVACY_EN : PRIVACY_FR

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
              {messages.privacy.title}
            </h1>
            <p className="mt-5 max-w-3xl font-(family-name:--font-poppins) text-base leading-7 text-[#B7B7B7]">
              {messages.privacy.subtitle}
            </p>
            <p className="mt-4 font-(family-name:--font-poppins) text-sm uppercase tracking-[0.12em] text-[#7E7E7E]">
              {messages.privacy.lastUpdated}
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-5 border border-white/8 bg-[#121212] p-6 lg:sticky lg:top-24">
              <div>
                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.1em] text-[#FFD600]">
                  {messages.privacy.sideTitle}
                </p>
                <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-6 text-[#9B9B9B]">
                  {messages.privacy.sideText}
                </p>
              </div>
              <div className="border-t border-white/8 pt-5">
                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.1em] text-[#F0F0F0]">
                  {messages.legal.contact}
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
                  {messages.privacy.intro}
                </p>
              </div>

              {sections.map((section) => (
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
