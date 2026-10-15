# SPEC - Dodo Payments Flow

Status: implementation contract (2026-07-14)

## Configuration

```env
DODO_PAYMENTS_API_KEY=...
DODO_PAYMENTS_WEBHOOK_KEY=...
DODO_PAYMENTS_ENVIRONMENT=live_mode
DODO_PRODUCT_ID_STARTER=pdt_...
DODO_PRODUCT_ID_GROWTH=pdt_...
```

Create exactly two recurring monthly products in Dodo Payments:

| Product | Price | Trial in Dodo |
|---|---:|---|
| Starter | EUR 19/month | disabled |
| Growth | EUR 39/month | disabled |

The 7-day trial is owned by MsgFlash. Enabling a Dodo trial would incorrectly stack two trials.

## Checkout

```http
POST /api/billing/checkout
Authorization: Bearer <jwt>
Content-Type: application/json

{ "planCode": "starter" }
```

Allowed values are `starter` and `growth`. Redirect to `checkoutUrl` with a full-page navigation. Never iframe checkout and never mark the subscription active from the redirect alone.

## Return handling

- `/billing?success=true`: show pending confirmation and poll `GET /api/billing/subscription` until `status=active`, with a bounded timeout.
- `/billing?cancelled=true`: show a neutral message and keep the current state.
- Remove query parameters after handling.

## Webhook authority

| Dodo event | Internal effect |
|---|---|
| `subscription.active`, `payment.succeeded` | activate selected paid plan |
| `subscription.renewed` | renew period |
| `subscription.updated`, `subscription.plan_changed` | synchronize active plan |
| `subscription.on_hold`, `subscription.failed`, `payment.failed` | `past_due`, start 72h grace |
| `subscription.cancelled` | preserve access until paid period end |
| `subscription.expired` | block operational access |

Webhook metadata must contain `userId` and `planCode`. Payment events are idempotent through the billing fingerprint.

## Plan changes

- Upgrade Starter to Growth: new Dodo checkout.
- Downgrade Growth to Starter: scheduled at current period end.
- Cancellation: scheduled at current period end and then status becomes `expired`.
- There is no cancellation-to-Free transition.
- Trial expiration does not call Dodo because no provider subscription exists yet.

## Frontend errors

| HTTP/code | Action |
|---|---|
| `400 BAD_REQUEST` | Refresh catalog and show validation error |
| `402 TRIAL_EXPIRED` | Open billing subscribe state |
| `402 SUBSCRIPTION_REQUIRED` | Open billing subscribe state |
| `402 SUBSCRIPTION_PAST_DUE` | Open payment recovery state |
| `403 SUBSCRIPTION_SUSPENDED` | Show support path |
| `502 BILLING_PROVIDER_SYNC_FAILED` | Keep local state unchanged and offer retry |
