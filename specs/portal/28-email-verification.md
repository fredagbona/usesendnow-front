# SPEC — Portal / Email Verification
App: portal
Routes:
- /verify-email?token=...
- /verify-email/pending (ou état local après signup)
Auth: public
Status: ready

---

## Purpose
Empêcher la connexion des comptes email/password tant que l’adresse email n’a pas été confirmée.

Le flow frontend doit couvrir :
- l’écran `Check your email` après signup classique
- le renvoi du lien de vérification
- la confirmation via lien email
- les états `valid`, `expired`, `used`, `invalid`, `already_verified`

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| POST | /api/auth/signup | public | Créer un compte classique non vérifié |
| POST | /api/auth/login | public | Refuser la connexion si email non vérifié |
| POST | /api/auth/resend-verification | public | Renvoyer un lien de vérification |
| GET | /api/auth/verify-email/validate?token=... | public | Vérifier l’état du token |
| POST | /api/auth/verify-email | public | Confirmer l’email |

Toutes les réponses succès sont enveloppées dans `{ data: ... }`.

---

## Règles métier backend
- Signup classique :
  - crée le compte
  - envoie l’email de vérification
  - ne renvoie pas de JWT
- Login classique :
  - si email non vérifié => `403 EMAIL_NOT_VERIFIED`
- Google OAuth :
  - considéré comme vérifié automatiquement
- Resend verification :
  - réponse toujours générique
  - ne révèle jamais si l’email existe
- Les liens de vérification :
  - expirent au bout de 24h
  - sont à usage unique
  - les anciens liens actifs sont invalidés quand un nouveau lien est émis

---

## Signup classique

### Request
```json
POST /api/auth/signup
{
  "fullName": "Fred Agbona",
  "email": "fred@example.com",
  "phone": "+22912345678",
  "password": "mypassword123"
}
```

### Success response
```json
{
  "data": {
    "success": true,
    "verificationRequired": true,
    "email": "fred@example.com"
  }
}
```

### Frontend behavior
- Ne pas stocker de JWT
- Ne pas rediriger vers `/dashboard`
- Afficher un écran `Check your email`

### Copy recommandée
- Titre : `Check your email`
- Texte : `We sent a verification link to fred@example.com. Verify your email before signing in.`
- CTA principal : `Resend verification email`
- CTA secondaire : `Back to login`
- CTA optionnel frontend-only : `Open Gmail`

---

## Login classique

### Erreur email non vérifié
```json
{
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Email not verified"
  }
}
```

### Frontend behavior
- Afficher un message clair au-dessus ou sous le formulaire
- Proposer un bouton `Resend verification email`
- Réutiliser l’email déjà saisi dans le formulaire

### Copy recommandée
- `Please verify your email before signing in.`
- `Need a new link?`

---

## Renvoyer le lien de vérification

### Request
```json
POST /api/auth/resend-verification
{
  "email": "fred@example.com"
}
```

### Success response
```json
{
  "data": {
    "success": true
  }
}
```

### Frontend behavior
- Toujours afficher un message neutre
- Ne jamais déduire si le compte existe, est déjà vérifié, ou suspendu

### Copy recommandée
- `If your account still requires verification, a new verification link has been sent.`

---

## Page `/verify-email?token=...`

### Purpose
Confirmer l’email à partir du lien reçu.

### Flux attendu
1. Lire `token` depuis l’URL
2. Si absent :
   - afficher un écran invalide
3. Si présent :
   - appeler `GET /api/auth/verify-email/validate?token=...`
4. Si `valid: true` :
   - appeler `POST /api/auth/verify-email`
   - afficher succès
5. Sinon, afficher l’état correspondant

### Validation request
```http
GET /api/auth/verify-email/validate?token=abc123
```

### Validation responses
```json
{
  "data": {
    "valid": true,
    "status": "valid"
  }
}
```

```json
{
  "data": {
    "valid": false,
    "status": "expired"
  }
}
```

Autres statuts possibles :
- `used`
- `invalid`
- `already_verified`

### Confirmation request
```json
POST /api/auth/verify-email
{
  "token": "abc123"
}
```

### Confirmation success
```json
{
  "data": {
    "success": true,
    "alreadyVerified": false
  }
}
```

### Already verified success
```json
{
  "data": {
    "success": true,
    "alreadyVerified": true
  }
}
```

---

## États UI à prévoir sur `/verify-email`

### `loading`
- `Verifying your email...`

### `success`
- Titre : `Email verified`
- Texte : `Your email has been confirmed. You can now sign in to MsgFlash.`
- CTA : `Go to login`

### `already_verified`
- Titre : `Email already verified`
- Texte : `Your account is already verified. You can sign in normally.`
- CTA : `Go to login`

### `expired`
- Titre : `Verification link expired`
- Texte : `This verification link has expired. Request a new one to continue.`
- CTA :
  - `Request a new link`
  - `Back to login`

### `used`
- Titre : `Verification link no longer valid`
- Texte : `This link can no longer be used. Request a new verification email if needed.`
- CTA :
  - `Request a new link`
  - `Back to login`

### `invalid`
- Titre : `Invalid verification link`
- Texte : `This verification link is invalid.`
- CTA :
  - `Request a new link`
  - `Back to login`

---

## Recommandations frontend
- Ne pas logger le token dans la console ni dans les analytics
- Ne pas tenter de connecter automatiquement l’utilisateur après vérification
- Utiliser `router.replace` si besoin pour ne pas garder les écrans intermédiaires inutiles dans l’historique
- Le bouton `Request a new link` sur les écrans `expired|used|invalid` doit mener soit :
  - vers un mini formulaire email
  - soit vers `/login` avec l’email prérempli si le frontend l’a en mémoire

---

## Messages importants à montrer aux users
- `Verify your email before signing in.`
- `We sent a verification link to your inbox.`
- `Check your spam folder if you don’t see it.`
- `If your account still requires verification, a new verification link has been sent.`
- `Your email has been confirmed. You can now sign in.`
