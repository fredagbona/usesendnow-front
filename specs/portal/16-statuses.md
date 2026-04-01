# SPEC — Portal / Statuses
App: portal
Route: /statuses
Auth: required
Status: ready

---

## Purpose
Publier un statut WhatsApp (stories) depuis une instance connectée.
Supporte les statuts texte et image.
Page simplifiée — publication directe sans liste d'historique.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| POST | /api/statuses | JWT | Publier un statut WhatsApp |
| GET | /api/instances | JWT | Sélectionner l'instance source |
| GET | /api/billing/subscription | JWT | Vérifier si le plan autorise les statuts |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : titre "WhatsApp Statuses"
- **PlanGateBanner** : si `features.statuses === false`
- **PublishStatusForm** : formulaire de publication
- **RecentPublications** (optionnel, v2) : historique des statuts publiés

---

## Composants de la page

### PlanGateBanner
Affiché si `features.statuses === false` sur le plan actuel.
Message : "WhatsApp Statuses are not available on your current plan. Upgrade to publish statuses."
CTA : "Upgrade Plan" → `/billing`
Le formulaire est masqué ou désactivé.

### PublishStatusForm
Props : `instances: Instance[]; onSuccess: () => void`

Champs :
- `instanceId` — select parmi les instances **connectées**, required
  - Si aucune instance connectée : message d'avertissement "No connected WhatsApp instance. [Connect one →]"
- `type` — radio / toggle : **Text** | **Image**

**Si type = text :**
- `content` — textarea, required, max ~700 chars (limite WhatsApp story)
- `backgroundColor` — color picker optionnel (couleur de fond du texte)
  - Valeurs hex suggérées : #000000, #00a884, #2196F3, #FF5722, #9C27B0

**Si type = image :**
- `content` — input URL de l'image, required
- `caption` — textarea optionnel (légende de l'image)

Bouton "Publish Status" — loading state pendant l'appel API.

### StatusTypeToggle
Props : `value: "text" | "image"; onChange: (type: "text" | "image") => void`
Toggle visuel Text / Image.

### ConnectedInstanceSelect
Props : `instances: Instance[]; value: string; onChange: (id: string) => void`
Filtre les instances avec `status: "connected"`.
Si aucune connectée → afficher un message inline et désactiver le formulaire.

### SuccessToast
Après publication réussie : "Status published successfully!"
Afficher le `providerMessageId` dans le toast de manière discrète (optionnel).

---

## États à gérer
- `loading.instances` : skeleton du select d'instance pendant GET /api/instances
- `loading.subscription` : pending pendant GET /billing/subscription
- `plan_blocked` : PlanGateBanner + formulaire masqué
- `no_connected_instance` : message d'avertissement dans le formulaire
- `publishing` : loading sur le bouton "Publish Status"
- `success` : toast "Status published!" + reset du formulaire
- `error.STATUSES_NOT_AVAILABLE_ON_PLAN` : PlanGateBanner
- `error.MONTHLY_OUTBOUND_QUOTA_EXCEEDED` : toast "Monthly quota exhausted. Upgrade your plan."
- `error.NOT_FOUND` : toast "Instance not found."
- `error.PROVIDER_ERROR` : toast "WhatsApp rejected the status. Check the image URL or content."

---

## Actions utilisateur

### Charger les données initiales
- Au montage : GET /api/instances + GET /api/billing/subscription en parallèle
- Filtrer instances pour n'afficher que `status: "connected"`
- Vérifier `features.statuses` dans la subscription

### Publier un statut
- Déclencheur : bouton "Publish Status"
- Appel API : `POST /api/statuses`
  - Si type = text : `{ instanceId, type: "text", content, backgroundColor? }`
  - Si type = image : `{ instanceId, type: "image", content, caption? }`
- Succès : toast "Status published successfully!" + réinitialiser le formulaire (garder l'instanceId sélectionné)
- Erreur 403 `STATUSES_NOT_AVAILABLE_ON_PLAN` : afficher PlanGateBanner
- Erreur 429 `MONTHLY_OUTBOUND_QUOTA_EXCEEDED` : toast "Monthly quota exhausted."
- Erreur 404 `NOT_FOUND` : toast "Instance not found or disconnected."
- Erreur 502 `PROVIDER_ERROR` : toast "WhatsApp could not publish the status. Try again."

---

## Règles métier
- `content` pour type=image est une **URL** d'image (pas upload direct).
- `backgroundColor` est une couleur hex (ex: `#00a884`) — optionnel pour type=text.
- Seules les instances avec `status: "connected"` peuvent publier des statuts.
- Plan Free : `features.statuses = false` → PlanGateBanner.
- La publication consomme le quota outbound (`effectiveOutboundUsage++`).
- Un statut publié n'est pas stocké côté UseSendNow (pas de modèle Status en DB v1) — seul le `providerMessageId` est retourné.

---

## Payloads de référence

Request POST /api/statuses (texte):
```json
{
  "instanceId": "inst_abc123",
  "type": "text",
  "content": "🎉 Nouvelle collection disponible ! Visitez notre boutique.",
  "backgroundColor": "#00a884"
}
```

Request POST /api/statuses (image):
```json
{
  "instanceId": "inst_abc123",
  "type": "image",
  "content": "https://cdn.mystore.com/promo-banner.jpg",
  "caption": "Promo -30% ce weekend !"
}
```

Response POST /api/statuses (succès):
```json
{
  "data": {
    "instanceId": "inst_abc123",
    "providerMessageId": "BAE5D1234ABCDE5678"
  }
}
```

Response (plan bloqué):
```json
{
  "error": {
    "code": "STATUSES_NOT_AVAILABLE_ON_PLAN",
    "message": "Statuses feature is not available on your current plan"
  }
}
```

Response (quota dépassé):
```json
{
  "error": {
    "code": "MONTHLY_OUTBOUND_QUOTA_EXCEEDED",
    "message": "Monthly outbound quota exceeded"
  }
}
```

---

## Out of scope
- Upload d'image direct (il faut fournir une URL)
- Historique des statuts publiés (pas de modèle Status en DB v1)
- Statuts vidéo
- Planification d'un statut (envoi différé)
- Statistiques de vues du statut
