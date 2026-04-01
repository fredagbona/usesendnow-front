const ERROR_MESSAGES: Record<string, string> = {
  MAX_INSTANCES_REACHED: "Limite d'instances atteinte pour votre plan.",
  API_KEYS_NOT_AVAILABLE_ON_PLAN: "Les clés API ne sont pas disponibles sur le plan gratuit.",
  MAX_API_KEYS_REACHED: "Limite de clés API atteinte pour votre plan.",
  WEBHOOKS_NOT_AVAILABLE_ON_PLAN: "Les webhooks ne sont pas disponibles sur votre plan.",
  MAX_WEBHOOK_ENDPOINTS_REACHED: "Limite d'endpoints webhook atteinte.",
  CAMPAIGNS_NOT_AVAILABLE_ON_PLAN: "Les campagnes ne sont pas disponibles sur votre plan.",
  STATUSES_NOT_AVAILABLE_ON_PLAN: "Les statuts ne sont pas disponibles sur votre plan.",
  MONTHLY_OUTBOUND_QUOTA_EXCEEDED: "Quota mensuel d'envoi atteint.",
  MONTHLY_API_REQUEST_QUOTA_EXCEEDED: "Quota mensuel de requêtes API atteint.",
  SUBSCRIPTION_INACTIVE: "Votre abonnement est inactif.",
  UNAUTHORIZED: "Session expirée. Veuillez vous reconnecter.",
  FORBIDDEN: "Vous n'avez pas accès à cette ressource.",
  NOT_FOUND: "Ressource introuvable.",
  VALIDATION_ERROR: "Données invalides. Vérifiez le formulaire.",
  CONFLICT: "Un conflit existe avec une ressource existante.",
}

export const getErrorMessage = (code: string): string =>
  ERROR_MESSAGES[code] ?? "Une erreur est survenue. Réessayez."
