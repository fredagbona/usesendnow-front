# SPEC — Portal / API Keys
App: portal
Route: /api-keys
Auth: required
Status: ready

---

## Purpose
Gestion des clés API pour accéder à l'API publique `/api/v1/*`.
Les clés ne sont affichées en clair qu'une seule fois à la création — ensuite, seul le préfixe est visible.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/api-keys | JWT | Lister les clés |
| GET | /api/api-keys/usage | JWT | Voir l'usage mensuel par clé API |
| POST | /api/api-keys | JWT | Créer une clé |
| DELETE | /api/api-keys/{id} | JWT | Révoquer une clé |
| GET | /api/billing/subscription | JWT | Vérifier si le plan autorise les clés |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : titre "API Keys" + bouton "New API Key"
- **PlanInfoBanner** : message contextuel selon le plan
- **Table des clés** : une ligne par clé
- **Usage summary** : volume mensuel des requêtes par clé API
- **NewKeyModal** : modale de création
- **SecretRevealModal** : modale d'affichage unique du secret

---

## Composants de la page

### PlanInfoBanner
Cas 1 — plan Free:
- message : "Free inclut 1 clé API pour tester l'intégration. Le quota reste limité à 20 messages + statuts par mois."
- le bouton "New API Key" reste disponible tant que `activeApiKeysCount < 1`

Cas 2 — limite atteinte:
- message : "You've reached your API key limit for the current plan."
- CTA : "Manage Billing" → `/billing`

### ApiKeyTable
Props : `apiKeys: ApiKey[]`, `usage?: ApiKeyUsage[]`
Colonnes :
- **Name** : nom de la clé
- **Prefix** : `keyPrefix` (ex: `msgf_live_ab12`)
- **Requests (month)** : nombre de requêtes API du mois courant
- **Last Used** : date relative ou "Never"
- **Created** : date de création
- **Actions** : bouton "Revoke" (rouge, outline)

### NewApiKeyModal
Props : `onSuccess: (secret: string) => void; onClose: () => void`
Champ :
- `name` — string, required, min 1

Bouton "Create" — loading state.

### SecretRevealModal
Affiché immédiatement après la création d'une clé.
Props : `secret: string; keyPrefix: string; onClose: () => void`

Affiche :
- Warning : "This is the only time you'll see this key. Copy it now."
- La clé complète dans un champ input readonly avec bouton "Copy"
- Bouton "I've copied it" pour fermer

### RevokeConfirmationModal
Props : `keyName: string; onConfirm: () => void; onCancel: () => void`
Message : "Are you sure you want to revoke **{keyName}**? Any application using this key will stop working immediately."

---

## États à gérer
- `loading` : skeleton de table pendant GET /api-keys
- `empty` : "No API keys yet. Create your first key." (uniquement si plan le permet)
- `plan_info` : afficher PlanInfoBanner
- `creating` : loading dans NewApiKeyModal
- `revoking` : loading sur le bouton "Revoke" de la ligne concernée
- `error.MAX_API_KEYS_REACHED` : toast "You've reached your API key limit. Revoke an existing key or upgrade."

---

## Actions utilisateur

### Voir l'usage par clé
- Chargement initial : appeler `GET /api/api-keys` et `GET /api/api-keys/usage`
- Afficher pour chaque clé :
  - `requestCount`
  - `lastRequestAt`
  - `lastUsedAt`
- Si une clé n'a aucun trafic, afficher `0` et "Never"

### Créer une clé
- Déclencheur : bouton "New API Key" → NewApiKeyModal → submit
- Appel API : `POST /api/api-keys` — `{ name: string }`
- Succès : fermer NewApiKeyModal → ouvrir SecretRevealModal avec `data.secret` + rafraîchir la liste
- Erreur 403 `MAX_API_KEYS_REACHED` : fermer modale + toast "Key limit reached."

### Révoquer une clé
- Déclencheur : bouton "Revoke" → RevokeConfirmationModal → "Revoke"
- Appel API : `DELETE /api/api-keys/{id}`
- Succès : retirer la clé de la liste + toast "API key revoked"
- Erreur : toast "Could not revoke key."

---

## Règles métier
- Le secret n'est **jamais** re-affiché après la création. Ne pas stocker le secret en state global ou localStorage.
- Les clés révoquées ont `revokedAt` non-null — le backend les filtre de la liste (la liste ne montre que les clés actives).
- Plan Free : `maxApiKeys: 1` → autoriser une seule clé API de test.
- Le plan Free ne change pas de quota outbound : il reste à 20 messages + statuts par mois.
- Vérifier `maxApiKeys` depuis `subscription.plan.limits.maxApiKeys` (chargé via GET /billing/subscription).

---

## Payloads de référence

Response GET /api/api-keys:
```json
{
  "data": [
    {
      "id": "key_abc123",
      "name": "Production App",
      "keyPrefix": "msgf_live_ab12cd",
      "lastUsedAt": "2026-03-26T14:22:00.000Z",
      "revokedAt": null,
      "createdAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

Response GET /api/api-keys/usage:
```json
{
  "data": {
    "periodKey": "2026-04",
    "totalRequests": 1284,
    "apiKeys": [
      {
        "id": "key_abc123",
        "name": "Production App",
        "keyPrefix": "msgf_live_ab12cd",
        "requestCount": 1200,
        "lastRequestAt": "2026-04-01T10:15:00.000Z",
        "lastUsedAt": "2026-04-01T10:15:00.000Z",
        "revokedAt": null,
        "createdAt": "2026-03-01T10:00:00.000Z"
      }
    ]
  }
}
```

Request POST /api/api-keys:
```json
{
  "name": "Production App"
}
```

Response POST /api/api-keys (succès — secret visible une seule fois):
```json
{
  "data": {
    "id": "key_abc123",
    "name": "Production App",
    "keyPrefix": "msgf_live_ab12cd",
    "secret": "msgf_live_ab12cd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9",
    "createdAt": "2026-03-27T10:00:00.000Z"
  }
}
```

Response POST /api/api-keys (erreur plan):
```json
{
  "error": {
    "code": "MAX_API_KEYS_REACHED",
    "message": "API key limit reached for your plan (max 1)."
  }
}
```

---

## Message frontend à reprendre partout

Message court:
- `Le plan Free inclut 1 clé API pour tester l'intégration, avec toujours 20 messages + statuts maximum par mois.`

Message long:
- `Le plan Free vous permet de créer une seule clé API pour tester MsgFlash. Cette ouverture ne change pas les autres limites du plan: vous restez limité à 20 messages + statuts par mois, 1 instance, 0 webhook et 2 groupes de contacts.`

Response DELETE /api/api-keys/{id}:
```json
{
  "data": { "success": true }
}
```

---

## Out of scope
- Scopes / permissions par clé
- Rotation automatique des clés
