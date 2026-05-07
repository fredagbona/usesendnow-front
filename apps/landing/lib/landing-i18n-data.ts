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
  comparatif: {
    metaTitle: string
    metaDescription: string
    eyebrow: string
    title: string
    subtitle: string
    primary: string
    secondary: string
    tableHeaders: string[]
    rows: Array<{
      criterion: string
      msgflash: string
      twilio: string
      dialog360: string
      wati: string
    }>
    winTitle: string
    winPoints: string[]
    loseTitle: string
    losePoints: string[]
    faqTitle: string
    faqItems: Array<{ question: string; answer: string }>
  }
  risques: {
    metaTitle: string
    metaDescription: string
    eyebrow: string
    title: string
    subtitle: string
    primary: string
    secondary: string
    risks: Array<{
      title: string
      label: string
      description: string
      mitigation: string[]
    }>
    mythTitle: string
    mythRows: Array<{ myth: string; reality: string }>
    closingTitle: string
    closingText: string
  }
  useCasesPage: {
    metaTitle: string
    metaDescription: string
    eyebrow: string
    title: string
    subtitle: string
    primary: string
    secondary: string
    cases: Array<{
      title: string
      label: string
      problem: string
      solution: string
      result: string
      limits: string[]
    }>
    summaryTitle: string
    summaryRows: Array<{ useCase: string; trigger: string; benefit: string }>
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
      campaigns: string
      wordpress: string
      comparatif: string
      risques: string
      useCases: string
      pricing: string
      api: string
      docs: string
      webhook: string
      status: string
      blog: string
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
    subtitle: "Choisissez le volume qui correspond à votre croissance.",
    plans: [
      { name: "Gratuit", price: "0 €", secondaryPrice: "", desc: "Pour tester l’infrastructure et brancher un premier numéro.", cta: "Commencer", features: ["1 instance", "20 messages / statuts par mois", "1 000 requêtes API / mois", "1 clé API", "0 endpoint webhook", "2 groupes de contacts", "Campagnes : non", "Webhooks : non", "Notes vocales : oui"] },
      { name: "Starter", price: "9 €", secondaryPrice: "", desc: "Pour lancer vos premiers automatismes en production.", cta: "Commencer", features: ["2 instances", "5 000 messages / statuts par mois", "10 000 requêtes API / mois", "3 clés API", "3 endpoints webhook", "10 groupes de contacts", "Campagnes : oui", "Webhooks : oui", "Notes vocales : oui"] },
      { name: "Pro", price: "19 €", secondaryPrice: "", desc: "Pour les équipes qui envoient plus, automatisent plus et monitorent mieux.", cta: "S’abonner", features: ["5 instances", "25 000 messages / statuts par mois", "100 000 requêtes API / mois", "10 clés API", "10 endpoints webhook", "50 groupes de contacts", "Campagnes : oui", "Webhooks : oui", "Notes vocales : oui"] },
      { name: "Plus", price: "39 €", secondaryPrice: "", desc: "Pour les volumes élevés, les workflows avancés et les opérations multi-numéros.", cta: "Contacter", features: ["20 instances", "150 000 messages / statuts par mois", "500 000 requêtes API / mois", "10 clés API", "50 endpoints webhook", "Groupes de contacts illimités", "Campagnes : oui", "Webhooks : oui", "Notes vocales : oui"] },
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
  comparatif: {
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
      { criterion: "Warmup & protection anti-ban", msgflash: "SafetyScore + warnings", twilio: "Non", dialog360: "Non", wati: "Non" },
      { criterion: "Webhooks", msgflash: "Livraison, réponses, erreurs", twilio: "Complets", dialog360: "Complets", wati: "Basiques" },
      { criterion: "n8n / Zapier / Make", msgflash: "Natif", twilio: "Via HTTP", dialog360: "Non", wati: "Limité" },
      { criterion: "SLA / Uptime", msgflash: "99% (Pro+)", twilio: "99.99%", dialog360: "99.9%", wati: "99.9%" },
      { criterion: "Support", msgflash: "Discord + Email", twilio: "Enterprise", dialog360: "Email", wati: "Chat" },
      { criterion: "Ban risk", msgflash: "Moyen (warmup actif)", twilio: "Faible", dialog360: "Faible", wati: "Faible" },
      { criterion: "Idéal pour", msgflash: "Devs, makers, automations", twilio: "Enterprise, devs custom", dialog360: "Devs API-first", wati: "SMB no-code" },
    ],
    winTitle: "Quand choisir MsgFlash",
    winPoints: [
      "Vous voulez shipper aujourd'hui, pas dans 2 semaines",
      "Vous envoyez < 15 000 messages/mois",
      "Vous intégrez n8n, Zapier, ou votre backend custom",
      "Vous préférez un coût fixe prévisible",
      "Vous voulez un système qui vous protège de vos propres erreurs",
      "Vous utilisez WhatsApp pour des notifications transactionnelles",
    ],
    loseTitle: "Quand NE PAS choisir MsgFlash",
    losePoints: [
      "Vous avez besoin du green tick vérifié",
      "Vous envoyez > 50 000 messages/mois",
      "Vous opérez dans la santé ou la finance",
      "Vous ne pouvez pas vous permettre de perdre un numéro",
      "Vous avez besoin de templates pré-approuvés",
    ],
    faqTitle: "FAQ Comparatif",
    faqItems: [
      { question: "Le warmup bloque mes envois ?", answer: "Non. La V1 est en warnings only : elle calcule le risque, vous alerte, mais ne bloque pas systématiquement." },
      { question: "Puis-je passer de MsgFlash à Twilio plus tard ?", answer: "Oui, mais vous devrez re-valider votre numéro chez Meta et recréer vos templates. Prévoyez 2 semaines de transition." },
      { question: "MsgFlash est-il illégal ?", answer: "Non. Nous utilisons le protocole WhatsApp Web. Ce n'est pas officiel, ce n'est pas illégal." },
      { question: "Pourquoi 360dialog coûte 49 € / mois sans interface ?", answer: "Parce qu'ils paient Meta pour être BSP officiel. Vous payez cette certification, pas la technologie." },
    ],
  },
  risques: {
    metaTitle: "Les risques de MsgFlash — qu'on ne vous cache rien",
    metaDescription:
      "Nous listons clairement les risques, limites et mitigations de MsgFlash : ban, green tick, templates, dépendance protocole.",
    eyebrow: "Risques",
    title: "Les risques de MsgFlash — qu'on ne vous cache rien",
    subtitle:
      "Nous ne sommes pas l'API officielle. Voici ce que ça signifie concrètement, et comment notre système de warmup vous protège de vos propres erreurs.",
    primary: "Tester gratuitement",
    secondary: "Voir le comparatif",
    risks: [
      {
        title: "Risque 1 : Bannissement du numéro",
        label: "🟡",
        description:
          "WhatsApp détecte les comportements automatisés et bannit le numéro.",
        mitigation: [
          "Utilisez un numéro dédié",
          "Variez le contenu",
          "Respectez les horaires",
          "Laissez des délais",
          "Suivez les recommandations du warmup",
        ],
      },
      {
        title: "Risque 2 : Pas de green tick vérifié",
        label: "🟡",
        description:
          "Le green tick certifie que votre numéro appartient bien à votre marque.",
        mitigation: ["Réservez MsgFlash aux usages où la vérification n'est pas critique", "Préférez l'API officielle pour les marques publiques ou régulées"],
      },
      {
        title: "Risque 3 : Pas de templates pré-approuvés",
        label: "🟡",
        description:
          "L'API officielle oblige à soumettre chaque message marketing à Meta pour validation.",
        mitigation: ["Évitez le spam", "Restez sur des usages transactionnels", "Contrôlez la qualité et la fréquence"],
      },
      {
        title: "Risque 4 : Dépendance au protocole WhatsApp Web",
        label: "🟡",
        description:
          "MsgFlash repose sur le protocole WhatsApp Web. Si Meta change ce protocole, nous devons adapter la stack rapidement.",
        mitigation: ["Monitoring 24/7", "Tests sur les versions bêta", "Communication transparente", "Backup technique"],
      },
    ],
    mythTitle: "Ce qui n'est pas un risque",
    mythRows: [
      { myth: "C'est illégal", reality: "Non. Nous utilisons le protocole WhatsApp Web." },
      { myth: "Vos données sont volées", reality: "Non. Nous ne stockons pas le contenu, seulement les métadonnées utiles." },
      { myth: "Meta va vous poursuivre", reality: "Non. Meta bannit les numéros, elle ne poursuit pas les utilisateurs de librairies tierces." },
      { myth: "Le warmup bloque tout", reality: "Non. La V1 est warnings only." },
    ],
    closingTitle: "Notre recommandation finale",
    closingText:
      "Utilisez MsgFlash si vous acceptez le risque de ban comme coût de faire business, si vous avez un numéro dédié, et si vous voulez itérer vite. N'utilisez pas MsgFlash si votre numéro WhatsApp est critique ou si vous avez besoin du green tick.",
  },
  useCasesPage: {
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
      },
      {
        title: "SaaS — Alertes monitoring & DevOps",
        label: "Use Case 2",
        problem: "Votre serveur tombe à 3h du matin. L'email d'alerte est noyé dans la boîte de réception. Vous voulez être réveillé immédiatement.",
        solution:
          "Datadog/UptimeRobot → webhook → MsgFlash API → WhatsApp\n\n```bash\ncurl -X POST https://api.msgflash.com/v1/messages \\\n  -H \"Authorization: Bearer $MSGFLASH_TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"to\": \"+33612345678\",\n    \"type\": \"text\",\n    \"message\": \"🚨 ALERTE CRITIQUE\\n\\nServeur: prod-db-01\\nStatus: DOWN\\nError: Connection timeout\\nTime: 2026-05-07 03:24 UTC\\n\\nDashboard: https://status.monapp.com\",\n    \"instanceId\": \"monitoring\"\n  }'\n```",
        result: "Temps de réaction < 2 minutes.",
        limits: ["Pas d'escalade automatique native", "Pas d'intégration PagerDuty native"],
      },
      {
        title: "Agences — Multi-comptes clients",
        label: "Use Case 3",
        problem: "Vous gérez plusieurs clients, plusieurs numéros et plusieurs contextes. Vous voulez un cadre propre.",
        solution:
          "Un compte par client, ou une instance dédiée par opération. Les tags et les groupes permettent d'isoler les flux sans multiplier les outils.",
        result: "Moins de confusion, plus de contrôle, onboarding plus rapide.",
        limits: ["Gouvernance à définir", "Bonnes pratiques d'accès à mettre en place"],
      },
      {
        title: "Santé — Rappels de rendez-vous",
        label: "Use Case 4",
        problem: "Les patients oublient leurs rendez-vous et les no-shows coûtent cher.",
        solution:
          "Un CRM ou un agenda envoie un rappel WhatsApp avec date, heure et lien de confirmation. Les équipes réduisent les oublis sans ajouter de canal compliqué.",
        result: "Moins de no-shows et plus de confirmations.",
        limits: ["Sujet sensible sur la conformité", "Opt-in indispensable"],
      },
      {
        title: "Événementiel — Communication participants",
        label: "Use Case 5",
        problem: "Les changements de dernière minute n'arrivent pas à tout le monde.",
        solution:
          "Envoyez les infos de session, les changements de salle et les instructions pratiques par WhatsApp, avec suivi des statuts pour savoir qui a reçu quoi.",
        result: "Une meilleure diffusion des informations utiles.",
        limits: ["Gestion de gros volumes à cadrer", "Opt-in recommandé"],
      },
      {
        title: "Logistique — Suivi de livraison",
        label: "Use Case 6",
        problem: "Les clients demandent sans cesse où est leur colis.",
        solution:
          "À chaque changement de statut, un message WhatsApp informe le client avec son numéro de suivi et les dernières étapes.",
        result: "Moins de tickets support et plus de visibilité.",
        limits: ["Connexion aux systèmes logistiques à prévoir"],
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
      campaigns: "Campagnes",
      wordpress: "WordPress",
      comparatif: "Comparatif",
      risques: "Risques",
      useCases: "Cas d’usage",
      pricing: "Tarifs",
      api: "API",
      docs: "Documentation",
      webhook: "Webhook",
      status: "Statut",
      blog: "Blog",
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
    subtitle: "Choose the volume that matches your growth.",
    plans: [
      { name: "Free", price: "0 €", secondaryPrice: "", desc: "Test the infrastructure and connect a first number.", cta: "Get started", features: ["1 instance", "20 messages / statuses per month", "1,000 API requests / month", "1 API key", "0 webhook endpoints", "2 contact groups", "Campaigns: no", "Webhooks: no", "Voice notes: yes"] },
      { name: "Starter", price: "9 €", secondaryPrice: "", desc: "Launch your first automations in production.", cta: "Get started", features: ["2 instances", "5,000 messages / statuses per month", "10,000 API requests / month", "3 API keys", "3 webhook endpoints", "10 contact groups", "Campaigns: yes", "Webhooks: yes", "Voice notes: yes"] },
      { name: "Pro", price: "19 €", secondaryPrice: "", desc: "For teams sending more, automating more, and monitoring better.", cta: "Subscribe", features: ["5 instances", "25,000 messages / statuses per month", "100,000 API requests / month", "10 API keys", "10 webhook endpoints", "50 contact groups", "Campaigns: yes", "Webhooks: yes", "Voice notes: yes"] },
      { name: "Plus", price: "39 €", secondaryPrice: "", desc: "For high volume, advanced workflows, and multi-number operations.", cta: "Contact us", features: ["20 instances", "150,000 messages / statuses per month", "500,000 API requests / month", "10 API keys", "50 webhook endpoints", "Unlimited contact groups", "Campaigns: yes", "Webhooks: yes", "Voice notes: yes"] },
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
  comparatif: {
    metaTitle: "MsgFlash vs Twilio, 360dialog, Wati: the honest comparison (2026)",
    metaDescription: "Transparent comparison of MsgFlash, Twilio, 360dialog and Wati: pricing, setup, webhooks, risks, and real-world usage.",
    eyebrow: "Comparison",
    title: "MsgFlash vs Twilio, 360dialog, Wati: the honest comparison (2026)",
    subtitle: "No fluff. We show where we win, where we lose, and why some teams still choose the official API despite the price.",
    primary: "See the risks",
    secondary: "Start free",
    tableHeaders: ["Criterion", "MsgFlash", "Twilio", "360dialog", "Wati"],
    rows: [
      { criterion: "Monthly price", msgflash: "$9 to $39", twilio: "$0 + $0.005 / msg", dialog360: "€49 / month + Meta", wati: "$49 / month + Meta" },
      { criterion: "Cost per message (France)", msgflash: "Included in the subscription", twilio: "~$0.143 marketing + $0.005 markup", dialog360: "~$0.143 marketing + $0.005 markup", wati: "Meta pass-through + plan" },
      { criterion: "Setup", msgflash: "2 min (QR code)", twilio: "1-2 weeks (validation)", dialog360: "1-2 weeks (validation)", wati: "< 1 hour" },
      { criterion: "Meta validation", msgflash: "Not required", twilio: "Required", dialog360: "Required", wati: "Required" },
      { criterion: "Green tick", msgflash: "No", twilio: "Yes", dialog360: "Yes", wati: "Yes" },
      { criterion: "Pre-approved templates", msgflash: "No", twilio: "Yes", dialog360: "Yes", wati: "Yes" },
      { criterion: "Warmup & anti-ban protection", msgflash: "SafetyScore + warnings", twilio: "No", dialog360: "No", wati: "No" },
      { criterion: "Webhooks", msgflash: "Delivery, replies, errors", twilio: "Full", dialog360: "Full", wati: "Basic" },
      { criterion: "n8n / Zapier / Make", msgflash: "Native", twilio: "Via HTTP", dialog360: "No", wati: "Limited" },
      { criterion: "SLA / Uptime", msgflash: "99% (Pro+)", twilio: "99.99%", dialog360: "99.9%", wati: "99.9%" },
      { criterion: "Support", msgflash: "Discord + Email", twilio: "Enterprise", dialog360: "Email", wati: "Chat" },
      { criterion: "Ban risk", msgflash: "Medium (warmup active)", twilio: "Low", dialog360: "Low", wati: "Low" },
      { criterion: "Best for", msgflash: "Devs, makers, automations", twilio: "Enterprise, custom devs", dialog360: "API-first devs", wati: "SMB no-code" },
    ],
    winTitle: "When to choose MsgFlash",
    winPoints: [
      "You want to ship today, not in 2 weeks",
      "You send < 25,000 messages/month",
      "You integrate n8n, Zapier, or your custom backend",
      "You prefer predictable fixed pricing over Meta billing surprises",
      "You want a system that protects you from your own mistakes",
      "You use WhatsApp for transactional notifications",
    ],
    loseTitle: "When NOT to choose MsgFlash",
    losePoints: [
      "You need a verified green tick",
      "You send > 150,000 messages/month",
      "You operate in health or finance",
      "You cannot afford to lose a number",
      "You need pre-approved templates",
    ],
    faqTitle: "Comparison FAQ",
    faqItems: [
      { question: "Does warmup block my sends?", answer: "No. V1 is warnings only: it calculates risk, warns you, but does not systematically block sends." },
      { question: "Can I move from MsgFlash to Twilio later?", answer: "Yes, but you will need to re-validate your number with Meta and recreate your templates. Plan for a 2-week transition." },
      { question: "Is MsgFlash illegal?", answer: "No. We use the WhatsApp Web protocol. It is not official, but it is not illegal." },
      { question: "Why does 360dialog cost €49 / month without a UI?", answer: "Because they pay Meta to be an official BSP. You are paying for certification, not the technology." },
    ],
  },
  risques: {
    metaTitle: "MsgFlash risks — what you need to know before you start",
    metaDescription: "We clearly list the risks, limits, and mitigations of MsgFlash: bans, green tick, templates, and protocol dependency.",
    eyebrow: "Risks",
    title: "MsgFlash risks — nothing hidden",
    subtitle: "We are not the official API. Here is what that means in practice, and how our warmup system helps reduce mistakes.",
    primary: "Start free",
    secondary: "See the comparison",
    risks: [
      {
        title: "Risk 1: Number bans",
        label: "🟡",
        description:
          "WhatsApp detects automated behavior and bans the number.",
        mitigation: ["Use a dedicated number", "Vary content", "Respect quiet hours", "Leave delays", "Follow warmup recommendations"],
      },
      {
        title: "Risk 2: No verified green tick",
        label: "🟡",
        description:
          "The green tick certifies that your number belongs to your brand.",
        mitigation: ["Use MsgFlash where verification is not critical", "Prefer the official API for public or regulated brands"],
      },
      {
        title: "Risk 3: No pre-approved templates",
        label: "🟡",
        description:
          "The official API requires every marketing message to be submitted to Meta for approval.",
        mitigation: ["Avoid spam", "Stay transactional", "Control quality and frequency"],
      },
      {
        title: "Risk 4: WhatsApp Web protocol dependency",
        label: "🟡",
        description:
          "MsgFlash relies on the WhatsApp Web protocol. If Meta changes it, we need to adapt the stack quickly.",
        mitigation: ["24/7 monitoring", "Beta release testing", "Transparent communication", "Technical backup"],
      },
    ],
    mythTitle: "What is not a risk",
    mythRows: [
      { myth: "It is illegal", reality: "No. We use the WhatsApp Web protocol." },
      { myth: "Your data is stolen", reality: "No. We do not store message content, only useful metadata." },
      { myth: "Meta will sue you", reality: "No. Meta bans numbers; it does not sue users of third-party libraries." },
      { myth: "Warmup blocks everything", reality: "No. V1 is warnings only." },
    ],
    closingTitle: "Our final recommendation",
    closingText:
      "Use MsgFlash if you accept ban risk as the cost of doing business, if you have a dedicated number, and if you want to iterate quickly. Do not use MsgFlash if your WhatsApp number is critical or if you need a green tick.",
  },
  useCasesPage: {
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
      },
      {
        title: "SaaS — Monitoring & DevOps alerts",
        label: "Use Case 2",
        problem: "Your server goes down at 3 a.m. The alert email is buried in the inbox. You want to be woken up immediately.",
        solution:
          "Datadog/UptimeRobot → webhook → MsgFlash API → WhatsApp\n\n```bash\ncurl -X POST https://api.msgflash.com/v1/messages \\\n  -H \"Authorization: Bearer $MSGFLASH_TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"to\": \"+33612345678\",\n    \"type\": \"text\",\n    \"message\": \"🚨 CRITICAL ALERT\\n\\nServer: prod-db-01\\nStatus: DOWN\\nError: Connection timeout\\nTime: 2026-05-07 03:24 UTC\\n\\nDashboard: https://status.monapp.com\",\n    \"instanceId\": \"monitoring\"\n  }'\n```",
        result: "Response time under 2 minutes.",
        limits: ["No native escalation", "No native PagerDuty integration"],
      },
      {
        title: "Agencies — Multi-client operations",
        label: "Use Case 3",
        problem: "You manage multiple clients, numbers, and contexts. You need a clean operating model.",
        solution:
          "One account per client, or one instance per operation. Tags and groups help isolate flows without multiplying tools.",
        result: "Less confusion, more control, faster onboarding.",
        limits: ["Governance to define", "Access best practices to set up"],
      },
      {
        title: "Health — Appointment reminders",
        label: "Use Case 4",
        problem: "Patients forget appointments and no-shows are costly.",
        solution:
          "A CRM or calendar sends a WhatsApp reminder with time, date, and a confirmation link. Teams reduce missed appointments without adding a complex channel.",
        result: "Fewer no-shows and more confirmations.",
        limits: ["Sensitive compliance context", "Opt-in required"],
      },
      {
        title: "Events — Participant communication",
        label: "Use Case 5",
        problem: "Last-minute changes do not reach everyone.",
        solution:
          "Send session details, room changes, and practical instructions over WhatsApp, with status tracking to know who received what.",
        result: "Better delivery of useful information.",
        limits: ["Large volume management to plan", "Opt-in recommended"],
      },
      {
        title: "Logistics — Delivery tracking",
        label: "Use Case 6",
        problem: "Customers keep asking where their parcel is.",
        solution:
          "On every status change, a WhatsApp message updates the customer with their tracking number and latest step.",
        result: "Fewer support tickets and more visibility.",
        limits: ["Logistics system integration required"],
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
      campaigns: "Campaigns",
      wordpress: "WordPress",
      comparatif: "Comparison",
      risques: "Risks",
      useCases: "Use cases",
      pricing: "Pricing",
      api: "API",
      docs: "Documentation",
      webhook: "Webhook",
      status: "Status",
      blog: "Blog",
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
