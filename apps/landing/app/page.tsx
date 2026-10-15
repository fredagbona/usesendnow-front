import type { Metadata } from "next"
import Image from "next/image"
import {
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  FlowConnectionIcon,
  Megaphone01Icon,
  Rocket01Icon,
  Shield01Icon,
  SmartPhone01Icon,
  WebhookIcon,
  WordpressIcon,
} from "hugeicons-react"
import { Navbar } from "../components/sections/Navbar"
import { Footer } from "../components/sections/Footer"
import { Button } from "../components/ui/Button"
import { FaqAccordion } from "../components/shared/FaqAccordion"
import { CalendlyEmbed } from "../components/shared/CalendlyEmbed"
import { landingBrand } from "../lib/brand"
import { detectLandingLocaleFromHeaders } from "../lib/landing-locale.server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title: "MsgFlash",
    description:
      locale === "en"
        ? "Run your business. Every customer stays informed automatically."
        : "Faites tourner votre business. Chaque client reste informé automatiquement.",
  }
}

function SectionHeading({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <div className="max-w-4xl">
      {eyebrow ? <p className="font-(family-name:--font-geist-sans) text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A18A00]">{eyebrow}</p> : null}
      <h2 className="mt-3 font-(family-name:--font-geist-sans) text-[clamp(2rem,4vw,4.25rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171515]">
        {title}
      </h2>
      {lead ? <p className="mt-4 max-w-3xl font-(family-name:--font-poppins) text-base leading-7 text-[#625B54]">{lead}</p> : null}
    </div>
  )
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-sm border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(23,21,21,0.05)]">
      <h3 className="font-(family-name:--font-geist-sans) text-base font-semibold text-[#171515]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#625B54]">{text}</p>
    </div>
  )
}

function ToolPill({ title, iconSrc, iconAlt }: { title: string; iconSrc: string; iconAlt: string }) {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-black/10 bg-white px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#FFF3B3]">
        <Image src={iconSrc} alt={iconAlt} width={22} height={22} className="h-5 w-5 object-contain" />
      </span>
      <span className="font-(family-name:--font-geist-sans) text-sm font-semibold text-[#171515]">{title}</span>
    </div>
  )
}

function PricingCard({
  name,
  price,
  badge,
  description,
  features,
  cta,
}: {
  name: string
  price: string
  badge?: string
  description: string
  features: string[]
  cta: string
}) {
  return (
    <div className="relative flex h-full flex-col rounded-sm border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(23,21,21,0.06)]">
      {badge ? <span className="absolute right-5 top-5 rounded-sm bg-[#FFD600] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#171515]">{badge}</span> : null}
      <p className="font-(family-name:--font-geist-sans) text-xl font-semibold text-[#171515]">{name}</p>
      <p className="mt-3 font-(family-name:--font-geist-sans) text-4xl font-semibold tracking-[-0.04em] text-[#171515]">{price}</p>
      <p className="mt-3 text-sm leading-6 text-[#625B54]">{description}</p>
      <div className="mt-5 space-y-2">
        {features.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-[#4D463F]">
            <CheckmarkCircle01Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#A18A00]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-7">
        <Button href={`${landingBrand.appUrl}/signup`} size="sm" className="w-full justify-center">
          {cta}
        </Button>
      </div>
    </div>
  )
}

function SalesCard({ title, text, cta }: { title: string; text: string; cta: string }) {
  return (
    <div className="rounded-sm border border-black/10 bg-[#FFF8EE] p-6">
      <p className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-[0.14em] text-[#A18A00]">Enterprise</p>
      <h3 className="mt-3 font-(family-name:--font-geist-sans) text-2xl font-semibold text-[#171515]">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625B54]">{text}</p>
      <div className="mt-6">
        <Button href="/#demo" size="sm" variant="secondary">
          {cta}
        </Button>
      </div>
    </div>
  )
}

type FlowPreview = {
  title: string
  text: string
  imageSrc: string
  ctaLabel: string
  ctaHref: string
}

type FeatureSlide = {
  title: string
  text: string
  imageSrc: string
  imageAlt: string
}

function FeatureSlideCard({ title, text, imageSrc, imageAlt, reverse = false }: FeatureSlide & { reverse?: boolean }) {
  return (
    <article className="overflow-hidden border border-black/10 bg-white shadow-[0_20px_60px_rgba(23,21,21,0.06)]">
      <div className={`grid gap-0 lg:grid-cols-2 ${reverse ? "lg:[direction:rtl]" : ""}`}>
        <div className={`relative min-h-[460px] bg-[#F7F2E6] p-8 sm:p-10 ${reverse ? "lg:[direction:ltr]" : ""}`}>
          <div className="relative h-full min-h-[280px] w-full">
            <Image src={imageSrc} alt={imageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain object-center" />
          </div>
        </div>
        <div className={`flex items-center p-8 sm:p-10 lg:p-16 ${reverse ? "lg:[direction:ltr]" : ""}`}>
          <div className="max-w-2xl">
            <p className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-[0.16em] text-[#A18A00]">Feature</p>
            <h3 className="mt-4 font-(family-name:--font-geist-sans) text-[clamp(1.8rem,3vw,2.8rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171515]">
              {title}
            </h3>
            <p className="mt-5 max-w-prose font-(family-name:--font-poppins) text-[1.05rem] leading-8 text-[#625B54]">{text}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

export default async function Home() {
  const locale = await detectLandingLocaleFromHeaders()
  const isEnglish = locale === "en"
  const sectionInnerClassName = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
  const copy = isEnglish
    ? {
        heroTitle: ["Run your business.", "Every customer stays informed automatically."],
        heroSubtitle:
          "Turn orders, payments, appointments, subscriptions and every important business event into automated WhatsApp communication.",
        primaryCta: "Start free trial",
        secondaryCta: "Watch demo",
        section2Title: "Every business runs on events.",
        section2Body:
          "Your business is constantly moving. Orders are placed. Payments are received. Appointments are booked. Customers sign up. Shipments leave your warehouse. Every one of these moments is an opportunity to communicate. Most businesses still rely on manual messages-or forget them altogether.",
        section4Title: "Built for the way modern businesses work.",
        section4Lead: "All the use case that fits your operations today.",
        section4Cards: [
          { title: "WooCommerce", text: "Recover abandoned carts. Send order confirmations. Share shipping updates. Request reviews. Increase repeat purchases." },
          { title: "SaaS", text: "Send OTP codes. Welcome new users. Notify subscription renewals. Deliver invoices. Keep customers informed automatically." },
          { title: "Agencies", text: "Launch campaigns. Manage multiple clients. Collaborate with your team. Monitor performance." },
          { title: "Appointments", text: "Confirm bookings. Send reminders. Handle rescheduling. Follow up automatically." },
        ],
        section5Title: "Everything you need to automate customer communication.",
        section5Cards: [
          { title: "Business Flows", text: "Automate messages triggered by real business events. Orders, payments, bookings, subscriptions and follow-ups can all move without manual work. The right WhatsApp message goes out at the exact moment it matters.", imageSrc: "/flow-business.jpeg", imageAlt: "Business Flows" },
          { title: "Campaigns", text: "Launch targeted WhatsApp campaigns in minutes and reach the right audience with the right message. Build broadcasts that feel timely, relevant and easy to measure. Every send stays aligned with your business goals.", imageSrc: "/campaigns.png", imageAlt: "Campaigns" },
          { title: "Contacts", text: "Organize customers into reusable audiences so every list stays clean, actionable and ready for a campaign or flow. Segment by tags, groups or imports without losing control. Your database becomes a working asset, not a static list.", imageSrc: "/contacts.png", imageAlt: "Contacts" },
          { title: "Public API", text: "Connect MsgFlash to your applications with a public API built for product and engineering teams. Trigger sends, manage data and orchestrate communication from your own stack. The platform fits into your workflows instead of replacing them.", imageSrc: "/public-api.png", imageAlt: "Public API" },
          { title: "Teams", text: "Collaborate across workspaces with a clear structure for growing teams. Keep responsibilities visible, workflows aligned and execution easier to manage. More people can work together without creating chaos.", imageSrc: "/teams.png", imageAlt: "Teams" },
          { title: "Analytics", text: "Track delivery, engagement and campaign performance from one place. Understand what lands, what converts and what needs to improve next. Better visibility leads to better customer communication.", imageSrc: "/analytics.png", imageAlt: "Analytics" },
          { title: "Warm-up Monitoring", text: "Protect your WhatsApp numbers with built-in health monitoring and usage guidance. Stay aware of risk signals before they hurt sending quality. Healthy numbers mean more reliable communication over time.", imageSrc: "/warmup.png", imageAlt: "Warm-up Monitoring" },
          { title: "Templates", text: "Launch proven customer journeys without starting from scratch. Templates help you move faster while keeping your communication structured and repeatable. You start with a strong base instead of a blank page.", imageSrc: "/template.png", imageAlt: "Templates" },
        ],
        section6Title: "Connect the tools you already use.",
        section6Body: "No migration. No complicated setup. Simply connect your business and start automating.",
        integrations: [
          { title: "WooCommerce", iconSrc: "/woocommerce-icon-svgrepo-com.svg", iconAlt: "WooCommerce" },
          { title: "WordPress", iconSrc: "/wordpress-svgrepo-com.svg", iconAlt: "WordPress" },
          { title: "REST API", iconSrc: "/rest-api-svgrepo-com.svg", iconAlt: "REST API" },
          { title: "Zapier", iconSrc: "/zapier-icon-svgrepo-com.svg", iconAlt: "Zapier" },
          { title: "Make", iconSrc: "/make-ai-automation-icon.svg", iconAlt: "Make" },
          { title: "n8n", iconSrc: "/n8n-color.svg", iconAlt: "n8n" },
        ],
        section7Title: "Designed around Business Flows.",
        section7Body:
          "Every automation begins with a business event. Every flow delivers the right message. Every interaction can be measured.",
        previews: [
          {
            title: "Campaigns",
            text: "Broadcast promotional messages with rich media and audience segmentation.",
            imageSrc: "/campaigns-v2.png",
            ctaLabel: "Explore campaigns",
            ctaHref: "/product/campaigns",
          },
          {
            title: "Flows",
            text: "Build automated customer journeys triggered by business events.",
            imageSrc: "/flows-v2.png",
            ctaLabel: "Explore flows",
            ctaHref: "/product/flows",
          },
          {
            title: "Analytics",
            text: "Understand what works and continuously improve customer communication.",
            imageSrc: "/analytics-v2.png",
            ctaLabel: "Open analytics",
            ctaHref: "/product/analytics",
          },
        ],
        section8Title: "Built for growing businesses.",
        section8Body: "Replace this section with real customer logos and case studies as they become available. Until then, use product metrics.",
        section8Cards: [
          { title: "Reliable infrastructure", text: "Your own WhatsApp number." },
          { title: "Fast onboarding", text: "Create your first Flow in minutes." },
          { title: "Transparent pricing", text: "No hidden fees." },
          { title: "Growing community", text: "Businesses already automating customer communication with MsgFlash." },
        ],
        pricingTitle: "Start small. Scale as you grow.",
        pricingBody: "Whether you're running a single online store or managing communication for multiple clients, there's a plan built for your stage.",
        pricingCta: "Contact sales",
        plans: [
          {
            name: "Starter",
            price: "€19/month",
            badge: "Most popular",
            description: "For small businesses automating customer communication.",
            features: [
              "Campaigns",
              "Contacts & Groups",
              "Templates",
              "REST API",
              "Webhooks",
              "Number Lookup",
              "WordPress Plugin",
              "Health Center",
              "Teams",
              "5 WhatsApp Instances",
              "50,000 messages / month",
              "150,000 API requests / month",
            ],
            cta: "Start Free Trial",
          },
          {
            name: "Growth",
            price: "€39/month",
            description: "For growing businesses and agencies managing communication at scale.",
            features: [
              "Everything in Starter, plus:",
              "20 WhatsApp Instances",
              "Higher messaging limits",
              "Higher API limits",
              "More team seats",
              "More workspaces",
              "Priority Support",
              "150,000 messages / month",
              "500,000 API requests / month",
            ],
            cta: "Start Free Trial",
          },
        ],
        demoTitle: "Book a demo.",
        demoLead:
          "This call is a simple way to see whether MsgFlash can actually be useful for your business. It is quick, clear and not intrusive.",
        faqTitle: "Frequently asked questions.",
        faq: [
          { question: "Can I use my own WhatsApp number?", answer: "Yes. Connect your existing WhatsApp account and keep using the number your customers already know." },
          { question: "Do I need technical skills?", answer: "No. Most businesses can create their first automation without writing code." },
          { question: "Is the API included?", answer: "Yes. Every paid plan includes API access." },
          { question: "Is there a WooCommerce plugin?", answer: "Yes. Install the plugin, connect your store and automate customer communication in minutes." },
          { question: "How does warm-up monitoring work?", answer: "MsgFlash continuously monitors your connected numbers and helps you build healthy sending habits over time." },
          { question: "Can I try MsgFlash before subscribing?", answer: "Yes. Every new account includes a 7-day free trial." },
        ],
        finalTitle: "Keep business flowing.",
        finalBody: "Automate customer communication powered by real business events. Start your first Flow today.",
        finalPrimary: "Start free trial",
        finalSecondary: "Book a demo",
      }
    : {
        heroTitle: ["Faites tourner votre business.", "Chaque client reste informé automatiquement."],
        heroSubtitle:
          "Transformez les commandes, paiements, rendez-vous, abonnements et tous les événements métier importants en communication WhatsApp automatisée.",
        primaryCta: "Commencer gratuitement",
        secondaryCta: "Voir la démo",
        section2Title: "Chaque entreprise vit au rythme des événements.",
        section2Body:
          "Votre activité évolue en permanence. Les commandes arrivent. Les paiements sont reçus. Les rendez-vous sont réservés. Les clients s’inscrivent. Les expéditions quittent l’entrepôt. Chaque moment est une occasion de communiquer. La plupart des entreprises dépendent encore de messages manuels - ou les oublient complètement.",
        section4Title: "Pensé pour le fonctionnement des entreprises modernes.",
        section4Lead: "Tous les cas d’usage qui correspondent à votre activité aujourd’hui.",
        section4Cards: [
          { title: "WooCommerce", text: "Récupérez les paniers abandonnés. Envoyez les confirmations. Partagez les livraisons. Demandez des avis. Augmentez les achats répétés." },
          { title: "SaaS", text: "Envoyez les codes OTP. Accueillez les nouveaux utilisateurs. Prévenez les renouvellements. Envoyez les factures. Informez automatiquement vos clients." },
          { title: "Agences", text: "Lancez des campagnes. Gérez plusieurs clients. Collaborez avec votre équipe. Suivez les performances." },
          { title: "Rendez-vous", text: "Confirmez les réservations. Envoyez des rappels. Gérez les reports. Relancez automatiquement." },
        ],
        section5Title: "Tout ce qu’il faut pour automatiser la communication client.",
        section5Cards: [
          { title: "Flows métier", text: "Automatisez les messages déclenchés par de vrais événements métier. Les commandes, paiements, réservations, abonnements et relances peuvent tous évoluer sans intervention manuelle. Le bon message part au bon moment, automatiquement.", imageSrc: "/flow-business.jpeg", imageAlt: "Flows métier" },
          { title: "Campagnes", text: "Lancez des campagnes WhatsApp ciblées en quelques minutes et touchez la bonne audience avec le bon message. Construisez des envois plus pertinents et plus faciles à mesurer. Chaque campagne sert votre objectif business.", imageSrc: "/campaigns.png", imageAlt: "Campagnes" },
          { title: "Contacts", text: "Organisez vos clients en audiences réutilisables pour garder une base exploitable et propre. Segmentez par tags, groupes ou imports sans perdre le contrôle. Votre base devient un levier opérationnel, pas un simple carnet d’adresses.", imageSrc: "/contacts.png", imageAlt: "Contacts" },
          { title: "API publique", text: "Connectez MsgFlash à vos applications avec une API pensée pour les équipes produit et engineering. Déclenchez des envois, pilotez vos données et orchestrez vos messages depuis votre propre stack. La plateforme s’intègre à votre workflow au lieu de le contraindre.", imageSrc: "/public-api.png", imageAlt: "API publique" },
          { title: "Équipes", text: "Collaborez à plusieurs espaces de travail avec une structure claire pour les équipes qui grandissent. Répartissez les rôles, alignez les exécutions et gardez une vision propre des opérations. Plus d’équipe, moins de friction.", imageSrc: "/teams.png", imageAlt: "Équipes" },
          { title: "Analytics", text: "Suivez la délivrabilité, l’engagement et la performance depuis un seul endroit. Comprenez ce qui fonctionne, ce qui convertit et ce qui mérite une amélioration. Une meilleure visibilité mène à de meilleures communications client.", imageSrc: "/analytics.png", imageAlt: "Analytics" },
          { title: "Warm-up monitoring", text: "Protégez vos numéros WhatsApp avec un suivi de santé intégré et des signaux d’usage clairs. Anticipez les risques avant qu’ils n’abîment la qualité d’envoi. Des numéros sains rendent la communication plus fiable sur la durée.", imageSrc: "/warmup.png", imageAlt: "Warm-up monitoring" },
          { title: "Templates", text: "Lancez des parcours clients éprouvés sans repartir de zéro. Les templates permettent d’aller plus vite tout en gardant des messages structurés et réutilisables. Vous partez d’une base solide plutôt que d’une page blanche.", imageSrc: "/template.png", imageAlt: "Templates" },
        ],
        section6Title: "Connectez les outils que vous utilisez déjà.",
        section6Body: "Aucune migration. Aucune configuration complexe. Branchez votre business et commencez à automatiser.",
        integrations: [
          { title: "WooCommerce", iconSrc: "/woocommerce-icon-svgrepo-com.svg", iconAlt: "WooCommerce" },
          { title: "WordPress", iconSrc: "/wordpress-svgrepo-com.svg", iconAlt: "WordPress" },
          { title: "REST API", iconSrc: "/rest-api-svgrepo-com.svg", iconAlt: "REST API" },
          { title: "Zapier", iconSrc: "/zapier-icon-svgrepo-com.svg", iconAlt: "Zapier" },
          { title: "Make", iconSrc: "/make-ai-automation-icon.svg", iconAlt: "Make" },
          { title: "n8n", iconSrc: "/n8n-color.svg", iconAlt: "n8n" },
        ],
        section7Title: "Conçu autour des flows métier.",
        section7Body:
          "Chaque automatisation commence par un événement métier. Chaque flow délivre le bon message. Chaque interaction peut être mesurée.",
        previews: [
          {
            title: "Campagnes",
            text: "Diffusez des messages promotionnels avec médias riches et segmentation d’audience.",
            imageSrc: "/campaigns-v2.png",
            ctaLabel: "Explore campaigns",
            ctaHref: "/product/campaigns",
          },
          {
            title: "Flows",
            text: "Créez des parcours clients automatisés déclenchés par vos événements métier.",
            imageSrc: "/flows-v2.png",
            ctaLabel: "Explore flows",
            ctaHref: "/product/flows",
          },
          {
            title: "Analytics",
            text: "Comprenez ce qui fonctionne et améliorez en continu votre communication client.",
            imageSrc: "/analytics-v2.png",
            ctaLabel: "Open analytics",
            ctaHref: "/product/analytics",
          },
        ],
        section8Title: "Pensé pour les entreprises qui grandissent.",
        section8Body: "Remplacez cette section par de vrais logos clients et des études de cas au fur et à mesure. En attendant, utilisez les métriques produit.",
        section8Cards: [
          { title: "Infrastructure fiable", text: "Votre propre numéro WhatsApp." },
          { title: "Onboarding rapide", text: "Créez votre premier Flow en quelques minutes." },
          { title: "Tarification transparente", text: "Aucun frais caché." },
          { title: "Communauté grandissante", text: "Des entreprises automatisent déjà leur communication client avec MsgFlash." },
        ],
        pricingTitle: "Commencez petit. Montez en puissance à votre rythme.",
        pricingBody: "Que vous gériez une boutique en ligne ou plusieurs clients, il existe un plan adapté à votre stade.",
        pricingCta: "Contacter l’équipe",
        plans: [
          {
            name: "Starter",
            price: "€19/month",
            badge: "Le plus populaire",
            description: "Pour les petites entreprises qui automatisent leur communication client.",
            features: [
              "Campaigns",
              "Contacts & Groups",
              "Templates",
              "REST API",
              "Webhooks",
              "Number Lookup",
              "WordPress Plugin",
              "Health Center",
              "Teams",
              "5 WhatsApp Instances",
              "50,000 messages / month",
              "150,000 API requests / month",
            ],
            cta: "Start Free Trial",
          },
          {
            name: "Growth",
            price: "€39/month",
            description: "Pour les entreprises et agences qui gèrent la communication à grande échelle.",
            features: [
              "Everything in Starter, plus:",
              "20 WhatsApp Instances",
              "Higher messaging limits",
              "Higher API limits",
              "More team seats",
              "More workspaces",
              "Priority Support",
              "150,000 messages / month",
              "500,000 API requests / month",
            ],
            cta: "Start Free Trial",
          },
        ],
        demoTitle: "Réserver une démo.",
        demoLead:
          "Cet appel sert simplement à voir si MsgFlash peut réellement être utile à votre business. C’est rapide, clair et sans pression.",
        faqTitle: "Questions fréquentes.",
        faq: [
          { question: "Puis-je utiliser mon propre numéro WhatsApp ?", answer: "Oui. Connectez votre compte WhatsApp existant et continuez d’utiliser le numéro que vos clients connaissent déjà." },
          { question: "Ai-je besoin de compétences techniques ?", answer: "Non. La plupart des entreprises peuvent créer leur première automatisation sans écrire de code." },
          { question: "L’API est-elle incluse ?", answer: "Oui. Tous les plans payants incluent l’accès à l’API." },
          { question: "Existe-t-il un plugin WooCommerce ?", answer: "Oui. Installez le plugin, connectez votre boutique et automatisez la communication client en quelques minutes." },
          { question: "Comment fonctionne la surveillance warm-up ?", answer: "MsgFlash surveille en continu vos numéros connectés et vous aide à construire des habitudes d’envoi saines dans le temps." },
          { question: "Puis-je essayer MsgFlash avant de m’abonner ?", answer: "Oui. Chaque nouveau compte inclut un essai gratuit de 7 jours." },
        ],
        finalTitle: "Gardez votre business en mouvement.",
        finalBody: "Automatisez la communication client à partir des vrais événements métier. Lancez votre premier Flow dès aujourd’hui.",
        finalPrimary: "Commencer gratuitement",
        finalSecondary: "Réserver une démo",
      }

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-[#FFF8EE] px-4 pt-10 sm:px-6 lg:px-8">
          <div className={`${sectionInnerClassName} py-8 sm:py-12 lg:py-16`}>
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="mt-5 max-w-5xl font-(family-name:--font-geist-sans) text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-[#171515]">
                {copy.heroTitle.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="mt-5 max-w-4xl font-(family-name:--font-poppins) text-lg leading-8 text-[#5C554D]">{copy.heroSubtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={`${landingBrand.appUrl}/signup`} size="md" showArrow>
                  {copy.primaryCta}
                </Button>
                <Button href="/#demo" variant="secondary" size="md">
                  {copy.secondaryCta}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className={sectionInnerClassName}>
            <SectionHeading title={copy.section2Title} />
            <p className="mt-5 max-w-5xl font-(family-name:--font-poppins) text-lg leading-8 text-[#5C554D]">{copy.section2Body}</p>
            <div className="mt-8 overflow-hidden border border-black/10 bg-[#FBF6EA] shadow-[0_20px_60px_rgba(23,21,21,0.06)]">
              <div className="relative aspect-[16/7]">
                <Image src="/banner.png" alt={copy.section2Title} fill sizes="(max-width: 1024px) 100vw, 80vw" className="object-cover object-center" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className={sectionInnerClassName}>
            <SectionHeading title={copy.section4Title} lead={copy.section4Lead} />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {copy.section4Cards.map((card, index) => (
                <div key={card.title} className="rounded-sm border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(23,21,21,0.06)]">
                  <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#FFF3B3] text-[#171515]">
                      {index === 0 ? <FlowConnectionIcon className="h-5 w-5" /> : index === 1 ? <Megaphone01Icon className="h-5 w-5" /> : index === 2 ? <SmartPhone01Icon className="h-5 w-5" /> : <Shield01Icon className="h-5 w-5" />}
                    </div>
                    <span className="font-(family-name:--font-geist-sans) text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A8177]">{`0${index + 1}`}</span>
                  </div>
                  <h3 className="mt-6 font-(family-name:--font-geist-sans) text-xl font-semibold text-[#171515]">{card.title}</h3>
                  <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-6 text-[#625B54]">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="bg-[#FFF8EE] px-4 py-16 sm:px-6 lg:px-8">
          <div className={sectionInnerClassName}>
            <SectionHeading title={copy.section5Title} />
            <div className="mt-12 space-y-12">
              {copy.section5Cards.map((card, index) => (
                <div key={card.title} className="lg:sticky lg:top-24">
                  <FeatureSlideCard title={card.title} text={card.text} imageSrc={card.imageSrc} imageAlt={card.imageAlt} reverse={index % 2 === 1} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#FBF6EA] px-4 py-16 sm:px-6 lg:px-8">
          <div className={`${sectionInnerClassName} border border-black/10 bg-white p-8`}>
            <SectionHeading title={copy.section6Title} lead={copy.section6Body} />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {copy.integrations.map((tool) => (
                <ToolPill key={tool.title} title={tool.title} iconSrc={tool.iconSrc} iconAlt={tool.iconAlt} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#FBF6EA] px-4 pb-16 sm:px-6 lg:px-8">
          <div className={`${sectionInnerClassName} border border-black/10 bg-white p-8`}>
            <SectionHeading title={copy.section7Title} lead={copy.section7Body} />
            <div className="mt-8">
              <div className="grid gap-5 md:grid-cols-3">
                {(copy.previews as FlowPreview[]).map((preview) => (
                  <article key={preview.title} className="flex h-full flex-col overflow-hidden border border-black/10 bg-white shadow-[0_20px_60px_rgba(23,21,21,0.06)]">
                  <div className="relative aspect-[4/4.8] border-b border-black/10 bg-[#F7F2E6]">
                    <Image
                      src={preview.imageSrc}
                      alt={preview.title}
                      fill
                      priority
                      loading="eager"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center"
                    />
                  </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-(family-name:--font-geist-sans) text-xl font-semibold text-[#171515]">{preview.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#625B54]">{preview.text}</p>
                      <div className="mt-6">
                        <Button href={preview.ctaHref} size="sm" variant="secondary">
                          {preview.ctaLabel}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FBF6EA] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading title={copy.section8Title} lead={copy.section8Body} />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {copy.section8Cards.map((card) => <FeatureCard key={card.title} title={card.title} text={card.text} />)}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading title={copy.pricingTitle} lead={copy.pricingBody} />
            <div className="mt-10 grid gap-5 xl:grid-cols-2">
              <PricingCard
                name={copy.plans[0].name}
                price={copy.plans[0].price}
                description={copy.plans[0].description}
                features={copy.plans[0].features}
                cta={copy.plans[0].cta}
              />
              <PricingCard
                name={copy.plans[1].name}
                price={copy.plans[1].price}
                badge={copy.plans[1].badge}
                description={copy.plans[1].description}
                features={copy.plans[1].features}
                cta={copy.plans[1].cta}
              />
            </div>
            <div className="mt-6">
            <SalesCard
                title={locale === "en" ? "For businesses with high-volume communication needs." : "Pour les entreprises qui ont des besoins de communication à haut volume."}
                text={locale === "en" ? "Custom limits, dedicated onboarding, SLA, priority support and custom pricing." : "Limites personnalisées, onboarding dédié, SLA, support prioritaire et tarification sur mesure."}
                cta={locale === "en" ? "Contact Sales" : "Contacter les ventes"}
              />
            </div>
          </div>
        </section>

        <section id="demo" className="bg-[#FFF8EE] px-4 py-20 sm:px-6 lg:px-8">
          <div className={`${sectionInnerClassName} px-0 py-0 text-left`}>
            <SectionHeading title={copy.demoTitle} lead={copy.demoLead} />
            <div className="mt-8 w-full overflow-hidden bg-[#FFF6D8]">
              <CalendlyEmbed url="https://calendly.com/msgflash/letstalk?hide_gdpr_banner=1" className="block" />
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className={`${sectionInnerClassName} rounded-sm border border-black/10 bg-white p-6 sm:p-10`}>
            <SectionHeading title={copy.faqTitle} />
            <div className="mt-10">
              <FaqAccordion items={copy.faq} />
            </div>
          </div>
        </section>

        <section className="bg-[#FBF6EA] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className={`${sectionInnerClassName} rounded-sm border border-black/10 bg-[#FFF8D6] p-8 text-[#171515] sm:p-12`}>
            <h2 className="max-w-4xl font-(family-name:--font-geist-sans) text-[clamp(2rem,5vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.05em]">{copy.finalTitle}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5C554D]">{copy.finalBody}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={`${landingBrand.appUrl}/signup`} size="md">
                {copy.finalPrimary}
              </Button>
              <Button href="/#demo" variant="secondary" size="md">
                {copy.finalSecondary}
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
