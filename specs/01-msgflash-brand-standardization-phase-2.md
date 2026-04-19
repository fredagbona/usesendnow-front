# SPEC — Monorepo / Brand Standardization Phase 2 (Technical Rename)
App: all (landing, portal, admin, docs, packages)
Route: n/a (cross-app)
Auth: n/a
Status: ready

---

## Purpose

Finaliser la migration de marque en traitant la dette technique laissee en Phase 1.
Cette phase renomme les identifiants internes historiques `usesendnow` vers `msgflash` sans casser la livraison.
Objectif: aligner code, packages, envs et conventions internes avec la marque officielle **MsgFlash**.

---

## Prerequis

- La spec `specs/00-msgflash-brand-standardization.md` est appliquee et validee.
- Toutes les surfaces utilisateur visibles sont deja en `MsgFlash`.
- Une branche dediee de migration est utilisee (pas de changement melange avec des features produit).

---

## Scope

### In scope

- Renommage des namespaces de packages internes:
  - `@usesendnow/types` -> `@msgflash/types`
  - `@usesendnow/api-client` -> `@msgflash/api-client`
  - `@usesendnow/ui` -> `@msgflash/ui`
  - `@usesendnow/config` -> `@msgflash/config`
- Mise a jour de tous les imports dans les apps et packages.
- Renommage des references techniques internes (constantes, comments, docs dev).
- Normalisation progressive des variables d'environnement frontend:
  - `NEXT_PUBLIC_API_URL` (legacy) -> `NEXT_PUBLIC_MSGFLASH_API_URL` (new canonical)
- Mise a jour des exemples `.env.example` et de la documentation dev associee.
- Mise a jour des scripts/tooling qui referencent les anciens noms (si present).

### Out of scope

- Renommage du repository Git distant.
- Renommage backend hors frontend monorepo.
- Breaking changes API backend.

---

## Decisions techniques

### 1) Package naming

- Les nouveaux noms `@msgflash/*` deviennent **source of truth**.
- Pendant une periode de transition, un alias de compatibilite est maintenu:
  - soit via `exports`/re-export
  - soit via mapping TypeScript/resolve
- Fin de transition: suppression des anciens imports `@usesendnow/*`.

### 2) Environment variables

- Resolution API URL frontend:
  1. `NEXT_PUBLIC_MSGFLASH_API_URL`
  2. fallback `NEXT_PUBLIC_API_URL` (legacy)
  3. fallback local dev uniquement (si necessaire)
- Les docs doivent presenter la nouvelle variable comme officielle.
- La variable legacy reste supportee sur une fenetre de transition definie.

### 3) Backward compatibility

- Aucune regression fonctionnelle toleree pendant migration.
- Toute compat legacy doit etre explicite, temporaire, et marquee deprecated.

---

## Strategie de migration (ordre obligatoire)

1. Introduire les nouveaux package names et alias de compatibilite.
2. Migrer tous les imports du monorepo vers `@msgflash/*`.
3. Introduire la nouvelle variable env canonical + fallback legacy.
4. Migrer docs/dev guides et `.env.example`.
5. Supprimer les references techniques obsoletes restantes.
6. Activer les guardrails CI (voir section CI/Lint).
7. Retirer les alias legacy apres stabilisation.

---

## CI / Lint guardrails

Ajouter des controles pour eviter la reintroduction de legacy naming:

- Echec CI si nouveaux imports `@usesendnow/*` sont introduces.
- Echec CI si nouvelles references visibles `usesendnow` apparaissent hors zone legacy autorisee.
- Optionnel: rule lint custom "no-legacy-branding" sur dossiers cibles.

Zones legacy autorisees temporairement:

- Fallback env handling
- Notes de migration documentees
- Historique/archives explicitement marquees

---

## Criteres d'acceptation

1. Tous les imports actifs utilisent `@msgflash/*`.
2. Aucun fichier de production n'importe `@usesendnow/*` (hors shim/compat explicit).
3. Toutes les apps resolvent l'API URL via la nouvelle variable canonical avec fallback legacy.
4. `.env.example` et docs dev utilisent `NEXT_PUBLIC_MSGFLASH_API_URL`.
5. Build, lint, type-check passent sur les apps actives.
6. Aucune regression sur auth, dashboard, messaging, campaigns, billing.
7. Un document de deprecation timeline est ajoute (date de retrait de legacy).

---

## Test plan

- Static checks:
  - recherche globale imports `@usesendnow/`
  - recherche globale `NEXT_PUBLIC_API_URL` usages directs non encadres
- Validation apps:
  - `landing` build + smoke
  - `portal` auth + flow message + billing smoke
  - `admin` build + smoke
- Env validation:
  - run avec `NEXT_PUBLIC_MSGFLASH_API_URL` uniquement
  - run avec legacy uniquement (compat)
  - run avec les deux (priorite canonical)
- Regression docs:
  - verifier snippets setup et quickstart

---

## Risques

- Casse d'imports cross-package pendant renommage massif.
- Oubli d'un alias qui bloque runtime/bundle.
- Confusion equipe si coexistence des deux namespaces trop longue.

Mitigation:

- Migration en petites PRs sequencees.
- Ajout des guardrails CI des la 1ere PR.
- Deadline claire de retrait legacy.

---

## Rollout plan

### Milestone A — Compat introduite
- Nouveaux namespaces crees.
- Aliases legacy actifs.
- Aucun comportement change.

### Milestone B — Monorepo migre
- Tous les imports internes bascules sur `@msgflash/*`.
- CI interdit les nouveaux imports legacy.

### Milestone C — Legacy retirement
- Suppression aliases `@usesendnow/*`.
- Suppression fallback env legacy (si approuve).
- Documentation finale nettoyee.

---

## Definition of done

- Le monorepo frontend n'utilise plus `usesendnow` comme identifiant technique actif.
- La compatibilite legacy est retiree ou explicitement datee.
- Les conventions de nommage sont coherentes produit + technique: **MsgFlash partout**.
