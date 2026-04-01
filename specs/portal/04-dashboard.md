# SPEC — Portal / Dashboard
App: portal
Route: /dashboard
Auth: required
Status: ready

---

## Purpose
Vue d'ensemble du compte utilisateur : plan actuel, quotas du mois, instances actives, messages récents et campagnes récentes.
Permet d'accéder rapidement aux actions les plus fréquentes.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/billing/subscription | JWT | Plan + usage + période |
| GET | /api/instances | JWT | Instances actives |
| GET | /api/messages?limit=5 | JWT | 5 derniers messages |
| GET | /api/campaigns | JWT | Dernières campagnes |

---

## Layout de la page
Layout standard portal : sidebar à gauche + zone main à droite.

### Zones principales (main)
1. **Header** : "Dashboard" + nom de l'utilisateur
2. **Bande plan + quotas** (UsageSummaryCard)
3. **Grille 2 colonnes** :
   - Colonne gauche : RecentMessages (5 derniers)
   - Colonne droite : RecentCampaigns (3 dernières)
4. **Ligne de raccourcis** (QuickActions)

---

## Composants de la page

### UsageSummaryCard
Affiche le plan actuel et la consommation du mois.
Props :
```ts
{
  plan: { code: string; name: string }
  usage: {
    effectiveOutboundUsage: number
    apiRequestsCount: number
    activeInstancesCount: number
    activeApiKeysCount: number
  }
  limits: {
    monthlyOutboundQuota: number
    monthlyApiRequestQuota: number
    maxInstances: number
    maxApiKeys: number
  }
  period: { start: string; end: string }
}
```
Affiche :
- Badge plan (ex: "Free Plan", "Pro Plan")
- 3 barres de progression : Messages & Statuses / API Requests / Instances connectées
- Date de reset des quotas (fin de période)

### RecentMessages
Liste les 5 derniers messages.
Props : `messages: Message[]`

Pour chaque message :
- Badge statut coloré : `queued` (gray), `sent` (blue), `delivered` (green), `read` (purple), `failed` (red)
- Numéro destinataire (`to`)
- Type et extrait du body
- Date relative (ex: "2 hours ago")
- Clic → `/messages/{id}`

Lien "View all messages" → `/messages`

### RecentCampaigns
Liste les 3 dernières campagnes.
Props : `campaigns: Campaign[]`

Pour chaque campagne :
- Nom de la campagne
- Badge statut : `draft` (gray), `scheduled` (yellow), `running` (blue), `paused` (orange), `completed` (green), `failed` (red)
- Stats rapides : "sent / total" depuis `stats`
- Date de création relative
- Clic → `/campaigns/{id}`

Lien "View all campaigns" → `/campaigns`

### QuickActions
Rangée de boutons d'action rapide.
- "Send Message" → ouvre la modale d'envoi (ou `/messages`)
- "New Campaign" → `/campaigns` (trigger modal)
- "Connect WhatsApp" → `/instances`
- "Generate API Key" → `/api-keys`

### InstanceStatusBanner
Affiché si aucune instance n'est connectée.
Props : `instanceCount: number`
Message : "You have no connected WhatsApp instance. [Connect now →]"
Lien → `/instances`

---

## États à gérer
- `loading` : skeletons sur chaque section pendant les fetches parallèles
- `empty.messages` : "No messages sent yet." avec CTA "Send your first message"
- `empty.campaigns` : "No campaigns yet." avec CTA "Create a campaign"
- `empty.instances` : afficher InstanceStatusBanner
- `error` : toast d'erreur non-bloquant + données partielles affichées

---

## Actions utilisateur

### Clic sur un message récent
- Déclencheur : clic sur une ligne RecentMessages
- Action : `router.push('/messages/{id}')`

### Clic sur une campagne récente
- Déclencheur : clic sur une ligne RecentCampaigns
- Action : `router.push('/campaigns/{id}')`

### Clic QuickAction
- Déclencheur : bouton QuickActions
- Action : navigation ou ouverture de modale selon le cas

---

## Règles métier
- Toutes les requêtes du dashboard sont faites en parallèle (`Promise.all`).
- Si `effectiveOutboundUsage >= monthlyOutboundQuota * 0.9` → afficher la barre en rouge + warning "Quota almost exhausted".
- Si `effectiveOutboundUsage >= monthlyOutboundQuota` → barre rouge + "Quota exhausted. Upgrade your plan."
- Instances : compter uniquement celles avec `deletedAt: null` (le backend filtre déjà).

---

## Payloads de référence

Response GET /api/billing/subscription:
```json
{
  "data": {
    "subscription": {
      "id": "sub_abc",
      "plan": {
        "code": "free",
        "name": "Free",
        "priceEur": 0,
        "priceFcfa": 0,
        "limits": {
          "maxInstances": 1,
          "maxApiKeys": 0,
          "maxWebhookEndpoints": 0,
          "monthlyOutboundQuota": 20,
          "monthlyApiRequestQuota": 1000
        },
        "features": {
          "campaigns": false,
          "statuses": false,
          "voiceNotes": true,
          "webhooks": false
        }
      },
      "status": "active",
      "currentPeriodStart": "2026-03-01T00:00:00.000Z",
      "currentPeriodEnd": "2026-03-31T23:59:59.999Z",
      "cancelAtPeriodEnd": false
    },
    "usage": {
      "messagesCount": 12,
      "statusesCount": 0,
      "effectiveOutboundUsage": 12,
      "apiRequestsCount": 45,
      "activeInstancesCount": 1,
      "activeApiKeysCount": 0
    },
    "period": {
      "start": "2026-03-01T00:00:00.000Z",
      "end": "2026-03-31T23:59:59.999Z"
    }
  }
}
```

Response GET /api/messages?limit=5:
```json
{
  "data": {
    "messages": [
      {
        "id": "msg_abc",
        "instanceId": "inst_xyz",
        "type": "text",
        "to": "+22912345678",
        "body": "Bonjour, votre commande est prête !",
        "status": "delivered",
        "createdAt": "2026-03-27T10:30:00.000Z"
      }
    ],
    "nextCursor": null,
    "hasMore": false
  }
}
```

---

## Out of scope
- Graphiques de tendance (séries temporelles)
- Notifications en temps réel (WebSocket)
- Logs d'activité détaillés
