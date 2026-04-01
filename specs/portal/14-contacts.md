# SPEC — Portal / Contacts
App: portal
Route: /contacts
Auth: required
Status: ready

---

## Purpose
Gestion du carnet de contacts : créer, modifier, supprimer des contacts.
Les contacts sont utilisés comme destinataires dans les campagnes et peuvent être filtrés par tag.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/contacts | JWT | Lister les contacts |
| POST | /api/contacts | JWT | Créer un contact |
| PUT | /api/contacts/{id} | JWT | Modifier un contact |
| DELETE | /api/contacts/{id} | JWT | Supprimer un contact |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : titre "Contacts" + bouton "Add Contact" + compteur total
- **SearchBar + FiltersBar** : recherche par nom / numéro + filtre par tag
- **ContactTable** : liste paginée
- **ContactModal** : modale de création et d'édition (shared)
- **DeleteContactModal** : confirmation de suppression

---

## Composants de la page

### ContactSearchBar
Props : `value: string; onChange: (v: string) => void`
Input de recherche — filtre côté client sur `name` et `phone` (la liste complète est chargée une fois).
Placeholder : "Search by name or number..."

### ContactTable
Props : `contacts: Contact[]`
Colonnes :
- **Name** : nom du contact
- **Phone** : numéro de téléphone
- **Tags** : badges de tags (3 max, overflow "+N")
- **Created** : date relative
- **Actions** : bouton "Edit" + bouton "Delete"

### ContactModal
Props :
```ts
{
  mode: "create" | "edit"
  contact?: Contact  // uniquement en mode edit
  onSuccess: (contact: Contact) => void
  onClose: () => void
}
```

Champs :
- `name` — string, required, min 1
- `phone` — tel input, required (ex: +22912345678)
- `tags` — input tags (array de strings, séparés par virgule ou Enter)

Bouton : "Add Contact" (create) ou "Save Changes" (edit).
Loading state pendant l'appel API.

### DeleteContactModal
Props : `contactName: string; onConfirm: () => void; onCancel: () => void`
Message : "Delete **{name}**? They will be removed from all tags and campaigns."

---

## États à gérer
- `loading.initial` : skeleton de table pendant GET /api/contacts
- `empty` : "No contacts yet. Add your first contact."
- `empty.filtered` : "No contacts match your search."
- `creating` : loading dans la modale
- `updating` : loading dans la modale
- `deleting` : loading sur le bouton Delete de la ligne
- `error.CONFLICT` : "A contact with this phone number already exists."
- `error.NOT_FOUND` : toast "Contact not found."

---

## Actions utilisateur

### Créer un contact
- Déclencheur : bouton "Add Contact" → ContactModal (mode create) → submit
- Appel API : `POST /api/contacts` — `{ name, phone, tags }`
- Succès : fermer modale + ajouter en tête de liste + toast "Contact added"
- Erreur 409 `CONFLICT` : "A contact with this phone number already exists."
- Erreur 400 `VALIDATION_ERROR` : par champ

### Modifier un contact
- Déclencheur : bouton "Edit" → ContactModal (mode edit, pré-rempli) → submit
- Appel API : `PUT /api/contacts/{id}` — `{ name, phone, tags }`
- Succès : fermer modale + mettre à jour dans la liste + toast "Contact updated"

### Supprimer un contact
- Déclencheur : bouton "Delete" → DeleteContactModal → "Delete"
- Appel API : `DELETE /api/contacts/{id}`
- Succès : retirer de la liste + toast "Contact deleted"

### Rechercher / filtrer
- Déclencheur : saisie dans ContactSearchBar
- Action : filtre côté client sur les données chargées (name.includes, phone.includes)
- Pas d'appel API supplémentaire

---

## Règles métier
- Unicité sur `(userId, phone)` — le backend renverra `CONFLICT` si le numéro existe déjà.
- Le numéro est normalisé côté backend — accepter +229... et 229...
- Les tags sont des strings libres — pas de liste prédéfinie.
- Filtre côté client uniquement (la liste complète est chargée d'un coup, pas de pagination serveur).
- `POST /api/contacts/import` (import CSV) n'est pas encore implémenté (`[À CRÉER]` — retourne 501).

---

## Payloads de référence

Response GET /api/contacts:
```json
{
  "data": [
    {
      "id": "cnt_abc123",
      "userId": "user_xyz",
      "name": "Jean Dupont",
      "phone": "+22912345678",
      "tags": ["vip", "newsletter"],
      "meta": null,
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

Request POST /api/contacts:
```json
{
  "name": "Jean Dupont",
  "phone": "+22912345678",
  "tags": ["vip", "newsletter"]
}
```

Response POST /api/contacts (succès):
```json
{
  "data": {
    "id": "cnt_new456",
    "name": "Jean Dupont",
    "phone": "+22912345678",
    "tags": ["vip"],
    "createdAt": "2026-03-27T10:00:00.000Z"
  }
}
```

Response POST /api/contacts (conflit):
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Contact with this phone already exists for this user"
  }
}
```

Request PUT /api/contacts/{id}:
```json
{
  "name": "Jean Dupont",
  "tags": ["vip", "newsletter", "promo"]
}
```

Response DELETE /api/contacts/{id}:
```json
{
  "data": { "deleted": true }
}
```

---

## Out of scope
- Import CSV (endpoint `/api/contacts/import` non implémenté — `[À CRÉER]`)
- Export CSV
- Merge de contacts en double
- Vue détail d'un contact avec historique de messages
