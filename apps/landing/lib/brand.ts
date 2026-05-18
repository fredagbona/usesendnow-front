export const landingBrand = {
  name: "msgflash",
  domain: "msgflash.com",
  appUrl: "https://app.msgflash.com",
  docsUrl: "https://docs.msgflash.com",
  wordpressUrl: "/wordpress",
  campaignsUrl: "/campaigns",
  useCasesUrl: "/use-cases",
  comparisonUrl: "/comparatif",
  risksUrl: "/risques",
  blogUrl: "https://blog.msgflash.com",
  /** Include `/` so hash links work from `/wordpress`, `/campaigns`, etc. */
  homeAnchors: {
    features: "/#fonctionnalites",
    pricing: "/#tarifs",
    faq: "/#faq",
  },
  apiUrl: "https://srv.msgflash.com",
  supportEmail: "support@msgflash.com",
  helloEmail: "hello@msgflash.com",
  privacyEmail: "privacy@msgflash.com",
  tagline: "L'infrastructure WhatsApp pour vos produits et automatisations.",
} as const
