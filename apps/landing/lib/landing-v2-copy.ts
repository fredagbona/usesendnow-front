import type { LandingLocale } from "./landing-i18n-data"

export type V2Copy = {
  nav: {
    product: string
    useCases: string
    integrations: string
    pricing: string
    docs: string
    bookDemo: string
    login: string
    language: string
    productItems: Array<{ label: string; href: string }>
    useCaseItems: Array<{ label: string; href: string }>
    integrationItems: Array<{ label: string; href: string }>
  }
  home: {
    heroEyebrow: string
    heroTitle: string
    heroSubtitle: string
    heroMicrocopy: string
    primaryCta: string
    secondaryCta: string
    stats: Array<{ value: string; label: string }>
    problemTitle: string
    problemBody: string
    solutionTitle: string
    solutionBody: string
    useCasesTitle: string
    useCasesLead: string
    useCases: Array<{ title: string; text: string; result: string }>
    whyTitle: string
    whyLead: string
    why: Array<{ title: string; text: string }>
    integrationsTitle: string
    integrationsLead: string
    integrations: Array<{ title: string; text: string; result?: string }>
    productTitle: string
    productLead: string
    product: Array<{ title: string; text: string }>
    pricingTitle: string
    pricingLead: string
    plans: Array<{ name: string; price: string; description: string; features: string[]; cta: string }>
    enterpriseTitle: string
    enterpriseText: string
    enterpriseCta: string
    faqTitle: string
    faq: Array<{ question: string; answer: string }>
    finalTitle: string
    finalBody: string
    finalPrimary: string
    finalSecondary: string
  }
  footer: {
    product: string
    useCases: string
    integrations: string
    resources: string
    company: string
    links: {
      home: string
      features: string
      security: string
      whatsappApi: string
      pricing: string
      woocommerce: string
      saas: string
      sales: string
      appointments: string
      campaigns: string
      integrations: string
      api: string
      webhooks: string
      wordpress: string
      docs: string
      announcements: string
      blog: string
      status: string
      faq: string
      risks: string
      bookDemo: string
      contact: string
      privacy: string
      terms: string
    }
    description: string
    copyright: string
  }
  pages: {
    useCases: { title: string; subtitle: string; cards: Array<{ title: string; text: string; href: string }> }
    integrations: { title: string; subtitle: string; cards: Array<{ title: string; text: string; href: string }> }
    bookDemo: { title: string; subtitle: string; points: string[]; cta: string }
  }
  announcement: {
    eyebrow: string
    date: string
    contentsLabel: string
    shareLabel: string
    title: string
    lead: string
    whyTitle: string
    why: string
    whatStaysTitle: string
    whatStays: string
    eventTitle: string
    eventBody: string
    eventSteps: string[]
    availableTitle: string
    availableLead: string
    available: string[]
    rolloutLabel: string
    rolloutLead: string
    rollout: string
    pricingTitle: string
    pricingLead: string
    pricing: string
    existingUsersTitle: string
    existingUsers: string
    closing: string
    primaryCta: string
    secondaryCta: string
  }
  announcements: Array<{
    date: string
    title: string
    summary: string
    coverLabel: string
    href: string
  }>
}

const FR: V2Copy = {
  nav: {
    product: "Produit",
    useCases: "Cas d'usage",
    integrations: "Intégrations",
    pricing: "Tarifs",
    docs: "Docs",
    bookDemo: "Réserver une démo",
    login: "Connexion",
    language: "Langue",
    productItems: [
      { label: "Fonctionnalités", href: "/features" },
      { label: "Santé des instances", href: "/security" },
      { label: "WhatsApp API", href: "/whatsapp-api" },
    ],
    useCaseItems: [
      { label: "WooCommerce", href: "/use-cases#woocommerce" },
      { label: "Notifications SaaS", href: "/use-cases#saas" },
      { label: "Relances commerciales", href: "/use-cases#sales" },
      { label: "Rappels de rendez-vous", href: "/use-cases#appointments" },
      { label: "Campagnes", href: "/use-cases#campaigns" },
    ],
    integrationItems: [
      { label: "WooCommerce", href: "/integrations#woocommerce" },
      { label: "WordPress", href: "/integrations#wordpress" },
      { label: "Webhooks", href: "/integrations#webhooks" },
      { label: "API", href: "/integrations#api" },
    ],
  },
  home: {
    heroEyebrow: "Business should flow.",
    heroTitle: "Automatisez vos communications clients à partir de chaque événement métier.",
    heroSubtitle:
      "Connectez vos outils, créez des flows automatisés et gardez vos clients informés sur WhatsApp, sans relances manuelles.",
    heroMicrocopy: "Connectez votre premier numéro en quelques minutes. Aucune carte bancaire requise.",
    primaryCta: "Commencer l’essai de 7 jours",
    secondaryCta: "Réserver une démo",
    stats: [
      { value: "500k+", label: "messages envoyés ce mois" },
      { value: "99.2%", label: "taux de livraison moyen" },
      { value: "4 min 30 s", label: "temps moyen avant 1er message" },
    ],
    problemTitle: "Chaque entreprise vit d’événements. Mais la communication client reste souvent manuelle.",
    problemBody:
      "Commandes, paiements, livraisons, rappels, campagnes et relances devraient déclencher automatiquement le bon message. À la place, les équipes les envoient encore un par un.",
    solutionTitle: "Transformez vos événements métier en flows WhatsApp.",
    solutionBody:
      "MsgFlash écoute vos événements métier et envoie le bon message WhatsApp au bon moment.",
    useCasesTitle: "Des flows prêts pour les moments qui comptent.",
    useCasesLead: "Commencez avec des usages concrets, puis adaptez-les à votre activité.",
    useCases: [
      { title: "WooCommerce", text: "Récupérez les paniers, confirmez les commandes et envoyez les updates de livraison.", result: "Plus de revenus récupérés" },
      { title: "Notifications SaaS", text: "Informez vos clients sur les inscriptions, paiements et renouvellements.", result: "Moins de support manuel" },
      { title: "Relances commerciales", text: "Relancez les leads et les devis sans perdre le rythme.", result: "Plus de réponses" },
      { title: "Rappels de rendez-vous", text: "Gardez les bookings, rappels et suivis à l’heure.", result: "Moins d’absences" },
      { title: "Campagnes", text: "Diffusez des messages ciblés avec suivi, segmentation et contrôle.", result: "Meilleur impact" },
    ],
    whyTitle: "Pensé pour garder la communication en mouvement.",
    whyLead: "Flows, campagnes, intégrations, sécurité et analytics dans une seule plateforme dédiée.",
    why: [
      { title: "Flows", text: "Déclenchez les bons messages à partir d’événements métier réels." },
      { title: "Campagnes", text: "Diffusez des messages ciblés avec plus de contrôle." },
      { title: "Intégrations", text: "Connectez WooCommerce, WordPress, webhooks et votre API." },
      { title: "Santé des instances", text: "Suivez l’état de vos numéros et recevez des recommandations avant les envois sensibles." },
    ],
    integrationsTitle: "Connectez les outils que votre entreprise utilise déjà.",
    integrationsLead: "WooCommerce, WordPress, les webhooks et l’API publique alimentent MsgFlash en événements.",
    integrations: [
      { title: "WooCommerce", text: "Automatisez commandes, paiements et relances.", result: "" },
      { title: "WordPress", text: "Reliez votre boutique au WhatsApp automatisé.", result: "" },
      { title: "Webhooks", text: "Branchez n’importe quel système métier.", result: "" },
      { title: "API", text: "Construisez vos propres automatisations.", result: "" },
    ],
    productTitle: "Tout ce qu’il faut pour automatiser vos communications WhatsApp.",
    productLead: "Gérez vos numéros, contacts, campagnes, flows, équipes et analytics depuis un seul dashboard.",
    product: [
      { title: "Dashboard", text: "Vue claire sur l’activité, les volumes et les événements récents." },
      { title: "Campagnes", text: "Créez, planifiez et suivez vos diffusions." },
      { title: "Contacts", text: "Organisez vos listes et vos groupes." },
      { title: "API & webhooks", text: "Déclenchez les flows depuis vos outils." },
      { title: "Analytics", text: "Mesurez l’envoi, la livraison et la lecture." },
      { title: "Équipes", text: "Travaillez à plusieurs, sans perdre le contrôle." },
    ],
    pricingTitle: "Commencez simplement. Montez en puissance avec vos flows.",
    pricingLead: "Choisissez le plan adapté à votre manière de communiquer.",
    enterpriseTitle: "Pour les entreprises qui ont des besoins de communication à haut volume.",
    enterpriseText: "Limites personnalisées, onboarding dédié, SLA, support prioritaire et tarification sur mesure.",
    enterpriseCta: "Contacter les ventes",
    plans: [
      { name: "Starter", price: "19 € / mois", description: "Pour les petites entreprises qui automatisent leur communication client.", cta: "Commencer l’essai", features: ["Campagnes", "Contacts et groupes", "Templates", "API REST", "Webhooks", "Number Lookup", "WordPress", "Health Center", "Teams", "5 instances WhatsApp", "50 000 messages / mois", "150 000 requêtes API / mois"] },
      { name: "Growth", price: "39 € / mois", description: "Pour les entreprises et agences qui gèrent leur communication à grande échelle.", cta: "Commencer l’essai", features: ["Tout Starter, plus :", "20 instances WhatsApp", "Limites de messages supérieures", "Limites API supérieures", "Plus de sièges équipe", "Plus d’espaces de travail", "Support prioritaire", "150 000 messages / mois", "500 000 requêtes API / mois"] },
    ],
    faqTitle: "Les questions que les entreprises posent avant d’automatiser WhatsApp.",
    faq: [
      { question: "Faut-il être développeur ?", answer: "Non pour les campagnes et WooCommerce. Oui uniquement si vous voulez intégrer l’API ou les webhooks." },
      { question: "Est-ce un fournisseur officiel Meta ?", answer: "Non. MsgFlash utilise une architecture basée sur la connexion QR WhatsApp, avec une trajectoire d’évolution claire." },
      { question: "Puis-je essayer MsgFlash avant de m’abonner ?", answer: "Oui. Chaque nouveau compte bénéficie d’un essai unique de 7 jours sur Starter ou Growth, sans carte bancaire à l’inscription." },
    ],
    finalTitle: "Gardez votre business en mouvement.",
    finalBody: "Commencez votre essai unique de 7 jours ou réservez une démo pour voir comment MsgFlash s’intègre à vos flows métier.",
    finalPrimary: "Commencer l’essai",
    finalSecondary: "Réserver une démo",
  },
  announcement: {
    eyebrow: "Mise à jour produit",
    date: "14 juillet 2026",
    contentsLabel: "Dans cet article",
    shareLabel: "Partager",
    title: "MsgFlash évolue vers la Business Event Automation",
    lead: "Vos commandes, paiements, réservations, inscriptions, abonnements et expéditions génèrent déjà des événements. MsgFlash transforme ces événements en communications WhatsApp automatiques, traçables et utiles pour vos clients.",
    whyTitle: "Pourquoi ce changement de positionnement ?",
    why: "MsgFlash ne se limite plus à « envoyer des messages WhatsApp ». Notre objectif est de relier les événements réels de votre activité à la bonne communication client, au bon moment, tout en conservant une API claire et une infrastructure WhatsApp spécialisée.",
    whatStaysTitle: "Ce qui reste au cœur de MsgFlash",
    whatStays: "Vos instances, contacts, groupes, modèles, campagnes, programmations, clés API, webhooks, équipes, médias et outils de facturation restent au cœur du produit.",
    eventTitle: "Des événements métier aux conversations utiles",
    eventBody: "Une commande passée, un paiement confirmé ou une réservation enregistrée ne sont pas de simples lignes dans un système. Ce sont des moments où votre client attend une information claire. MsgFlash relie ces événements à une communication WhatsApp qui arrive au moment où elle a le plus de valeur.",
    eventSteps: ["Un événement se produit dans votre activité.", "MsgFlash reçoit ou déclenche l’action correspondante.", "Le bon message est mis en file et envoyé sur WhatsApp.", "Votre client reste informé, tandis que votre équipe garde une trace de l’opération."],
    availableTitle: "Disponible aujourd’hui",
    availableLead: "Le repositionnement ne remet pas en cause les fondations déjà disponibles. Vous pouvez dès maintenant connecter votre infrastructure, organiser vos audiences et opérer vos communications depuis MsgFlash.",
    available: ["Instances", "Contacts, groupes, tags, imports et traitements en masse", "Templates, campagnes et programmations", "Clés API, API publique et webhooks", "Number Lookup, équipes, workspaces, billing et upload média", "Informations actuelles de santé des instances"],
    rolloutLabel: "Déploiement progressif",
    rolloutLead: "Nous construisons cette évolution par étapes afin de garder une plateforme fiable et lisible.",
    rollout: "Les modèles par industrie, la galerie d’intégrations, les Event Logs, les analytics de délivrabilité enrichis, le nouveau Health Center et l’onboarding métier seront introduits progressivement. Ils ne sont pas tous disponibles aujourd’hui.",
    pricingTitle: "Un essai unique, puis un abonnement clair",
    pricingLead: "Le nouveau positionnement s’accompagne d’une offre plus simple, conçue pour permettre une vraie découverte du produit avant l’abonnement.",
    pricing: "MsgFlash propose désormais un essai unique de 7 jours sur Starter à 19 €/mois ou Growth à 39 €/mois. Il n’existe plus de plan Free permanent. Sans abonnement actif à la fin de l’essai, les opérations sont bloquées mais la facturation, le profil et les exports autorisés restent accessibles.",
    existingUsersTitle: "Impact pour les utilisateurs actuels",
    existingUsers: "Vous pouvez continuer à utiliser les fonctions déjà disponibles. Les changements de navigation et les nouvelles capacités seront annoncés au fur et à mesure. Aucun workflow existant ne doit être présenté comme migré automatiquement sans confirmation dans le produit.",
    closing: "Business Event Automation devient le fil conducteur de MsgFlash : connecter ce qui se passe dans votre entreprise à une communication client claire, au bon moment.",
    primaryCta: "Ouvrir MsgFlash",
    secondaryCta: "Voir les tarifs",
  },
  announcements: [
    {
      date: "14 juillet 2026",
      title: "MsgFlash évolue vers la Business Event Automation",
      summary: "Découvrez comment vos événements métier deviennent des communications WhatsApp automatiques, traçables et utiles.",
      coverLabel: "Business Event Automation",
      href: "/announcements/business-event-automation",
    },
  ],
  footer: {
    product: "Produit",
    useCases: "Cas d'usage",
    integrations: "Intégrations",
    resources: "Ressources",
    company: "Entreprise",
    links: {
      home: "Accueil",
      features: "Fonctionnalités",
      security: "Sécurité",
      whatsappApi: "WhatsApp API",
      pricing: "Tarifs",
      woocommerce: "WooCommerce",
      saas: "Notifications SaaS",
      sales: "Relances commerciales",
      appointments: "Rappels de rendez-vous",
      campaigns: "Campagnes",
      integrations: "Intégrations",
      api: "API",
      webhooks: "Webhooks",
      wordpress: "WordPress",
      docs: "Docs",
      announcements: "Annonces",
      blog: "Blog",
      status: "Status",
      faq: "FAQ",
      risks: "Risques",
      bookDemo: "Réserver une démo",
      contact: "Contact",
      privacy: "Confidentialité",
      terms: "Conditions",
    },
    description: "Une plateforme WhatsApp pour faire circuler vos communications clients automatiquement.",
    copyright: "© 2026 MsgFlash. Tous droits réservés.",
  },
  pages: {
    useCases: {
      title: "Des cas d'usage pensés pour chaque équipe.",
      subtitle: "Choisissez un contexte métier et transformez-le en flow automatisé.",
      cards: [
        { title: "WooCommerce", text: "Recouvrez les paniers, confirmez les commandes, rassurez vos acheteurs.", href: "/use-cases/woocommerce" },
        { title: "Notifications SaaS", text: "Informez automatiquement vos clients à chaque étape utile.", href: "/use-cases/saas-notifications" },
        { title: "Relances commerciales", text: "Suivez les leads et les devis sans charge manuelle.", href: "/use-cases/sales-follow-up" },
        { title: "Rappels de rendez-vous", text: "Réduisez les absences et gardez le rythme.", href: "/use-cases/appointment-reminders" },
        { title: "Campagnes", text: "Diffusez des messages ciblés avec contrôle et suivi.", href: "/use-cases/campaigns" },
      ],
    },
    integrations: {
      title: "Intégrez MsgFlash dans votre stack existante.",
      subtitle: "Chaque intégration devient une source de flow business.",
      cards: [
        { title: "WooCommerce", text: "Boutique, commandes et relances.", href: "/integrations/woocommerce" },
        { title: "WordPress", text: "Le plugin pour brancher votre site en quelques minutes.", href: "/integrations/wordpress" },
        { title: "Webhooks", text: "Transformez n’importe quel événement en message.", href: "/integrations/webhooks" },
        { title: "API", text: "Créez vos automatisations sur mesure.", href: "/integrations/api" },
      ],
    },
    bookDemo: {
      title: "Réservez une démo pour voir MsgFlash en contexte.",
      subtitle: "Idéal pour les agences, les équipes multi-clients et les projets à volume.",
      points: [
        "Comprendre le produit dans votre cas d’usage.",
        "Voir comment brancher vos événements métier.",
        "Obtenir des recommandations de mise en place.",
      ],
      cta: "Réserver une démo",
    },
  },
}

const EN: V2Copy = {
  nav: {
    product: "Product",
    useCases: "Use cases",
    integrations: "Integrations",
    pricing: "Pricing",
    docs: "Docs",
    bookDemo: "Book a demo",
    login: "Login",
    language: "Language",
    productItems: [
      { label: "Features", href: "/features" },
      { label: "Instance health", href: "/security" },
      { label: "WhatsApp API", href: "/whatsapp-api" },
    ],
    useCaseItems: [
      { label: "WooCommerce", href: "/use-cases#woocommerce" },
      { label: "SaaS notifications", href: "/use-cases#saas" },
      { label: "Sales follow-up", href: "/use-cases#sales" },
      { label: "Appointment reminders", href: "/use-cases#appointments" },
      { label: "Campaigns", href: "/use-cases#campaigns" },
    ],
    integrationItems: [
      { label: "WooCommerce", href: "/integrations#woocommerce" },
      { label: "WordPress", href: "/integrations#wordpress" },
      { label: "Webhooks", href: "/integrations#webhooks" },
      { label: "API", href: "/integrations#api" },
    ],
  },
  home: {
    heroEyebrow: "Business should flow.",
    heroTitle: "Automate customer communication from every business event.",
    heroSubtitle:
      "Connect your tools, create automated flows, and keep customers informed on WhatsApp without manual follow-ups.",
    heroMicrocopy: "Connect your first number in minutes. No credit card required.",
    primaryCta: "Start 7-day trial",
    secondaryCta: "Book a demo",
    stats: [
      { value: "500k+", label: "messages sent this month" },
      { value: "99.2%", label: "average delivery rate" },
      { value: "4 min 30 s", label: "average time to first message" },
    ],
    problemTitle: "Every business runs on events. Most customer communication is still manual.",
    problemBody:
      "Orders, payments, deliveries, reminders, campaigns, and follow-ups should trigger the right message automatically. Instead, teams still send them one by one.",
    solutionTitle: "Turn business events into WhatsApp flows.",
    solutionBody:
      "MsgFlash listens to your business events and sends the right WhatsApp message at the right time.",
    useCasesTitle: "Ready-made flows for the moments that matter.",
    useCasesLead: "Start with practical use cases, then adapt them to your business.",
    useCases: [
      { title: "WooCommerce", text: "Recover carts, confirm orders, and send shipping updates.", result: "More revenue recovered" },
      { title: "SaaS notifications", text: "Keep users informed about signups, payments, and renewals.", result: "Less manual support" },
      { title: "Sales follow-up", text: "Follow up leads and quotes without losing momentum.", result: "More replies" },
      { title: "Appointment reminders", text: "Keep bookings, reminders, and follow-ups on time.", result: "Fewer no-shows" },
      { title: "Campaigns", text: "Run targeted messages with tracking, segmentation, and control.", result: "Better reach" },
    ],
    whyTitle: "Built to keep communication flowing.",
    whyLead: "Flows, campaigns, integrations, safety, and analytics in one focused platform.",
    why: [
      { title: "Flows", text: "Trigger the right messages from real business events." },
      { title: "Campaigns", text: "Send targeted broadcasts with more control." },
      { title: "Integrations", text: "Connect WooCommerce, WordPress, webhooks, and your API." },
      { title: "Instance health", text: "Monitor connected numbers and get guidance before sensitive sends." },
    ],
    integrationsTitle: "Connect the tools your business already uses.",
    integrationsLead: "WooCommerce, WordPress, webhooks, and the public API feed events into MsgFlash.",
    integrations: [
      { title: "WooCommerce", text: "Automate orders, payments, and follow-ups.", result: "" },
      { title: "WordPress", text: "Connect your store to WhatsApp flows.", result: "" },
      { title: "Webhooks", text: "Plug in any business system.", result: "" },
      { title: "API", text: "Build your own flows.", result: "" },
    ],
    productTitle: "Everything you need to automate WhatsApp communication.",
    productLead: "Manage numbers, contacts, campaigns, flows, teams, and analytics from one dashboard.",
    product: [
      { title: "Dashboard", text: "Clear view of activity, volume, and recent events." },
      { title: "Campaigns", text: "Create, schedule, and track broadcasts." },
      { title: "Contacts", text: "Organize customers into lists and groups." },
      { title: "API & webhooks", text: "Trigger flows from your tools." },
      { title: "Analytics", text: "Track sending, delivery, and reads." },
      { title: "Teams", text: "Work together without losing control." },
    ],
    pricingTitle: "Start simple. Scale as your flows grow.",
    pricingLead: "Choose the plan that matches how your business communicates.",
    enterpriseTitle: "For businesses with high-volume communication needs.",
    enterpriseText: "Custom limits, dedicated onboarding, SLA, priority support and custom pricing.",
    enterpriseCta: "Contact Sales",
    plans: [
      { name: "Starter", price: "€19 / month", description: "For small businesses automating customer communication.", cta: "Start free trial", features: ["Campaigns", "Contacts & Groups", "Templates", "REST API", "Webhooks", "Number Lookup", "WordPress", "Health Center", "Teams", "5 WhatsApp Instances", "50,000 messages / month", "150,000 API requests / month"] },
      { name: "Growth", price: "€39 / month", description: "For growing businesses and agencies managing communication at scale.", cta: "Start free trial", features: ["Everything in Starter, plus:", "20 WhatsApp Instances", "Higher messaging limits", "Higher API limits", "More team seats", "More workspaces", "Priority Support", "150,000 messages / month", "500,000 API requests / month"] },
    ],
    faqTitle: "Questions businesses ask before automating WhatsApp.",
    faq: [
      { question: "Do I need to be a developer?", answer: "No for campaigns and WooCommerce. Yes only if you want to integrate the API or webhooks." },
      { question: "Is it an official Meta provider?", answer: "No. MsgFlash uses a QR-based WhatsApp connection architecture with a clear evolution path." },
      { question: "Can I try MsgFlash before subscribing?", answer: "Yes. Every new account gets one seven-day trial on Starter or Growth, with no credit card required at signup." },
    ],
    finalTitle: "Keep your business flowing.",
    finalBody: "Start your one seven-day trial or book a demo to see how MsgFlash fits your business flows.",
    finalPrimary: "Start trial",
    finalSecondary: "Book a demo",
  },
  announcement: {
    eyebrow: "Product update",
    date: "July 14, 2026",
    contentsLabel: "In this article",
    shareLabel: "Share",
    title: "MsgFlash is evolving into Business Event Automation",
    lead: "Your orders, payments, bookings, signups, subscriptions, and shipments already generate events. MsgFlash turns those events into automatic, traceable, and useful WhatsApp communication for your customers.",
    whyTitle: "Why this positioning is changing",
    why: "MsgFlash is no longer described as a tool that only “sends WhatsApp messages”. Our goal is to connect real business events to the right customer communication at the right time, while preserving a clear API and specialized WhatsApp infrastructure.",
    whatStaysTitle: "What remains at the core of MsgFlash",
    whatStays: "Your instances, contacts, groups, templates, campaigns, schedules, API keys, webhooks, teams, media, and billing tools remain core product capabilities.",
    eventTitle: "From business events to useful conversations",
    eventBody: "An order, a confirmed payment, or a new booking is more than a record in a system. It is a moment when your customer expects clear information. MsgFlash connects these events to WhatsApp communication that arrives when it is most useful.",
    eventSteps: ["An event happens in your business.", "MsgFlash receives or triggers the corresponding action.", "The right message is queued and sent on WhatsApp.", "Your customer stays informed while your team keeps an operational record."],
    availableTitle: "Available today",
    availableLead: "This new positioning does not change the foundations already available. You can connect your infrastructure, organize audiences, and operate communication from MsgFlash today.",
    available: ["Instances", "Contacts, groups, tags, imports, and bulk jobs", "Templates, campaigns, and scheduling", "API keys, Public API, and webhooks", "Number lookup, teams, workspaces, billing, and media upload", "Current instance health information"],
    rolloutLabel: "Progressive rollout",
    rolloutLead: "We are building this evolution in stages so the platform stays reliable and clear.",
    rollout: "Industry Templates, the Integration Gallery, Event Logs, expanded Delivery Analytics, the new Health Center, and business-aware onboarding will be introduced progressively. They are not all available today.",
    pricingTitle: "One trial, then clear pricing",
    pricingLead: "This new positioning comes with a simpler offer designed to let you experience the product before subscribing.",
    pricing: "MsgFlash now provides one seven-day trial on Starter at €19/month or Growth at €39/month. There is no permanent Free plan. Without an active subscription when the trial ends, product operations are blocked while billing, profile, and eligible exports remain available.",
    existingUsersTitle: "What this means for existing users",
    existingUsers: "You can continue using currently available capabilities. Navigation changes and new capabilities will be announced progressively. No existing workflow should be described as automatically migrated unless the product confirms it.",
    closing: "Business Event Automation is now the thread running through MsgFlash: connect what happens in your business to clear customer communication at the right time.",
    primaryCta: "Open MsgFlash",
    secondaryCta: "View pricing",
  },
  announcements: [
    {
      date: "July 14, 2026",
      title: "MsgFlash is evolving into Business Event Automation",
      summary: "See how your business events become automatic, traceable, and useful WhatsApp communication.",
      coverLabel: "Business Event Automation",
      href: "/announcements/business-event-automation",
    },
  ],
  footer: {
    product: "Product",
    useCases: "Use cases",
    integrations: "Integrations",
    resources: "Resources",
    company: "Company",
    links: {
      home: "Home",
      features: "Features",
      security: "Security",
      whatsappApi: "WhatsApp API",
      pricing: "Pricing",
      woocommerce: "WooCommerce",
      saas: "SaaS notifications",
      sales: "Sales follow-up",
      appointments: "Appointment reminders",
      campaigns: "Campaigns",
      integrations: "Integrations",
      api: "API",
      webhooks: "Webhooks",
      wordpress: "WordPress",
      docs: "Docs",
      announcements: "Announcements",
      blog: "Blog",
      status: "Status",
      faq: "FAQ",
      risks: "Risks",
      bookDemo: "Book a demo",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
    },
    description: "A WhatsApp platform to keep customer communication flowing automatically.",
    copyright: "© 2026 MsgFlash. All rights reserved.",
  },
  pages: {
    useCases: {
      title: "Use cases for every team.",
      subtitle: "Pick a business context and turn it into an automated flow.",
      cards: [
        { title: "WooCommerce", text: "Recover carts, confirm orders, reassure buyers.", href: "/use-cases/woocommerce" },
        { title: "SaaS notifications", text: "Keep users informed at every useful step.", href: "/use-cases/saas-notifications" },
        { title: "Sales follow-up", text: "Follow leads and quotes without manual overhead.", href: "/use-cases/sales-follow-up" },
        { title: "Appointment reminders", text: "Reduce no-shows and keep the rhythm.", href: "/use-cases/appointment-reminders" },
        { title: "Campaigns", text: "Broadcast targeted messages with control and tracking.", href: "/use-cases/campaigns" },
      ],
    },
    integrations: {
      title: "Fit MsgFlash into your existing stack.",
      subtitle: "Each integration becomes a source of business flow.",
      cards: [
        { title: "WooCommerce", text: "Store, orders, and follow-ups.", href: "/integrations/woocommerce" },
        { title: "WordPress", text: "The plugin to connect your site in minutes.", href: "/integrations/wordpress" },
        { title: "Webhooks", text: "Turn any event into a message.", href: "/integrations/webhooks" },
        { title: "API", text: "Build custom flows.", href: "/integrations/api" },
      ],
    },
    bookDemo: {
      title: "Book a demo to see MsgFlash in context.",
      subtitle: "Ideal for agencies, multi-client teams, and higher-volume setups.",
      points: [
        "Understand the product for your use case.",
        "See how your business events connect.",
        "Get setup recommendations.",
      ],
      cta: "Book a demo",
    },
  },
}

export function getLandingV2Copy(locale: LandingLocale) {
  return locale === "fr" ? FR : EN
}
