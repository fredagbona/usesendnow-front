export type LandingLocale = "fr" | "en"

type LandingMessages = {
  nav: {
    features: string
    pricing: string
    faq: string
    docs: string
    login: string
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
    secondaryCta: string
    hook: string
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
  }
  pricing: {
    useCasesTitle: string
    useCases: Array<{ title: string; text: string; imageAlt: string }>
    title: string
    subtitle: string
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
    resources: string
    legal: string
    description: string
    designCredit: string
    links: {
      automations: string
      wordpress: string
      pricing: string
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
    pricing: "Tarifs",
    faq: "FAQ",
    docs: "Documentation",
    login: "Connexion",
    getStarted: "Commencer",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    language: "Langue",
  },
  hero: {
    title: "L’API WHATSAPP LA PLUS SIMPLE POUR LANCER VOS AUTOMATISATIONS",
    description: "Connectez un numéro WhatsApp, envoyez des messages, lancez des campagnes et intégrez vos outils favoris en quelques minutes.",
    primaryCta: "Commencer",
    secondaryCta: "Voir la documentation",
  },
  logos: ["API REST simple", "Webhook events", "Messages texte + médias", "Connexion rapide"],
  features: {
    title: "Construisez rapidement vos automatisations WhatsApp",
    cards: [
      { title: "Envoyer des messages", description: "Un point unique pour vos messages textuels, médias et réponses simples." },
      { title: "Planifier des envois", description: "Déclenchez vos campagnes et vos rappels depuis une API claire et rapide." },
      { title: "Lancer des campagnes", description: "Gérez vos listes de diffusion et suivez les performances en temps réel." },
      { title: "Recevoir des événements", description: "Récupérez vos webhooks pour chaque livraison ou réponse utilisateur." },
      { title: "Connecter vos outils", description: "Branchez votre backend, n8n, Zapier, Make ou vos workflows internes sans friction." },
    ],
    reasonsTitle: "Pourquoi utiliser notre plateforme plutôt que bricoler ?",
    reasons: [
      { title: "API simple", text: "Une documentation claire et des endpoints directs, sans détour." },
      { title: "Connexion rapide", text: "Scannez le QR Code et mettez votre intégration en ligne rapidement." },
      { title: "Webhooks utiles", text: "Recevez les livraisons, réponses et erreurs dès qu'elles arrivent." },
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
    secondaryCta: "Télécharger le guide",
    hook: "L'ancien marketing WooCommerce est mort. Récupérez 15% de votre CA via WhatsApp.",
    description: "Ne laissez plus vos paniers abandonnés au hasard des emails. Connectez msgflash à votre boutique en 4 minutes 27 secondes.",
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
  },
  pricing: {
    useCasesTitle: "Cas d’usage concrets",
    useCases: [
      { title: "Relance clients", text: "Débloquez vos paniers, vos rappels et vos confirmations directement sur WhatsApp.", imageAlt: "Aperçu du cas d'usage de relance client sur WhatsApp" },
      { title: "Notifications commande", text: "Tenez vos clients au courant de chaque étape avec messages et réponses en temps réel.", imageAlt: "Aperçu du cas d'usage de notifications de commande sur WhatsApp" },
    ],
    title: "Des plans simples pour démarrer et évoluer",
    subtitle: "Choisissez le volume qui correspond à votre croissance.",
    plans: [
      { name: "Gratuit", price: "0 €", secondaryPrice: "", desc: "Pour tester l’infrastructure et brancher un premier numéro.", cta: "Commencer", features: ["1 instance", "20 messages / statuts par mois", "1 000 requêtes API / mois", "1 clé API", "0 endpoint webhook", "2 groupes de contacts", "Campagnes : non", "Statuts WhatsApp : non", "Webhooks : non", "Notes vocales : oui"] },
      { name: "Starter", price: "9 €", secondaryPrice: "", desc: "Pour lancer vos premiers automatismes en production.", cta: "Commencer", features: ["2 instances", "5 000 messages / statuts par mois", "10 000 requêtes API / mois", "3 clés API", "3 endpoints webhook", "10 groupes de contacts", "Campagnes : oui", "Statuts WhatsApp : non", "Webhooks : oui", "Notes vocales : oui"] },
      { name: "Pro", price: "19 €", secondaryPrice: "", desc: "Pour les équipes qui envoient plus, automatisent plus et monitorent mieux.", cta: "S’abonner", features: ["5 instances", "5 000 messages / statuts par mois", "50 000 requêtes API / mois", "10 clés API", "10 endpoints webhook", "50 groupes de contacts", "Campagnes : oui", "Statuts WhatsApp : oui", "Webhooks : oui", "Notes vocales : oui"] },
      { name: "Plus", price: "39 €", secondaryPrice: "", desc: "Pour les volumes élevés, les workflows avancés et les opérations multi-numéros.", cta: "Contacter", features: ["20 instances", "150 000 messages / statuts par mois", "500 000 requêtes API / mois", "10 clés API", "50 endpoints webhook", "Groupes de contacts illimités", "Campagnes : oui", "Statuts WhatsApp : oui", "Webhooks : oui", "Notes vocales : oui"] },
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
    resources: "Ressources",
    legal: "Légal",
    description: "Infrastructure WhatsApp pour vos produits, automatisations et scénarios à volume.",
    designCredit: "Designed by Website24h",
    links: {
      automations: "Automations",
      wordpress: "WordPress",
      pricing: "Tarifs",
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
    pricing: "Pricing",
    faq: "FAQ",
    docs: "Documentation",
    login: "Login",
    getStarted: "Get started",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
  },
  hero: {
    title: "THE EASIEST WHATSAPP API TO LAUNCH YOUR AUTOMATIONS",
    description: "Connect a WhatsApp number, send messages, launch campaigns, and plug into your favorite tools in minutes.",
    primaryCta: "Get started",
    secondaryCta: "View documentation",
  },
  logos: ["Simple REST API", "Webhook events", "Text + media messages", "Fast connection"],
  features: {
    title: "Build WhatsApp automations quickly",
    cards: [
      { title: "Send messages", description: "A single place for text messages, media, and simple replies." },
      { title: "Schedule sends", description: "Trigger campaigns and reminders through a clear and fast API." },
      { title: "Launch campaigns", description: "Manage broadcast lists and monitor performance in real time." },
      { title: "Receive events", description: "Capture webhooks for every delivery or user reply." },
      { title: "Connect your tools", description: "Plug in your backend, n8n, Zapier, Make, or internal workflows without friction." },
    ],
    reasonsTitle: "Why use our platform instead of hacking it together?",
    reasons: [
      { title: "Simple API", text: "Clear docs and direct endpoints, no detours." },
      { title: "Fast setup", text: "Scan the QR Code and get your integration live quickly." },
      { title: "Useful webhooks", text: "Receive deliveries, replies, and errors as soon as they happen." },
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
    secondaryCta: "Download the guide",
    hook: "The old WooCommerce marketing playbook is dead. Recover 15% of your revenue via WhatsApp.",
    description: "Stop leaving abandoned carts to email alone. Connect msgflash to your store in 4 minutes 27 seconds.",
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
  },
  pricing: {
    useCasesTitle: "Concrete use cases",
    useCases: [
      { title: "Customer recovery", text: "Unlock carts, reminders, and confirmations directly on WhatsApp.", imageAlt: "Preview of the customer recovery use case on WhatsApp" },
      { title: "Order notifications", text: "Keep customers informed at every step with real-time messages and replies.", imageAlt: "Preview of the order notification use case on WhatsApp" },
    ],
    title: "Simple plans to start and grow",
    subtitle: "Choose the volume that matches your growth.",
    plans: [
      { name: "Free", price: "0 €", secondaryPrice: "", desc: "Test the infrastructure and connect a first number.", cta: "Get started", features: ["1 instance", "20 messages / statuses per month", "1,000 API requests / month", "1 API key", "0 webhook endpoints", "2 contact groups", "Campaigns: no", "WhatsApp statuses: no", "Webhooks: no", "Voice notes: yes"] },
      { name: "Starter", price: "9 €", secondaryPrice: "", desc: "Launch your first automations in production.", cta: "Get started", features: ["2 instances", "5,000 messages / statuses per month", "10,000 API requests / month", "3 API keys", "3 webhook endpoints", "10 contact groups", "Campaigns: yes", "WhatsApp statuses: no", "Webhooks: yes", "Voice notes: yes"] },
      { name: "Pro", price: "19 €", secondaryPrice: "", desc: "For teams sending more, automating more, and monitoring better.", cta: "Subscribe", features: ["5 instances", "5,000 messages / statuses per month", "50,000 API requests / month", "10 API keys", "10 webhook endpoints", "50 contact groups", "Campaigns: yes", "WhatsApp statuses: yes", "Webhooks: yes", "Voice notes: yes"] },
      { name: "Plus", price: "39 €", secondaryPrice: "", desc: "For high volume, advanced workflows, and multi-number operations.", cta: "Contact us", features: ["20 instances", "150,000 messages / statuses per month", "500,000 API requests / month", "10 API keys", "50 webhook endpoints", "Unlimited contact groups", "Campaigns: yes", "WhatsApp statuses: yes", "Webhooks: yes", "Voice notes: yes"] },
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
    resources: "Resources",
    legal: "Legal",
    description: "WhatsApp infrastructure for your products, automations, and high-volume scenarios.",
    designCredit: "Designed by Website24h",
    links: {
      automations: "Automations",
      wordpress: "WordPress",
      pricing: "Pricing",
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
