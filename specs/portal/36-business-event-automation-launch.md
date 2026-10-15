# Frontend implementation — Business Event Automation launch

**Status:** Ready for implementation  
**Last updated:** 2026-07-14  
**Backend contract:** `usesendnow-backend/specs/integrations/portal-integration/36-business-event-automation-launch.md`

## 1. Delivery goal

Ship a public product-update page and an authenticated portal banner announcing that MsgFlash is now positioned as **Business Event Automation**.

This release is intentionally static and frontend-only. The future admin-managed announcement API is not implemented, so this task must not add calls, types, unread counters, or loading states for `/api/announcements`.

## 2. Product truth

- MsgFlash turns orders, payments, bookings, signups, subscriptions, shipments, and other business events into WhatsApp communication.
- WhatsApp remains the core channel and the Public API remains first-class.
- MsgFlash is not a generic workflow builder.
- Starter is **EUR 19/month** with one seven-day trial.
- Growth is **EUR 39/month** with one seven-day trial.
- Enterprise pricing is custom.
- There is no permanent Free plan and no fallback to Free after trial expiration.
- An unpaid expired account cannot perform product operations.
- WhatsApp Status publishing and interactive buttons are removed.

Never expose the superseded Free / Pro / MAX / Plus catalog or Starter at EUR 9.

## 3. Availability language

The announcement must not imply that every part of the new direction is already available.

### Available today

- instances;
- contacts, groups, tags, imports, and bulk jobs;
- templates;
- campaigns and scheduling;
- API keys, Public API, and webhooks;
- number lookup;
- teams and workspaces;
- billing, usage, and access enforcement;
- media upload;
- current instance health information.

### Progressive rollout

- industry-aware onboarding;
- Industry Templates;
- Integration Gallery;
- customer Event Logs;
- expanded Delivery Analytics;
- complete Health Center;
- dynamic announcements and public changelog.

Use “coming progressively” or “progressive rollout”, never “available now”, for the second list.

## 4. Public page

### Route and SEO

- App: `apps/landing`.
- Route: `/announcements/business-event-automation`.
- Canonical URL: `https://msgflash.com/announcements/business-event-automation`.
- Public, indexable, responsive, and localized through the existing landing locale provider.
- Add it to the sitemap when the landing app manages one explicitly.

Metadata:

| Locale | Title | Description |
| --- | --- | --- |
| FR | `MsgFlash évolue vers la Business Event Automation` | `Découvrez comment MsgFlash transforme les événements de votre entreprise en communications WhatsApp automatiques.` |
| EN | `MsgFlash is evolving into Business Event Automation` | `See how MsgFlash turns business events into automatic WhatsApp communication.` |

### Required layout

1. Product-update eyebrow and publication date.
2. Hero with lead and CTA.
3. Why the positioning is changing.
4. Example event-to-message flow.
5. Capabilities available today.
6. Progressive rollout section.
7. Starter/Growth trial and pricing clarification.
8. Existing-user impact.
9. Final links to the portal and pricing.

Use the existing marketing shell, navbar, footer, spacing, typography, and responsive patterns. Do not create a disconnected “documentation page” visual.

### Approved French copy

- Eyebrow: `Mise à jour produit`
- Title: `MsgFlash évolue vers la Business Event Automation`
- Lead: `Vos commandes, paiements, réservations, inscriptions, abonnements et expéditions génèrent déjà des événements. MsgFlash transforme ces événements en communications WhatsApp automatiques, traçables et utiles pour vos clients.`
- Why: `MsgFlash ne se limite plus à “envoyer des messages WhatsApp”. Notre objectif est de relier les événements réels de votre activité à la bonne communication client, au bon moment, tout en conservant une API claire et une infrastructure WhatsApp spécialisée.`
- What stays: `Vos instances, contacts, groupes, modèles, campagnes, programmations, clés API, webhooks, équipes, médias et outils de facturation restent au cœur du produit.`
- Rollout label: `Déploiement progressif`
- Rollout: `Les modèles par industrie, la galerie d’intégrations, les Event Logs, les analytics de délivrabilité enrichis, le nouveau Health Center et l’onboarding métier seront introduits progressivement. Ils ne sont pas tous disponibles aujourd’hui.`
- Pricing: `MsgFlash propose désormais un essai unique de 7 jours sur Starter à 19 €/mois ou Growth à 39 €/mois. Il n’existe plus de plan Free permanent. Sans abonnement actif à la fin de l’essai, les opérations sont bloquées mais la facturation, le profil et les exports autorisés restent accessibles.`
- Existing users: `Vous pouvez continuer à utiliser les fonctions déjà disponibles. Les changements de navigation et les nouvelles capacités seront annoncés au fur et à mesure. Aucun workflow existant ne doit être présenté comme migré automatiquement sans confirmation dans le produit.`
- Primary CTA: `Ouvrir MsgFlash`
- Secondary CTA: `Voir les tarifs`

### Approved English copy

- Eyebrow: `Product update`
- Title: `MsgFlash is evolving into Business Event Automation`
- Lead: `Your orders, payments, bookings, signups, subscriptions, and shipments already generate events. MsgFlash turns those events into automatic, traceable, and useful WhatsApp communication for your customers.`
- Why: `MsgFlash is no longer described as a tool that only “sends WhatsApp messages”. Our goal is to connect real business events to the right customer communication at the right time, while preserving a clear API and specialized WhatsApp infrastructure.`
- What stays: `Your instances, contacts, groups, templates, campaigns, schedules, API keys, webhooks, teams, media, and billing tools remain core product capabilities.`
- Rollout label: `Progressive rollout`
- Rollout: `Industry Templates, the Integration Gallery, Event Logs, expanded Delivery Analytics, the new Health Center, and business-aware onboarding will be introduced progressively. They are not all available today.`
- Pricing: `MsgFlash now provides one seven-day trial on Starter at €19/month or Growth at €39/month. There is no permanent Free plan. Without an active subscription when the trial ends, product operations are blocked while billing, profile, and eligible exports remain available.`
- Existing users: `You can continue using currently available capabilities. Navigation changes and new capabilities will be announced progressively. No existing workflow should be described as automatically migrated unless the product confirms it.`
- Primary CTA: `Open MsgFlash`
- Secondary CTA: `View pricing`

## 5. Portal banner

### Placement

Add the banner to `apps/portal/components/layout/PortalAppChrome.tsx`, directly below `TopNav` and above the scrollable `<main>`. This makes the banner visible on every authenticated operational page and on billing for blocked accounts.

Do not render it in authentication layouts or on public pages.

### Copy

| Locale | Title | Message | CTA | Accessible dismiss label |
| --- | --- | --- | --- | --- |
| FR | `MsgFlash évolue` | `Découvrez comment vos événements métier deviennent automatiquement des communications WhatsApp.` | `Lire la mise à jour` | `Masquer cette annonce` |
| EN | `MsgFlash is evolving` | `See how your business events become automatic WhatsApp communication.` | `Read the update` | `Dismiss this announcement` |

### Behavior

- ID: `business-event-automation-launch-2026-07`.
- Target every authenticated user, including expired, past-due, or suspended accounts.
- Link to `https://msgflash.com/announcements/business-event-automation`.
- Dismissible without a modal or confirmation.
- Persist browser-local dismissal using `msgflash:announcement:business-event-automation-launch-2026-07:dismissed`.
- Read local storage after hydration to avoid mismatch.
- Keep the ID in the key so later announcements remain visible.
- Use one CTA only.
- Do not style the banner as an error, destructive warning, or billing failure.
- At 320 px, title, CTA, and close action must remain usable without covering navigation.
- Keyboard focus order and visible focus styles are required.

## 6. Configuration and copy organization

- Add an explicit `marketingUrl: "https://msgflash.com"` to shared landing/brand configuration. Do not derive it by replacing `app.` in another URL.
- Keep banner and page copy in the existing bilingual copy layer.
- Do not duplicate literal copy in page, banner, and tests.
- Preserve `subscription.access.operational` as the source of truth for billing redirects.
- The launch banner must not interfere with access redirects or billing checkout.

## 7. Analytics

Use the consent-aware frontend analytics adapter when available:

- `announcement.impression` once per session/placement;
- `announcement.opened` on portal banner CTA;
- `announcement.dismissed` on dismissal;
- `announcement.page_viewed` on public page load;
- `announcement.cta_clicked` on public page CTAs.

Allowed properties are `announcementId`, `placement`, `locale`, `cta`, and coarse trusted `planCode`/`accessReason`. Do not send email, name, phone, contact data, message content, API keys, tokens, query strings, or free text.

If the portal has no consent-aware analytics adapter, ship UI behavior without silent telemetry and create analytics wiring as a separate reviewed task.

## 8. Required cleanup audit

Review at minimum:

- `apps/landing/lib/landing-v2-copy.ts`;
- `apps/landing/lib/landing-i18n-data.ts`;
- landing pricing and FAQ sections;
- `apps/portal/lib/portal-copy.ts`;
- portal signup, billing, dashboard, sidebar, and team limits;
- package types and plan labels;
- page metadata and structured data.

Known stale values currently found in marketing sources include Starter at EUR 9, Free, Pro, MAX, Plus, and standalone Warmup. Removing only the visible homepage instance is insufficient; active secondary routes must also be checked.

## 9. Acceptance checklist

- [ ] Public page exists at the canonical route and works in FR and EN.
- [ ] Current capabilities and progressive rollout are clearly separated.
- [ ] Portal banner is below `TopNav` for trialing, active, and blocked users.
- [ ] CTA uses the public marketing origin, not the portal origin.
- [ ] Dismissal survives refresh and is scoped to the launch ID.
- [ ] Banner works with keyboard, screen readers, mobile, and desktop.
- [ ] No call or type was added for the unimplemented announcement API.
- [ ] No active launch, signup, billing, pricing, FAQ, or navigation surface advertises Free, Pro, MAX, Plus, or Starter at EUR 9.
- [ ] Starter is EUR 19/month and Growth is EUR 39/month everywhere.
- [ ] Seven-day trial and post-trial blocking are consistent everywhere.
- [ ] Removed features are not advertised.
- [ ] Planned features are not labelled as available.
- [ ] Analytics are consent-aware and contain no PII/customer content.
- [ ] Typecheck, lint, tests, production build, and visual checks pass.

## 10. Later migration

When the backend implements the canonical announcement APIs, replace local dismissal with server-side eligibility and user state. Do not remove the static launch banner until its dynamic replacement is verified in production, and preserve the launch ID to avoid redisplaying a dismissed announcement.
