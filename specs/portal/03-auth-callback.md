# SPEC — Portal / Auth Callback
App: portal
Route: /auth/callback
Auth: public
Status: ready

---

## Purpose
Page intermédiaire sans UI visible.
Récupère le JWT depuis le query param `?token=` après un flow Google OAuth, le stocke en localStorage, puis redirige vers `/dashboard`.
En cas d'erreur OAuth, redirige vers `/login` avec un message d'erreur.

Le flow Google reste considéré comme déjà vérifié côté backend : il n’y a pas d’étape supplémentaire de vérification email après ce callback.

---

## Backend endpoints utilisés
| Method | Endpoint | Auth | Usage |
|---|---|---|---|
| — | — | — | Aucun appel API direct. Le token arrive dans l'URL. |

---

## Layout de la page
Page publique — pas de sidebar.
Afficher uniquement un spinner centré le temps du traitement (quelques millisecondes).
L'utilisateur ne doit pas voir cette page plus d'une seconde.

---

## Composants de la page

### AuthCallbackHandler
Composant côté client qui s'exécute au montage (`useEffect`).

Logique :
1. Lire `searchParams.get('token')` depuis l'URL
2. Si `token` présent → `localStorage.setItem('usn_token', token)` → `router.replace('/dashboard')`
3. Si `searchParams.get('error') === 'oauth_failed'` → `router.replace('/login?error=oauth_failed')`
4. Si ni `token` ni `error` → `router.replace('/login')`

Affichage pendant traitement : spinner + "Signing you in..."

---

## États à gérer
- `processing` : spinner centré (état par défaut — toujours présent brièvement)
- `error` : ne pas afficher — rediriger immédiatement vers `/login`

---

## Actions utilisateur
Aucune action utilisateur — tout est automatique.

---

## Règles métier
- Ne jamais stocker le token si absent ou vide.
- Utiliser `router.replace` (pas `push`) pour que la page callback ne reste pas dans l'historique navigateur.
- Si un `usn_token` valide est déjà en localStorage au moment du callback, l'écraser avec le nouveau token.
- La page `/login` doit lire `?error=oauth_failed` dans son URL et afficher : "Google sign-in failed. Please try again."

---

## Payloads de référence
Aucun appel API. Le token JWT est reçu directement dans l'URL :

```
https://app.msgflash.com/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

En cas d'erreur OAuth :
```
https://app.msgflash.com/auth/callback?error=oauth_failed
```

---

## Out of scope
- Validation du JWT côté client (le backend valide à chaque requête)
- Refresh token
