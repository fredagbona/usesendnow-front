# SPEC — Portal / Signup
App: portal
Route: /signup
Auth: public
Status: ready

---

## Purpose
Permet à un nouvel utilisateur de créer un compte avec email + mot de passe, ou via Google OAuth.
Après inscription classique réussie, le frontend affiche un écran `Check your email`.
Le compte n’est pas connecté automatiquement tant que l’email n’a pas été vérifié.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| POST | /api/auth/signup | public | Créer un compte email/password |
| POST | /api/auth/resend-verification | public | Renvoyer un lien de vérification |
| GET | /api/auth/google | public | Initier Google OAuth |

---

## Layout de la page
Page publique — pas de sidebar.
Centré verticalement et horizontalement : logo + card d'inscription.

### Zones principales
- **Header de la card** : logo + titre "Create your account"
- **Formulaire d'inscription**
- **Séparateur "or"**
- **Bouton Google OAuth**
- **Footer de la card** : lien vers `/login`

---

## Composants de la page

### SignupForm
Props : `onSuccess: (email: string) => void`

Champs :
- `fullName` — input text, required, min 2 chars
- `email` — input email, required
- `phone` — input tel, required (ex: +22912345678)
- `password` — input password, required, min 8 chars

Bouton submit : "Create account" — loading state pendant l'appel API.

### GoogleOAuthButton
Identique à la page login.
Bouton "Sign up with Google" — redirige vers `GET /api/auth/google`.

---

## États à gérer
- `loading`: bouton désactivé + spinner
- `error.CONFLICT`: "An account with this email already exists." — lien "Sign in instead" vers `/login`
- `error.VALIDATION_ERROR`: messages par champ
- `error.network`: "Connection error. Please try again."
- `success.check-email`: écran succès avec CTA de renvoi du lien

---

## Actions utilisateur

### Inscription email/password
- Déclencheur : submit du formulaire
- Appel API : `POST /api/auth/signup` — `{ fullName, email, phone, password }`
- Succès : ne rien stocker en localStorage. Afficher un écran `Check your email`.
- Payload succès attendu :
  - `data.success === true`
  - `data.verificationRequired === true`
  - `data.email`
- Erreur 409 `CONFLICT` : "An account with this email already exists."
- Erreur 400 `VALIDATION_ERROR` : afficher les détails par champ

### Écran "Check your email"
Après signup classique réussi, afficher :
- titre : `Check your email`
- texte : `We sent a verification link to your email address. You must verify your account before signing in.`
- CTA :
  - `Resend verification email`
  - `Back to login`
  - `Open Gmail` optionnel frontend-only

Si l’utilisateur clique sur `Resend verification email` :
- appel API : `POST /api/auth/resend-verification` — `{ email }`
- succès : afficher un toast/message neutre

### Inscription Google
- Déclencheur : clic sur "Sign up with Google"
- Action : `window.location.href = '/api/auth/google'`
- Même flow que login — callback → `/auth/callback?token=<jwt>`

---

## Règles métier
- Si `usn_token` présent en localStorage → rediriger vers `/dashboard`.
- Le numéro de téléphone est normalisé côté backend — accepter les formats internationaux.
- Un compte créé via Google n'a pas de mot de passe — si l'email existe déjà, le googleId est lié au compte existant (pas de doublon).
- Un compte créé via signup classique n’est pas connecté automatiquement.
- L’utilisateur doit vérifier son email puis se connecter manuellement via `/login`.

---

## Payloads de référence

Request:
```json
POST /api/auth/signup
{
  "fullName": "Fred Agbona",
  "email": "fred@example.com",
  "phone": "+22912345678",
  "password": "mypassword123"
}
```

Response (succès):
```json
{
  "data": {
    "success": true,
    "verificationRequired": true,
    "email": "fred@example.com"
  }
}
```

Response (erreur conflit):
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered"
  }
}
```

---

## Out of scope
- Invitation flow
- Terms of service checkbox
