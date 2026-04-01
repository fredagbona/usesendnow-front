# SPEC — Portal / Message Detail
App: portal
Route: /messages/[id]
Auth: required
Status: ready

---

## Purpose
Affiche tous les détails d'un message individuel : contenu, statut, timestamps, instance source et éventuellement l'erreur si échec.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/messages/{id} | JWT | Charger le message |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : "Message Details" + bouton "Back to Messages" + badge statut
- **MessageDetailCard** : toutes les informations du message
- **ErrorCard** : affiché si `status: "failed"` et `error` présent

---

## Composants de la page

### MessageDetailCard
Props : `message: Message`

Sections affichées :
- **Status** : badge + label texte (ex: "Delivered")
- **Type** : badge type (text, image, video, etc.)
- **Recipient** : `to` (numéro de téléphone)
- **Instance** : `instanceId` (idéalement résoudre le nom — voir note)
- **Provider Message ID** : `providerMessageId` si présent (monospace, copiable)
- **Content** : selon le type
  - `text` → afficher `body`
  - `image/video/document` → lien vers `mediaUrl`
  - `location` → afficher lat/long depuis `meta`
  - autres → "[media type]"
- **Timestamps** :
  - Created : date complète (DD MMM YYYY, HH:mm:ss)
  - Updated : date complète
- **Campaign** : lien vers `/campaigns/{campaignId}` si `campaignId` présent
- **Contact** : `contactId` si présent

### ErrorCard
Affiché uniquement si `status === "failed"` et `error !== null`.
Props : `error: string`
Card rouge (outline) avec icône warning.
Affiche la raison de l'échec.

---

## États à gérer
- `loading` : skeleton pendant GET /api/messages/{id}
- `error.NOT_FOUND` : "Message not found." + bouton "Back to messages"
- `error.network` : toast d'erreur

---

## Actions utilisateur

### Charger le message
- Au montage : `GET /api/messages/{id}`
- Afficher les données

### Copier le Provider Message ID
- Déclencheur : bouton "Copy" à côté du providerMessageId
- Action : `navigator.clipboard.writeText(providerMessageId)` + toast "Copied"

### Retour à la liste
- Déclencheur : bouton "Back to Messages"
- Action : `router.push('/messages')` ou `router.back()`

---

## Règles métier
- La page est en lecture seule — aucune action de modification.
- Si `campaignId` présent → afficher un lien cliquable "View campaign" vers `/campaigns/{campaignId}`.
- Note sur l'instance : l'API retourne `instanceId` (UUID), pas le nom. Soit charger le nom via `/api/instances/{instanceId}`, soit afficher l'UUID tronqué.

---

## Payloads de référence

Response GET /api/messages/{id}:
```json
{
  "data": {
    "id": "msg_abc123",
    "userId": "user_xyz",
    "instanceId": "inst_abc",
    "contactId": null,
    "campaignId": "cmp_xyz",
    "type": "text",
    "to": "+22912345678",
    "body": "Bonjour, votre commande est prête !",
    "mediaUrl": null,
    "status": "delivered",
    "error": null,
    "meta": null,
    "providerMessageId": "BAE5D1234ABCDE5678",
    "createdAt": "2026-03-27T10:30:00.000Z",
    "updatedAt": "2026-03-27T10:31:00.000Z"
  }
}
```

Response (message échoué):
```json
{
  "data": {
    "id": "msg_fail123",
    "type": "text",
    "to": "+22900000000",
    "body": "Test message",
    "status": "failed",
    "error": "Invalid destination number",
    "providerMessageId": null,
    "createdAt": "2026-03-27T09:00:00.000Z",
    "updatedAt": "2026-03-27T09:00:05.000Z"
  }
}
```

---

## Out of scope
- Renvoyer un message échoué
- Éditer le message
- Voir le thread de conversation
