# SPEC — Portal / Signup
App: portal
Route: /signup
Auth: public
Status: ready

---

## Purpose
Permet à un nouvel utilisateur de créer un compte avec email + mot de passe, ou via Google OAuth.
Après inscription réussie, l'utilisateur est redirigé vers `/dashboard`.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| POST | /api/auth/signup | public | Créer un compte email/password |
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
Props : `onSuccess: (token: string) => void`

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

---

## Actions utilisateur

### Inscription email/password
- Déclencheur : submit du formulaire
- Appel API : `POST /api/auth/signup` — `{ fullName, email, phone, password }`
- Succès : stocker `data.token` dans `localStorage.setItem('usn_token', token)`, puis `router.push('/dashboard')`
- Erreur 409 `CONFLICT` : "An account with this email already exists."
- Erreur 400 `VALIDATION_ERROR` : afficher les détails par champ

### Inscription Google
- Déclencheur : clic sur "Sign up with Google"
- Action : `window.location.href = '/api/auth/google'`
- Même flow que login — callback → `/auth/callback?token=<jwt>`

---

## Règles métier
- Si `usn_token` présent en localStorage → rediriger vers `/dashboard`.
- Le numéro de téléphone est normalisé côté backend — accepter les formats internationaux.
- Un compte créé via Google n'a pas de mot de passe — si l'email existe déjà, le googleId est lié au compte existant (pas de doublon).

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
- Email verification
- Invitation flow
- Terms of service checkbox
