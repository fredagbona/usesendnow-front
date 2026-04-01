# SPEC — Portal / Messages
App: portal
Route: /messages
Auth: required
Status: ready

---

## Purpose
Liste paginée (cursor-based) de tous les messages de l'utilisateur.
Permet de filtrer par instance et par statut, d'envoyer un nouveau message, et d'accéder au détail d'un message.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/messages | JWT | Lister les messages (cursor pagination) |
| POST | /api/messages/send | JWT | Envoyer un nouveau message |
| GET | /api/instances | JWT | Alimenter le filtre par instance |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : titre "Messages" + bouton "Send Message"
- **Barre de filtres** : filtre par instance + filtre par statut
- **MessageTable** : liste des messages
- **Pagination cursor** : bouton "Load more"
- **SendMessageModal** : modale d'envoi

---

## Composants de la page

### MessageFilters
Props :
```ts
{
  instances: Instance[]
  selectedInstanceId: string | null
  selectedStatus: string | null
  onInstanceChange: (id: string | null) => void
  onStatusChange: (status: string | null) => void
}
```
Deux dropdowns :
- Instance : "All instances" + liste des instances par nom
- Statut : "All statuses" | `sent` | `delivered` | `read` | `failed`

### MessageTable
Props : `messages: Message[]`
Colonnes :
- **To** : numéro destinataire
- **Type** : badge type (text, image, video, etc.)
- **Preview** : extrait de `body` (50 chars max) ou "[media]"
- **Status** : badge coloré
- **Instance** : nom de l'instance (`instanceId`)
- **Date** : date relative
- Clic sur une ligne → `/messages/{id}`

Statut badges :
- `queued` : gray
- `sent` : blue
- `delivered` : green
- `read` : purple
- `failed` : red

### LoadMoreButton
Affiché si `hasMore: true`.
Props : `onClick: () => void; loading: boolean`
Texte : "Load more messages"
Au clic, appel avec le `nextCursor` courant.

### SendMessageModal
Props : `instances: Instance[]; onSuccess: (message: Message) => void; onClose: () => void`

Champs :
- `instanceId` — select parmi les instances connectées, required
- `to` — phone number, required (ex: +22912345678)
- `type` — select : text | image | video | audio | document
- `text` — textarea, required si type=text
- `mediaUrl` — url input, required si type != text
- `scheduledAt` — datetime optionnel (pour envoi programmé)
- `contactId` — UUID optionnel (liaison contact)

Bouton "Send" ou "Schedule" (selon si scheduledAt rempli).

---

## États à gérer
- `loading.initial` : skeleton de table
- `loading.more` : spinner dans LoadMoreButton
- `empty` : "No messages found." (avec ou sans filtres)
- `empty.filtered` : "No messages match your filters."
- `error.quota` : toast si retour 429 `MONTHLY_OUTBOUND_QUOTA_EXCEEDED`
- `sending` : loading dans SendMessageModal
- `error.send` : messages d'erreur dans la modale

---

## Actions utilisateur

### Charger la liste initiale
- Au montage : `GET /api/messages?limit=20`
- Stocker `messages`, `nextCursor`, `hasMore`

### Filtrer
- Déclencheur : changement de dropdown instance ou statut
- Réinitialiser le cursor (supprimer), relancer `GET /api/messages?limit=20&instanceId=X&status=Y`

### Charger plus
- Déclencheur : bouton "Load more"
- Appel API : `GET /api/messages?limit=20&cursor={nextCursor}&instanceId=X&status=Y`
- Succès : **ajouter** les nouveaux messages à la liste existante (append, pas replace), mettre à jour `nextCursor` et `hasMore`

### Envoyer un message
- Déclencheur : bouton "Send Message" → SendMessageModal → submit
- Appel API : `POST /api/messages/send` — payload selon les champs
- Succès : fermer modale + prepend le nouveau message en tête de liste + toast "Message queued"
- Erreur 429 `MONTHLY_OUTBOUND_QUOTA_EXCEEDED` : "Monthly message quota exhausted. Upgrade your plan."
- Erreur 404 `NOT_FOUND` : "Instance not found."
- Erreur 400 `VALIDATION_ERROR` : par champ

### Accéder au détail d'un message
- Déclencheur : clic sur une ligne
- Action : `router.push('/messages/{id}')`

---

## Règles métier
- Cursor = ID du dernier message reçu. Passer `?cursor={id}` pour la page suivante.
- Quand les filtres changent, remettre le cursor à null et vider la liste.
- Seules les instances avec `status: "connected"` sont sélectionnables dans SendMessageModal.
- Un message `scheduled` (via `scheduledAt`) sera envoyé après le délai — statut initial = `queued`.

---

## Payloads de référence

Response GET /api/messages?limit=20:
```json
{
  "data": {
    "messages": [
      {
        "id": "msg_abc",
        "instanceId": "inst_xyz",
        "contactId": null,
        "campaignId": null,
        "type": "text",
        "to": "+22912345678",
        "body": "Bonjour, votre commande est prête !",
        "mediaUrl": null,
        "status": "delivered",
        "error": null,
        "providerMessageId": "BAE5D...",
        "createdAt": "2026-03-27T10:30:00.000Z",
        "updatedAt": "2026-03-27T10:31:00.000Z"
      }
    ],
    "nextCursor": "msg_prev_id",
    "hasMore": true
  }
}
```

Request POST /api/messages/send:
```json
{
  "instanceId": "inst_xyz",
  "to": "+22912345678",
  "type": "text",
  "text": "Bonjour, votre commande est prête !"
}
```

Response POST /api/messages/send:
```json
{
  "data": {
    "id": "msg_new123",
    "instanceId": "inst_xyz",
    "type": "text",
    "to": "+22912345678",
    "body": "Bonjour, votre commande est prête !",
    "status": "queued",
    "createdAt": "2026-03-27T10:35:00.000Z"
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
- Temps réel (push des mises à jour de statut)
- Export CSV des messages
- Suppression de messages
