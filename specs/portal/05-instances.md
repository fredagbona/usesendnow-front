# SPEC — Portal / Instances
App: portal
Route: /instances
Auth: required
Status: ready

---

## Purpose
Liste toutes les instances WhatsApp de l'utilisateur et permet d'en créer de nouvelles.
Chaque instance représente un numéro WhatsApp connecté à la plateforme.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/instances | JWT | Lister les instances |
| POST | /api/instances | JWT | Créer une nouvelle instance |
| GET | /api/billing/subscription | JWT | Vérifier la limite du plan |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : titre "WhatsApp Instances" + bouton "New Instance"
- **Grille de cards** : une card par instance
- **Modale de création** : affichée au clic "New Instance"

---

## Composants de la page

### InstanceList
Props : `instances: Instance[]`
Grille de cards. Chaque card = `InstanceCard`.

### InstanceCard
Props : `instance: Instance`

Affiche :
- Nom de l'instance
- Statut avec badge coloré : `connected` (green), `connecting` (yellow/pulse), `disconnected` (gray)
- Numéro WhatsApp (`waNumber`) si connecté, sinon "Not connected"
- Bouton "Manage" → `router.push('/instances/{id}')`

### NewInstanceModal
Modale de création d'instance.
Props : `onSuccess: (instance: Instance) => void; onClose: () => void`

Champ :
- `name` — string, required, min 1

Bouton "Create" — loading pendant POST.

### PlanLimitBanner
Affiché si `activeInstancesCount >= maxInstances` selon le plan.
Message : "You've reached your instance limit ({maxInstances}). [Upgrade your plan →]"
Lien → `/billing`
Le bouton "New Instance" est désactivé dans ce cas.

---

## États à gérer
- `loading` : skeletons de cards pendant GET /api/instances
- `empty` : "No instances yet. Create your first WhatsApp instance." avec CTA
- `error` : toast d'erreur
- `creating` : loading dans la modale
- `plan_limit_reached` : PlanLimitBanner + bouton "New Instance" désactivé

---

## Actions utilisateur

### Ouvrir la modale de création
- Déclencheur : bouton "New Instance"
- Pré-condition : vérifier `activeInstancesCount < maxInstances` côté client avant d'ouvrir (double-check côté backend de toute façon)

### Créer une instance
- Déclencheur : submit dans NewInstanceModal
- Appel API : `POST /api/instances` — `{ name: string }`
- Succès : fermer modale + ajouter l'instance à la liste + toast "Instance created"
- Erreur 403 `MAX_INSTANCES_REACHED` : fermer modale + afficher PlanLimitBanner + message "Instance limit reached. Upgrade your plan."
- Erreur 400 `VALIDATION_ERROR` : afficher par champ dans la modale

### Accéder au détail
- Déclencheur : bouton "Manage" sur une InstanceCard
- Action : `router.push('/instances/{id}')`

---

## Règles métier
- La liste n'inclut que les instances non-supprimées (le backend filtre `deletedAt: null`).
- Le statut de connexion est celui stocké en DB, pas le statut live. Pour le statut live, aller sur `/instances/[id]`.
- Plan Free : `maxInstances: 1` — un seul WA autorisé.

---

## Payloads de référence

Response GET /api/instances:
```json
{
  "data": [
    {
      "id": "inst_abc123",
      "userId": "user_xyz",
      "name": "Shop Principal",
      "waNumber": "+22912345678",
      "status": "connected",
      "webhook": null,
      "meta": null,
      "deletedAt": null,
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-27T08:00:00.000Z"
    }
  ]
}
```

Request POST /api/instances:
```json
{
  "name": "Shop Principal"
}
```

Response POST /api/instances (succès):
```json
{
  "data": {
    "id": "inst_abc123",
    "name": "Shop Principal",
    "status": "disconnected",
    "waNumber": null,
    "createdAt": "2026-03-27T10:00:00.000Z"
  }
}
```

Response POST /api/instances (erreur limite):
```json
{
  "error": {
    "code": "MAX_INSTANCES_REACHED",
    "message": "Instance limit reached for your plan"
  }
}
```

---

## Out of scope
- Bulk delete
- Recherche / filtrage des instances
- Renommer une instance existante
