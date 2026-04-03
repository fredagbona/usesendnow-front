# SPEC — Portal / Login
App: portal
Route: /login
Auth: public
Status: ready

---

## Purpose
Permet à un utilisateur existant de se connecter avec email + mot de passe ou via Google OAuth.
Après connexion réussie, le token JWT est stocké en localStorage (`usn_token`) et l'utilisateur est redirigé vers `/dashboard`.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| POST | /api/auth/login | public | Connexion email/password |
| POST | /api/auth/resend-verification | public | Renvoyer un lien de vérification email |
| GET | /api/auth/google | public | Initier Google OAuth |

---

## Layout de la page
Page publique — pas de sidebar.
Centré verticalement et horizontalement : logo + card de connexion.
Fond blanc, card avec léger shadow.

### Zones principales
- **Header de la card** : logo MsgFlash + titre "Welcome back"
- **Formulaire email/password**
- **Lien "Forgot password?"** sous le champ mot de passe
- **Séparateur "or"**
- **Bouton Google OAuth**
- **Footer de la card** : lien vers `/signup`

---

## Composants de la page

### LoginForm
Formulaire email + mot de passe.
Props : `onSuccess: (token: string) => void`

Champs :
- `email` — input type email, required
- `password` — input type password, required, min 8 chars

Bouton submit : "Sign in" — loading state pendant l'appel API.

### GoogleOAuthButton
Bouton "Continue with Google".
Props : none
Action : redirige vers `GET /api/auth/google` (navigation href, pas fetch).
Note : pas de loading state — c'est une redirection navigateur.

---

## États à gérer
- `loading`: bouton submit désactivé + spinner pendant POST /api/auth/login
- `error.UNAUTHORIZED`: "Invalid email or password." sous le formulaire
- `error.EMAIL_NOT_VERIFIED`: "Please verify your email before signing in."
- `error.VALIDATION_ERROR`: messages de validation Zod par champ
- `error.network`: "Connection error. Please try again."

---

## Actions utilisateur

### Connexion email/password
- Déclencheur : submit du formulaire
- Appel API : `POST /api/auth/login` — `{ email, password }`
- Succès : stocker `data.token` dans `localStorage.setItem('usn_token', token)`, puis `router.push('/dashboard')`
- Erreur 401 `UNAUTHORIZED` : "Invalid email or password."
- Erreur 403 `EMAIL_NOT_VERIFIED` : afficher un message clair + proposer un bouton "Resend verification email"
- Erreur 400 `VALIDATION_ERROR` : afficher les détails par champ

### Mot de passe oublié
- Déclencheur : clic sur le lien "Forgot password?"
- Action : `router.push('/forgot-password')`
- Aucun appel API direct depuis la page `/login`

### Renvoyer le lien de vérification
- Déclencheur : clic sur "Resend verification email" après une erreur `EMAIL_NOT_VERIFIED`
- Appel API : `POST /api/auth/resend-verification` — `{ email }`
- Succès : afficher un message neutre :
  - `If your account still requires verification, a new verification link has been sent.`
- Ne jamais afficher si l’email existe réellement ou non

### Connexion Google
- Déclencheur : clic sur "Continue with Google"
- Action : `window.location.href = '/api/auth/google'` (redirection navigateur directe)
- Le callback Google redirige vers `/auth/callback?token=<jwt>` — géré dans la page `/auth/callback`

---

## Règles métier
- Si `usn_token` est déjà présent en localStorage au chargement de la page, rediriger directement vers `/dashboard` sans afficher la page.
- Les comptes Google-only (sans password) retourneront `UNAUTHORIZED` si on tente une connexion email/password — afficher le message générique "Invalid email or password."
- Les comptes classiques non vérifiés retournent `EMAIL_NOT_VERIFIED` tant que l’utilisateur n’a pas confirmé son email.
- Pas de "remember me" — le JWT expire dans 7 jours côté backend.

---

## Payloads de référence

Request:
```json
POST /api/auth/login
{
  "email": "fred@example.com",
  "password": "mypassword123"
}
```

Response (succès):
```json
{
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "fullName": "Fred Agbona",
      "email": "fred@example.com",
      "phone": "+22912345678",
      "plan": "free"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Response (erreur):
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

Response (email non vérifié):
```json
{
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Email not verified"
  }
}
```

---

## Out of scope
- 2FA
- "Remember me" toggle
