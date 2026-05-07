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
- `< 100` numéros : traitement synchrone
- `>= 100` numéros : traitement asynchrone avec polling
- le backend traite les numéros valides par batchs provider de `20`
- les résultats sont regroupés en :
  - `onWhatsApp`
  - `notOnWhatsApp`
  - `invalid`
- l’import contacts ne prend que les numéros `onWhatsApp`

### Différence entre lookup sync et lookup async

Un **lookup sync** est une vérification courte que le backend traite dans la même requête HTTP.
Concrètement :
- l’utilisateur clique sur `Verify numbers`
- le frontend attend la réponse
- les résultats reviennent immédiatement dans la réponse API
- il n’y a pas d’écran de progression long ni de job à surveiller

Cas d’usage :
- petite liste
- test rapide
- vérification ponctuelle

Un **lookup async** est une vérification plus volumineuse, traitée en arrière-plan par un worker.
Concrètement :
- l’utilisateur clique sur `Verify numbers`
- le backend répond tout de suite avec un `lookupId`
- le traitement continue en arrière-plan
- le frontend doit afficher un état `in progress`
- puis interroger régulièrement l’endpoint de progression jusqu’à la fin

Cas d’usage :
- listes plus longues
- import en masse
- vérifications qui peuvent prendre plusieurs appels provider

### Ce que le user doit comprendre à l’écran

Le produit ne doit pas exposer seulement `sync` ou `async` comme jargon brut.
Il faut expliquer clairement ce que cela veut dire pour l’utilisateur :

- **Vérification instantanée**
  - utilisée pour les petites listes
  - les résultats s’affichent directement

- **Vérification en arrière-plan**
  - utilisée pour les listes plus longues
  - le traitement continue pendant que l’utilisateur peut rester sur la page
  - une progression est affichée jusqu’à la fin

Le frontend peut garder les termes techniques `sync` / `async` dans le code ou en debug, mais en UI il faut préférer :
- `Instant verification`
- `Background verification`

---

## Backend endpoints utilisés

| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/instances | JWT | Lister les instances disponibles |
| POST | /api/number-lookups | JWT | Lancer une vérification sync ou async |
| GET | /api/number-lookups | JWT | Lister les vérifications passées |
| GET | /api/number-lookups/{id} | JWT | Lire le statut et le résultat |
| GET | /api/number-lookups/{id}/progress | JWT | Suivre la progression d’un lookup async |
| POST | /api/number-lookups/{id}/cancel | JWT | Annuler un lookup pending/processing |
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
- indication si `< 100` :
  - `This verification will run instantly and return results directly.`
- indication si `>= 100` :
  - `This verification will run in background. You will be able to follow progress live.`

Bloc visuel recommandé sous la zone de saisie :

```txt
Small list (< 100 numbers)
Instant verification
Results appear immediately after submission.

Large list (100+ numbers)
Background verification
Processing continues in the background with live progress.
```

Ce bloc doit être visible avant soumission pour éviter la surprise UX.

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
- mode (`Instant` / `Background`)
- status
- progress
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
- `cancelling`
- `done`
- `failed`
- `cancelled`
- `importingContacts`

Messages :
- sync : `Lookup completed`
- async : `Lookup started. Results will be available shortly.`
- failed : `Lookup failed. Please try again.`
- cancelled : `Lookup cancelled.`

Messages explicatifs recommandés :
- avant envoi d’une petite liste :
  - `This list will be verified instantly.`
- avant envoi d’une grande liste :
  - `This list will be verified in the background. You can follow progress live.`
- pendant un async :
  - `Verification in progress...`
- sous la barre de progression :
  - `Checked {checkedCount} of {normalizedCount} valid numbers`
- en fin de traitement :
  - `Verification completed`

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
    "requested": 400,
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

### GET /api/number-lookups/{id}/progress

Réponse :
```json
{
  "data": {
    "id": "uuid",
    "status": "processing",
    "progress": 60,
    "requestedCount": 400,
    "normalizedCount": 392,
    "checkedCount": 240,
    "onWhatsAppCount": 151,
    "notOnWhatsAppCount": 89,
    "invalidCount": 8,
    "error": null,
    "createdAt": "2026-05-07T10:00:00.000Z",
    "updatedAt": "2026-05-07T10:00:07.000Z",
    "completedAt": null
  }
}
```

Interprétation frontend :
- `pending`
  - le job a été créé mais n’a pas encore commencé
- `processing`
  - le worker traite actuellement les batchs
- `done`
  - la vérification est terminée, les résultats complets sont disponibles
- `failed`
  - la vérification a échoué
- `cancelled`
  - la vérification a été interrompue par l’utilisateur

### POST /api/number-lookups/{id}/cancel

Réponse :
```json
{
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "completedAt": "2026-05-07T10:00:08.000Z"
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

### Stratégie frontend recommandée
- si `numbers.length < 100` :
  - appel direct
  - attendre la réponse synchrone
- si `numbers.length >= 100` :
  - envoyer le lookup
  - rediriger vers la vue détail / suivi
  - poller `GET /api/number-lookups/{id}/progress` toutes les `2s`
  - arrêter le polling quand `status` devient :
    - `done`
    - `failed`
    - `cancelled`

### Présentation visuelle recommandée

Pour un lookup async, afficher au minimum :
- un badge `Background verification`
- une barre de progression
- le pourcentage
- les compteurs intermédiaires :
  - `Checked`
  - `On WhatsApp`
  - `Not on WhatsApp`
  - `Invalid`
- un bouton `Cancel lookup`

Exemple de rendu textuel :

```txt
Background verification
We are checking your numbers in batches.

[██████████░░░░░░░░] 60%

Checked: 240 / 392
On WhatsApp: 151
Not on WhatsApp: 89
Invalid: 8

[Cancel lookup]
```

Pour un lookup sync, ne pas montrer une barre de progression longue.
Afficher seulement un état court de chargement :

```txt
Instant verification
Checking your numbers...
```

### Actions UI recommandées
- afficher le bouton `Cancel lookup` seulement si `status` est :
  - `pending`
  - `processing`
- masquer `Import contacts` tant que `status !== done`
- afficher les counts intermédiaires pendant `processing`
- si `status = cancelled`, afficher les résultats partiels seulement si le backend en stocke plus tard
  - pour cette V1, considérer qu’un lookup annulé n’a pas de résultat exploitable

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
