# SPEC — Portal / Billing
App: portal
Route: /billing
Auth: required
Status: ready

---

## Purpose
Vue complète de la facturation : plan actuel, consommation du mois, comparatif des plans, et gestion de l'abonnement (upgrade, annulation).
Les prix sont affichés en FCFA (principal) et EUR (secondaire).

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/billing/subscription | JWT | Plan actuel + usage + période |
| GET | /api/billing/plans | public | Catalogue de tous les plans |
| POST | /api/billing/checkout | JWT | Créer une session de paiement |
| POST | /api/billing/cancel | JWT | Annuler l'abonnement |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : titre "Billing & Plans"
- **CurrentPlanCard** : résumé du plan actif + usage
- **UsageMetrics** : barres de progression pour chaque quota
- **PlansComparison** : grille des 4 plans (Free / Starter / Pro / Plus)
- **DangerZone** : bouton d'annulation (si plan payant actif)

---

## Composants de la page

### CurrentPlanCard
Props :
```ts
{
  subscription: Subscription
  usage: {
    effectiveOutboundUsage: number
    apiRequestsCount: number
    activeInstancesCount: number
    activeApiKeysCount: number
  }
  period: { start: string; end: string }
}
```

Affiche :
- Badge plan (code + nom, ex: "Pro Plan")
- Statut abonnement : `active`, `trialing`, `past_due`, `cancelled`, `expired`
- Période de facturation actuelle (ex: "March 1 – March 31, 2026")
- Si `cancelAtPeriodEnd: true` → banner orange "Your plan will be cancelled at end of period."
- Prix mensuel : "{priceFcfa} FCFA / month (€{priceEur})"

### UsageMetrics
Props : `usage: UsageData; limits: PlanLimits`

3 barres de progression :
1. **Messages & Statuses** : `effectiveOutboundUsage / monthlyOutboundQuota`
2. **API Requests** : `apiRequestsCount / monthlyApiRequestQuota`
3. **Instances** : `activeInstancesCount / maxInstances`

Chaque barre :
- Label + compteur (ex: "12 / 20")
- Couleur : green < 70%, orange 70–90%, red > 90%
- Si quota illimité (`monthlyOutboundQuota: -1` ou très grand) → afficher "Unlimited"

### PlansComparison
Props : `plans: Plan[]; currentPlanCode: string`

Grille 4 colonnes (ou 2x2 sur mobile) pour les plans : free, starter, pro, plus.

Pour chaque plan :
- Nom du plan
- Prix : **{priceFcfa} FCFA/mois** + (€{priceEur})
- Liste des limites et features :
  - Instances : `maxInstances`
  - Clés API : `maxApiKeys`
  - Messages/mois : `monthlyOutboundQuota`
  - API requests/mois : `monthlyApiRequestQuota`
  - Webhooks : `features.webhooks` (✓/✗)
  - Campagnes : `features.campaigns` (✓/✗)
  - Statuts WhatsApp : `features.statuses` (✓/✗)
- **Bouton d'action** :
  - Plan actuel → "Current Plan" (disabled)
  - Plan supérieur → "Upgrade" (primary)
  - Plan inférieur → "Downgrade" (secondary)
  - Free → "Downgrade to Free" ou pas de bouton si déjà free

### CancelSubscriptionSection
Affiché uniquement si `billingProvider !== 'none'` (plan payant actif).
Props : `cancelAtPeriodEnd: boolean; periodEnd: string`

Si `cancelAtPeriodEnd: false` :
- Message : "Cancel your subscription — you'll retain access until {periodEnd}"
- Bouton "Cancel Subscription" (rouge outline)

Si `cancelAtPeriodEnd: true` :
- Message : "Your plan is scheduled to cancel on {periodEnd}."
- Bouton désactivé "Cancellation scheduled"

### CancelConfirmationModal
Props : `periodEnd: string; onConfirm: () => void; onCancel: () => void`
Message : "Your subscription will be cancelled at the end of the current period ({periodEnd}). You'll retain access until then."

---

## États à gérer
- `loading` : skeletons sur CurrentPlanCard et UsageMetrics pendant les fetches
- `upgrading` : loading sur le bouton "Upgrade" du plan sélectionné
- `cancelling` : loading sur "Cancel Subscription"
- `error.checkout` : toast "Could not initiate payment. Please try again."
- `error.cancel` : toast "Could not cancel subscription. Please try again."
- `checkout_pending` : note "Payment integration coming soon" si `checkoutUrl: null`

---

## Actions utilisateur

### Upgrader / Changer de plan
- Déclencheur : bouton "Upgrade" sur un plan
- Appel API : `POST /api/billing/checkout` — `{ planCode: "pro" }`
- Succès si `checkoutUrl` non-null : `window.location.href = checkoutUrl` (redirection Paystack)
- Si `checkoutUrl: null` (paiement pas encore configuré) : afficher un toast "Payment integration coming soon."
- Erreur 404 : "Plan not found."

### Annuler l'abonnement
- Déclencheur : bouton "Cancel Subscription" → CancelConfirmationModal → "Confirm"
- Appel API : `POST /api/billing/cancel`
- Succès : rafraîchir les données (recharger GET /billing/subscription) + toast "Subscription cancelled at period end"
- Erreur : toast "Could not cancel subscription."

---

## Règles métier
- Plan `free` : pas de bouton annulation (pas d'abonnement à annuler).
- `billingProvider: 'none'` = plan free ou abonnement sans fournisseur de paiement — pas d'annulation possible.
- `cancelAtPeriodEnd: true` → afficher la date limite d'accès, pas de nouveau bouton d'annulation.
- Ordre d'affichage des plans : free → starter → pro → plus.
- Le plan actuel dans la grille doit être visuellement mis en avant (border colorée, badge "Current").

---

## Payloads de référence

Response GET /api/billing/subscription:
```json
{
  "data": {
    "subscription": {
      "id": "sub_abc",
      "planId": "plan_pro_id",
      "plan": {
        "code": "pro",
        "name": "Pro",
        "priceEur": 29,
        "priceFcfa": 17000,
        "limits": {
          "maxInstances": 5,
          "maxApiKeys": 10,
          "maxWebhookEndpoints": 10,
          "monthlyOutboundQuota": 5000,
          "monthlyApiRequestQuota": 50000
        },
        "features": {
          "campaigns": true,
          "statuses": true,
          "voiceNotes": true,
          "webhooks": true
        }
      },
      "status": "active",
      "billingProvider": "paystack",
      "currentPeriodStart": "2026-03-01T00:00:00.000Z",
      "currentPeriodEnd": "2026-03-31T23:59:59.999Z",
      "cancelAtPeriodEnd": false
    },
    "usage": {
      "messagesCount": 312,
      "statusesCount": 45,
      "effectiveOutboundUsage": 357,
      "apiRequestsCount": 1240,
      "activeInstancesCount": 3,
      "activeApiKeysCount": 2
    },
    "period": {
      "start": "2026-03-01T00:00:00.000Z",
      "end": "2026-03-31T23:59:59.999Z"
    }
  }
}
```

Response GET /api/billing/plans:
```json
{
  "data": [
    {
      "id": "plan_free_id",
      "code": "free",
      "name": "Free",
      "priceEur": 0,
      "priceFcfa": 0,
      "isActive": true,
      "limits": { "maxInstances": 1, "maxApiKeys": 0, "maxWebhookEndpoints": 0, "monthlyOutboundQuota": 20, "monthlyApiRequestQuota": 1000 },
      "features": { "campaigns": false, "statuses": false, "voiceNotes": true, "webhooks": false }
    },
    {
      "code": "starter",
      "name": "Starter",
      "priceEur": 9,
      "priceFcfa": 5500,
      "limits": { "maxInstances": 2, "maxApiKeys": 3, "maxWebhookEndpoints": 3, "monthlyOutboundQuota": 500, "monthlyApiRequestQuota": 10000 },
      "features": { "campaigns": true, "statuses": false, "voiceNotes": true, "webhooks": true }
    }
  ]
}
```

Request POST /api/billing/checkout:
```json
{ "planCode": "pro" }
```

Response POST /api/billing/checkout:
```json
{
  "data": {
    "checkoutUrl": "https://checkout.paystack.com/abcdef...",
    "planCode": "pro",
    "message": "Checkout session created"
  }
}
```

Response POST /api/billing/cancel:
```json
{
  "data": { "cancelled": true }
}
```

---

## Out of scope
- Historique des factures / invoices
- Méthodes de paiement sauvegardées
- Codes promo / réduction
- Downgrade immédiat (seulement en fin de période)
