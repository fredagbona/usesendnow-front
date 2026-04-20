# Portal — I18n finalization checklist

App: `apps/portal`  
Locales: `fr` / `en`  
Source de vérité: `apps/portal/lib/portal-copy.ts` + `usePortalLocale()` (`PortalLocaleProvider`)

**Statut global:** en cours — **messages**, **campagnes/contacts**, **templates**, **`webhooks/new`**, **number-lookups**, **clés API**, **`formatBytes`**, **billing**, **dashboard**, **hooks** et **grep `components/`** (layout : TopNav / Sidebar / `(portal)/layout`) alignés ; suite prioritaire : **QA** (section E) et grep global `apps/portal` si besoin.

---

## Hors scope (acceptable)

- **Formatage** `toLocaleString` / `toLocaleDateString` avec `locale === "fr" ? "fr-FR" : "en-US"` (billing, dashboard, etc.) — ce n’est pas du texte produit, c’est la locale numérique.
- **Bascule de langue** dans `PortalLocaleProvider` / `TopNav`.
- **Identifiants techniques** (`instanceId`, codes d’erreur API) sauf s’ils sont affichés comme libellé utilisateur.

---

## Fait récemment (vérifié dans le dépôt)

- [x] `app/(portal)/campaigns/page.tsx` — `copy.campaigns.list` (liste, modales, toasts, médias, actions ligne).
- [x] `app/(portal)/instances/page.tsx` — `copy.instances.list`.
- [x] `app/(portal)/campaigns/[id]/page.tsx` — `copy.campaigns.list` + `copy.campaigns.detail`.
- [x] `lib/portal-copy.ts` — `campaigns.detail`, `instances.detail` (FR + EN).

---

## A. Pages `(portal)` — à migrer ou à auditer

Cochez quand **toutes** les chaînes visibles / toasts / erreurs passent par `portal-copy` (plus de `locale === "fr" ?` pour du copy, plus de français seul).

- [x] `app/(portal)/profile/page.tsx`
- [x] `app/(portal)/templates/[id]/page.tsx`
- [x] `app/(portal)/webhooks/page.tsx`
- [x] `app/(portal)/contacts/page.tsx`
- [x] `app/(portal)/contacts/groups/page.tsx`
- [x] `app/(portal)/contacts/groups/[groupId]/page.tsx`
- [x] `app/(portal)/campaigns/new/page.tsx`
- [x] `lib/safetyTranslations.ts` + `CampaignSafetyHints` + `InstanceHealthCard` — locale `fr` → dict FR ; `en` → texte API inchangé
- [x] Libellés **type de message** (campagnes new/détail, messages list/new) via `copy.messages.detail.types` (plus de `TYPE_LABEL` messageComposer sur ces écrans)
- [x] `app/(portal)/messages/new/page.tsx` — `messages.compose` + erreurs média `campaigns.list` + `messages.detail` / `messages.recipient` (placeholder téléphone)
- [x] `app/(portal)/messages/page.tsx` — `copy.messages.list` + types via `messages.detail.types`
- [x] `app/(portal)/messages/[id]/page.tsx` — `messages.detail` + `messages.list.statusLabels` ; libellés FR corrigés pour le bloc template
- [x] `app/(portal)/templates/page.tsx`
- [x] `app/(portal)/templates/new/page.tsx` (re-scan)
- [x] `app/(portal)/webhooks/new/page.tsx` (re-scan)
- [x] `app/(portal)/number-lookups/page.tsx` (re-scan)
- [x] `app/(portal)/billing/page.tsx` (uniquement libellés / toasts restants, pas les `toLocaleString`)
- [x] `app/(portal)/dashboard/page.tsx` (idem)
- [x] `app/(portal)/api-keys/page.tsx` (re-scan après refactors)

Pages **auth** et **layout** : repasser un grep si besoin.

---

## B. Composants — ternaires `locale === "fr"` ou FR seul

- [x] `components/number-lookups/LookupComposer.tsx`
- [x] `components/number-lookups/ImportContactsPanel.tsx`
- [x] `components/templates/TemplateVariableGuide.tsx`
- [x] `components/templates/HighlightedTemplateBody.tsx`
- [x] Tout autre fichier sous `components/` avec grep `locale === "fr"` hors formatage. (2026-04-19 : restants = `toLocaleDateString` / `numberLocale` / `PortalLocaleProvider` — hors scope copy.)

---

## C. Hooks — messages utilisateur

Objectif : erreurs / toasts exposés aux pages via `copy` ou clés passées depuis la page, pas de chaîne FR/EN en dur dans le hook (sauf mapping technique rare documenté).

- [x] Re-grep `apps/portal/hooks/*.ts` pour `"` / `toast.` / `setError` avec literals.
- [x] Aligner avec `copy.hooks.*` / domaines (`numberLookups`, etc.) dans `portal-copy.ts`.

---

## D. Cohérence technique

- [ ] Préférer **`usePortalLocale()`** partout ; éviter **`portalCopy[locale]`** direct dans les pages (sauf cas documenté).
- [ ] Regrouper les clés par domaine (`instances.detail`, `templates.detail`, `profile`, `lookups.composer`, etc.).
- [ ] Prévoir **placeholders** (`{{count}}`, `{{pct}}`) plutôt que concaténation dispersée quand la grammaire varie entre langues.

---

## E. QA finale (manuel)

- [ ] Parcours FR : instances liste → détail → QR / danger ; campagnes liste → détail ; profil ; template détail ; webhooks.
- [ ] Même parcours en **EN** (titres navigateur via `PortalTitleManager` si applicable).
- [ ] Recherche repo : `locale === "fr" ? "` dans `apps/portal` → ne doit rester que formatage ou cas explicitement acceptés.
- [x] `pnpm exec tsc --noEmit` dans `apps/portal`.

---

## Definition of done

1. Aucune chaîne **utilisateur** FR/EN inline dans pages et composants listés (hors exceptions « Hors scope »).
2. Nouvelles clés **FR et EN** dans `portal-copy.ts` pour chaque libellé migré.
3. `tsc` portal OK ; pas de régression évidente sur les parcours cochés en section E.

---

## Journal (optionnel)

| Date       | Fichier / zone              | Notes                          |
|------------|-----------------------------|--------------------------------|
| 2026-04-19 | `instances/[id]/page.tsx`   | Migré vers `instances.detail`. |
| 2026-04-19 | `templates/[id]/page.tsx`   | Migré vers `templates.detail` + `HighlightedTemplateBody`. |
| 2026-04-19 | `messages/page.tsx`, safety | Liste messages → `messages.list` ; warmup reasons/reco selon locale ; types message depuis `portal-copy`. |
| 2026-04-19 | `messages/new/page.tsx` | `messages.compose` (FR+EN), médias via `campaigns.list`, titre `messages.title`, placeholder `recipient.phonePlaceholder`. |
| 2026-04-19 | `messages/[id]/page.tsx` | Statuts via `messages.list.statusLabels` ; `templateRenderFailed` ; FR `detail` (rendu template, variables, code). |
| 2026-04-19 | `templates/page.tsx`, `templates/new/page.tsx` | Liste + édition modale + new : `usePortalLocale().copy`, types via `templates.detail.typeLabels`, exemples / placeholders / corps d’exemples dans `portal-copy`. |
| 2026-04-19 | `webhooks/new`, `api-keys` | Placeholder URL webhook ; exemple `curl` quick-start (FR/EN) dans `portal-copy`. |
| 2026-04-19 | `number-lookups/page.tsx` | Déjà sur `copy.numberLookups` ; seuls `toLocaleDateString` restants dans les sous-composants (hors scope formatage). |
| 2026-04-19 | `formatBytes` + `MediaUploadPanel` | Unité mégaoctet via `common.bytesMegabyte` (Mo / MB) passée depuis les pages et le panneau média. |
| 2026-04-19 | `billing/page.tsx` | `instance` singulier, `priceSecondaryEur`, toasts `downgradeScheduled` / `cancelSuccess*` avec `{{planName}}` ; plus de chaînes utilisateur hors `portal-copy` (hors `toLocaleString`). |
| 2026-04-19 | `dashboard/page.tsx` | `planNameFree` ; `StatTile` + dates selon `numberLocale` ; statuts campagne `paused_quota` / `paused_plan` / `cancelled` (clés alignées API). |
| 2026-04-19 | `hooks/*.ts` | `billingLoadError` ; lookups : toasts depuis `numberLookups` ; retrait doublons `toasts` ; `sonner` → `@/lib/toast` sur instances / messages / contactImports / numberLookups. |
| 2026-04-19 | Grep `components/` + layout | `sidebar.*`, `topnav.themeSwitch*`, `common.currentLanguageName` / `localeCode` ; quota sidebar selon locale ; `(portal)/layout` : plan gratuit via `profile.planFallbackFree`. |
