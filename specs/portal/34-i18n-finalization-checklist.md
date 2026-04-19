# SPEC — Portal / I18n Finalization Checklist
App: portal
Scope: en/fr
Status: complete (QA manuelle recommandée)

---

## Objectif

Finaliser la migration i18n du portal en supprimant les chaines UI hardcodees dans les pages, composants partages et hooks.

---

## Checklist restante

### A. Pages non migrees (bloquant)

- [x] `app/(auth)/callback/page.tsx`
- [x] `app/(auth)/forgot-password/page.tsx`
- [x] `app/(auth)/login/page.tsx`
- [x] `app/(auth)/reset-password/page.tsx`
- [x] `app/(auth)/signup/page.tsx`
- [x] `app/(auth)/verify-email/page.tsx`
- [x] `app/(portal)/contacts/groups/page.tsx`
- [x] `app/(portal)/contacts/groups/[groupId]/page.tsx`
- [x] `app/(portal)/dashboard/page.tsx`
- [x] `app/(portal)/messages/[id]/page.tsx`
- [x] `app/(portal)/number-lookups/page.tsx`
- [x] `app/(portal)/templates/new/page.tsx`
- [x] `app/(portal)/webhooks/new/page.tsx`
- [x] `app/auth/callback/page.tsx` (réexport documenté vers `/(auth)/callback`)
- [x] `app/page.tsx` (`generateMetadata` selon locale + redirect `/dashboard`)

### B. Pages partiellement migrees

- [x] `app/(portal)/api-keys/page.tsx` (retirer inline `isFr ? ... : ...`)
- [x] `app/(portal)/billing/page.tsx` (toasts/libelles restants)

### C. Composants partages (priorite haute)

- [x] `components/layout/GlobalSearch.tsx`
- [x] `components/messages/RecipientSelector.tsx`
- [x] `components/messages/VoiceRecorderPanel.tsx`
- [x] `components/messages/MediaUploadPanel.tsx`
- [x] `components/messages/ButtonBuilder.tsx`
- [x] `components/messages/SendStatusPanel.tsx`
- [x] `components/number-lookups/LookupDetailModal.tsx`
- [x] `components/number-lookups/LookupHistoryTable.tsx`
- [x] `components/number-lookups/LookupResultsTabs.tsx`
- [x] `components/campaigns/CampaignSafetyHints.tsx`
- [x] `components/instances/InstanceHealthCard.tsx`
- [x] `components/ui/CustomVariableBuilder.tsx`
- [x] `components/ui/MessageTextarea.tsx`

### D. Hooks avec messages hardcodes

- [x] `hooks/useApiKeys.ts`
- [x] `hooks/useBilling.ts`
- [x] `hooks/useCampaigns.ts`
- [x] `hooks/useContactGroups.ts`
- [x] `hooks/useContactImports.ts`
- [x] `hooks/useContacts.ts`
- [x] `hooks/useGlobalSearch.ts`
- [x] `hooks/useInstanceHealth.ts`
- [x] `hooks/useInstances.ts`
- [x] `hooks/useMessages.ts`
- [x] `hooks/useNumberLookups.ts`
- [x] `hooks/usePayments.ts`
- [x] `hooks/useTemplates.ts`
- [x] `hooks/useWebhooks.ts`

---

## Plan de migration (execution)

### Phase 1 — Fondations (fait en premier)
- Etendre `lib/portal-copy.ts` avec toutes les cles manquantes:
  - auth
  - globalSearch
  - messages.recipient
  - messages.voiceRecorder
  - labels utilitaires transverses
- Migrer les composants transverses qui impactent plusieurs pages.

### Phase 2 — Auth + parcours critiques
- Migrer 100% des pages auth.
- Migrer detail message + dashboard + groups + number lookups + new template/new webhook.

### Phase 3 — Nettoyage pages deja migrees
- Enlever tous les `isFr ? ... : ...` et literals restants dans:
  - api-keys
  - billing

### Phase 4 — Hooks
- Centraliser messages utilisateur via `portalCopy` (ou mapper d'erreurs central).
- Eviter les chaines en dur dans `setError`, `toast.*`.

### Phase 5 — QA finale
- Smoke test fr + en sur:
  - auth
  - dashboard
  - messages send + details
  - contacts/groups
  - billing + api-keys
- Verifier qu'aucune chaine FR/EN inline ne subsiste hors dictionnaire.

---

## Definition of done

- Aucun texte UI utilisateur hardcode dans pages/composants portal.
- `portal-copy.ts` est la source de verite en/fr.
- Les hooks n'exposent plus de messages hardcodes.
