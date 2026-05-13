# Intégration Portal — Media Upload Temporaire

## Résumé

Le portal peut maintenant uploader un fichier binaire vers le backend, recevoir une `url` publique temporaire, puis réutiliser cette URL dans:

- l'envoi de message
- la programmation de message
- les campagnes avec template média
- les templates média
- les statuts média

Le backend uploade le fichier sur Cloudinary, renvoie une URL publique prête à l'emploi, puis supprime automatiquement le fichier après expiration.

Important:

- l'URL est publique
- l'URL expire automatiquement
- le frontend doit prévenir clairement l'utilisateur

---

## Endpoint backend

### `POST /api/media/upload`

Upload d'un fichier temporaire.

Auth:

- `Authorization: Bearer <jwt>`

Content-Type:

- `multipart/form-data`

Body:

- champ `file`: fichier binaire

Réponse succès `201`:

```json
{
  "data": {
    "id": "0d8f0c6d-4a61-4fc0-81dd-4f875c9248f6",
    "url": "https://res.cloudinary.com/.../msgflash/temp/images/example.jpg",
    "type": "image",
    "mimeType": "image/jpeg",
    "sizeBytes": 245678,
    "originalName": "photo-produit.jpg",
    "expiresAt": "2026-04-04T10:00:00.000Z",
    "suggestedMessageType": "image"
  }
}
```

Notes:

- `type` est le type média backend détecté: `image | video | document | audio`
- `suggestedMessageType` est prévu pour aider l'UI:
  - `image`
  - `video`
  - `document`
  - `audio`
  - ou `voice_note` si le fichier audio ressemble à une note vocale

### `DELETE /api/media/:mediaId`

Suppression manuelle d'un upload temporaire.

Réponse succès `200`:

```json
{
  "data": {
    "deleted": true
  }
}
```

Usage:

- si l'utilisateur abandonne l'envoi avant validation
- si l'utilisateur remplace le fichier par un autre

---

## Types de fichiers acceptés

| Famille  | MIME autorisés                                                                                                                                                                                                      | Taille max |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------: |
| Image    | `image/jpeg`, `image/png`, `image/webp`, `image/gif`                                                                                                                                                                |       5 MB |
| Vidéo    | `video/mp4`, `video/3gpp`                                                                                                                                                                                           |      16 MB |
| Document | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |      10 MB |
| Audio    | `audio/mpeg`, `audio/ogg`, `audio/mp4`, `audio/aac`, `audio/amr`                                                                                                                                                    |      16 MB |

Hard limit global:

- `16 MB`

Le frontend doit idéalement faire une prévalidation locale avant l'appel API, mais la validation serveur reste la source de vérité.

---

## Contrat frontend recommandé

Créer un type frontend:

```ts
export type UploadedMedia = {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  sizeBytes: number;
  originalName: string;
  expiresAt: string;
  suggestedMessageType: 'image' | 'video' | 'document' | 'audio' | 'voice_note';
};
```

Uploader helper:

```ts
export async function uploadMedia(file: File): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}
```

Delete helper:

```ts
export async function deleteUploadedMedia(mediaId: string) {
  await api.delete(`/media/${mediaId}`);
}
```

---

## Pages impactées

### 1. Nouvelle page / modale d'envoi de message

Quand `type !== text`:

- permettre de choisir un fichier local
- uploader le fichier avant l'envoi final
- stocker le résultat `UploadedMedia`
- remplir automatiquement `mediaUrl = uploadedMedia.url`

Mapping recommandé:

- `image` -> `type = image`
- `video` -> `type = video`
- `document` -> `type = document`
- `audio` -> choix utilisateur:
  - `audio`
  - ou `voice_note`

Si `suggestedMessageType === 'voice_note'`, le frontend peut préselectionner `voice_note`, mais doit laisser l'utilisateur changer vers `audio`.

### 2. Programmation de message

Même logique que message immédiat:

- uploader d'abord
- ensuite envoyer `mediaUrl`

Attention (depuis le passage au cleanup référence-aware) :

- Le worker `media-cleanup` vérifie les références avant chaque suppression. Tant qu'un **template**, une **campagne active** (`draft | scheduled | running | paused | paused_quota | paused_plan`) ou un **message en file** (`status='queued'`) pointe vers l'URL, la suppression est repoussée de 24 h, indéfiniment.
- Une campagne programmée au-delà de `expiresAt` est donc *sûre* dès que la campagne est créée (la référence vit dans la table `Campaign`).
- Le seul cas qui reste dangereux : créer la campagne au-delà de `expiresAt` **sans la persister** (drafts client uniquement). Le frontend continue d'afficher la date d'expiration comme indicateur, mais le backend ne rejette plus systématiquement les dates lointaines tant que la référence est créée à temps.

### 3. Templates média

Pour `image`, `video`, `audio`, `document` dans la création/édition de template :

- ajouter un sélecteur de fichier
- uploader le média via `POST /api/media/upload`
- stocker `mediaUrl = uploadedMedia.url` (l'upload géré est désormais accepté ; le backend étend automatiquement `expiresAt` à l'attachement)
- une URL externe permanente reste également acceptée

Le worker garde le média en vie tant que le template existe. Quand le template est supprimé (et plus rien ne référence le média), le prochain réveil du worker (≤ 24 h) le supprime de Cloudinary.

### 4. Campagnes

Si une campagne utilise un template média:

- le média vient du template

Si une campagne utilise un média temporaire uploadé (`POST /api/media/upload`) :

- la date `expiresAt` renvoyée reste **indicative** ; une fois la campagne **persistée**, le worker « reference-aware » repousse la suppression tant que la campagne est active (`draft | scheduled | running | paused | paused_quota | paused_plan`) et pointe vers l’URL.
- le portail affiche un **avertissement informatif** si la date planifiée dépasse `expiresAt`, mais **ne bloque plus** la création : la référence en base suffit pour prolonger la vie du média.

### 5. Statuts WhatsApp

Pour les statuts image:

- même logique d'upload puis réutilisation de l'URL

---

## Payloads à envoyer ensuite

### Message image

```json
{
  "instanceId": "inst_xxx",
  "to": "+22901000000",
  "type": "image",
  "text": "Votre produit est prêt",
  "mediaUrl": "https://res.cloudinary.com/..."
}
```

### Message document

```json
{
  "instanceId": "inst_xxx",
  "to": "+22901000000",
  "type": "document",
  "text": "Voici votre facture",
  "mediaUrl": "https://res.cloudinary.com/..."
}
```

### Message audio

```json
{
  "instanceId": "inst_xxx",
  "to": "+22901000000",
  "type": "audio",
  "mediaUrl": "https://res.cloudinary.com/..."
}
```

### Note vocale

```json
{
  "instanceId": "inst_xxx",
  "to": "+22901000000",
  "type": "voice_note",
  "mediaUrl": "https://res.cloudinary.com/..."
}
```

### Template média

```json
{
  "name": "Brochure PDF",
  "type": "document",
  "body": "Voici la brochure du jour",
  "mediaUrl": "https://res.cloudinary.com/..."
}
```

---

## Erreurs backend à gérer

| Code                          | HTTP | Quand                              | Message UI recommandé                               |
| ----------------------------- | ---: | ---------------------------------- | --------------------------------------------------- |
| `MEDIA_FILE_MISSING`          |  400 | aucun fichier envoyé               | Aucun fichier sélectionné.                          |
| `MEDIA_TYPE_NOT_ALLOWED`      |  400 | type MIME refusé                   | Ce format n'est pas supporté.                       |
| `MEDIA_TOO_LARGE`             |  400 | fichier trop volumineux            | Le fichier dépasse la taille maximale autorisée.    |
| `MEDIA_UPLOAD_FAILED`         |  500 | Cloudinary ou upload KO            | L'upload du fichier a échoué. Réessayez.            |
| `MEDIA_UPLOAD_NOT_CONFIGURED` |  503 | env Cloudinary absente             | L'upload média n'est pas disponible pour le moment. |
| `NOT_FOUND`                   |  404 | suppression d'un média déjà absent | Ce fichier temporaire est introuvable.              |
| `MEDIA_URL_EXPIRED`           |  400 | URL d'upload déjà supprimée (ex. template) | Le fichier n'est plus disponible. Recharge-le. |

Erreur métier indirecte ensuite:

- si l'utilisateur envoie un message avec une `mediaUrl` expirée, le message peut finir en `failed`

Le frontend doit donc aussi montrer:

- le statut du message
- l'erreur backend éventuelle sur le message

---

## Messages UX à montrer à l'utilisateur

Ces messages doivent apparaître clairement dans l'UI.

### Message informatif principal

```text
Le fichier est hébergé temporairement et supprimé automatiquement après expiration.
```

### Message de confidentialité

```text
Le lien généré est public. N'uploadez pas de document sensible.
```

### Message pour messages programmés / campagnes

```text
Si la date planifiée dépasse l’expiration affichée du fichier temporaire, l’envoi peut encore réussir une fois le message ou la campagne enregistré (références côté serveur). Vérifiez tout de même la cohérence.
```

### Message après upload réussi

```text
Fichier uploadé avec succès. Il expirera le {date}.
```

### Message si l'utilisateur remplace le fichier

```text
Le précédent fichier temporaire sera ignoré. Pensez à enregistrer ou renvoyer avec le nouveau fichier.
```

### Message si l'utilisateur sélectionne un audio

```text
Vous pouvez l'envoyer comme audio classique ou comme note vocale WhatsApp.
```

---

## Comportement UI recommandé

### États

Pour chaque upload:

- `idle`
- `uploading`
- `uploaded`
- `failed`

### Affichage après succès

Afficher:

- nom du fichier
- taille formatée
- type détecté
- date d'expiration
- action `Supprimer`
- action `Remplacer`

### Si le fichier est un audio

Afficher un toggle ou select:

- `Audio`
- `Note vocale`

Préselection:

- utiliser `suggestedMessageType`

### Validation avant soumission

Bloquer l'envoi si:

- aucun `mediaUrl` n'est disponible pour un type média

Afficher un **avertissement** (non bloquant) si la date planifiée est postérieure à `expiresAt` sur un upload temporaire — le cleanup référence-aware peut repousser la suppression tant qu’un message en file ou une campagne active référence l’URL.

### Nettoyage recommandé

Si l'utilisateur annule le compose après un upload déjà fait:

- appeler `DELETE /api/media/:mediaId` si possible

Ce n'est pas obligatoire pour la cohérence backend, mais c'est préférable.

---

## Règles produit à respecter côté frontend

- un upload = un seul fichier
- pas de batch upload en v1
- le backend retourne une URL déjà prête à être utilisée comme `mediaUrl`
- le frontend ne doit pas demander à l'utilisateur de coller un lien manuel s'il passe par l'upload
- l'expiration doit être visible dans l'UI
- pour les contenus programmés, la compatibilité entre `scheduledAt` et `expiresAt` doit être **signalée** (avertissement), sans bloquer la soumission une fois la persistance assure une référence

---

## Checklist frontend

- ajouter un client `uploadMedia(file)`
- ajouter un client `deleteUploadedMedia(mediaId)`
- brancher l'upload dans la modale d'envoi de message
- brancher l'upload dans la programmation de message
- brancher l'upload dans la création/édition de template média (y compris modale liste)
- brancher l'upload dans l'envoi de statut média
- afficher l'expiration (indicatif ; libellé plus discret pour le contexte **template** : le serveur prolonge à l’attachement)
- afficher le warning lien public
- gérer le choix `audio` vs `voice_note`
- afficher un avertissement (non bloquant) si planification après `expiresAt` sur média temporaire
- afficher les erreurs backend listées (y compris `MEDIA_URL_EXPIRED` sur template)

---

## Résumé pour le frontend

Le flow attendu est:

1. l'utilisateur choisit un fichier
2. le frontend appelle `POST /api/media/upload`
3. le backend renvoie `data.url`
4. le frontend réutilise cette URL comme `mediaUrl` dans le message, template, campagne ou statut
5. le frontend affiche la date d'expiration comme **indicateur** et les avertissements importants (lien public, planification vs expiration en **non bloquant** pour message/campagne une fois la référence persistée)

Le point critique à ne pas rater:

- l'URL est publique
- l'URL expire sans référence ; avec références actives, le worker repousse le nettoyage
- un brouillon uniquement côté client reste fragile si la date dépasse l’expiration **avant** persistance
