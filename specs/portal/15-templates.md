# SPEC — Portal / Templates
App: portal
Route: /templates
Auth: required
Status: ready

---

## Purpose
Gestion des templates de messages réutilisables.
Un template définit un corps de message avec des variables dynamiques (ex: `{{prenom}}`) que les campagnes peuvent utiliser.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/templates?page=1&limit=20 | JWT | Lister les templates (paginé offset) |
| POST | /api/templates | JWT | Créer un template |
| GET | /api/templates/{id} | JWT | Détail d'un template |
| PUT | /api/templates/{id} | JWT | Modifier (name, body, variables) |
| DELETE | /api/templates/{id} | JWT | Supprimer |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : titre "Templates" + bouton "New Template" + compteur total
- **TemplateGrid** : grille de cards, 3 par ligne (responsive)
- **Pagination** : offset-based (Previous / Next)
- **TemplateModal** : modale partagée pour création et édition
- **TemplatePreviewPanel** : volet d'aperçu (slide-over ou section)
- **DeleteTemplateModal** : confirmation

---

## Composants de la page

### TemplateGrid
Props : `templates: Template[]`
Grille de TemplateCard.

### TemplateCard
Props : `template: Template; onEdit: () => void; onDelete: () => void; onPreview: () => void`

Affiche :
- **Name** : nom du template
- **Type** : badge (`text`, `image`, `video`, `document`)
- **Body preview** : 80 premiers chars du `body`, variables mises en évidence (`{{var}}` en bleu)
- **Variables** : liste des variables (badges small)
- **Updated** : date relative
- **Actions** : "Edit" | "Preview" | "Delete"

### TemplateModal
Props :
```ts
{
  mode: "create" | "edit"
  template?: Template
  onSuccess: (template: Template) => void
  onClose: () => void
}
```

Champs :
- `name` — string, required, min 1, max 100
- `type` — select : text | image | video | document
  - En mode **edit** : disabled (type immutable après création)
- `body` — textarea, required, min 1, max 4096
  - Placeholder : "Use {{variable_name}} for dynamic content"
- `variables` — input tags : array de strings, max 20, chaque var max 50 chars
  - Auto-détection optionnelle : parser `body` pour extraire les `{{var}}` et proposer de les ajouter

Bouton : "Create Template" (create) ou "Save Changes" (edit).

### TemplatePreviewPanel
Affiche une prévisualisation du template.
Props : `template: Template`

- Affiche le body avec les variables mises en évidence (fond jaune sur `{{var}}`)
- Si `type !== 'text'` → afficher "Media template ({type})" + `body` comme caption
- Liste des variables déclarées
- Bouton "Close"

### PaginationBar
Props :
```ts
{
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}
```
Affiche : "Showing {start}–{end} of {total}" + boutons Previous / Next.

### DeleteTemplateModal
Props : `templateName: string; onConfirm: () => void; onCancel: () => void`
Message : "Delete **{name}**? Campaigns using this template will no longer reference it."

---

## États à gérer
- `loading.initial` : skeleton de grille
- `loading.page` : skeleton pendant changement de page
- `empty` : "No templates yet. Create your first message template."
- `creating` : loading dans TemplateModal
- `updating` : loading dans TemplateModal
- `deleting` : loading sur le bouton Delete de la card
- `error.NOT_FOUND` : toast "Template not found."
- `error.VALIDATION_ERROR` : messages par champ dans la modale

---

## Actions utilisateur

### Créer un template
- Déclencheur : bouton "New Template" → TemplateModal (create) → submit
- Appel API : `POST /api/templates` — `{ name, type, body, variables }`
- Succès : fermer modale + ajouter en tête de grille + toast "Template created"

### Modifier un template
- Déclencheur : bouton "Edit" → TemplateModal (edit, pré-rempli) → submit
- Appel API : `PUT /api/templates/{id}` — `{ name?, body?, variables? }`
- Note : le champ `type` est disabled dans la modale (immutable côté backend)
- Succès : fermer modale + mettre à jour la card + toast "Template saved"

### Aperçu
- Déclencheur : bouton "Preview" → TemplatePreviewPanel
- Pas d'appel API (données déjà en mémoire)

### Supprimer
- Déclencheur : bouton "Delete" → DeleteTemplateModal → "Delete"
- Appel API : `DELETE /api/templates/{id}`
- Succès : retirer de la grille + toast "Template deleted"

### Paginer
- Déclencheur : boutons Previous / Next dans PaginationBar
- Appel API : `GET /api/templates?page={n}&limit=20`
- Remplace la grille courante

---

## Règles métier
- `type` est immutable après création — le select est disabled en mode édition.
- Variables valides : `[a-z_]+`, max 50 chars chacune, max 20 variables par template.
- Format variable dans le body : `{{variable_name}}` (double accolades).
- La pagination est offset-based (pas cursor) — `page` et `limit` dans la query.
- Le body peut contenir du markdown simple (mais affichage plaintext uniquement en v1).

---

## Payloads de référence

Response GET /api/templates?page=1&limit=20:
```json
{
  "data": {
    "templates": [
      {
        "id": "tmpl_abc123",
        "userId": "user_xyz",
        "name": "Relance panier",
        "type": "text",
        "body": "Bonjour {{prenom}}, votre panier vous attend ! Utilisez le code {{code}} pour -10%.",
        "mediaUrl": null,
        "variables": ["prenom", "code"],
        "createdAt": "2026-03-01T10:00:00.000Z",
        "updatedAt": "2026-03-27T09:00:00.000Z"
      }
    ],
    "total": 45
  }
}
```

Request POST /api/templates:
```json
{
  "name": "Relance panier",
  "type": "text",
  "body": "Bonjour {{prenom}}, votre panier vous attend !",
  "variables": ["prenom"]
}
```

Request PUT /api/templates/{id} (seuls name, body, variables modifiables):
```json
{
  "name": "Relance panier v2",
  "body": "Bonjour {{prenom}}, n'oubliez pas votre panier !",
  "variables": ["prenom"]
}
```

Response DELETE /api/templates/{id}:
```json
{
  "data": { "deleted": true }
}
```

---

## Out of scope
- Aperçu rendu avec des vraies valeurs de substitution (ex: "Bonjour Jean")
- Import / export de templates
- Templates partagés entre utilisateurs
- Historique des versions
