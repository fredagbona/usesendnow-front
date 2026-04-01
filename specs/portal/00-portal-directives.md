
# DIRECTIVES — Portal (Tableau de bord utilisateur)
App: portal
URL: app.usesendnow.com
Status: référence permanente — lire avant toute spec portal

---

## Ce qu'est le portal

Le portal est le control plane humain de UseSendNow.
Ce n'est pas un outil marketing. C'est une console technique.
L'utilisateur vient ici pour configurer, connecter, surveiller — pas pour naviguer.

Philosophie UI: **Clarity over decoration.**
Chaque élément à l'écran a une raison d'être.
Si on peut le retirer sans perdre d'information — on le retire.

---

## Thème — Light Mode

Le portal est en **light mode uniquement**.
Pas de dark mode. Pas de toggle. Light only.

La landing est dark et punchy (Neo-Brutalist).
Le portal est light et précis (High-End SaaS Tool).
Le contraste entre les deux est intentionnel — on change d'univers en entrant dans l'app.

---

## Palette portal

| Token | Value | Usage |
|---|---|---|
| bg-base | #FFFFFF | fond principal des pages |
| bg-subtle | #F8F9FA | fond sidebar, tableaux, zones neutres |
| bg-card | #FFFFFF | cartes et panels |
| border | #E5E7EB | séparateurs, bordures de cards |
| border-strong | #D1D5DB | bordures d'inputs, focus rings |
| text-primary | #111827 | titres, labels importants |
| text-secondary | #6B7280 | texte secondaire, descriptions |
| text-muted | #9CA3AF | placeholders, infos tertiaires |
| accent | #25D366 | actions primaires, états actifs, badges success |
| accent-hover | #1EBF5A | hover sur accent |
| accent-subtle | #F0FDF4 | fond de badges success, highlights légers |
| destructive | #EF4444 | delete, revoke, erreurs |
| destructive-subtle | #FEF2F2 | fond de badges error |
| warning | #F59E0B | quota proche, statut dégradé |
| warning-subtle | #FFFBEB | fond de badges warning |

Jamais de couleur en dehors de cette palette.

---

## Typographie portal

- Font unique: **Geist Sans** pour tout (titres ET corps)
- Pas de Poppins dans le portal
- Raison: cohérence "outil technique", lisibilité maximale sur les données

| Rôle | Classes Tailwind |
|---|---|
| Page title | `text-xl font-semibold text-[#111827]` |
| Section title | `text-base font-medium text-[#111827]` |
| Body | `text-sm font-normal text-[#374151]` |
| Secondary | `text-sm text-[#6B7280]` |
| Muted | `text-xs text-[#9CA3AF]` |
| Mono (IDs, keys, code) | `font-mono text-sm text-[#111827]` |

---

## Layout global du portal
```
┌─────────────────────────────────────────────┐
│  Sidebar (240px fixe)  │  Main content area  │
│                        │                     │
│  Logo                  │  Page header        │
│  Navigation            │  ─────────────────  │
│  ─────────────────     │  Page content       │
│  User + plan badge     │                     │
│  ─────────────────     │                     │
│  Usage mini widget     │                     │
└─────────────────────────────────────────────┘
```

### Sidebar
- Width: 240px fixe sur desktop
- bg-[#F8F9FA], border-right border-[#E5E7EB]
- Position: fixed left, full height
- Collapsible sur tablet (icon-only mode, 64px)
- Drawer sur mobile

### Sidebar navigation items
```
Tableau de bord        /dashboard
Instances              /instances
Messages               /messages
Campagnes              /campaigns
Statuts                /statuses
Contacts               /contacts
Templates              /templates
Webhooks               /webhooks
─────────────────
Clés API               /api-keys
─────────────────
Abonnement             /billing
```

### Main content area
- margin-left: 240px sur desktop
- padding: 32px
- max-width: none — s'adapte à la fenêtre
- bg-[#FFFFFF]

### Page header pattern (chaque page)
```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-xl font-semibold text-[#111827]">{title}</h1>
    <p className="text-sm text-[#6B7280] mt-1">{description}</p>
  </div>
  <div>{/* CTA bouton principal de la page */}</div>
</div>
```

---

## Composants UI du portal

### Button variants
```
primary   → bg-[#25D366] text-white hover:bg-[#1EBF5A]
secondary → bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F8F9FA]
danger    → bg-[#EF4444] text-white hover:bg-[#DC2626]
ghost     → text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FA]
```
Taille standard: `px-4 py-2 text-sm font-medium rounded-lg`
Pas de Hard Shadow ici — c'est la landing, pas le portal.

### Card
```
bg-white border border-[#E5E7EB] rounded-xl p-6
```
Pas de shadow par défaut. Shadow légère uniquement si la carte est interactive.

### Input
```
border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent
placeholder:text-[#9CA3AF]
```

### Badge / Status pill
```
success  → bg-[#F0FDF4] text-[#15803D] text-xs font-medium px-2.5 py-0.5 rounded-full
error    → bg-[#FEF2F2] text-[#DC2626] text-xs font-medium px-2.5 py-0.5 rounded-full
warning  → bg-[#FFFBEB] text-[#B45309] text-xs font-medium px-2.5 py-0.5 rounded-full
neutral  → bg-[#F3F4F6] text-[#6B7280] text-xs font-medium px-2.5 py-0.5 rounded-full
```

### Table
```
<table className="w-full">
  <thead>
    <tr className="border-b border-[#E5E7EB]">
      <th className="text-left text-xs font-medium text-[#6B7280] uppercase
                     tracking-wide pb-3">
```
Lignes alternées: `even:bg-[#F8F9FA]`
Hover sur ligne: `hover:bg-[#F0FDF4]` si la ligne est cliquable

### Empty state
Chaque liste/tableau a un empty state:
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Icon className="w-10 h-10 text-[#9CA3AF] mb-4" />
  <p className="text-sm font-medium text-[#111827]">{title}</p>
  <p className="text-sm text-[#6B7280] mt-1 mb-4">{description}</p>
  <Button variant="primary">{cta}</Button>
</div>
```

### Loading state
Skeleton loaders uniquement — pas de spinner global.
```tsx
<div className="h-4 bg-[#F3F4F6] rounded animate-pulse" />
```

### Modal / Dialog
- Overlay: `bg-black/40 backdrop-blur-sm`
- Panel: `bg-white rounded-2xl p-6 shadow-xl max-w-md w-full`
- Toujours un titre, un corps, et des boutons (Cancel + Confirm)
- Confirm destructif → bouton danger

### Toast notifications
- Position: bottom-right
- Success: border-left 3px solid #25D366
- Error: border-left 3px solid #EF4444
- Duration: 4s auto-dismiss
- Librairie: `sonner`

---

## Animations portal

Framer Motion — mais plus sobre que la landing.

| Élément | Animation |
|---|---|
| Page transition | opacity 0→1, durée 0.2s |
| Modal open | scale 0.97→1 + opacity, durée 0.15s |
| Sidebar item hover | bg transition 0.1s |
| Toast in | slide depuis la droite, 0.2s |
| Empty state | fadeIn, 0.3s |
| Skeleton→content | opacity, 0.2s |

Pas de stagger complexe dans le portal.
Pas d'animations sur les tableaux ou les listes de données.
La donnée doit apparaître vite — l'animation ne doit jamais retarder l'information.

---

## Auth flow du portal

### Pages publiques (sans sidebar)
```
/login
/signup
/auth/callback      ← reçoit le token Google OAuth
/forgot-password    ← v2
```

### Pages protégées (avec sidebar)
Tout le reste. Redirection vers /login si pas de token JWT valide.

### Stockage du token
localStorage key: `usn_token`
Header sur chaque requête: `Authorization: Bearer <token>`

### Google OAuth flow côté frontend
1. Bouton "Continuer avec Google" → redirige vers `{API_URL}/api/auth/google`
2. Backend gère OAuth, redirige vers `/auth/callback?token=<jwt>`
3. Frontend lit le token depuis l'URL, le stocke, redirige vers `/dashboard`

---

## Format de spec obligatoire pour chaque page portal

Chaque spec portal doit respecter exactement ce format:
```md
# SPEC — Portal / [Nom de la page]
App: portal
Route: /[route]
Auth: required
Status: draft | ready | in-progress | done

---

## Purpose
Ce que l'utilisateur vient faire sur cette page.
Maximum 3 phrases.

---

## Backend endpoints utilisés
Liste des endpoints appelés, avec méthode et chemin exact.
| Method | Endpoint | Usage |
|---|---|---|

---

## Layout de la page
Description du layout spécifique si différent du pattern standard.
Sinon: "Layout standard portal."

---

## Composants de la page
Liste des composants à créer pour cette page.
Chaque composant avec:
- Nom
- Ce qu'il affiche
- Props principales

---

## États à gérer
- loading
- empty
- error
- [états spécifiques à la page]

---

## Actions utilisateur
Liste des actions possibles sur la page.
Pour chaque action:
- Déclencheur (bouton, form, etc.)
- Appel API
- Feedback utilisateur (toast, redirect, update)
- Cas d'erreur à gérer

---

## Règles métier
Contraintes spécifiques au plan, à l'état de l'entité, etc.

---

## Out of scope
Ce qui n'est pas dans cette spec.
```

---

## Ordre de développement des pages portal

1. `/login` + `/signup` + `/auth/callback` — auth en premier, tout dépend de ça
2. `/dashboard` — vue d'ensemble
3. `/instances` — cœur du produit
4. `/api-keys` — deuxième action critique
5. `/messages` — envoi et historique
6. `/webhooks` — configuration events
7. `/billing` — plans et usage
8. `/campaigns` — bulk messaging
9. `/contacts` — répertoire
10. `/templates` — messages réutilisables
11. `/statuses` — WhatsApp status

---

## Ce que le dev NE DOIT PAS faire dans le portal

- Pas de dark mode
- Pas de couleurs hors palette
- Pas d'images décoratives
- Pas de Poppins
- Pas de Hard Shadow (c'est la landing)
- Pas de fetch direct — tout passe par @usesendnow/api-client
- Pas de logique métier dans les composants — dans les hooks
- Pas de token JWT hardcodé ou en commentaire
- Pas de console.log en prod
