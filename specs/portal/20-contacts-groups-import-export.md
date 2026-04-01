# SPEC — Portal / Contact Groups, CSV Import & Export
App: portal
Routes: /contacts (mis à jour), /contacts/groups, /contacts/groups/:groupId
Auth: required
Status: ready

---

## Purpose
Extension du module contacts :
- Organiser les contacts dans des **groupes** (many-to-many)
- **Importer** des contacts depuis un fichier CSV (sync ≤500 lignes, async >500)
- **Exporter** tous les contacts ou un groupe en CSV
- Cibler un **groupe** comme destinataires d'une campagne

---

## Backend endpoints utilisés

| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/contacts/groups | JWT | Lister les groupes |
| POST | /api/contacts/groups | JWT | Créer un groupe |
| GET | /api/contacts/groups/:groupId | JWT | Détail d'un groupe |
| PUT | /api/contacts/groups/:groupId | JWT | Modifier un groupe |
| DELETE | /api/contacts/groups/:groupId | JWT | Supprimer un groupe |
| POST | /api/contacts/groups/:groupId/members | JWT | Ajouter des contacts |
| DELETE | /api/contacts/groups/:groupId/members | JWT | Retirer des contacts |
| GET | /api/contacts/groups/:groupId/members | JWT | Lister les contacts d'un groupe |
| GET | /api/contacts/:id/groups | JWT | Groupes d'un contact |
| POST | /api/contacts/import | JWT + multipart | Importer un CSV |
| GET | /api/contacts/imports | JWT | Lister les imports |
| GET | /api/contacts/imports/:importId | JWT | Statut d'un import async |
| GET | /api/contacts/export?groupId=... | JWT | Exporter en CSV |
| GET | /api/billing/subscription | JWT | Vérifier limite maxContactGroups |

---

## 1. Mise à jour de la page /contacts

### Nouvelles zones dans le header
- Bouton **"Import CSV"** (ouvre ImportModal)
- Bouton **"Export CSV"** (déclenche le téléchargement direct)
- Bouton **"Groups"** ou onglet → navigue vers `/contacts/groups`
- Badge plan sur le bouton "Groups" si limite atteinte

### Indicateur de limite de groupes
Récupérer via `GET /api/billing/subscription` → `limits.maxContactGroups`.
Afficher sous le bouton "Groups" : "3 / 10 groups used" (si plan le permet).
Si `maxContactGroups === -1` : pas de badge, illimité.

### Colonne "Groups" dans ContactTable
Ajouter une colonne **Groups** : badges des groupes du contact (2 max + "+N").
Cliquer sur un badge → `/contacts/groups/:groupId`.

---

## 2. Page /contacts/groups

### Layout
Layout standard portal.

### Zones principales
- **Header** : titre "Contact Groups" + bouton "New Group" + compteur "X / Y groups"
  - Si limite atteinte : bouton désactivé + tooltip "Upgrade to create more groups"
- **PlanLimitBanner** : si `count >= maxContactGroups` et `maxContactGroups !== -1`
- **GroupGrid** ou **GroupList** : liste des groupes (cards ou table)
- **GroupModal** : modale création/édition
- **DeleteGroupModal** : confirmation de suppression

### GroupCard / GroupRow
Infos affichées :
- Pastille de couleur (`color`)
- Nom du groupe
- Description (tronquée à 60 chars)
- Compteur de contacts : "47 contacts"
- Date de création (relative)
- Actions : "View" → `/contacts/groups/:groupId` | "Edit" | "Delete"

### GroupModal
Props :
```ts
{
  mode: "create" | "edit"
  group?: ContactGroup
  onSuccess: (group: ContactGroup) => void
  onClose: () => void
}
```

Champs :
- `name` — string, required, min 1, max 100
- `description` — textarea, optional, max 255
- `color` — color picker (hex, regex `/^#[0-9A-Fa-f]{6}$/`), optional
  - Proposer 6 couleurs prédéfinies : `#25D366`, `#F59E0B`, `#EF4444`, `#3B82F6`, `#8B5CF6`, `#EC4899`

Bouton : "Create Group" (create) ou "Save Changes" (edit).

### DeleteGroupModal
Props : `groupName: string; contactCount: number; onConfirm: () => void; onCancel: () => void`
Message : "Delete **{name}**? The {contactCount} contacts inside will NOT be deleted — only the group."

---

## 3. Page /contacts/groups/:groupId

### Layout
Layout standard portal avec breadcrumb : Contacts > Groups > {name}

### Zones principales
- **GroupHeader** : nom, description, pastille couleur, compteur, bouton "Edit" + "Delete"
- **SearchBar** : recherche dans les membres (param `search`)
- **MembersTable** : liste paginée des contacts membres
- **AddMembersModal** : ajouter des contacts existants au groupe
- **RemoveMemberModal** : confirmation de retrait

### MembersTable
Colonnes :
- **Name** : nom du contact
- **Phone** : numéro
- **Tags** : badges (3 max)
- **Added** : `addedAt` relatif
- **Actions** : bouton "Remove from group"

Pagination cursor-based :
- Bouton "Load more" en bas (ou infinite scroll)
- Paramètres : `?limit=50&cursor=<id>&search=<string>`

### AddMembersModal
- Champ de recherche des contacts de l'utilisateur (appel `GET /api/contacts` + filtre local)
- Liste avec checkboxes
- Bouton "Add X contacts"
- Appel : `POST /api/contacts/groups/:groupId/members` → `{ contactIds: [...] }`
- Retour : toast "X contacts added" + refresh liste membres

---

## 4. Import CSV — ImportModal

### Déclencheur
Bouton "Import CSV" depuis `/contacts`.

### Composant ImportModal
Props : `onSuccess: (result: ImportResult) => void; onClose: () => void`

#### Étapes (wizard 3 étapes)

**Étape 1 — Upload**
- Zone drag & drop ou bouton "Choose file"
- Formats acceptés : `.csv` uniquement
- Taille max : 5MB (indiquer dans l'UI)
- Lien "Download sample CSV" → génère ou télécharge un fichier exemple
- Champ optionnel : "Assign to group" → select parmi les groupes existants
- Bouton "Next" → valide la présence d'un fichier

**Étape 2 — Preview**
- Afficher les 3 premières lignes du CSV côté client pour confirmer le format
- Indiquer le nombre total de lignes détectées
- Avertissement si >500 lignes : "⚠ Large file: import will run in the background"
- Bouton "Import" → déclenche l'appel API

**Étape 3 — Résultat**
- **Sync (≤500 lignes)** : affiche le rapport immédiatement
  ```
  ✓ 38 contacts imported
  ↻ 5 contacts updated
  ✗ 2 invalid (see details)
  ```
  - Si `errors.length > 0` : section dépliable "Show errors" avec tableau ligne/numéro/raison
  - Bouton "Done"

- **Async (>500 lignes)** : affiche un état intermédiaire
  ```
  ⏳ Import in progress — importId: imp_abc123
  You can close this window. Check status in the Imports tab.
  ```
  - Bouton "Close"

### Appel API
```
POST /api/contacts/import
Content-Type: multipart/form-data

file: <csv file>
groupId: <optional>
```

**Réponse sync (mode: "sync")** :
```json
{
  "mode": "sync",
  "totalRows": 45,
  "importedCount": 38,
  "updatedCount": 5,
  "skippedCount": 0,
  "invalidCount": 2,
  "errors": [
    { "line": 4,  "phone": "0601000000", "reason": "Phone must be in international format (+XXX...)" },
    { "line": 17, "phone": "+999000000", "reason": "Invalid phone number: +999000000" }
  ]
}
```

**Réponse async (mode: "async")** :
```json
{
  "mode": "async",
  "importId": "imp_abc123",
  "status": "pending",
  "totalRows": 2500,
  "message": "Import in progress. Check status via GET /api/contacts/imports/imp_abc123"
}
```

### Format CSV attendu (à documenter dans l'UI)
```
phone,name,tags
+22901000000,Kouassi Amara,vip|benin
+22501000000,Fatou Diallo,client
+33612345678,Jean Dupont,
```
- `phone` : obligatoire, format international E.164 (+XXX...)
- `name` : optionnel
- `tags` : optionnel, séparés par `|`

---

## 5. Onglet / Section "Imports" dans /contacts

### Déclencheur
Onglet "Imports" dans la page `/contacts` ou lien depuis le résultat async de l'ImportModal.

### Layout
Table paginée des imports passés.

### ImportsTable
Colonnes :
- **Date** : `createdAt` relatif
- **Status** : badge coloré
  - `pending` : gray "Pending"
  - `processing` : blue (avec pulse) "Processing…"
  - `done` : green "Done"
  - `failed` : red "Failed"
- **Rows** : `totalRows`
- **Imported** : `importedCount`
- **Updated** : `updatedCount`
- **Invalid** : `invalidCount`
- **Actions** : bouton "Details" (si `status: done` et `report` disponible)

### Polling pour les imports en cours
- Si un import a `status: pending` ou `processing` → poll `GET /api/contacts/imports/:importId` toutes les 3 secondes
- Arrêter le poll quand `status: done` ou `failed`
- Toast "Import completed — 2341 contacts imported" quand `done`

### Appel liste
```
GET /api/contacts/imports?limit=10&cursor=<id>
```

**Réponse** :
```json
{
  "imports": [
    {
      "id": "imp_abc123",
      "status": "done",
      "totalRows": 2500,
      "importedCount": 2341,
      "updatedCount": 150,
      "skippedCount": 0,
      "invalidCount": 9,
      "groupId": "grp_abc",
      "createdAt": "2026-03-27T10:00:00.000Z",
      "completedAt": "2026-03-27T10:02:13.000Z"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

---

## 6. Export CSV

### Déclencheur
- Bouton "Export CSV" dans la page `/contacts` → export de tous les contacts
- Bouton "Export" dans la page `/contacts/groups/:groupId` → export du groupe uniquement

### Comportement
- Appel : `GET /api/contacts/export` (tous) ou `GET /api/contacts/export?groupId=grp_abc`
- Le navigateur déclenche le téléchargement automatiquement (`Content-Disposition: attachment`)
- Nom du fichier : `contacts-2026-03-27.csv`
- Toast "Export started…" pendant le chargement + disparaît à la fin
- Pas de modale intermédiaire

### Implémentation frontend
```ts
const handleExport = async (groupId?: string) => {
  const url = groupId
    ? `/api/contacts/export?groupId=${groupId}`
    : `/api/contacts/export`

  // Déclencher le téléchargement avec le token JWT
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const blob = await response.blob()
  const filename = response.headers.get('Content-Disposition')
    ?.split('filename=')[1] ?? 'contacts.csv'

  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
```

### Format CSV exporté
```
phone,name,tags,groups,createdAt
+22901000000,Kouassi Amara,vip|benin,Clients VIP|Bénin,2026-03-01T10:00:00Z
+22501000000,Fatou Diallo,client,Clients VIP,2026-02-15T08:00:00Z
```

---

## 7. Mise à jour de NewCampaignModal — stratégie "group"

Dans la section **Recipients** de la modale de création de campagne, ajouter l'option :

```
Type : radio  ○ All  ○ Tags  ○ Group  ○ Explicit
```

Quand `group` est sélectionné :
- Afficher un `<select>` alimenté par `GET /api/contacts/groups`
- Payload envoyé :
  ```json
  { "type": "group", "groupId": "grp_abc123" }
  ```
- Si aucun groupe n'existe : afficher "No groups yet. Create a group first." avec lien

---

## 8. États à gérer

### Page /contacts/groups
- `loading.initial` : skeleton de cards
- `empty` : "No groups yet. Create your first group to organize your contacts."
- `plan_limit` : PlanLimitBanner + bouton "New Group" désactivé
- `creating` : loading dans GroupModal
- `updating` : loading dans GroupModal
- `deleting` : loading sur le bouton Delete
- `error.MAX_CONTACT_GROUPS_REACHED` (403) : "You've reached your plan's group limit. Upgrade to create more."
- `error.CONFLICT` (409) : "A group with this name already exists."
- `error.NOT_FOUND` (404) : toast "Group not found."

### Page /contacts/groups/:groupId
- `loading.initial` : skeleton
- `empty.members` : "No contacts in this group yet. Add some."
- `adding` : loading dans AddMembersModal
- `removing` : loading sur le bouton "Remove"
- `error.NOT_FOUND` : redirect `/contacts/groups` + toast "Group not found"

### ImportModal
- `uploading` : spinner + "Importing…"
- `error.CSV_INVALID_FORMAT` (400) : "Invalid CSV format. Check the file encoding and column headers."
- `error.CSV_TOO_LARGE` (400) : "File too large. Max 5MB and 10,000 rows."
- `error.NOT_FOUND` (groupId invalide) : "The selected group was not found."

---

## 9. Codes d'erreur backend à gérer

| Code | HTTP | Message affiché |
|---|---|---|
| `MAX_CONTACT_GROUPS_REACHED` | 403 | "Group limit reached. Upgrade your plan." |
| `NOT_FOUND` (group) | 404 | "Group not found." |
| `CONFLICT` (nom groupe) | 409 | "A group named '{name}' already exists." |
| `CSV_INVALID_FORMAT` | 400 | "Invalid CSV file. Check headers and encoding." |
| `CSV_TOO_LARGE` | 400 | "File exceeds 5MB or 10,000 rows." |
| `IMPORT_NOT_FOUND` | 404 | "Import not found." |

---

## 10. Types TypeScript de référence

```ts
interface ContactGroup {
  id: string
  name: string
  description?: string
  color?: string
  contactCount: number
  createdAt: string
  updatedAt?: string
}

interface ContactGroupMember {
  id: string
  name: string
  phone: string
  tags: string[]
  addedAt: string
}

interface ContactImport {
  id: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  totalRows: number
  importedCount: number
  updatedCount: number
  skippedCount: number
  invalidCount: number
  groupId?: string
  createdAt: string
  completedAt?: string
  report?: {
    errors: Array<{ line: number; phone: string; reason: string }>
  }
}

// Extension du type Campaign recipients
type CampaignRecipients =
  | { type: 'all' }
  | { type: 'tags'; value: string[] }
  | { type: 'group'; groupId: string }
  | { type: 'explicit'; value: string[] }
```

---

## 11. Payloads de référence complets

### GET /api/contacts/groups
```json
{
  "groups": [
    {
      "id": "grp_abc123",
      "name": "Clients VIP",
      "description": "Clients avec plus de 3 commandes",
      "color": "#25D366",
      "contactCount": 47,
      "createdAt": "2026-03-27T10:00:00Z",
      "updatedAt": "2026-03-27T10:00:00Z"
    }
  ],
  "total": 3
}
```

### POST /api/contacts/groups
```json
// Request
{ "name": "Clients VIP", "description": "...", "color": "#25D366" }

// Response 201
{ "group": { "id": "grp_new", "name": "Clients VIP", "contactCount": 0, "createdAt": "..." } }

// Error 403
{ "error": { "code": "MAX_CONTACT_GROUPS_REACHED", "message": "Your plan allows a maximum of 2 contact groups. Upgrade to create more." } }

// Error 409
{ "error": { "code": "CONFLICT", "message": "A group named \"Clients VIP\" already exists" } }
```

### POST /api/contacts/groups/:groupId/members
```json
// Request
{ "contactIds": ["cnt_abc", "cnt_def", "cnt_xyz"] }

// Response
{ "added": 3, "alreadyInGroup": 1, "notFound": 0, "total": 4 }
```

### DELETE /api/contacts/groups/:groupId/members
```json
// Request
{ "contactIds": ["cnt_abc"] }

// Response
{ "removed": 1, "notInGroup": 0 }
```

### GET /api/contacts/groups/:groupId/members
```json
{
  "contacts": [
    { "id": "cnt_abc", "name": "Kouassi Amara", "phone": "+22901000000", "tags": ["vip"], "addedAt": "2026-03-27T10:00:00Z" }
  ],
  "nextCursor": "cnt_xyz",
  "hasMore": true,
  "total": 47
}
```

### GET /api/contacts/:id/groups
```json
{
  "groups": [
    { "id": "grp_abc", "name": "Clients VIP", "color": "#25D366" },
    { "id": "grp_def", "name": "Bénin", "color": "#F59E0B" }
  ]
}
```

---

## 12. Navigation

| Route | Composant principal |
|---|---|
| `/contacts` | Mise à jour : +boutons Import/Export/Groups, +colonne groups dans table |
| `/contacts/groups` | Liste des groupes |
| `/contacts/groups/:groupId` | Détail du groupe + membres |
| `/contacts` (onglet Imports) | Liste des imports + polling statut |

---

## 13. Out of scope
- Fusion de contacts en double
- Import depuis Google Contacts / vCard
- Groupes imbriqués / hiérarchie
- Permissions différentes par groupe
- Statistiques d'engagement par groupe
- Suppression des groupes en excès lors d'un downgrade (les groupes existants restent — seule la création de nouveaux est bloquée)
