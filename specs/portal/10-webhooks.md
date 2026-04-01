# SPEC — Portal / Webhooks
App: portal
Route: /webhooks
Auth: required
Status: ready

---

## Purpose
Gestion des endpoints webhook : l'utilisateur enregistre une URL qui recevra des événements (message livré, instance connectée, etc.).
Un secret HMAC-SHA256 est généré automatiquement à la création et doit être conservé pour valider les livraisons.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/webhooks | JWT | Lister les webhooks |
| POST | /api/webhooks | JWT | Enregistrer un endpoint |
| DELETE | /api/webhooks/{id} | JWT | Supprimer un endpoint |
| GET | /api/billing/subscription | JWT | Vérifier si le plan autorise les webhooks |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : titre "Webhooks" + bouton "Add Endpoint"
- **PlanGateBanner** : si le plan ne permet pas les webhooks
- **WebhookList** : liste des endpoints enregistrés
- **NewWebhookModal** : modale de création
- **SecretRevealModal** : affiche le secret une seule fois après création

---

## Composants de la page

### PlanGateBanner
Affiché si `features.webhooks === false` sur le plan actuel.
Message : "Webhooks are not available on your current plan. Upgrade to receive real-time event notifications."
CTA : "Upgrade Plan" → `/billing`
Bouton "Add Endpoint" masqué.

### WebhookList
Props : `webhooks: Webhook[]`
Une card par webhook, contenant :
- **URL** : url de l'endpoint (tronquée si longue, copiable)
- **Events** : badges pour chaque événement souscrit
- **Active** : badge "Active" (green) ou "Inactive" (gray)
- **Created** : date de création
- Bouton "Delete" (rouge outline)

Événements possibles (badges) :
- `message.sent`
- `message.delivered`
- `message.failed`
- `instance.connected`

### NewWebhookModal
Props : `onSuccess: (webhook: Webhook, secret: string) => void; onClose: () => void`

Champs :
- `url` — input url, required (https uniquement recommandé)
- `events` — checkboxes multiples :
  - `message.sent`
  - `message.delivered`
  - `message.failed`
  - `instance.connected`

Au moins un event doit être sélectionné.
Bouton "Register Endpoint" — loading state.

### SecretRevealModal
Affiché immédiatement après la création.
Props : `secret: string; webhookUrl: string; onClose: () => void`

Affiche :
- Warning : "This signing secret is shown only once. Use it to verify incoming requests with HMAC-SHA256."
- Le secret en champ readonly + bouton "Copy"
- Exemple de vérification (pseudo-code) :
  ```
  signature = HMAC-SHA256(secret, rawBody)
  compare(signature, request.headers['x-usesendnow-signature'])
  ```
- Bouton "I've saved it" pour fermer

### DeleteWebhookModal
Props : `webhookUrl: string; onConfirm: () => void; onCancel: () => void`
Message : "Are you sure you want to delete the endpoint **{url}**? No more events will be delivered to this URL."

---

## États à gérer
- `loading` : skeleton de liste
- `empty` : "No webhooks registered yet." (uniquement si plan le permet)
- `plan_blocked` : PlanGateBanner
- `creating` : loading dans NewWebhookModal
- `deleting` : loading sur le bouton Delete de la ligne concernée
- `error.WEBHOOKS_NOT_AVAILABLE_ON_PLAN` : PlanGateBanner
- `error.MAX_WEBHOOK_ENDPOINTS_REACHED` : toast "Webhook endpoint limit reached."

---

## Actions utilisateur

### Enregistrer un endpoint
- Déclencheur : bouton "Add Endpoint" → NewWebhookModal → submit
- Appel API : `POST /api/webhooks` — `{ url, events }`
- Succès : fermer NewWebhookModal → ouvrir SecretRevealModal avec `data.secret` + prepend webhook à la liste
- Erreur 403 `WEBHOOKS_NOT_AVAILABLE_ON_PLAN` : fermer modale + afficher PlanGateBanner
- Erreur 403 `MAX_WEBHOOK_ENDPOINTS_REACHED` : toast "Endpoint limit reached for your plan."
- Erreur 400 `VALIDATION_ERROR` : par champ dans la modale

### Supprimer un endpoint
- Déclencheur : bouton "Delete" → DeleteWebhookModal → "Delete"
- Appel API : `DELETE /api/webhooks/{id}`
- Succès : retirer de la liste + toast "Webhook deleted"

---

## Règles métier
- Le secret HMAC est généré par le backend et **ne peut pas être régénéré** — si perdu, supprimer et recréer le webhook.
- Plan Free : `features.webhooks = false` → PlanGateBanner, aucune action possible.
- Le champ `active` est toujours `true` à la création — pas de toggle actif/inactif v1.
- L'endpoint `/api/webhooks/evolution` est interne (Evolution API → backend) et n'apparaît **pas** dans cette liste.

---

## Payloads de référence

Response GET /api/webhooks:
```json
{
  "data": [
    {
      "id": "wh_abc123",
      "userId": "user_xyz",
      "url": "https://myapp.com/hooks/usesendnow",
      "secret": "a1b2c3d4e5f6...",
      "events": ["message.delivered", "message.failed"],
      "active": true,
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

Request POST /api/webhooks:
```json
{
  "url": "https://myapp.com/hooks/usesendnow",
  "events": ["message.sent", "message.delivered", "message.failed"]
}
```

Response POST /api/webhooks (succès):
```json
{
  "data": {
    "id": "wh_new456",
    "url": "https://myapp.com/hooks/usesendnow",
    "secret": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
    "events": ["message.sent", "message.delivered", "message.failed"],
    "active": true,
    "createdAt": "2026-03-27T10:00:00.000Z"
  }
}
```

Response DELETE /api/webhooks/{id}:
```json
{
  "data": { "deleted": true }
}
```

---

## Out of scope
- Toggle actif/inactif sur un webhook existant
- Logs des livraisons webhook (deliveries history)
- Retry manuel d'une livraison échouée
- Test de l'endpoint (ping)
