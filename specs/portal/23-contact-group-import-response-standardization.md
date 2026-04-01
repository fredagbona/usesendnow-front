
# SPEC — Portal Integration / Contacts, Groups and Imports Response Standardization
App: portal
Audience: frontend
Auth: required
Status: ready

---

## Purpose
Document de migration frontend pour la normalisation des reponses API contacts, groupes et imports.

Objectif:
- expliquer le changement de contrat
- lister tous les endpoints impactes
- montrer le mapping avant/apres
- permettre au frontend de corriger rapidement ses fetchers, hooks et pages

Le nouveau standard est:

```json
{
  "data": ...
}
```

Toutes les reponses console JWT de cette surface doivent maintenant etre lues via `response.data`.

---

## Pourquoi ce changement

Le backend etait incoherent:
- une partie des endpoints contacts respectait deja le standard `{ data: ... }`
- les endpoints groupes et imports renvoyaient parfois directement l'objet racine
- certains endpoints groupes renvoyaient `{ group: ... }`

Cela forçait le frontend a gerer plusieurs formes de payload pour une meme feature.

Le backend a ete corrige pour standardiser ces reponses.

---

## Endpoints impactes

| Method | Endpoint | Ancien format | Nouveau format |
|---|---|---|---|
| GET | /api/contacts/groups | `{ groups, total }` | `{ data: { groups, total } }` |
| POST | /api/contacts/groups | `{ group }` | `{ data: group }` |
| GET | /api/contacts/groups/{groupId} | `{ group }` | `{ data: group }` |
| PUT | /api/contacts/groups/{groupId} | `{ group }` | `{ data: group }` |
| DELETE | /api/contacts/groups/{groupId} | `{ deleted: true }` | `{ data: { deleted: true } }` |
| POST | /api/contacts/groups/{groupId}/members | objet direct | `{ data: objet }` |
| DELETE | /api/contacts/groups/{groupId}/members | objet direct | `{ data: objet }` |
| GET | /api/contacts/groups/{groupId}/members | objet direct | `{ data: objet }` |
| GET | /api/contacts/{id}/groups | `{ groups: [...] }` | `{ data: { groups: [...] } }` |
| POST | /api/contacts/import | objet direct | `{ data: objet }` |
| GET | /api/contacts/imports | objet direct | `{ data: objet }` |
| GET | /api/contacts/imports/{importId} | objet direct | `{ data: objet }` |

Non impactes:
- `GET /api/contacts`
- `POST /api/contacts`
- `GET /api/contacts/{id}`
- `PUT /api/contacts/{id}`
- `DELETE /api/contacts/{id}`

Ces endpoints utilisaient deja `{ data: ... }`.

---

## Regle frontend a appliquer

### Regle simple
Pour toute la surface `/api/contacts/*`, le frontend doit maintenant supposer:

```ts
const payload = response.data.data
```

Il ne faut plus lire:
- `response.data.group`
- `response.data.groups`
- `response.data.total`
- `response.data.mode`

Il faut lire l'objet metier dans `response.data.data`.

---

## Mapping avant / apres

### 1. List groups

#### Endpoint
`GET /api/contacts/groups`

#### Avant
```json
{
  "groups": [
    {
      "id": "grp_1",
      "name": "VIP",
      "description": "Best customers",
      "color": "#F59E0B",
      "membersCount": 12,
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-01T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

#### Maintenant
```json
{
  "data": {
    "groups": [
      {
        "id": "grp_1",
        "name": "VIP",
        "description": "Best customers",
        "color": "#F59E0B",
        "membersCount": 12,
        "createdAt": "2026-04-01T10:00:00.000Z",
        "updatedAt": "2026-04-01T10:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

#### Frontend
```ts
const result = response.data.data
const groups = result.groups
const total = result.total
```

### 2. Create group

#### Endpoint
`POST /api/contacts/groups`

#### Avant
```json
{
  "group": {
    "id": "grp_1",
    "name": "VIP",
    "description": "Best customers",
    "color": "#F59E0B"
  }
}
```

#### Maintenant
```json
{
  "data": {
    "id": "grp_1",
    "name": "VIP",
    "description": "Best customers",
    "color": "#F59E0B"
  }
}
```

#### Frontend
```ts
const group = response.data.data
```

### 3. Get group

#### Endpoint
`GET /api/contacts/groups/{groupId}`

#### Avant
```json
{
  "group": {
    "id": "grp_1",
    "name": "VIP",
    "description": "Best customers",
    "color": "#F59E0B"
  }
}
```

#### Maintenant
```json
{
  "data": {
    "id": "grp_1",
    "name": "VIP",
    "description": "Best customers",
    "color": "#F59E0B"
  }
}
```

### 4. Update group

#### Endpoint
`PUT /api/contacts/groups/{groupId}`

#### Avant
```json
{
  "group": {
    "id": "grp_1",
    "name": "VIP Updated",
    "description": "Best customers",
    "color": "#F59E0B"
  }
}
```

#### Maintenant
```json
{
  "data": {
    "id": "grp_1",
    "name": "VIP Updated",
    "description": "Best customers",
    "color": "#F59E0B"
  }
}
```

### 5. Delete group

#### Endpoint
`DELETE /api/contacts/groups/{groupId}`

#### Avant
```json
{
  "deleted": true
}
```

#### Maintenant
```json
{
  "data": {
    "deleted": true
  }
}
```

### 6. Add / remove / list members

#### Endpoints
- `POST /api/contacts/groups/{groupId}/members`
- `DELETE /api/contacts/groups/{groupId}/members`
- `GET /api/contacts/groups/{groupId}/members`

#### Regle frontend
Les reponses metier restent identiques dans leur contenu, mais elles sont maintenant enveloppees dans `data`.

Exemple:

#### Avant
```json
{
  "members": [
    {
      "id": "cnt_1",
      "name": "Awa",
      "phone": "+22912345678"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

#### Maintenant
```json
{
  "data": {
    "members": [
      {
        "id": "cnt_1",
        "name": "Awa",
        "phone": "+22912345678"
      }
    ],
    "nextCursor": null,
    "hasMore": false
  }
}
```

### 7. Get groups for a contact

#### Endpoint
`GET /api/contacts/{id}/groups`

#### Avant
```json
{
  "groups": [
    {
      "id": "grp_1",
      "name": "VIP",
      "color": "#F59E0B"
    }
  ]
}
```

#### Maintenant
```json
{
  "data": {
    "groups": [
      {
        "id": "grp_1",
        "name": "VIP",
        "color": "#F59E0B"
      }
    ]
  }
}
```

### 8. CSV import

#### Endpoint
`POST /api/contacts/import`

#### Avant
```json
{
  "mode": "async",
  "importId": "imp_123",
  "status": "pending"
}
```

#### Maintenant
```json
{
  "data": {
    "mode": "async",
    "importId": "imp_123",
    "status": "pending"
  }
}
```

#### Frontend
```ts
const result = response.data.data
const mode = result.mode
const importId = result.importId
```

### 9. List imports

#### Endpoint
`GET /api/contacts/imports`

#### Avant
```json
{
  "imports": [...],
  "nextCursor": null,
  "hasMore": false
}
```

#### Maintenant
```json
{
  "data": {
    "imports": [...],
    "nextCursor": null,
    "hasMore": false
  }
}
```

### 10. Get import detail

#### Endpoint
`GET /api/contacts/imports/{importId}`

#### Avant
```json
{
  "id": "imp_123",
  "status": "done",
  "summary": {
    "created": 120,
    "updated": 5,
    "failed": 2
  }
}
```

#### Maintenant
```json
{
  "data": {
    "id": "imp_123",
    "status": "done",
    "summary": {
      "created": 120,
      "updated": 5,
      "failed": 2
    }
  }
}
```

---

## Pages frontend impactees

### `/contacts`
Verifier:
- liste principale des contacts non impactee
- panneau/group picker d'un contact impacte si `GET /api/contacts/{id}/groups` est utilise

### `/contacts/groups`
Impactee directement:
- liste des groupes
- creation
- edition
- suppression

### `/contacts/groups/[groupId]`
Impactee directement:
- chargement detail groupe
- chargement membres
- ajout/suppression membres

### `/contacts/imports`
Impactee directement:
- listing des imports
- detail d'import
- submit CSV import

---

## Fix frontend recommande

### Adapter les clients API
Si vous avez des helpers comme:
```ts
api.get("/contacts/groups")
api.post("/contacts/groups", payload)
api.get(`/contacts/groups/${id}`)
```

Corriger les parseurs:

#### Avant
```ts
const groups = response.data.groups
const total = response.data.total
const group = response.data.group
```

#### Maintenant
```ts
const result = response.data.data
const groups = result.groups
const total = result.total
const group = result
```

### Pattern generique recommande
```ts
type ApiEnvelope<T> = {
  data: T
}
```

Puis:
```ts
const response = await api.get<ApiEnvelope<GroupListResponse>>("/contacts/groups")
return response.data.data
```

---

## Checklist frontend

- Corriger tous les hooks/groups pour lire `response.data.data`
- Corriger tous les hooks/imports pour lire `response.data.data`
- Corriger `getContactGroups(contactId)` pour lire `response.data.data.groups`
- Corriger `createGroup` / `updateGroup` / `getGroup` pour lire directement `response.data.data`
- Corriger les optimistic updates si elles dependaient de `response.data.group`
- Corriger les types TypeScript locaux si le root payload etait encore `group` ou `groups`

---

## Ce qui ne change pas

- Les routes elles-memes ne changent pas
- Les statuts HTTP ne changent pas
- Les payloads de requete ne changent pas
- Les erreurs `error.code`, `error.message`, `error.meta` ne changent pas
- L'endpoint webhook n'est pas concerne par cette normalisation

---

## Recommendation finale

Pour le frontend, considere maintenant que toute la surface console `/api/*` suit ce contrat:

```ts
type ApiSuccess<T> = { data: T }
type ApiFailure = { error: { code: string; message: string; meta?: unknown } }
```

Si un ancien hook lit encore une forme non enveloppee, il faut le migrer.
