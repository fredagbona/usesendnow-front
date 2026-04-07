# SPEC — Portal / Number Lookups
App: portal
Route: /number-lookups
Auth: required
Status: ready

---

## Purpose
Permettre à un utilisateur MsgFlash de :
- vérifier si un ou plusieurs numéros sont présents sur WhatsApp
- suivre un traitement asynchrone pour les gros volumes
- importer ensuite les numéros trouvés comme contacts MsgFlash

Cette feature dépend toujours d’une instance connectée choisie par l’utilisateur.

---

## Règles produit

- `instanceId` est obligatoire
- `< 1000` numéros : traitement synchrone
- `>= 1000` numéros : traitement asynchrone avec polling
- les résultats sont regroupés en :
  - `onWhatsApp`
  - `notOnWhatsApp`
  - `invalid`
- l’import contacts ne prend que les numéros `onWhatsApp`

---

## Backend endpoints utilisés

| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/instances | JWT | Lister les instances disponibles |
| POST | /api/number-lookups | JWT | Lancer une vérification sync ou async |
| GET | /api/number-lookups | JWT | Lister les vérifications passées |
| GET | /api/number-lookups/{id} | JWT | Lire le statut et le résultat |
| POST | /api/number-lookups/{id}/import-contacts | JWT | Importer les numéros valides en contacts |

---

## Layout de la page

### Zones principales
- **Header** : titre `Number Lookups`
- **LookupComposer** : instance + textarea / import de liste
- **LookupSummaryCards** : métriques résultat
- **LookupResultsTabs** : `On WhatsApp`, `Not on WhatsApp`, `Invalid`
- **LookupHistoryTable** : historique des jobs
- **ImportContactsPanel** : import vers contacts / groupe

---

## Composants

### LookupComposer
Props :
```ts
{
  instances: Instance[]
  onSubmit: (payload: { instanceId: string; numbers: string[] }) => Promise<void>
}
```

Champs :
- `instanceId` : select obligatoire
- `numbersInput` : textarea ou import texte collé

Règles frontend :
- une ligne = un numéro
- trim des lignes vides
- compteur live du nombre de numéros
- avertissement si `>= 1000` : `This lookup will run in background.`

### LookupSummaryCards
Affiche :
- `Requested`
- `Checked`
- `On WhatsApp`
- `Not on WhatsApp`
- `Invalid`

### LookupResultsTabs
3 onglets :
- `On WhatsApp`
- `Not on WhatsApp`
- `Invalid`

Chaque ligne `On WhatsApp` :
- input original
- numéro normalisé
- jid si utile en debug avancé seulement, pas en UI principale

Chaque ligne `Invalid` :
- input
- reason

### LookupHistoryTable
Colonnes :
- date
- instance
- status
- requested
- onWhatsAppCount
- notOnWhatsAppCount
- invalidCount
- actions

Actions :
- `View results`
- `Import contacts` si `status = done`

### ImportContactsPanel
Champs :
- `groupId` optionnel
- `tag` optionnel

Action :
- `Import valid numbers as contacts`

---

## États UI

- `idle`
- `loading.instances`
- `submitting.sync`
- `submitting.async`
- `polling`
- `done`
- `failed`
- `importingContacts`

Messages :
- sync : `Lookup completed`
- async : `Lookup started. Results will be available shortly.`
- failed : `Lookup failed. Please try again.`

---

## Contrats API utiles

### POST /api/number-lookups

Request :
```json
{
  "instanceId": "uuid",
  "numbers": ["+22901000000", "+22902000000"]
}
```

Réponse sync :
```json
{
  "data": {
    "mode": "sync",
    "lookupId": "uuid",
    "status": "done",
    "requested": 2,
    "normalized": 2,
    "checked": 2,
    "onWhatsAppCount": 1,
    "notOnWhatsAppCount": 1,
    "invalidCount": 0,
    "result": {
      "onWhatsApp": [],
      "notOnWhatsApp": [],
      "invalid": []
    }
  }
}
```

Réponse async :
```json
{
  "data": {
    "mode": "async",
    "lookupId": "uuid",
    "status": "pending",
    "requested": 1250,
    "message": "Lookup in progress. Check status later."
  }
}
```

### GET /api/number-lookups/{id}

Réponse :
```json
{
  "data": {
    "id": "uuid",
    "status": "done",
    "progress": 100,
    "requestedCount": 1250,
    "normalizedCount": 1180,
    "checkedCount": 1180,
    "onWhatsAppCount": 730,
    "notOnWhatsAppCount": 450,
    "invalidCount": 70,
    "result": {
      "onWhatsApp": [],
      "notOnWhatsApp": [],
      "invalid": []
    },
    "completedAt": "2026-04-07T10:00:00.000Z"
  }
}
```

### POST /api/number-lookups/{id}/import-contacts

Request :
```json
{
  "groupId": "uuid",
  "tag": "verified-whatsapp"
}
```

Response :
```json
{
  "data": {
    "requested": 730,
    "created": 650,
    "updated": 80,
    "skipped": 0
  }
}
```

---

## UX recommandé

### Après création sync
- afficher immédiatement le résumé
- ouvrir automatiquement l’onglet `On WhatsApp`
- proposer `Import contacts`

### Après création async
- rediriger vers `/number-lookups/{lookupId}` ou ouvrir le détail
- poll toutes les 3 à 5 secondes tant que `status` est `pending` ou `processing`

### Import contacts
- succès :
  - `Contacts imported successfully`
- succès partiel :
  - `Some contacts were imported, some were skipped`

---

## Erreurs à gérer

| Code | HTTP | Quand |
|---|---|---|
| `VALIDATION_ERROR` | 400 | payload invalide |
| `NOT_FOUND` | 404 | instance introuvable |
| `LOOKUP_NOT_FOUND` | 404 | lookup introuvable |
| `LOOKUP_NOT_READY` | 400 | import demandé avant la fin |
| `CONTACT_GROUP_NOT_FOUND` | 404 | groupe cible introuvable |
| `PROVIDER_ERROR` | 502 | provider lookup en échec |
| `PROVIDER_TIMEOUT` | 502 | timeout provider |
| `PROVIDER_UNAVAILABLE` | 502 | provider indisponible |

Ne jamais afficher le message technique brut du provider en UI finale.

---

## Messages frontend à afficher

- `Choose a connected instance before running a lookup.`
- `Large lookup detected. We’ll process it in background.`
- `Only numbers found on WhatsApp can be imported as contacts.`
- `Invalid numbers are excluded before provider verification.`

---

## Out of scope

- export CSV des résultats
- import direct via fichier CSV pour cette V1
- suppression d’un lookup
