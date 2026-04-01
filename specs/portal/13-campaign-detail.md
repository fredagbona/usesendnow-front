# SPEC — Portal / Campaign Detail
App: portal
Route: /campaigns/[id]
Auth: required
Status: ready

---

## Purpose
Vue détaillée d'une campagne individuelle : stats complètes de livraison, statut actuel, et actions de gestion (pause/resume/delete).

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/campaigns/{id} | JWT | Données de la campagne |
| GET | /api/campaigns/{id}/stats | JWT | Stats de livraison détaillées |
| PATCH | /api/campaigns/{id}/pause | JWT | Pauser |
| PATCH | /api/campaigns/{id}/resume | JWT | Reprendre |
| DELETE | /api/campaigns/{id} | JWT | Supprimer |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : nom de la campagne + badge statut + bouton "Back to Campaigns"
- **StatsOverview** : barre de progression + compteurs
- **CampaignMetaCard** : métadonnées (instance, template, schedule, recipients)
- **ActionBar** : boutons pause/resume/delete
- **DeleteModal** : confirmation de suppression

---

## Composants de la page

### CampaignHeader
Props : `campaign: Campaign`
Affiche : nom, badge statut, bouton back.
Badge statuts mêmes couleurs que la liste.

### StatsOverview
Props : `stats: CampaignStats`

Affiche :
- **Barre de progression** : `progressPercent` % (colorée selon avancement)
  - `progressPercent < 30` : blue
  - `progressPercent 30–80` : blue
  - `progressPercent >= 100` ou status = completed : green
- **6 compteurs** en grille :
  - Total : `stats.total`
  - Queued : `stats.queued` (gray)
  - Sent : `stats.sent` (blue)
  - Delivered : `stats.delivered` (green)
  - Read : `stats.read` (purple)
  - Failed : `stats.failed` (red)
- **Progress %** : "{progressPercent}% complete"
- Note : `progressPercent = Math.round((sent + failed) / total * 100)`

### CampaignMetaCard
Props : `campaign: Campaign`

Affiche :
- **Instance** : `instanceId` (résoudre le nom si possible)
- **Template** : `templateId` (lien vers `/templates/{id}` si présent)
- **Schedule** : date/heure formatée
- **Repeat** : none | daily | weekly
- **Recipients** : type (all / tags / explicit) + count si disponible
- **Created** : date de création

### ActionBar
Props : `campaign: Campaign; onPause: () => void; onResume: () => void; onDelete: () => void`

Affiche selon le statut :
- Si `running` → bouton "Pause Campaign" (orange)
- Si `paused` / `paused_quota` / `paused_plan` → bouton "Resume Campaign" (blue)
- Toujours → bouton "Delete Campaign" (rouge outline)

### StatsAutoRefresh
Si `status === 'running'` → poll `GET /api/campaigns/{id}/stats` toutes les 15 secondes.
Props : `campaignId: string; onUpdate: (stats: CampaignStats) => void`
S'arrête quand status devient `completed` ou `failed`.

### DeleteCampaignModal
Idem page `/campaigns`.

---

## États à gérer
- `loading.initial` : skeleton pendant les deux fetches parallèles (campaign + stats)
- `loading.pause` : loading sur bouton Pause
- `loading.resume` : loading sur bouton Resume
- `loading.delete` : loading sur bouton Delete
- `error.NOT_FOUND` : "Campaign not found." + lien retour
- `polling` : actif si `status === 'running'`

---

## Actions utilisateur

### Charger les données
- Au montage : `GET /api/campaigns/{id}` et `GET /api/campaigns/{id}/stats` en parallèle

### Pauser
- Déclencheur : bouton "Pause Campaign"
- Appel API : `PATCH /api/campaigns/{id}/pause`
- Succès : mettre à jour `campaign.status` → `paused` + arrêter le polling + toast "Campaign paused"

### Reprendre
- Déclencheur : bouton "Resume Campaign"
- Appel API : `PATCH /api/campaigns/{id}/resume`
- Succès : mettre à jour `campaign.status` → `running` + relancer le polling + toast "Campaign resumed"

### Supprimer
- Déclencheur : bouton "Delete Campaign" → DeleteCampaignModal → "Delete"
- Appel API : `DELETE /api/campaigns/{id}`
- Succès : `router.push('/campaigns')` + toast "Campaign deleted"

### Voir le template lié
- Déclencheur : clic sur le nom du template dans CampaignMetaCard
- Action : `router.push('/templates/{templateId}')`

---

## Règles métier
- `estimatedCompletionAt` est toujours `null` en v1 — ne pas afficher ce champ.
- Si `stats.total === 0` → progressPercent = 0, afficher "Campaign not started yet."
- Polling des stats uniquement quand `status === 'running'` (toutes les 15s est raisonnable pour ne pas surcharger).
- Les statuts `paused_quota` et `paused_plan` affichent un message d'info supplémentaire dans l'ActionBar :
  - `paused_quota` : "Paused — monthly quota exhausted. Quota resets on {periodEnd}."
  - `paused_plan` : "Paused — feature unavailable on current plan."

---

## Payloads de référence

Response GET /api/campaigns/{id}:
```json
{
  "data": {
    "id": "cmp_abc123",
    "name": "Black Friday Promo",
    "instanceId": "inst_xyz",
    "templateId": "tmpl_abc",
    "schedule": "2026-03-28T10:00:00.000Z",
    "repeat": "none",
    "status": "running",
    "recipients": { "type": "all", "value": [] },
    "stats": { "queued": 150, "sent": 350, "delivered": 340, "failed": 10 },
    "createdAt": "2026-03-27T09:00:00.000Z",
    "updatedAt": "2026-03-27T10:30:00.000Z"
  }
}
```

Response GET /api/campaigns/{id}/stats:
```json
{
  "data": {
    "campaignId": "cmp_abc123",
    "status": "running",
    "stats": {
      "total": 510,
      "queued": 150,
      "sent": 350,
      "delivered": 340,
      "read": 200,
      "failed": 10
    },
    "progressPercent": 71,
    "startedAt": "2026-03-28T10:00:00.000Z",
    "estimatedCompletionAt": null
  }
}
```

---

## Out of scope
- Liste des messages individuels de la campagne
- Export des stats
- Modification de la campagne après création
