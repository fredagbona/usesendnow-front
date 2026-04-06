# SPEC — Portal / Campaign Composer v2
App: portal
Routes concernées:
- /campaigns
- /campaigns/[id]
Auth: required
Status: ready

---

## Purpose
Empêcher la création de campagnes sans contenu à envoyer.

Une campagne doit maintenant avoir :
- `instanceId` obligatoire
- `schedule` obligatoire
- `recipients` obligatoires
- et **exactement un mode de contenu** :
  - soit `templateId`
  - soit un message direct avec `type` + contenu associé

Il est interdit de créer une campagne “vide”.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/campaigns | JWT | Lister les campagnes |
| POST | /api/campaigns | JWT | Créer une campagne |
| GET | /api/campaigns/{id} | JWT | Lire une campagne |
| GET | /api/instances | JWT | Choisir une instance |
| GET | /api/templates | JWT | Choisir un template |

La même logique s’applique aussi à l’API publique `POST /api/v1/campaigns`.

---

## Modes de contenu autorisés

### 1. Mode template
Payload :
- `templateId`
- `variables` optionnel pour les `custom.*`

Ne pas envoyer en plus :
- `type`
- `body`
- `mediaUrl`

### 2. Mode direct
Payload :
- `type`
- `body` si `type === "text"`
- `mediaUrl` si type média

Types directs supportés :
- `text`
- `image`
- `video`
- `audio`
- `document`
- `voice_note`

### Règle stricte
Le frontend doit empêcher :
- template + direct en même temps
- aucun mode sélectionné

---

## Validation métier attendue

### Champs toujours obligatoires
- `name`
- `instanceId`
- `schedule`
- `recipients`

### Validation recipients
- `recipients.type === "all"` :
  - pas de sélection supplémentaire requise
- `recipients.type === "tags"` :
  - `recipients.value` doit contenir au moins un tag
- `recipients.type === "explicit"` :
  - `recipients.value` doit contenir au moins un contactId

### Validation mode direct
- `type === "text"` :
  - `body` obligatoire
  - `mediaUrl` inutile
- `type === "image" | "video" | "audio" | "document" | "voice_note"` :
  - `mediaUrl` obligatoire
  - `body` optionnel
  - pour `image`, `video`, `document`, `body` sert de caption
  - pour `audio` et `voice_note`, `body` peut être ignoré côté provider

---

## UX recommandée dans la modale / page de création

### Étape 1 — Informations générales
- `name`
- `instanceId`
- `schedule`
- `repeat`

### Étape 2 — Audience
- radio :
  - `All contacts`
  - `Tags`
  - `Specific contacts`
- afficher les champs liés seulement au type choisi

### Étape 3 — Contenu
radio obligatoire :
- `Use a template`
- `Write a direct message`

#### Si `Use a template`
- afficher `templateId`
- afficher éventuellement les champs `custom.*` requis
- masquer les champs `type/body/mediaUrl`

#### Si `Write a direct message`
- afficher `type`
- selon le type :
  - `text` => textarea `body`
  - média => uploader / `mediaUrl` + caption éventuelle
- masquer `templateId`

### CTA
Le bouton `Create campaign` doit rester désactivé tant que :
- aucune instance
- aucun schedule
- aucun recipients valide
- aucun contenu valide

---

## Request payloads de référence

### Campagne template
```json
{
  "name": "Promo Avril",
  "instanceId": "d6f66e76-9e59-41a5-bba8-a45c7fb72bfc",
  "templateId": "b5d5cbe2-7b5a-4dbf-8b4d-8be4bde9f104",
  "variables": {
    "code": "AVRIL10"
  },
  "schedule": "2026-04-05T09:00:00.000Z",
  "repeat": "none",
  "recipients": {
    "type": "tags",
    "value": ["vip"]
  }
}
```

### Campagne message direct texte
```json
{
  "name": "Relance panier",
  "instanceId": "d6f66e76-9e59-41a5-bba8-a45c7fb72bfc",
  "type": "text",
  "body": "Bonjour, votre panier vous attend encore.",
  "schedule": "2026-04-05T09:00:00.000Z",
  "repeat": "none",
  "recipients": {
    "type": "explicit",
    "value": ["contact_1", "contact_2"]
  }
}
```

### Campagne message direct média
```json
{
  "name": "Promo visuelle",
  "instanceId": "d6f66e76-9e59-41a5-bba8-a45c7fb72bfc",
  "type": "image",
  "body": "Découvrez notre offre de la semaine",
  "mediaUrl": "https://res.cloudinary.com/.../promo.jpg",
  "schedule": "2026-04-05T09:00:00.000Z",
  "repeat": "none",
  "recipients": {
    "type": "all",
    "value": []
  }
}
```

---

## Réponses utiles pour le frontend

### Success create
La réponse campagne peut maintenant contenir :
- `templateId` si mode template
- ou `type/body/mediaUrl` si mode direct

### Erreurs validation attendues
| Code | HTTP | Cas |
|---|---:|---|
| VALIDATION_ERROR | 400 | payload invalide |
| NOT_FOUND | 404 | instance ou template introuvable |
| CAMPAIGNS_NOT_AVAILABLE_ON_PLAN | 403 | feature non incluse |
| MONTHLY_OUTBOUND_QUOTA_EXCEEDED | 429 | quota épuisé |

### Messages UX recommandés
- `Choose a template or write a direct message.`
- `A campaign cannot be created without content.`
- `Select at least one tag.`
- `Select at least one contact.`
- `A media campaign requires a file.`
- `A text campaign requires message content.`

---

## Lecture et affichage d’une campagne existante

Le frontend doit maintenant afficher le mode de contenu :
- si `templateId` est présent :
  - badge `Template`
  - montrer le template lié
- sinon si `type` est présent :
  - badge `Direct message`
  - montrer :
    - `type`
    - `body` si présent
    - `mediaUrl` si présent

Sur `/campaigns/[id]`, la meta card ne doit plus supposer qu’un template existe toujours.

---

## Points importants à montrer aux users
- `A campaign must have content before it can be scheduled.`
- `Choose one mode only: template or direct message.`
- `Direct message campaigns are sent as-is to each recipient.`
- `Template campaigns are rendered per recipient using template variables.`
