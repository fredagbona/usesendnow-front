# SPEC — Portal / Instance Detail
App: portal
Route: /instances/[id]
Auth: required
Status: ready

---

## Purpose
Page de gestion d'une instance WhatsApp individuelle.
Affiche le statut live, permet de connecter via QR code ou pairing code, de déconnecter, ou de supprimer l'instance.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| GET | /api/instances/{id} | JWT | Charger les données de l'instance |
| GET | /api/instances/{id}/state | JWT | Statut live (polling) |
| POST | /api/instances/{id}/connect | JWT | Déclencher la connexion (QR / pairing) |
| POST | /api/instances/{id}/logout | JWT | Déconnecter WhatsApp |
| DELETE | /api/instances/{id} | JWT | Supprimer l'instance (soft delete) |

---

## Layout de la page
Layout standard portal.

### Zones principales
- **Header** : nom de l'instance + badge statut + bouton "Back to Instances"
- **ConnectionCard** : zone principale de gestion de connexion
- **DangerZone** : section suppression en bas de page

---

## Composants de la page

### InstanceHeader
Props : `instance: Instance; liveState: string`
Affiche le nom, le statut live avec badge animé (pulse si `connecting`), et le numéro WhatsApp si connecté.

### ConnectionCard
Zone principale adaptative selon le statut.

#### Si statut = `connected`
- Message : "WhatsApp is connected" + numéro
- Bouton "Disconnect" (secondary, destructive)

#### Si statut = `disconnected`
- Message : "Not connected"
- Bouton "Connect via QR Code" (primary)
- Bouton "Connect via Pairing Code" (secondary)

#### Si statut = `connecting`
- Spinner + "Waiting for connection..."
- Affichage QR code ou pairing code si disponible (voir QRCodeDisplay / PairingCodeDisplay)
- Bouton "Refresh status"

### QRCodeDisplay
Affiché après POST /connect si `qrCode` présent dans la réponse.
Props : `qrCode: string` (base64 image ou string à encoder)
Affiche l'image QR code.
Note : le QR expire rapidement — afficher un timer ou un bouton "Regenerate QR".

### PairingCodeDisplay
Affiché après POST /connect si `pairingCode` présent.
Props : `pairingCode: string`
Affiche le code de couplage en grand (formaté par groupes de 4 : XXXX-XXXX).

### LiveStatusPoller
Composant invisible qui poll `GET /api/instances/{id}/state` toutes les 5 secondes quand le statut est `connecting`.
S'arrête quand le statut devient `connected` ou `disconnected`.
Props : `instanceId: string; onStateChange: (state: string) => void`

### DangerZone
Section avec bouton "Delete this instance" (rouge, outline).
Ouvre une modale de confirmation avant `DELETE /api/instances/{id}`.

### DeleteConfirmationModal
Props : `instanceName: string; onConfirm: () => void; onCancel: () => void`
Message : "Are you sure you want to delete **{name}**? This will disconnect WhatsApp and delete all associated data."
Bouton "Delete" rouge + bouton "Cancel".

---

## États à gérer
- `loading.initial` : skeleton pendant GET /api/instances/{id}
- `loading.connect` : spinner dans ConnectionCard pendant POST /connect
- `loading.logout` : spinner pendant POST /logout
- `loading.delete` : spinner pendant DELETE
- `polling` : actif quand statut = `connecting`
- `error.not_found` : "Instance not found." + lien back
- `error.connect` : toast "Could not initiate connection. Try again."
- `error.logout` : toast "Could not disconnect. Try again."

---

## Actions utilisateur

### Charger l'instance
- Au montage : `GET /api/instances/{id}` pour les données, `GET /api/instances/{id}/state` pour le statut live

### Connecter via QR Code
- Déclencheur : bouton "Connect via QR Code"
- Appel API : `POST /api/instances/{id}/connect`
- Succès : afficher QRCodeDisplay si `data.qrCode` présent, sinon PairingCodeDisplay si `data.pairingCode`
- Démarrer le polling du statut

### Connecter via Pairing Code
- Même endpoint que QR Code. Le backend détermine le type selon l'état de l'instance.
- Afficher le pairing code si `data.pairingCode` présent

### Déconnecter
- Déclencheur : bouton "Disconnect"
- Appel API : `POST /api/instances/{id}/logout`
- Succès : mettre à jour statut local → `disconnected` + toast "WhatsApp disconnected"
- Arrêter le polling

### Supprimer l'instance
- Déclencheur : bouton "Delete this instance" → confirmation modal → "Delete"
- Appel API : `DELETE /api/instances/{id}`
- Succès : `router.push('/instances')` + toast "Instance deleted"
- Erreur : toast "Could not delete instance."

### Refresh manuel du statut
- Déclencheur : bouton "Refresh status"
- Appel API : `GET /api/instances/{id}/state`
- Succès : mettre à jour le badge statut

---

## Règles métier
- Polling toutes les 5s uniquement quand statut = `connecting`. Stopper le polling en `useEffect` cleanup.
- Le QR code expire côté Evolution API — si l'utilisateur attend trop longtemps, proposer "Regenerate QR" (re-appel de POST /connect).
- La suppression est un soft delete côté backend (`deletedAt`). Les messages liés restent en DB.
- Un statut `connected` depuis l'API `/state` retourne `providerState: "open"`.

---

## Payloads de référence

Response GET /api/instances/{id}/state:
```json
{
  "data": {
    "instanceId": "inst_abc123",
    "status": "connected",
    "providerState": "open"
  }
}
```

Response POST /api/instances/{id}/connect (QR code):
```json
{
  "data": {
    "instanceId": "inst_abc123",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "pairingCode": null,
    "state": "connecting"
  }
}
```

Response POST /api/instances/{id}/connect (pairing code):
```json
{
  "data": {
    "instanceId": "inst_abc123",
    "qrCode": null,
    "pairingCode": "ABCD-1234",
    "state": "connecting"
  }
}
```

Response POST /api/instances/{id}/logout:
```json
{
  "data": { "success": true }
}
```

Response DELETE /api/instances/{id}:
```json
{
  "data": { "deleted": true }
}
```

---

## Out of scope
- Renommer l'instance
- Configuration avancée du webhook de l'instance
- Historique des connexions
