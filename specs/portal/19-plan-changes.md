# Plan Changes — Downgrade, Cancel, Upgrade

## Règles produit

| Action | Effet | Timing |
|--------|-------|--------|
| Upgrade | Nouveau plan actif immédiatement (checkout Dodo) | Immédiat |
| Downgrade | Ancien plan jusqu'à fin de période | Différé |
| Annulation | Plan actif jusqu'à fin de période, repasse Free ensuite | Différé |
| Annulation du changement programmé | Revient au plan actuel | Immédiat |

---

## GET /api/billing/subscription — réponse mise à jour

La réponse inclut maintenant les champs de changement programmé :

```json
{
  "data": {
    "subscription": {
      "plan": { "code": "pro", "name": "Pro" },
      "status": "active",
      "currentPeriodStart": "2026-03-01T00:00:00.000Z",
      "currentPeriodEnd": "2026-04-01T00:00:00.000Z",
      "cancelAtPeriodEnd": false,
      "scheduledPlan": "starter",
      "scheduledPlanAt": "2026-04-01T00:00:00.000Z",
      "scheduledAction": "downgrade"
    },
    "usage": { ... },
    "period": { ... }
  }
}
```

`scheduledPlan`, `scheduledPlanAt`, `scheduledAction` sont `null` si aucun changement programmé.

---

## Endpoints disponibles

### POST /api/billing/downgrade
Planifie un downgrade à la fin de la période en cours.

```json
// Request
{ "plan": "starter" }

// Response 200
{
  "data": {
    "message": "Downgrade scheduled",
    "scheduledPlan": "starter",
    "effectiveAt": "2026-04-01T00:00:00.000Z"
  }
}
```

Erreurs :
- `400 INVALID_PLAN_CHANGE` — plan cible supérieur ou égal au plan actuel
- `400 DOWNGRADE_ALREADY_SCHEDULED` — un downgrade est déjà programmé
- `400 INVALID_PLAN_CHANGE` — tentative de downgrade vers "free" (utiliser /cancel)
- `400 SUBSCRIPTION_INACTIVE` — pas de subscription active

---

### POST /api/billing/cancel
Annule la subscription à la fin de la période (repasse Free).

```json
// Request: pas de body

// Response 200
{
  "data": {
    "message": "Subscription cancelled",
    "effectiveAt": "2026-04-01T00:00:00.000Z"
  }
}
```

Erreurs :
- `400 ALREADY_ON_FREE_PLAN` — déjà sur le plan Free
- `400 SUBSCRIPTION_INACTIVE` — pas de subscription active

---

### POST /api/billing/cancel-scheduled-change
Annule un downgrade ou une annulation programmée avant la date d'effet.

```json
// Request: pas de body

// Response 200
{
  "data": {
    "message": "Scheduled change cancelled",
    "currentPlan": "pro"
  }
}
```

Erreurs :
- `400 NO_SCHEDULED_CHANGE` — aucun changement programmé à annuler

---

### POST /api/billing/checkout (upgrade — inchangé)
Crée une session de paiement Dodo pour upgrader.
Si un downgrade ou une annulation était programmé, il est automatiquement annulé.

```json
// Request
{ "planCode": "plus" }

// Response 200
{
  "data": {
    "checkoutUrl": "https://checkout.dodopayments.com/..."
  }
}
```

---

## Logique UI recommandée

### Afficher le changement programmé

Si `scheduledAction !== null` dans la réponse subscription, afficher une bannière :

```
// downgrade programmé
⚠️ Votre plan passera de Pro → Starter le 1 avril 2026
   [Annuler ce changement]

// annulation programmée
⚠️ Votre abonnement sera résilié le 1 avril 2026. Vous passerez au plan Free.
   [Annuler la résiliation]
```

### Boutons d'action selon le plan actuel

```
Plan actuel: Pro, aucun changement programmé
→ [Upgrader vers Plus] [Downgrader vers Starter] [Annuler l'abonnement]

Plan actuel: Pro, downgrade vers Starter programmé
→ [Upgrader vers Plus] [Annuler le downgrade]

Plan actuel: Pro, annulation programmée
→ [Annuler la résiliation]

Plan actuel: Free
→ [Choisir un plan] (checkout)
```

### Ordre des plans pour comparaison
`free (0) < starter (1) < pro (2) < plus (3)`

Utiliser cet ordre pour déterminer si un changement est un upgrade ou downgrade.

---

## Ce qui se passe côté backend au downgrade effectif

Au jour J (fin de période), le backend applique automatiquement :

1. **Instances en excès** → status `suspended` (déconnectées d'Evolution, non supprimées)
2. **Clés API en excès** → révoquées (non récupérables)
3. **Webhooks en excès** → désactivés (récupérables si upgrade)
4. **Campagnes en cours** → passent en `paused_plan` si le nouveau plan ne supporte pas les campagnes

### Afficher les instances suspendues

```json
// Instance suspendue
{
  "id": "uuid",
  "status": "suspended",
  ...
}
```

Afficher badge rouge "Suspendue" + message :
> "Cette instance a été suspendue suite à un changement de plan. Passez à un plan supérieur pour la réactiver."

Le bouton "Reconnecter" doit être désactivé pour les instances `suspended`.
