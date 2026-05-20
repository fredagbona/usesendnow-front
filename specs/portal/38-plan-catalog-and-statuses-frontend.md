# SPEC — Portal / Plan catalog v2 & statuses (frontend)

App: portal (+ landing pricing)
Status: ready
Related: [`11-billing.md`](./11-billing.md)

---

## Summary

- **3 display plans:** `free` → `pro` → `max` (hide `starter` / `plus` from catalog UI).
- **EUR only** in portal billing (`priceEur`); no FCFA in UI.
- **Checkout / upgrade:** `pro` and `max` only.
- **WhatsApp statuses:** not marketed or shown in plan features; `canPublishStatuses: false` default in workspace capabilities.
- **Free plan note** (billing page): 500 messages/month, campaigns, 3 webhooks, number lookups, 1 instance, 1 API key, 10 contact groups.

Shared constants: `packages/types/plan-catalog.ts`.

---

## Landing pricing

Mirror the 3-plan grid (Free / Pro / MAX), EUR, no statuses in feature bullets. Marketing quotas are illustrative; live values come from `GET /api/billing/plans`.

---

## Teams

Team workspace **creation** requires `pro` or `max` (legacy `plus` treated as max).
