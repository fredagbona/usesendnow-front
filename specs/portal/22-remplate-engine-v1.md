# SPEC — Portal Integration / Template Engine v1
App: portal
Audience: frontend
Auth: required
Status: ready

---

## Purpose
Document d'integration complet pour le vrai moteur de templates v1.

Objectif:
- permettre au frontend d'integrer la creation et l'edition de templates
- permettre le preview rendu avec vraies valeurs
- permettre l'envoi direct d'un message via `templateId`
- permettre la creation de campagnes avec variables `custom.*`
- afficher correctement les erreurs de rendu et les metadonnees des messages generes depuis un template

Le moteur v1 supporte uniquement l'interpolation de variables.
Il ne supporte pas:
- conditions
- boucles
- filtres
- logique de formatage avancee

---

## Regles fonctionnelles a respecter

### Syntaxe des variables
- Format unique: `{{ path.to.value }}`
- Segments autorises: alphanumeriques + `_`
- Namespaces autorises:
  - `contact.*`
  - `user.*`
  - `instance.*`
  - `custom.*`
- Exemples valides:
  - `{{contact.firstName}}`
  - `{{contact.name}}`
  - `{{user.fullName}}`
  - `{{instance.name}}`
  - `{{custom.code}}`

### Source de verite
- `Template.variables` est derive automatiquement du `body` par le backend.
- Le frontend peut afficher la liste des variables, mais ne doit pas etre la source de verite.
- Le frontend peut envoyer `variables` dans les payloads de template pour compatibilite legacy, mais doit considerer que le backend recalculera toujours la liste reelle.

### Rendu
- Le texte final rendu est persiste dans `Message.body`.
- Le template brut n'est jamais envoye tel quel au provider.
- En cas de variables manquantes:
  - envoi direct: erreur `400 TEMPLATE_VARIABLES_MISSING`
  - campagne: le contact concerne cree un `Message` en `failed`, la campagne continue pour les autres contacts

---

## Pages impactees

### 1. `/templates`
La page templates doit maintenant gerer:
- templates texte et media
- preview rendu via endpoint backend
- affichage des variables detectees automatiquement

### 2. `/messages`
La modale d'envoi doit proposer 2 modes:
- `freeform`
- `template`

### 3. `/messages/[id]`
La page detail doit afficher les metadonnees de rendu si presentes dans `message.meta`.

### 4. `/campaigns`
La modale de creation doit supporter:
- `templateId`
- `variables` pour alimenter `custom.*`

---

## Endpoints backend utilises

| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/templates?page=1&limit=20 | JWT | Lister les templates |
| POST | /api/templates | JWT | Creer un template |
| GET | /api/templates/{id} | JWT | Detail template |
| PUT | /api/templates/{id} | JWT | Modifier template |
| DELETE | /api/templates/{id} | JWT | Supprimer template |
| POST | /api/templates/{id}/preview | JWT | Preview rendu |
| POST | /api/messages/send | JWT | Envoyer un message libre ou template |
| GET | /api/messages | JWT | Lister les messages |
| GET | /api/messages/{id} | JWT | Detail message |
| POST | /api/campaigns | JWT | Creer une campagne avec template |
| GET | /api/campaigns | JWT | Lister les campagnes |
| GET | /api/instances | JWT | Select instance |
| GET | /api/contacts | JWT | Select contact pour preview/message |

---

## Types frontend recommandes

```ts
type Template = {
  id: string
  userId: string
  name: string
  type: "text" | "image" | "video" | "audio" | "document"
  body: string | null
  mediaUrl: string | null
  variables: string[]
  createdAt: string
  updatedAt: string
}

type TemplatePreviewResponse = {
  rendered: string
  variables: string[]
  missingVariables: string[]
  valid: boolean
}

type TemplateRenderMeta = {
  templateId?: string
  usedVariables?: string[]
  missingVariables?: string[]
  code?: string
}

type Message = {
  id: string
  instanceId: string
  contactId: string | null
  campaignId: string | null
  type: string
  to: string
  body: string | null
  mediaUrl: string | null
  status: "queued" | "sent" | "delivered" | "read" | "failed" | "received"
  error: string | null
  meta: TemplateRenderMeta | null
  providerMessageId: string | null
  createdAt: string
  updatedAt: string
}
```

---

## Integration page `/templates`

### Layout attendu
- Header: "Templates" + bouton `New Template`
- TemplateGrid
- Pagination
- TemplateModal
- TemplatePreviewPanel
- DeleteTemplateModal

### TemplateGrid / TemplateCard
Afficher:
- `name`
- badge `type`
- preview de `body`
- si `type !== 'text'`, afficher aussi un badge `Media`
- liste `variables`
- date `updatedAt`
- actions: `Edit`, `Preview`, `Delete`

### TemplateModal
Props:
```ts
{
  mode: "create" | "edit"
  template?: Template
  onSuccess: (template: Template) => void
  onClose: () => void
}
```

Champs:
- `name`: required
- `type`: `text | image | video | audio | document`
- `body`:
  - requis si `type === "text"`
  - optionnel sinon
- `mediaUrl`:
  - requis si `type !== "text"`
  - null/hidden si `type === "text"`

Comportement:
- en mode edit, `type` reste immutable
- le frontend peut parser localement le body pour afficher un helper de variables detectees
- mais il ne doit pas faire confiance a son propre parsing comme source finale

### Preview dans `/templates`
Le preview ne doit plus etre purement visuel/local.
Il doit appeler le backend.

#### Endpoint
`POST /api/templates/{id}/preview`

#### Request
```json
{
  "instanceId": "inst_uuid_optional",
  "contactId": "contact_uuid_optional",
  "variables": {
    "code": "PROMO10",
    "amount": 1500
  }
}
```

#### Response
```json
{
  "data": {
    "rendered": "Bonjour Awa, votre code PROMO10 est pret.",
    "variables": ["contact.firstName", "custom.code"],
    "missingVariables": [],
    "valid": true
  }
}
```

### TemplatePreviewPanel
Props recommandees:
```ts
{
  template: Template
  instances: Instance[]
  contacts: Contact[]
  onClose: () => void
}
```

UI du preview:
- zone `Rendered Output`
- select `Instance` optionnel
- select `Contact` optionnel
- key/value builder pour `custom variables`
- liste des `variables`
- si `missingVariables.length > 0`, afficher warning
- bouton `Refresh preview`

### Etats a gerer sur `/templates`
- `loading.initial`
- `loading.page`
- `creating`
- `updating`
- `preview.loading`
- `preview.empty`
- `preview.valid`
- `preview.invalid`
- `deleting`
- `error.VALIDATION_ERROR`
- `error.TEMPLATE_INVALID`

### Payloads templates

#### POST /api/templates
```json
{
  "name": "Promo panier",
  "type": "text",
  "body": "Bonjour {{contact.firstName}}, utilisez {{custom.code}} aujourd'hui."
}
```

#### POST /api/templates media
```json
{
  "name": "Promo image",
  "type": "image",
  "body": "Bonjour {{contact.firstName}}, voici notre offre du jour.",
  "mediaUrl": "https://cdn.msgflash.com/offers/promo.jpg"
}
```

#### Response POST /api/templates
```json
{
  "data": {
    "id": "tmpl_abc123",
    "userId": "user_xyz",
    "name": "Promo panier",
    "type": "text",
    "body": "Bonjour {{contact.firstName}}, utilisez {{custom.code}} aujourd'hui.",
    "mediaUrl": null,
    "variables": ["contact.firstName", "custom.code"],
    "createdAt": "2026-04-01T11:00:00.000Z",
    "updatedAt": "2026-04-01T11:00:00.000Z"
  }
}
```

#### PUT /api/templates/{id}
```json
{
  "name": "Promo panier v2",
  "body": "Bonjour {{contact.firstName}}, utilisez {{custom.code}} avant ce soir."
}
```

### Messages d'erreur templates
- `VALIDATION_ERROR`: erreurs de formulaire standards
- `TEMPLATE_INVALID`: placeholder invalide ou template media incomplet

Message UI recommande:
- `TEMPLATE_INVALID`: "This template contains invalid placeholders or incomplete media settings."

---

## Integration page `/messages`

### SendMessageModal
La modale d'envoi doit maintenant avoir 2 onglets ou un switch:
- `Write manually`
- `Use template`

### Mode `Write manually`
Comportement existant:
- `instanceId`
- `to`
- `type`
- `text` ou `mediaUrl`
- `contactId` optionnel
- `scheduledAt` optionnel si la modale gere aussi la planification

### Mode `Use template`
Champs:
- `instanceId` required
- `to` required
- `templateId` required
- `contactId` optional mais recommande si le template utilise `contact.*`
- key/value builder `variables` pour `custom.*`
- preview inline optionnel via `POST /api/templates/{id}/preview`

#### Request `POST /api/messages/send`
```json
{
  "instanceId": "inst_xyz",
  "to": "+22912345678",
  "templateId": "tmpl_abc123",
  "contactId": "cnt_123",
  "variables": {
    "code": "PROMO10"
  }
}
```

#### Response
```json
{
  "data": {
    "id": "msg_new123",
    "instanceId": "inst_xyz",
    "contactId": "cnt_123",
    "campaignId": null,
    "type": "text",
    "to": "+22912345678",
    "body": "Bonjour Awa, utilisez PROMO10.",
    "mediaUrl": null,
    "status": "queued",
    "meta": {
      "templateId": "tmpl_abc123",
      "usedVariables": ["contact.firstName", "custom.code"]
    },
    "createdAt": "2026-04-01T11:30:00.000Z",
    "updatedAt": "2026-04-01T11:30:00.000Z"
  }
}
```

### Erreurs a gerer dans la modale d'envoi
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `TEMPLATE_INVALID`
- `TEMPLATE_VARIABLES_MISSING`
- `TEMPLATE_CONTEXT_UNAVAILABLE`
- `MONTHLY_OUTBOUND_QUOTA_EXCEEDED`

Messages UI recommandes:
- `TEMPLATE_VARIABLES_MISSING`: "Some template variables are missing. Complete the contact or custom variables."
- `TEMPLATE_CONTEXT_UNAVAILABLE`: "The selected contact or instance is unavailable for template rendering."
- `TEMPLATE_INVALID`: "The selected template is invalid."

### Listing `/messages`
La table peut continuer a utiliser:
- `body` comme preview
- `type`
- `status`

Si `message.meta?.templateId` existe:
- afficher badge `Template`
- afficher tooltip ou sous-texte `Generated from template`

---

## Integration page `/messages/[id]`

### Nouvelle section `Template Render`
A afficher si `message.meta?.templateId` existe.

Champs:
- `Template ID`
- `Used variables`
- `Missing variables` si presentes
- `Render code` si `meta.code` existe

### Cas d'echec
Si:
- `status === "failed"`
- et `error` contient une raison de rendu

Afficher une ErrorCard dediee:
- titre: `Template rendering failed`
- body: message d'erreur backend

Exemple de payload echec:
```json
{
  "data": {
    "id": "msg_fail123",
    "type": "text",
    "to": "+22900000000",
    "body": null,
    "status": "failed",
    "error": "Missing template variables: contact.firstName, custom.code",
    "meta": {
      "templateId": "tmpl_abc123",
      "missingVariables": ["contact.firstName", "custom.code"]
    }
  }
}
```

---

## Integration page `/campaigns`

### NewCampaignModal
Le template devient vraiment dynamique.

Champs:
- `name`
- `instanceId`
- `templateId` optional
- `variables` optional pour `custom.*`
- `recipients`
- `schedule`
- `repeat`

### UX recommandee
Si `templateId` est selectionne:
- afficher les `template.variables`
- distinguer visuellement:
  - variables resolues par contexte:
    - `contact.*`
    - `user.*`
    - `instance.*`
  - variables a saisir par l'utilisateur:
    - `custom.*`

Le frontend doit proposer un builder pour `custom.*`, par exemple:
- key: `code`
- value: `PROMO10`

Puis envoyer:
```json
{
  "name": "Promo avril",
  "instanceId": "inst_xyz",
  "templateId": "tmpl_abc123",
  "variables": {
    "code": "PROMO10",
    "amount": 1500
  },
  "schedule": "2026-04-02T10:00:00.000Z",
  "repeat": "none",
  "recipients": {
    "type": "all"
  }
}
```

### Comportement campagne
- le backend rend le template pour chaque destinataire
- si un contact n'a pas les variables requises, seul ce message echoue
- la campagne continue pour les autres destinataires

### Listing `/campaigns`
Pas de changement majeur sur la liste.
Option recommande:
- si `templateId` existe, afficher badge `Template`
- si la campagne a des `failed` dus au rendu, le detail campagne pourra les montrer via les messages lies

---

## Mapping des variables pour l'UI

### Variables resolues automatiquement
Le frontend n'a rien a saisir pour:
- `contact.name`
- `contact.firstName`
- `contact.phone`
- `contact.tags`
- `contact.meta.*`
- `user.fullName`
- `user.email`
- `user.phone`
- `instance.name`

### Variables que l'utilisateur doit fournir
Toute variable `custom.*`.

Exemple:
- `custom.code`
- `custom.amount`
- `custom.reference`

Regle UI:
- extraire les variables commencant par `custom.`
- afficher un champ d'edition pour chacune
- stocker la payload sous forme:
```json
{
  "code": "PROMO10",
  "amount": 1500
}
```

Le frontend ne doit pas envoyer:
```json
{
  "custom": {
    "code": "PROMO10"
  }
}
```

Le backend mappe deja l'objet `variables` recu dans le namespace `custom.*`.

---

## Etats et erreurs globaux

### Etats
- `templatePreview.loading`
- `templatePreview.ready`
- `templatePreview.invalid`
- `messageSend.templateMode`
- `messageSend.freeformMode`
- `campaignTemplate.loading`
- `campaignTemplate.ready`

### Codes d'erreur backend a brancher
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `TEMPLATE_INVALID`
- `TEMPLATE_VARIABLES_MISSING`
- `TEMPLATE_CONTEXT_UNAVAILABLE`
- `MONTHLY_OUTBOUND_QUOTA_EXCEEDED`

### Mapping UI recommande
| Code | UI |
|---|---|
| VALIDATION_ERROR | erreurs par champ |
| NOT_FOUND | toast ressource introuvable |
| TEMPLATE_INVALID | bloc d'erreur dans modale / preview |
| TEMPLATE_VARIABLES_MISSING | warning dans preview ou erreur submit |
| TEMPLATE_CONTEXT_UNAVAILABLE | demander de reselectionner contact/instance |
| MONTHLY_OUTBOUND_QUOTA_EXCEEDED | toast quota atteint |

---

## Checklist frontend

### Templates
- Remplacer la liste de variables saisies manuellement par un affichage derive du backend.
- Ajouter `mediaUrl` a la modale de template.
- Brancher `POST /api/templates/{id}/preview`.
- Ajouter une UI de saisie de `custom variables`.

### Messages
- Ajouter un mode `Use template` dans la modale d'envoi.
- Supporter `templateId` et `variables` dans `POST /api/messages/send`.
- Afficher badge `Template` si `message.meta.templateId` existe.

### Message detail
- Afficher la section `Template Render` si `message.meta` contient des infos de template.

### Campaigns
- Ajouter la saisie de `variables` dans `NewCampaignModal`.
- Montrer clairement quelles variables sont automatiques vs manuelles.

---

## Out of scope
- Conditions `if/else`
- Boucles
- Filtres type Liquid/Handlebars
- Versioning de templates
- Partage de templates entre utilisateurs
- Editeur visuel riche
