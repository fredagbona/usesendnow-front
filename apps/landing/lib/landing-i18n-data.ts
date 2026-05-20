export type LandingLocale = "fr" | "en"

type LandingMessages = {
  nav: {
    features: string
    campaigns: string
    pricing: string
    faq: string
    docs: string
    getStarted: string
    openMenu: string
    closeMenu: string
    language: string
  }
  hero: {
    title: string
    description: string
    primaryCta: string
    secondaryCta: string
  }
  logos: string[]
  features: {
    title: string
    cards: Array<{ title: string; description: string }>
    reasonsTitle: string
    reasons: Array<{ title: string; text: string }>
  }
  howItWorks: {
    title: string
    steps: Array<{ number: string; title: string; text: string }>
    audienceTitle: string
    audiences: string[]
  }
  wordpress: {
    title: string
    subtitle: string
    primaryCta: string
    h1: string
    heroAccent: string
    description: string
    statsBoutiques: string
    statsMessages: string
    license: string
    setupTitle: string
    setupDescription: string
    tipLabel: string
    tipQuote: string
    pillarsTitle: string
    pillars: Array<{ eyebrow: string; title: string; description: string; result: string }>
    h2AbandonedTitle: string
    h2AbandonedBody: string
    h2OrdersTitle: string
    h2OrdersBody: string
  }
  homeSeo: {
    developerH2: string
    integrationH2: string
    integrationBody: string
  }
  campaigns: {
    metaTitle: string
    metaDescription: string
    eyebrow: string
    heroTitle: string
    heroLead: string
    primaryCta: string
    secondaryCta: string
    blocks: Array<{ title: string; body: string }>
    closingTitle: string
  }
  pricing: {
    useCasesTitle: string
    useCases: Array<{ title: string; text: string; imageAlt: string }>
    title: string
    subtitle: string
    teamsFootnote: string
    plans: Array<{
      name: string
      price: string
      secondaryPrice: string
      desc: string
      cta: string
      features: string[]
    }>
    integrationTitle: string
    integrationText: string
    docsCta: string
    apiCta: string
    codeSample: string
  }
  faq: {
    title: string
    items: Array<{ question: string; answer: string }>
  }
  cta: {
    title: string
    primary: string
    secondary: string
  }
  footer: {
    product: string
    discover: string
    resources: string
    legal: string
    description: string
    designCredit: string
    links: {
      automations: string
      campaigns: string
      wordpress: string
      useCases: string
      pricing: string
      comparison: string
      risks: string
      blog: string
      faq: string
      api: string
      docs: string
      webhook: string
      status: string
      privacy: string
      terms: string
      contact: string
    }
  }
  contact: {
    badge: string
    title: string
    subtitle: string
    emailDirect: string
    support: string
    supportText: string
    responseTime: string
    responseText: string
    docs: string
    docsText: string
    writeUs: string
    formDescription: string
    firstName: string
    email: string
    subject: string
    message: string
    subjectOptions: string[]
    submit: string
    privacy: string
  }
  legal: {
    badge: string
    contact: string
  }
  conditions: {
    title: string
    subtitle: string
    sideTitle: string
    sideText: string
    intro: string
    lastUpdated: string
    sections: Array<{ title: string; content: string }>
  }
  privacy: {
    title: string
    subtitle: string
    sideTitle: string
    sideText: string
    intro: string
    lastUpdated: string
    sections: Array<{ title: string; content: string }>
  }
}

const FR: LandingMessages = {
  nav: {
    features: "Fonctionnalités",
    campaigns: "Campagnes",
    pricing: "Tarifs",
    faq: "FAQ",
    docs: "Documentation",
    getStarted: "Commencer",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    language: "Langue",
  },
  hero: {
    title: "API WHATSAPP POUR DÉVELOPPEURS — REST, WEBHOOKS, SANS APPROBATION META",
    description:
      "Envoyez des messages WhatsApp via une API REST, sans parcours BSP. Webhooks fiables, connexion par QR code, intégration n8n, Zapier et Make — pour une automatisation WhatsApp orientée produit.",
    primaryCta: "Commencer",
    secondaryCta: "Voir la documentation",
  },
  logos: ["API REST WhatsApp", "Webhooks & événements", "Messages texte + médias", "QR code & intégration rapide"],
  features: {
    title: "Automatisation WhatsApp par API — pensée pour les développeurs",
    cards: [
      { title: "Envoyer des messages", description: "Un seul endpoint REST pour texte, médias et réponses — idéal pour envoyer des messages WhatsApp depuis votre backend." },
      { title: "Planifier des envois", description: "Déclenchez campagnes et rappels depuis une API prévisible, sans couche BSP inutile." },
      { title: "Lancer des campagnes", description: "Listes de diffusion, suivi d’envoi et pilotage depuis l’API ou le portail." },
      { title: "Intégration webhooks WhatsApp", description: "Recevez livraisons, réponses et erreurs en temps réel pour orchestrer vos workflows." },
      { title: "n8n, Zapier, Make & backend", description: "Branchez n8n, Zapier, Make ou votre code : la même API REST pour tous vos scénarios." },
    ],
    reasonsTitle: "Pourquoi les équipes tech choisissent msgflash",
    reasons: [
      { title: "API simple", text: "Documentation claire, endpoints REST directs — moins de friction qu’avec une plateforme BSP classique." },
      { title: "QR code & instance", text: "Connectez un numéro via QR code et passez en production sans attendre une validation Meta complexe." },
      { title: "Webhooks utiles", text: "Intégration webhook WhatsApp pour livraisons, réponses et statuts — branchée sur votre observabilité." },
      { title: "Pensé pour les makers", text: "Compatible avec vos outils backend, no-code et automatisations." },
      { title: "Tarification lisible", text: "Pas de licence cachée, pas de surcoût de plateforme surprise." },
      { title: "Trajectoire solide", text: "Pour un bot simple, une campagne ou un orchestrateur plus complet." },
    ],
  },
  howItWorks: {
    title: "Comment ça marche ?",
    steps: [
      { number: "01", title: "Créez votre compte", text: "Inscription rapide, dashboard clair." },
      { number: "02", title: "Connectez un numéro", text: "Lecture du QR Code standard." },
      { number: "03", title: "Intégrez notre API", text: "Une route simple pour POST, GET et webhooks." },
      { number: "04", title: "Lancez l’automatisation", text: "Envoyez vos messages et suivez les réponses." },
    ],
    audienceTitle: "Conçu pour ceux qui veulent aller vite",
    audiences: ["Makers", "Agences", "E-commerçants", "Développeurs"],
  },
  wordpress: {
    title: "WordPress x msgflash",
    subtitle: "Le plugin WordPress qui transforme WooCommerce en canal WhatsApp piloté par revenu.",
    primaryCta: "Télécharger le Plugin (Gratuit)",
    h1: "Extension WooCommerce WhatsApp gratuite — relance panier abandonné & notifications de commande",
    heroAccent:
      "Récupérez jusqu’à 15% du chiffre d’affaires : relance panier, suivi commande et coupons — le tout sur WhatsApp, sans dépendre seul de l’email.",
    description:
      "Plugin WooCommerce WhatsApp gratuit : récupérez les paniers abandonnés, envoyez le suivi de commande et multipliez l’usage des coupons. Installation en moins de 5 minutes.",
    statsBoutiques: "Déjà 1 237 boutiques",
    statsMessages: "41 237 messages / 24h",
    license: "GPL v2 Licensed • WordPress Official Partner",
    setupTitle: "En 4 minutes chrono, activez WhatsApp sur votre boutique",
    setupDescription: "Pas besoin d'être développeur. Suivez ces 3 étapes pour activer la puissance de WhatsApp sur votre boutique.",
    tipLabel: "Le conseil msgflash",
    tipQuote: "98% des messages WhatsApp sont lus dans les 3 minutes. En rendant le champ téléphone obligatoire, vous ne demandez pas juste un numéro, vous ouvrez un canal de vente directe qui convertit 5x mieux que l'email.",
    pillarsTitle: "Les 3 cas d'usage piliers",
    pillars: [
      { eyebrow: "Relance panier", title: "Relance panier \"High-Touch\"", description: "Déclenchement automatique 45 minutes après abandon de checkout pour récupérer vos ventes sans action manuelle.", result: "+22% de récupération de paniers" },
      { eyebrow: "Suivi expédition", title: "Suivi de commande instantané", description: "Dès qu'une commande passe en expédiée, le client reçoit son numéro de suivi cliquable sur WhatsApp.", result: "-40% de tickets support" },
      { eyebrow: "Coupon bienvenue", title: "Lead magnet WhatsApp", description: "À chaque nouvelle inscription client, envoyez automatiquement un coupon de bienvenue directement dans WhatsApp.", result: "3x plus d'utilisation qu'un coupon email" },
    ],
    h2AbandonedTitle: "Récupérez les paniers abandonnés sur WhatsApp — automatiquement",
    h2AbandonedBody:
      "Les boutiques cherchent une solution WooCommerce panier abandonné WhatsApp : msgflash envoie la relance au bon moment, avec un message lu presque instantanément — idéal pour augmenter le taux de récupération sans spammer l’email.",
    h2OrdersTitle: "Notifications de commande WooCommerce via WhatsApp",
    h2OrdersBody:
      "Prévenez vos clients quand la commande est confirmée, expédiée ou livrée : notifications de commande WooCommerce claires, traçables et moins coûteuses en support que l’email seul.",
  },
  homeSeo: {
    developerH2: "API WhatsApp sans parcours BSP classique — pour développeurs & makers",
    integrationH2: "Webhooks WhatsApp & envoi via API REST",
    integrationBody:
      "Construisez votre intégration webhook WhatsApp, recevez les accusés et réponses, et déclenchez vos scénarios (CRM, helpdesk, data) depuis une API REST documentée — compatible n8n, Zapier et Make.",
  },
  campaigns: {
    metaTitle: "Outil campagnes & diffusion WhatsApp | msgflash",
    metaDescription:
      "Campagnes WhatsApp, envois groupés et pilotage marketing : msgflash pour les équipes growth qui veulent des broadcasts sans se perdre dans une stack BSP. Essayez gratuitement.",
    eyebrow: "Marketing & growth",
    heroTitle: "Campagnes WhatsApp, diffusions et automation marketing",
    heroLead:
      "Pensez msgflash comme votre outil de campagnes WhatsApp : listes, envois, suivi — sans abandonner une API propre pour vos équipes produit quand elles en ont besoin.",
    primaryCta: "Créer un compte",
    secondaryCta: "Documentation",
    blocks: [
      {
        title: "Outil de campagne broadcast WhatsApp",
        body: "Ciblez une liste, lancez une campagne et suivez les retours : conçu pour les équipes qui cherchent un outil campagne broadcast WhatsApp sans friction opérationnelle.",
      },
      {
        title: "Envoyer des campagnes sans parcours Meta lourd",
        body: "Même angle que pour l’API : démarrez vite, connectez votre numéro et pilotez vos envois — pour ceux qui veulent envoyer des campagnes WhatsApp sans Meta bloquant le quotidien.",
      },
      {
        title: "Messaging de masse & automation marketing",
        body: "Du message unitaire à la série programmée : une base unique pour le messaging de masse WhatsApp et l’automation marketing reliée à vos événements métier.",
      },
      {
        title: "Analytique des campagnes",
        body: "Livraisons, lectures et erreurs remontent dans le portail et via webhooks pour alimenter vos tableaux de bord — des métriques utiles pour ajuster vos campagnes.",
      },
    ],
    closingTitle: "Prêt à lancer votre prochaine campagne WhatsApp ?",
  },
  pricing: {
    useCasesTitle: "Cas d’usage concrets",
    useCases: [
      { title: "Relance clients", text: "Débloquez vos paniers, vos rappels et vos confirmations directement sur WhatsApp.", imageAlt: "Aperçu du cas d'usage de relance client sur WhatsApp" },
      { title: "Notifications commande", text: "Tenez vos clients au courant de chaque étape avec messages et réponses en temps réel.", imageAlt: "Aperçu du cas d'usage de notifications de commande sur WhatsApp" },
    ],
    title: "Des plans simples pour démarrer et évoluer",
    subtitle: "Choisissez le volume qui correspond à votre croissance — équipes partagées sur Pro et MAX.",
    teamsFootnote:
      "Gratuit : pas de création d’équipe — vous pouvez rejoindre une équipe sur invitation. Pro : 2 équipes × 4 sièges. MAX : 4 équipes × 8 sièges (en tant que propriétaire). Les quotas WhatsApp restent ceux du propriétaire de l’équipe.",
    plans: [
      { name: "Gratuit", price: "0 €", secondaryPrice: "", desc: "Pour tester l’infrastructure et brancher un premier numéro.", cta: "Commencer", features: ["1 instance", "500 messages par mois", "1 000 requêtes API / mois", "1 clé API", "3 endpoints webhook", "10 groupes de contacts", "Campagnes : oui", "Vérifications de numéros : oui", "Webhooks : oui", "Notes vocales : oui", "Équipes : pas de création — rejoignez une équipe sur invitation"] },
      { name: "Pro", price: "29 €", secondaryPrice: "", desc: "Pour les équipes qui envoient plus, automatisent plus et monitorent mieux.", cta: "S’abonner", features: ["5 instances", "5 000 messages par mois", "50 000 requêtes API / mois", "10 clés API", "10 endpoints webhook", "50 groupes de contacts", "Campagnes : oui", "Vérifications de numéros : oui", "Webhooks : oui", "Notes vocales : oui", "Équipes : jusqu’à 2 espaces dont vous êtes propriétaire, 4 sièges par équipe"] },
      { name: "MAX", price: "79 €", secondaryPrice: "", desc: "Pour les volumes élevés, les workflows avancés et les opérations multi-numéros.", cta: "S’abonner", features: ["20 instances", "150 000 messages par mois", "500 000 requêtes API / mois", "10 clés API", "50 endpoints webhook", "Groupes de contacts illimités", "Campagnes : oui", "Vérifications de numéros : oui", "Webhooks : oui", "Notes vocales : oui", "Équipes : jusqu’à 4 espaces dont vous êtes propriétaire, 8 sièges par équipe"] },
    ],
    integrationTitle: "Pensé pour l’intégration dès le départ",
    integrationText: "Une API REST lisible, sécurisée et performante. Stable à brancher avec vos backends, votre CRM, votre bot ou votre orchestrateur.",
    docsCta: "Lire la documentation",
    apiCta: "Tester l’API",
    codeSample: `POST https://srv.msgflash.com/messages/send
{
  "to": "+33612345000",
  "type": "text",
  "message": "Votre commande #123 est prête.",
  "instanceId": "main"
}`,
  },
  faq: {
    title: "Questions fréquentes",
    items: [
      { question: "Comment démarrer avec la plateforme ?", answer: "Créez votre compte, connectez un numéro WhatsApp, puis utilisez l’API ou les webhooks pour lancer vos premiers scénarios." },
      { question: "Puis-je utiliser WhatsApp personnel ?", answer: "Oui, tant que le numéro est disponible pour la connexion QR. Vous pouvez aussi gérer plusieurs numéros selon votre plan." },
      { question: "Y a-t-il des webhooks ?", answer: "Oui. Livraisons, réponses, changements d’état et événements clés sont exposés pour vos workflows backend." },
    ],
  },
  cta: {
    title: "Prêt à connecter WhatsApp à votre produit ?",
    primary: "Créer un compte",
    secondary: "Voir la documentation",
  },
  footer: {
    product: "Produit",
    discover: "Découvrir",
    resources: "Ressources",
    legal: "Légal",
    description: "Infrastructure WhatsApp pour vos produits, automatisations et scénarios à volume.",
    designCredit: "Designed by Website24h",
    links: {
      automations: "Automations",
      campaigns: "Campagnes",
      wordpress: "WordPress",
      useCases: "Cas d'usage",
      pricing: "Tarifs",
      comparison: "Comparatif",
      risks: "Risques",
      blog: "Blog",
      faq: "FAQ",
      api: "API",
      docs: "Documentation",
      webhook: "Webhook",
      status: "Statut",
      privacy: "Confidentialité",
      terms: "Conditions",
      contact: "Contact",
    },
  },
  contact: {
    badge: "Contact",
    title: "Contactez-nous",
    subtitle: "Une question sur l’API, un besoin d’intégration ou un projet à cadrer ? L’équipe msgflash vous répond rapidement avec le bon niveau de détail.",
    emailDirect: "Email direct",
    support: "Support technique",
    supportText: "Pour les problèmes d'intégration et les incidents API.",
    responseTime: "Délai de réponse",
    responseText: "Nous répondons à toutes les demandes dans un délai de 24 heures ouvrées. Pour les incidents critiques sur des plans Pro et Plus, la réponse est prioritaire.",
    docs: "Documentation",
    docsText: "Consultez notre documentation complète pour intégrer l'API en quelques minutes.",
    writeUs: "Écrivez-nous",
    formDescription: "Décrivez votre besoin. Nous vous répondons avec les prochaines étapes, la bonne doc ou le bon interlocuteur.",
    firstName: "Prénom & Nom",
    email: "Email",
    subject: "Sujet",
    message: "Message",
    subjectOptions: ["Sélectionnez un sujet...", "Aide à l'intégration", "Question commerciale / Tarifs", "Signaler un bug", "Partenariat", "Autre"],
    submit: "Envoyer le message",
    privacy: "Politique de confidentialité",
  },
  legal: {
    badge: "Légal",
    contact: "Contact",
  },
  conditions: {
    title: "Conditions d'utilisation",
    subtitle: "Ce document définit le cadre contractuel d’utilisation de msgflash, les règles d’accès à la plateforme et les obligations applicables à tous les utilisateurs.",
    sideTitle: "Conditions",
    sideText: "Un cadre clair sur l’accès à la plateforme, l’usage autorisé, la facturation et la responsabilité.",
    intro: "Les présentes Conditions d'utilisation régissent votre accès et votre utilisation de la plateforme msgflash. Veuillez les lire attentivement avant d'utiliser nos services.",
    lastUpdated: "Dernière mise à jour : 28 mars 2026",
    sections: [],
  },
  privacy: {
    title: "Politique de confidentialité",
    subtitle: "Nous expliquons ici quelles données msgflash traite, pourquoi elles sont utilisées et quelles garanties de sécurité et de transparence encadrent leur traitement.",
    sideTitle: "Confidentialité",
    sideText: "Un résumé clair de notre cadre de collecte, conservation, sécurité et exercice des droits.",
    intro: "Chez msgflash, nous prenons la protection de vos données personnelles très au sérieux. Cette politique détaille quelles données nous collectons, pourquoi elles sont traitées et comment elles sont protégées.",
    lastUpdated: "Dernière mise à jour : 28 mars 2026",
    sections: [],
  },
}

const EN: LandingMessages = {
  nav: {
    features: "Features",
    campaigns: "Campaigns",
    pricing: "Pricing",
    faq: "FAQ",
    docs: "Documentation",
    getStarted: "Get started",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
  },
  hero: {
    title: "WHATSAPP API FOR DEVELOPERS — REST, WEBHOOKS, NO META APPROVAL HASSLE",
    description:
      "Send WhatsApp messages via a REST API without a heavy BSP workflow. Reliable webhooks, QR code onboarding, and native fits for n8n, Zapier, and Make — built for product-minded automation.",
    primaryCta: "Get started",
    secondaryCta: "View documentation",
  },
  logos: ["WhatsApp REST API", "Webhooks & events", "Text + media messages", "QR code & fast connect"],
  features: {
    title: "WhatsApp automation API built for developers",
    cards: [
      { title: "Send messages", description: "One REST surface for text, media, and replies — the straightforward way to send WhatsApp messages from your backend." },
      { title: "Schedule sends", description: "Trigger campaigns and reminders through a predictable API without a bulky BSP layer." },
      { title: "Launch campaigns", description: "Manage broadcast lists, track sends, and operate from the API or the console." },
      { title: "WhatsApp webhook integration", description: "Stream deliveries, replies, and failures in real time to orchestrate your own workflows." },
      { title: "n8n, Zapier, Make & your stack", description: "Wire n8n, Zapier, Make, or custom code to the same REST API and webhook events." },
    ],
    reasonsTitle: "Why engineering teams pick msgflash",
    reasons: [
      { title: "Simple API", text: "Readable docs and direct REST endpoints — less ceremony than a classic BSP platform." },
      { title: "QR code onboarding", text: "Connect a number with a QR code flow and ship without waiting on a drawn-out Meta approval path." },
      { title: "Useful webhooks", text: "WhatsApp webhook integration for deliveries, replies, and statuses, ready for your observability stack." },
      { title: "Built for makers", text: "Compatible with backend, no-code, and automation tools." },
      { title: "Clear pricing", text: "No hidden license, no surprise platform surcharge." },
      { title: "Solid path", text: "For a simple bot, a campaign, or a more complete orchestrator." },
    ],
  },
  howItWorks: {
    title: "How it works",
    steps: [
      { number: "01", title: "Create your account", text: "Fast signup, clean dashboard." },
      { number: "02", title: "Connect a number", text: "Use the standard QR Code flow." },
      { number: "03", title: "Integrate the API", text: "One simple route for POST, GET, and webhooks." },
      { number: "04", title: "Launch automation", text: "Send messages and track responses." },
    ],
    audienceTitle: "Built for teams that want to move fast",
    audiences: ["Makers", "Agencies", "E-commerce", "Developers"],
  },
  wordpress: {
    title: "WordPress x msgflash",
    subtitle: "The WordPress plugin that turns WooCommerce into a revenue-driven WhatsApp channel.",
    primaryCta: "Download the plugin (Free)",
    h1: "The Free WooCommerce WhatsApp Plugin for Abandoned Cart Recovery & Order Notifications",
    heroAccent:
      "Recover up to 15% of revenue: cart recovery, order tracking, and coupons — all on WhatsApp instead of relying on email alone.",
    description:
      "Free WooCommerce WhatsApp plugin: recover abandoned carts, send order tracking messages, and boost coupon usage up to 3x. Set up in under 5 minutes.",
    statsBoutiques: "Already 1,237 stores",
    statsMessages: "41,237 messages / 24h",
    license: "GPL v2 Licensed • WordPress Official Partner",
    setupTitle: "In 4 minutes, activate WhatsApp on your store",
    setupDescription: "No need to be a developer. Follow these 3 steps to activate the power of WhatsApp on your store.",
    tipLabel: "Msgflash tip",
    tipQuote: "98% of WhatsApp messages are read within 3 minutes. By making the phone field required, you are not just asking for a number, you are opening a direct sales channel that converts 5x better than email.",
    pillarsTitle: "3 core use cases",
    pillars: [
      { eyebrow: "Cart recovery", title: "High-touch cart recovery", description: "Auto-trigger 45 minutes after checkout abandonment to recover revenue without manual work.", result: "+22% cart recovery" },
      { eyebrow: "Shipping follow-up", title: "Instant order tracking", description: "When an order is marked shipped, the customer receives a clickable tracking number on WhatsApp.", result: "-40% support tickets" },
      { eyebrow: "Lead magnet", title: "WhatsApp lead magnet", description: "On every new customer signup, send a welcome coupon directly through WhatsApp.", result: "3x higher coupon use than email" },
    ],
    h2AbandonedTitle: "Recover Abandoned Carts on WhatsApp — Automatically",
    h2AbandonedBody:
      "Store owners search for WooCommerce abandoned cart WhatsApp solutions: msgflash sends the nudge when it matters, on a channel people actually read — higher recovery without spamming inboxes.",
    h2OrdersTitle: "Send WooCommerce Order Notifications via WhatsApp",
    h2OrdersBody:
      "Confirmations, shipped, and delivery updates become clear WhatsApp order notifications for WooCommerce — fewer “where is my order?” tickets than email-only workflows.",
  },
  homeSeo: {
    developerH2: "WhatsApp API without a classic BSP approval maze — built for developers",
    integrationH2: "WhatsApp webhook integration & REST sends",
    integrationBody:
      "Ship WhatsApp webhook integration for deliveries and replies, trigger automations from REST, and plug into n8n, Zapier, or Make — one documented API for builders and operators.",
  },
  campaigns: {
    metaTitle: "WhatsApp broadcast & campaign tool for marketing teams | msgflash",
    metaDescription:
      "Run WhatsApp broadcast campaigns, bulk sends, and marketing automation with delivery analytics — without giving up a clean API when your product team needs it. Start free.",
    eyebrow: "Marketing & growth",
    heroTitle: "WhatsApp broadcast campaigns, bulk sends, and marketing automation",
    heroLead:
      "msgflash is your WhatsApp broadcast campaign tool: lists, sends, and reporting — while staying API-first when engineering wants control.",
    primaryCta: "Create an account",
    secondaryCta: "Documentation",
    blocks: [
      {
        title: "WhatsApp broadcast campaign tool",
        body: "Target a list, launch a broadcast, and watch results roll in — built for teams searching for a WhatsApp broadcast campaign tool that still fits a modern stack.",
      },
      {
        title: "Send WhatsApp campaigns without Meta friction",
        body: "Same philosophy as our developer API: connect fast, operate your sends, and avoid getting stuck in heavyweight BSP processes for day-to-day campaigns.",
      },
      {
        title: "Bulk messaging & marketing automation",
        body: "From one-off promos to sequenced follow-ups — one foundation for WhatsApp bulk messaging and marketing automation tied to real business events.",
      },
      {
        title: "WhatsApp campaign analytics",
        body: "Deliveries, reads, and failures surface in the console and webhooks so you can feed dashboards — practical WhatsApp campaign analytics for iterating fast.",
      },
    ],
    closingTitle: "Ready to launch your next WhatsApp campaign?",
  },
  pricing: {
    useCasesTitle: "Concrete use cases",
    useCases: [
      { title: "Customer recovery", text: "Unlock carts, reminders, and confirmations directly on WhatsApp.", imageAlt: "Preview of the customer recovery use case on WhatsApp" },
      { title: "Order notifications", text: "Keep customers informed at every step with real-time messages and replies.", imageAlt: "Preview of the order notification use case on WhatsApp" },
    ],
    title: "Simple plans to start and grow",
    subtitle: "Pick the volume that fits your growth — shared teams on Pro and MAX.",
    teamsFootnote:
      "Free: you cannot create a team workspace — you can still join one when invited. Pro: 2 teams × 4 seats. MAX: 4 teams × 8 seats (as owner). WhatsApp quotas follow the team owner’s plan.",
    plans: [
      { name: "Free", price: "0 €", secondaryPrice: "", desc: "Test the infrastructure and connect a first number.", cta: "Get started", features: ["1 instance", "500 messages per month", "1,000 API requests / month", "1 API key", "3 webhook endpoints", "10 contact groups", "Campaigns: yes", "Number lookups: yes", "Webhooks: yes", "Voice notes: yes", "Teams: no workspace creation — join a team when invited"] },
      { name: "Pro", price: "29 €", secondaryPrice: "", desc: "For teams sending more, automating more, and monitoring better.", cta: "Subscribe", features: ["5 instances", "5,000 messages per month", "50,000 API requests / month", "10 API keys", "10 webhook endpoints", "50 contact groups", "Campaigns: yes", "Number lookups: yes", "Webhooks: yes", "Voice notes: yes", "Teams: up to 2 workspaces you own, 4 seats each"] },
      { name: "MAX", price: "79 €", secondaryPrice: "", desc: "For high volume, advanced workflows, and multi-number operations.", cta: "Subscribe", features: ["20 instances", "150,000 messages per month", "500,000 API requests / month", "10 API keys", "50 webhook endpoints", "Unlimited contact groups", "Campaigns: yes", "Number lookups: yes", "Webhooks: yes", "Voice notes: yes", "Teams: up to 4 workspaces you own, 8 seats each"] },
    ],
    integrationTitle: "Designed for integration from day one",
    integrationText: "A readable, secure, and performant REST API. Easy to plug into your backend, CRM, bot, or orchestrator.",
    docsCta: "Read the docs",
    apiCta: "Test the API",
    codeSample: `POST https://srv.msgflash.com/messages/send
{
  "to": "+33612345000",
  "type": "text",
  "message": "Your order #123 is ready.",
  "instanceId": "main"
}`,
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      { question: "How do I get started?", answer: "Create your account, connect a WhatsApp number, then use the API or webhooks to launch your first workflows." },
      { question: "Can I use a personal WhatsApp number?", answer: "Yes, as long as the number is available for QR connection. You can also manage multiple numbers depending on your plan." },
      { question: "Are webhooks available?", answer: "Yes. Deliveries, replies, status changes, and key events are exposed for your backend workflows." },
    ],
  },
  cta: {
    title: "Ready to connect WhatsApp to your product?",
    primary: "Create an account",
    secondary: "View documentation",
  },
  footer: {
    product: "Product",
    discover: "Discover",
    resources: "Resources",
    legal: "Legal",
    description: "WhatsApp infrastructure for your products, automations, and high-volume scenarios.",
    designCredit: "Designed by Website24h",
    links: {
      automations: "Automations",
      campaigns: "Campaigns",
      wordpress: "WordPress",
      useCases: "Use cases",
      pricing: "Pricing",
      comparison: "Comparison",
      risks: "Risks",
      blog: "Blog",
      faq: "FAQ",
      api: "API",
      docs: "Documentation",
      webhook: "Webhook",
      status: "Status",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
    },
  },
  contact: {
    badge: "Contact",
    title: "Get in touch",
    subtitle: "Have a question about the API, need an integration, or want to scope a project? The msgflash team will reply quickly with the right level of detail.",
    emailDirect: "Direct email",
    support: "Technical support",
    supportText: "For integration issues and API incidents.",
    responseTime: "Response time",
    responseText: "We reply to every request within 24 business hours. Critical incidents on Pro and Plus plans are prioritized.",
    docs: "Documentation",
    docsText: "Check our full documentation to integrate the API in minutes.",
    writeUs: "Write to us",
    formDescription: "Describe your need. We’ll reply with next steps, the right docs, or the right contact.",
    firstName: "First & Last name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    subjectOptions: ["Select a subject...", "Integration help", "Sales / pricing question", "Report a bug", "Partnership", "Other"],
    submit: "Send message",
    privacy: "Privacy policy",
  },
  legal: {
    badge: "Legal",
    contact: "Contact",
  },
  conditions: {
    title: "Terms of use",
    subtitle: "This document defines the contractual framework for using msgflash, platform access rules, and obligations for all users.",
    sideTitle: "Terms",
    sideText: "A clear framework for platform access, acceptable use, billing, and liability.",
    intro: "These Terms of use govern your access to and use of the msgflash platform. Please read them carefully before using our services.",
    lastUpdated: "Last updated: March 28, 2026",
    sections: [],
  },
  privacy: {
    title: "Privacy policy",
    subtitle: "Here we explain what data msgflash processes, why it is used, and which security and transparency safeguards apply.",
    sideTitle: "Privacy",
    sideText: "A clear summary of our collection, retention, security, and rights-exercise framework.",
    intro: "At msgflash, we take the protection of your personal data seriously. This policy explains what we collect, why it is processed, and how it is protected.",
    lastUpdated: "Last updated: March 28, 2026",
    sections: [],
  },
}

export function normalizeLandingLocale(value: string | null | undefined): LandingLocale {
  const lower = value?.toLowerCase() ?? ""
  if (lower.startsWith("en")) return "en"
  return "fr"
}

export function getLandingMessages(locale: LandingLocale) {
  return locale === "en" ? EN : FR
}
