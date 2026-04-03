# SPEC — Portal / Forgot Password & Reset Password
App: portal
Routes:
- /forgot-password
- /reset-password?token=...
Auth: public
Status: ready

---

## Purpose
Permet à un utilisateur bloqué sur la connexion email/password de :
- demander un email de réinitialisation
- ouvrir un lien sécurisé reçu par email
- définir un nouveau mot de passe

Le backend gère des tokens de reset à usage unique, hashés en base et expirant au bout de 60 minutes.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| POST | /api/auth/forgot-password | public | Demander un email de reset |
| GET | /api/auth/reset-password/validate?token=... | public | Vérifier si le token est encore valide |
| POST | /api/auth/reset-password | public | Changer le mot de passe avec le token |

Toutes les réponses succès sont enveloppées dans `{ data: ... }`.

---

## Règles métier backend
- La réponse à `POST /api/auth/forgot-password` est toujours générique.
- On ne doit jamais révéler si l’email existe ou non.
- Le token de reset :
  - expire au bout de 60 minutes
  - est à usage unique
  - invalide les autres tokens actifs du même user quand un nouveau reset est demandé
- Si un token est expiré, déjà utilisé ou inconnu, le reset doit être refusé.
- Les comptes Google-only peuvent aussi utiliser ce flow pour définir un mot de passe local.
- Les comptes suspendus ne doivent pas pouvoir finaliser le reset.

---

## Page `/forgot-password`

### Purpose
Collecter l’email et déclencher l’envoi de l’email de réinitialisation.

### Layout
Page publique sans sidebar.
Card centrée avec :
- logo
- titre `Forgot your password?`
- texte d’aide
- champ email
- bouton submit
- lien retour vers `/login`

### Texte recommandé
Titre :
`Forgot your password?`

Description :
`Enter the email address linked to your account. If it exists, we’ll send you a reset link.`

### Composants
#### ForgotPasswordForm
Champs :
- `email` — input email, requis

Actions :
- submit => `POST /api/auth/forgot-password`

### États à gérer
- `idle`
- `loading`
- `success`
- `error.VALIDATION_ERROR`
- `error.network`

### Comportement
- Au submit, appeler :

```json
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}
```

- En cas de succès, toujours afficher un message neutre :
`If an account exists for this email, a reset link has been sent.`

- Ne jamais afficher :
  - `email not found`
  - `google account only`
  - `account suspended`

### Réponse succès
```json
{
  "data": {
    "success": true
  }
}
```

### Erreurs à gérer
| Code | HTTP | Quand | UX recommandée |
|---|---:|---|---|
| VALIDATION_ERROR | 400 | email invalide | afficher l’erreur sur le champ |

### Messages importants à montrer
- `If an account exists for this email, a reset link has been sent.`
- `Check your inbox and spam folder.`
- `The reset link expires in 60 minutes.`

---

## Email reçu par l’utilisateur

### Sujet
`Réinitialisez votre mot de passe msgflash`

### Action principale
Bouton :
`Réinitialiser mon mot de passe`

### URL de destination
Le frontend doit prévoir une page publique :

```txt
/reset-password?token=<token>
```

Le backend met déjà ce lien dans l’email.

---

## Page `/reset-password`

### Purpose
Valider le token présent dans l’URL puis permettre la saisie d’un nouveau mot de passe.

### Flux attendu
1. Lire `token` depuis `searchParams`
2. Si token absent :
   - afficher écran invalide
   - CTA retour `/forgot-password`
3. Si token présent :
   - appeler `GET /api/auth/reset-password/validate?token=...`
4. Si valide :
   - afficher le formulaire de nouveau mot de passe
5. Si invalide/expiré :
   - afficher un écran d’erreur avec CTA `Request a new link`

### Layout
Page publique sans sidebar.
Card centrée avec :
- spinner pendant validation du token
- soit formulaire
- soit état invalide/expiré

### Texte recommandé
État loading :
`Validating your reset link...`

État invalide :
`This reset link is invalid or has expired.`

CTA invalide :
`Request a new link`

Titre formulaire :
`Set a new password`

Description formulaire :
`Choose a new password for your account.`

### Appel de validation
```http
GET /api/auth/reset-password/validate?token=abc123
```

### Réponse token valide
```json
{
  "data": {
    "valid": true,
    "expiresAt": "2026-04-03T11:00:00.000Z"
  }
}
```

### Réponse token invalide
```json
{
  "data": {
    "valid": false,
    "expiresAt": null
  }
}
```

### Composant
#### ResetPasswordForm
Champs :
- `password` — requis, min 8 caractères
- `confirmPassword` — requis, validation frontend uniquement

Bouton :
- `Reset password`

### Soumission
```json
POST /api/auth/reset-password
{
  "token": "abc123",
  "password": "newStrongPassword123"
}
```

### Réponse succès
```json
{
  "data": {
    "success": true
  }
}
```

### Réponse erreur métier
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid or expired reset token"
  }
}
```

### Erreurs à gérer
| Code | HTTP | Quand | UX recommandée |
|---|---:|---|---|
| VALIDATION_ERROR | 400 | mot de passe trop court | erreur champ password |
| BAD_REQUEST | 400 | token expiré, utilisé ou inconnu | écran lien invalide + CTA nouvelle demande |
| UNAUTHORIZED | 401 | compte suspendu | message générique + retour login |

### Messages importants à montrer
- `Your password has been updated successfully.`
- `You can now sign in with your new password.`
- `This reset link is invalid or has expired.`
- `Request a new link`

### Redirection après succès
Après `POST /api/auth/reset-password` réussi :
- afficher un toast/success state
- rediriger vers `/login`
- idéalement préremplir l’email si le frontend l’avait conservé localement, sinon ne rien préremplir

Le backend ne connecte pas automatiquement l’utilisateur après reset.

---

## Recommandations frontend

### 1. Ne pas révéler l’existence d’un compte
La page `/forgot-password` doit toujours montrer le même succès visuel, même si l’email n’existe pas.

### 2. Gérer le token comme une donnée sensible
- ne pas logger le token en console
- ne pas l’envoyer dans des analytics
- ne pas le stocker ailleurs que dans l’URL et l’état local temporaire

### 3. Valider le token au montage
La page `/reset-password` ne doit pas afficher le formulaire avant que `GET /validate` ait confirmé `valid: true`.

### 4. Vérifier `confirmPassword` côté frontend
Le backend ne reçoit que :
- `token`
- `password`

Le champ `confirmPassword` est purement frontend.

---

## UX copy recommandée

### `/forgot-password`
- Titre : `Forgot your password?`
- Texte : `Enter the email linked to your account. If it exists, we’ll send you a reset link.`
- Success : `If an account exists for this email, a reset link has been sent.`

### `/reset-password`
- Loading : `Validating your reset link...`
- Titre : `Set a new password`
- Success : `Your password has been updated successfully.`
- Error : `This reset link is invalid or has expired.`

---

## Out of scope
- login automatique après reset
- verification email à l’inscription
- magic link passwordless
- policy de mot de passe plus riche que `min 8 chars`
