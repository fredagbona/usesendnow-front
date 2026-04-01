# SPEC — Portal Integration / Campaign Execution Tracking v2
App: portal
Audience: frontend
Auth: required
Status: ready

---

## Purpose
Document d'integration frontend pour le nouveau suivi d'execution des campagnes.

Objectifs:
- les campagnes se ferment automatiquement quand il n'y a plus de messages en file
- le frontend ne doit plus proposer Pause / Resume / Cancel sur une campagne terminee
- les stats doivent exposer plus de detail:
  - planifie
  - en file
  - envoye
  - delivered
  - lu
  - echoue
  - annule
- le frontend doit pouvoir lister les messages d'une campagne avec:
  - contact concerne
  - numero
  - statut
  - erreur
  - heure de creation
  - heure de derniere mise a jour

---

## Changements backend

### 1. Cloture automatique
Une campagne `running` passe automatiquement a `completed` quand `queued === 0`.

Consequence frontend:
- une campagne terminee ne doit plus afficher:
  - `Pause`
  - `Resume`
  - `Cancel`
- seule l'action `Delete` peut rester disponible si vous la gardez dans l'UI

### 2. Stats enrichies
`GET /api/campaigns/{id}/stats` renvoie maintenant:
- compteurs enrichis
- timeline d'execution

### 3. Nouveau endpoint detaille
Nouveau:
- `GET /api/campaigns/{id}/messages`

Il permet d'afficher les contacts concernes, les heures, et le statut reel de chaque message de campagne.

---

## Endpoints a utiliser

| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/campaigns/{id} | JWT | Meta campagne |
| GET | /api/campaigns/{id}/stats | JWT | Stats enrichies |
| GET | /api/campaigns/{id}/messages | JWT | Liste des messages de campagne |
| PATCH | /api/campaigns/{id}/pause | JWT | Pause si `running` ou `scheduled` |
| PATCH | /api/campaigns/{id}/resume | JWT | Resume si `paused*` |
| PATCH | /api/campaigns/{id}/cancel | JWT | Cancel si non completed/cancelled |
| DELETE | /api/campaigns/{id} | JWT | Supprimer la campagne |

---

## Regles frontend

### Actions par statut
- `scheduled`:
  - afficher `Pause`
  - afficher `Cancel`
  - afficher `Delete`
- `running`:
  - afficher `Pause`
  - afficher `Cancel`
  - afficher `Delete`
- `paused`
- `paused_quota`
- `paused_plan`
  - afficher `Resume`
  - afficher `Cancel`
  - afficher `Delete`
- `completed`
  - masquer `Pause`
  - masquer `Resume`
  - masquer `Cancel`
  - garder `Delete` si souhaite
- `cancelled`
  - masquer `Pause`
  - masquer `Resume`
  - masquer `Cancel`
  - garder `Delete`
- `failed`
  - masquer `Pause`
  - masquer `Resume`
  - masquer `Cancel`
  - garder `Delete`

### Polling
Le polling des stats ne doit tourner que si:
- `status === "running"`

Il doit s'arreter si le statut devient:
- `completed`
- `cancelled`
- `failed`
- `paused`
- `paused_quota`
- `paused_plan`

---

## Payloads

### GET /api/campaigns/{id}
La reponse garde la forme:
```json
{
  "data": {
    "id": "cmp_abc123",
    "name": "Promo Avril",
    "instanceId": "inst_xyz",
    "templateId": "tmpl_abc",
    "schedule": "2026-04-01T14:00:00.000Z",
    "repeat": "none",
    "status": "completed",
    "recipients": { "type": "all", "value": [] },
    "stats": {
      "planned": 120,
      "queued": 0,
      "sent": 120,
      "delivered": 116,
      "read": 74,
      "failed": 2,
      "cancelled": 2,
      "processingStartedAt": "2026-04-01T14:00:02.000Z",
      "lastEnqueuedAt": "2026-04-01T14:00:08.000Z",
      "completedAt": "2026-04-01T14:02:13.000Z",
      "cancelledAt": null
    },
    "createdAt": "2026-04-01T13:59:30.000Z",
    "updatedAt": "2026-04-01T14:02:13.000Z"
  }
}
```

### GET /api/campaigns/{id}/stats
```json
{
  "data": {
    "campaignId": "cmp_abc123",
    "status": "completed",
    "stats": {
      "total": 120,
      "planned": 120,
      "queued": 0,
      "sent": 120,
      "delivered": 116,
      "read": 74,
      "failed": 2,
      "cancelled": 2
    },
    "progressPercent": 100,
    "timeline": {
      "scheduledFor": "2026-04-01T14:00:00.000Z",
      "processingStartedAt": "2026-04-01T14:00:02.000Z",
      "lastEnqueuedAt": "2026-04-01T14:00:08.000Z",
      "completedAt": "2026-04-01T14:02:13.000Z",
      "cancelledAt": null,
      "lastActivityAt": "2026-04-01T14:02:13.000Z"
    },
    "startedAt": "2026-04-01T14:00:02.000Z",
    "estimatedCompletionAt": null
  }
}
```

### GET /api/campaigns/{id}/messages
#### Query params
- `limit` optional, default 20
- `cursor` optional
- `status` optional

Status filter supporte:
- `queued`
- `sent`
- `delivered`
- `read`
- `failed`
- `cancelled`

#### Response
```json
{
  "data": {
    "messages": [
      {
        "id": "msg_001",
        "contactId": "cnt_001",
        "contactName": "Awa Doe",
        "to": "+22901000000",
        "type": "text",
        "status": "delivered",
        "error": null,
        "body": "Bonjour Awa, utilisez PROMO10.",
        "createdAt": "2026-04-01T14:00:03.000Z",
        "updatedAt": "2026-04-01T14:01:20.000Z"
      },
      {
        "id": "msg_002",
        "contactId": "cnt_002",
        "contactName": "John Smith",
        "to": "+212778751168",
        "type": "text",
        "status": "cancelled",
        "error": "Campaign cancelled",
        "body": "Bonjour John, utilisez PROMO10.",
        "createdAt": "2026-04-01T14:00:04.000Z",
        "updatedAt": "2026-04-01T14:00:30.000Z"
      }
    ],
    "nextCursor": null,
    "hasMore": false
  }
}
```

---

## UI recommandee pour `/campaigns/[id]`

### Sections
- Header
- StatsOverview
- TimelineCard
- CampaignMetaCard
- CampaignMessagesTable
- ActionBar

### StatsOverview
Afficher les compteurs:
- `Planned`
- `Queued`
- `Sent`
- `Delivered`
- `Read`
- `Failed`
- `Cancelled`

### TimelineCard
Afficher:
- `Scheduled for`
- `Processing started`
- `Last enqueued`
- `Last activity`
- `Completed at`
- `Cancelled at`

Masquer les valeurs nulles.

### CampaignMessagesTable
Colonnes recommandees:
- Contact
- Phone
- Status
- Error
- Queued at
- Updated at
- Preview

Filtres recommandees:
- all
- queued
- sent
- delivered
- read
- failed
- cancelled

Pagination:
- bouton `Load more`
- appui sur `nextCursor`

### Badges status
- `queued`: gray
- `sent`: blue
- `delivered`: green
- `read`: purple
- `failed`: red
- `cancelled`: orange/red

---

## Regles d'interpretation

### `planned`
Nombre total de messages de campagne crees ou tentes pour les destinataires.

### `queued`
Nombre encore en file d'envoi.

### `sent`
Nombre marques `sent` par la plateforme.

### `delivered`
Nombre confirmes `delivered`.

### `read`
Nombre confirmes `read`.

### `failed`
Nombre en echec hors annulation manuelle.
Exemples:
- erreur provider
- variable template manquante
- numero invalide

### `cancelled`
Nombre de messages annules par l'utilisateur lors d'une annulation de campagne.

Important:
- `cancelled` n'est pas inclus dans `failed`
- l'UI doit l'afficher a part

---

## Etats et erreurs frontend

### Etats
- `loading.campaign`
- `loading.stats`
- `loading.messages`
- `loading.moreMessages`
- `loading.pause`
- `loading.resume`
- `loading.cancel`
- `loading.delete`

### Erreurs
- `NOT_FOUND`
- `BAD_REQUEST`

Messages recommandes:
- pause impossible: "This campaign can no longer be paused."
- resume impossible: "This campaign can no longer be resumed."
- cancel impossible: "This campaign is already finished."

---

## Checklist frontend

- Masquer les actions de controle sur `completed`, `cancelled`, `failed`
- Poller les stats uniquement en `running`
- Utiliser `GET /api/campaigns/{id}/messages` pour afficher les contacts et horaires
- Ajouter la colonne `Cancelled`
- Ajouter une carte `Timeline`
- Considerer `status: cancelled` dans la table detail des messages campagne

---

## Out of scope
- Export CSV des messages de campagne
- Retry individuel d'un message echoue
- Websocket temps reel
