# SPEC — Portal / Campaigns
App: portal
Route: /campaigns
Auth: required
Status: ready

---

## Purpose
Liste toutes les campagnes de l'utilisateur avec leur statut et stats rapides.
Permet de créer, pauser, reprendre et supprimer des campagnes.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/campaigns | JWT | Lister les campagnes |
| POST | /api/campaigns | JWT | Créer une campagne |
| PATCH | /api/campaigns/{id}/pause | JWT | Pauser une campagne |
| PATCH | /api/campaigns/{id}/resume | JWT | Reprendre une campagne |
| DELETE | /api/campaigns/{id} | JWT | Supprimer une campagne |
| GET | /api/instances | JWT | Alimenter le select d'instance |
| GET | /api/templates | JWT | Alimenter le select de template |
| GET | /api/billing/subscription | JWT | Vérifier si le plan autorise les campagnes |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : titre "Campaigns" + bouton "New Campaign"
- **PlanGateBanner** : si `features.campaigns === false`
- **CampaignList** : table des campagnes
- **NewCampaignModal** : modale de création

---

## Composants de la page

### PlanGateBanner
Affiché si `features.campaigns === false`.
Message : "Campaigns are not available on your current plan. Upgrade to send bulk messages."
CTA : "Upgrade Plan" → `/billing`
Bouton "New Campaign" masqué.

### CampaignList
Props : `campaigns: Campaign[]`
Table avec colonnes :
- **Name** : nom de la campagne, cliquable → `/campaigns/{id}`
- **Status** : badge coloré
  - `draft` : gray
  - `scheduled` : yellow
  - `running` : blue (avec pulse)
  - `paused` : orange
  - `paused_quota` : orange + "Quota paused"
  - `paused_plan` : orange + "Plan paused"
  - `completed` : green
  - `failed` : red
- **Progress** : "sent / total" depuis `stats` (ex: "350 / 500")
- **Schedule** : date/heure de la campagne
- **Actions** :
  - Si `running` → bouton "Pause"
  - Si `paused` / `paused_quota` / `paused_plan` → bouton "Resume"
  - Toujours → bouton "Delete"
  - Clic sur nom → `/campaigns/{id}`

### NewCampaignModal
Props : `instances: Instance[]; templates: Template[]; onSuccess: (campaign: Campaign) => void; onClose: () => void`

Champs :
- `name` — string, required
- `instanceId` — select instances connectées, required
- `templateId` — select templates, optional
- `recipients` — section récipients :
  - Type : radio `all` | `tags` | `explicit`
  - Si `tags` → input tags (array de strings)
  - Si `explicit` → liste de contact IDs (simplifié : textarea de contact IDs séparés par virgule)
- `schedule` — datetime picker (ISO string), required
- `repeat` — select : none | daily | weekly

Bouton "Create Campaign" — loading state.

### DeleteCampaignModal
Props : `campaignName: string; onConfirm: () => void; onCancel: () => void`
Message : "Delete **{name}**? This cannot be undone."

---

## États à gérer
- `loading` : skeleton de table
- `empty` : "No campaigns yet. Create your first campaign." (si plan le permet)
- `plan_blocked` : PlanGateBanner
- `creating` : loading dans la modale
- `pausing` : loading sur le bouton Pause de la ligne concernée
- `resuming` : loading sur le bouton Resume
- `deleting` : loading sur le bouton Delete
- `error.CAMPAIGNS_NOT_AVAILABLE_ON_PLAN` : PlanGateBanner
- `error.MONTHLY_OUTBOUND_QUOTA_EXCEEDED` : toast "Monthly quota exhausted. Upgrade to resume campaigns."

---

## Actions utilisateur

### Créer une campagne
- Déclencheur : bouton "New Campaign" → NewCampaignModal → submit
- Appel API : `POST /api/campaigns` — payload complet
- Succès : fermer modale + prepend à la liste + toast "Campaign scheduled"
- Erreur 403 `CAMPAIGNS_NOT_AVAILABLE_ON_PLAN` : PlanGateBanner
- Erreur 429 `MONTHLY_OUTBOUND_QUOTA_EXCEEDED` : toast "Monthly quota exhausted."
- Erreur 404 `NOT_FOUND` : "Instance not found."

### Pauser une campagne
- Déclencheur : bouton "Pause" sur la ligne
- Appel API : `PATCH /api/campaigns/{id}/pause`
- Succès : mettre à jour le statut local → `paused` + toast "Campaign paused"

### Reprendre une campagne
- Déclencheur : bouton "Resume" sur la ligne
- Appel API : `PATCH /api/campaigns/{id}/resume`
- Succès : mettre à jour le statut local → `running` + toast "Campaign resumed"

### Supprimer une campagne
- Déclencheur : bouton "Delete" → DeleteCampaignModal → "Delete"
- Appel API : `DELETE /api/campaigns/{id}`
- Succès : retirer de la liste + toast "Campaign deleted"

### Accéder au détail
- Déclencheur : clic sur le nom de la campagne
- Action : `router.push('/campaigns/{id}')`

---

## Règles métier
- Campagnes avec `status: paused_quota` ou `paused_plan` → bouton "Resume" présent mais peut échouer si le quota n'a pas été rechargé.
- Plan Free : `features.campaigns = false` → PlanGateBanner.
- Seules les instances avec `status: "connected"` peuvent être sélectionnées.
- Un template n'est pas obligatoire — la campagne peut envoyer un texte brut (body configuré séparément, à préciser dans v2).

---

## Payloads de référence

Response GET /api/campaigns:
```json
{
  "data": [
    {
      "id": "cmp_abc123",
      "name": "Black Friday Promo",
      "instanceId": "inst_xyz",
      "templateId": "tmpl_abc",
      "schedule": "2026-03-28T10:00:00.000Z",
      "repeat": "none",
      "status": "running",
      "recipients": { "type": "all", "value": [] },
      "stats": { "queued": 150, "sent": 350, "delivered": 340, "failed": 0 },
      "createdAt": "2026-03-27T09:00:00.000Z",
      "updatedAt": "2026-03-27T10:30:00.000Z"
    }
  ]
}
```

Request POST /api/campaigns:
```json
{
  "name": "Black Friday Promo",
  "instanceId": "inst_xyz",
  "templateId": "tmpl_abc",
  "schedule": "2026-03-28T10:00:00.000Z",
  "repeat": "none",
  "recipients": { "type": "all" }
}
```

Response POST /api/campaigns:
```json
{
  "data": {
    "id": "cmp_new456",
    "name": "Black Friday Promo",
    "status": "scheduled",
    "stats": { "queued": 0, "sent": 0, "delivered": 0, "failed": 0 },
    "createdAt": "2026-03-27T10:00:00.000Z"
  }
}
```

---

## Out of scope
- Duplication de campagne
- Prévisualisation avant envoi
- Segmentation avancée des destinataires
- Statistiques en temps réel (polling sur la liste)
