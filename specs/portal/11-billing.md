# SPEC - Portal / Billing, Trial and Access

App: portal
Route: `/billing`
Auth: required
Status: implementation contract (2026-07-14)

## Product rules

- There is no Free plan.
- Sellable plans are `starter` at EUR 19/month and `growth` at EUR 39/month.
- A new billing account receives one 7-day application-managed trial on the selected plan.
- Dodo Payments must not add another provider-side trial.
- Existing paid `pro` accounts migrate to `starter`; `max` accounts migrate to `growth` without a new trial.
- Existing Free accounts become `expired` and must subscribe before using product operations.
- When access is not operational, billing, profile, account deletion and contacts export remain available. Product actions and the public API are blocked.
- WhatsApp Statuses are removed. Do not display them as a plan feature or include them in outbound usage.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/billing/plans` | Active Starter/Growth catalog |
| `GET` | `/api/billing/subscription` | Subscription, access state, usage and period |
| `GET` | `/api/billing/usage` | Usage and period subset |
| `GET` | `/api/billing/payments` | Paginated payment history |
| `POST` | `/api/billing/checkout` | Dodo hosted checkout |
| `POST` | `/api/billing/downgrade` | Schedule Growth to Starter |
| `POST` | `/api/billing/cancel` | End paid subscription at period end |
| `POST` | `/api/billing/cancel-scheduled-change` | Undo scheduled change |

JWT endpoints accept optional `X-Team-Id`. Reads resolve against the team owner. Billing mutations and payment history are owner-only in a team workspace.

## Canonical response

```json
{
  "data": {
    "subscription": {
      "id": "sub_uuid",
      "status": "trialing",
      "billingProvider": "none",
      "currentPeriodStart": "2026-07-14T09:00:00.000Z",
      "currentPeriodEnd": "2026-07-21T09:00:00.000Z",
      "trialPlanCode": "starter",
      "trialStartedAt": "2026-07-14T09:00:00.000Z",
      "trialEndsAt": "2026-07-21T09:00:00.000Z",
      "trialConsumedAt": "2026-07-14T09:00:00.000Z",
      "accessBlockedAt": null,
      "cancelAtPeriodEnd": false,
      "scheduledPlan": null,
      "scheduledPlanAt": null,
      "scheduledAction": null,
      "plan": {
        "code": "starter",
        "name": "Starter",
        "priceEur": 19,
        "limits": {
          "maxInstances": 5,
          "maxApiKeys": 5,
          "maxWebhookEndpoints": 15,
          "maxContactGroups": 50,
          "monthlyOutboundQuota": 50000,
          "monthlyApiRequestQuota": 150000
        }
      }
    },
    "access": {
      "operational": true,
      "reason": "trialing",
      "expiresAt": "2026-07-21T09:00:00.000Z"
    },
    "usage": {
      "messagesCount": 312,
      "statusesCount": 0,
      "effectiveOutboundUsage": 312,
      "apiRequestsCount": 1240,
      "activeInstancesCount": 1,
      "activeApiKeysCount": 1
    },
    "period": {
      "start": "2026-07-01T00:00:00.000Z",
      "end": "2026-07-31T23:59:59.999Z"
    }
  }
}
```

`statusesCount` is retained temporarily for response compatibility. The UI must ignore it. `effectiveOutboundUsage` equals `messagesCount`.

## Access states

| `reason` | Operational | Frontend behavior |
|---|---:|---|
| `trialing` | yes | Show trial countdown and subscribe CTA |
| `active` | yes | Normal paid experience |
| `cancellation_grace` | yes | Show access end date |
| `past_due_grace` | yes, max 72h | Persistent payment warning |
| `trial_expired` | no | Blocking billing CTA |
| `payment_required` | no | Blocking billing CTA |
| `past_due` | no | Require payment update |
| `suspended` | no | Contact-support state |

Operational screens must handle `402 TRIAL_EXPIRED`, `402 SUBSCRIPTION_REQUIRED`, `402 SUBSCRIPTION_PAST_DUE` and `403 SUBSCRIPTION_SUSPENDED`. Invalidate workspace/subscription queries, show the matching billing message and navigate to `/billing`. Do not retry the denied mutation.

## Billing page behavior

- Render two plan cards only: Starter and Growth.
- Use `GET /api/billing/plans` for prices, features and limits.
- Show exact trial end date and remaining whole days/hours.
- Show message usage, API requests and instances. Do not show Statuses.
- Trial or expired user: subscribe CTA calls checkout.
- Starter paid user: Growth CTA starts checkout.
- Growth paid user: Starter CTA schedules a downgrade at `currentPeriodEnd`.
- Paid active user: cancellation schedules expiration at `currentPeriodEnd`; there is no Free fallback.
- Poll subscription briefly after `?success=true` because Dodo webhook activation can arrive after the redirect.

## Acceptance criteria

- No Free, Pro, MAX, Plus or FCFA labels remain on the billing page.
- Expired users can open billing and profile but cannot perform product operations.
- Trial countdown is based on backend timestamps, never a frontend-created date.
- A checkout never grants access before a verified Dodo webhook updates the subscription.
- Status usage is absent from visible metrics.
