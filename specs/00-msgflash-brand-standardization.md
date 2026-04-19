# SPEC — Monorepo / Brand Standardization (MsgFlash)
App: all (landing, portal, admin, docs, packages)
Route: n/a (cross-app)
Auth: n/a
Status: ready

---

## Purpose

Unifier toute la base frontend autour de la marque **MsgFlash**.
Supprimer l'ambiguite entre `UseSendNow` et `MsgFlash` dans le produit, la documentation et les metadonnees frontend.
Cette spec definit **quoi renommer, quoi conserver temporairement, et comment valider** le resultat.

---

## Decision de reference

- **Nom officiel produit:** `MsgFlash`
- **Nom officiel domaine public:** `msgflash.com`
- **Nom officiel app:** `app.msgflash.com`
- **Nom officiel docs:** `docs.msgflash.com`
- **Nom officiel admin:** `admin.msgflash.com`

Regle absolue: toute surface frontend visible utilisateur doit afficher `MsgFlash` et non `UseSendNow`.

---

## Scope

### In scope

- Branding texte visible dans:
  - `apps/landing`
  - `apps/portal`
  - `apps/admin`
  - `apps/docs` (navigation, pages MDX, titrages, descriptions)
- Metadata SEO/OpenGraph/Twitter (`title`, `description`, `url`, `images alt`)
- Favicon/manifest references si elles contiennent l'ancien nom
- Config de marque (`brand.ts`, constantes de domaine, URLs publiques)
- Docs internes frontend qui guident l'implementation produit

### Out of scope (pour cette phase)

- Renommage du nom du repository Git
- Renommage des noms de packages npm (`@usesendnow/*`)
- Renommage des variables d'environnement backend deja en production
- Refactor backend (hors de ce repo)

---

## Regles de migration

### 1) Surfaces utilisateur

- Remplacer tout libelle `UseSendNow` par `MsgFlash`.
- Conserver une casse coherente:
  - UI/Docs: `MsgFlash`
  - Domaines: `msgflash.com`

### 2) Domaines et URLs

- Tous les liens frontend publics doivent pointer vers les domaines `msgflash`.
- Si une URL historique `usesendnow` est encore necessaire temporairement, elle doit:
  - etre centralisee dans une constante de transition
  - etre marquee comme deprecated avec commentaire court

### 3) Config centralisee

- Chaque app doit exposer/consommer une source claire de branding (`brand.ts` ou equivalent).
- Interdiction de hardcoder des domaines marques dans les composants quand une constante existe.

### 4) Compatibilite technique

- Les identifiants techniques historiques (`@usesendnow/*`, `NEXT_PUBLIC_API_URL`, etc.) peuvent rester tant qu'ils ne sont pas visibles utilisateur.
- Toute dette de renommage technique doit etre listee dans une section "Phase 2" (cf. bas de spec).

---

## Fichiers cibles (minimum)

- `apps/landing/**` (metadata + copy + brand constants)
- `apps/portal/**` (metadata + copy + brand constants)
- `apps/admin/**` (metadata + copy + brand constants)
- `apps/docs/mint.json`
- `apps/docs/**/*.mdx` (pages de contenu et references de marque)
- `specs/**/*.md` uniquement si le document est encore actif comme reference implementation

---

## Criteres d'acceptation

La spec est consideree complete si tous les points suivants sont vrais:

1. Aucune occurrence de `UseSendNow` dans les surfaces frontend visibles utilisateur.
2. Aucun lien public frontend vers `usesendnow.com` (hors note de migration explicite).
3. Les metadata `title/description/og/twitter` des apps actives sont coherentes avec `MsgFlash`.
4. Les constantes de marque par app pointent toutes vers les domaines `msgflash`.
5. La docs publique (`apps/docs`) presente `MsgFlash` de facon uniforme.
6. Aucun comportement fonctionnel ne regresse (auth, navigation, CTA, webhooks docs, etc.).

---

## Test plan

- Verifier manuellement:
  - Landing home + footer + pages legals
  - Portal login/signup/dashboard/billing
  - Admin home
  - Docs home + nav + 3 pages API au hasard
- Verifier metadata generees dans chaque app (title + OG url + image alt).
- Verifier absence de references `UseSendNow` dans les fichiers UX visibles.
- Verifier qu'aucun endpoint API n'a ete casse par le rebranding.

---

## Risques

- Melange de marque dans les specs peut reintroduire d'anciens libelles.
- Incoherence entre copy UI et docs API si migration partielle.
- Oublis dans metadata/social previews qui nuisent au SEO et au partage.

Mitigation:
- Faire un pass global en une seule PR.
- Ajouter une checklist de review "Brand consistency".

---

## Phase 2 (dette technique hors scope immediat)

- Evaluer un futur renommage de namespaces techniques:
  - `@usesendnow/types`
  - `@usesendnow/api-client`
  - `@usesendnow/ui`
- Evaluer un plan de migration progressive des noms de variables/env et references internes.
- Prevoir backward compatibility + deprecation timeline si ces changements sont engages.

---

## Notes implementation

- Priorite: coherence produit et perception utilisateur.
- Ne pas bloquer la livraison sur un renommage technique profond.
- "Visible user first, technical rename later".
