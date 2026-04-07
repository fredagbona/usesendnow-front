# SPEC — Portal / Buttons Messages
App: portal
Route: /messages/send
Auth: required
Status: ready

---

## Purpose
Permettre à un utilisateur MsgFlash d'envoyer des messages avec boutons interactifs via l'API publique.

**Important :** Cette fonctionnalité nécessite un compte WhatsApp Business. Les boutons ne fonctionnent pas sur WhatsApp standard.

---

## Règles produit

- `type: "buttons"` obligatoire
- `title`, `description` obligatoires
- `buttons` obligatoire, array de 1 à 2 boutons maxi
- Types de boutons supportés : `reply`, `copy`, `url`, `call`, `pix`
- Chaque bouton doit avoir `title` et `displayText`
- Champs optionnels selon le type :
  - `reply` : `id`
  - `copy` : `copyCode`
  - `url` : `url`
  - `call` : `phoneNumber`
  - `pix` : `currency`, `name`, `keyType`, `key`

---

## Layout de la page

### Zones principales
- **MessageComposer** : ajout d'un onglet "Buttons" dans le type de message
- **ButtonBuilder** : interface pour configurer les boutons (max 2)
- **Preview** : aperçu du message avec boutons

### Composants

#### ButtonBuilder
Props :
```ts
{
  buttons: Button[]
  onChange: (buttons: Button[]) => void
}
```

Champs par bouton :
- `type` : select (reply, copy, url, call, pix)
- `displayText` : input text (max 50 chars)
- Champs conditionnels selon type

Validation :
- Max 2 boutons
- `displayText` requis
- Validation des URLs, numéros, etc.

#### Preview
Affiche :
- Titre
- Description
- Footer (optionnel)
- Liste des boutons avec leur type

---

## Contrats API

### POST /api/v1/messages/send

Request :
```json
{
  "instanceId": "uuid",
  "to": "+22901000000",
  "type": "buttons",
  "title": "Choisissez une option",
  "description": "Que souhaitez-vous faire ?",
  "footer": "Répondez rapidement",
  "buttons": [
    {
      "title": "reply",
      "displayText": "Option 1",
      "id": "opt1"
    },
    {
      "title": "url",
      "displayText": "Visiter le site",
      "url": "https://example.com"
    }
  ]
}
```

Response :
```json
{
  "data": {
    "id": "uuid",
    "status": "queued",
    "to": "+22901000000",
    "type": "buttons"
  }
}
```

---

## UX recommandé

### Ajout de boutons
- Bouton "+" pour ajouter un bouton (max 2)
- Drag & drop pour réorganiser
- Suppression individuelle

### Validation
- Erreur si plus de 2 boutons
- Erreur si champs requis manquants
- Warning : "Nécessite WhatsApp Business"

### Aperçu
- Rendu fidèle à WhatsApp
- Boutons cliquables en preview (mais inactifs)

---

## Erreurs à gérer

| Code | HTTP | Quand |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Payload invalide (e.g., >2 boutons) |
| `UNSUPPORTED_FEATURE` | 403 | Compte non Business |

---

## Messages frontend à afficher

- `Buttons require a WhatsApp Business account.`
- `Maximum 2 buttons allowed.`
- `Button text is required.`
- `Invalid URL format.`

---

## Out of scope

- Templates avec boutons
- Plus de 2 boutons
- Boutons dynamiques via variables