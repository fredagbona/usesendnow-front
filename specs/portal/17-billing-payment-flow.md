# Billing & Payment Integration — Frontend Spec

## Overview

The billing flow uses **Dodo Payments** as the payment provider.
The backend handles all payment logic — the frontend only needs to redirect the user to a checkout URL and handle the return.

---

## Endpoints used

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/billing/plans` | None | List all available plans |
| `GET` | `/api/billing/subscription` | JWT | Current subscription + usage |
| `POST` | `/api/billing/checkout` | JWT | Create a checkout session |
| `POST` | `/api/billing/cancel` | JWT | Cancel subscription at period end |

---

## 1. Display available plans

```http
GET /api/billing/plans
```

No auth required. Use this to render the plan selection UI.

**Response:**

```json
{
  "data": [
    {
      "id": "...",
      "code": "free",
      "name": "Free",
      "priceMonthly": 0,
      "currency": "XOF",
      "maxInstances": 1,
      "monthlyOutboundQuota": 20,
      "monthlyApiRequestQuota": 0,
      "maxApiKeys": 0,
      "maxWebhookEndpoints": 0,
      "canUseCampaigns": false,
      "canUseStatuses": false,
      "isActive": true
    },
    {
      "code": "starter",
      "name": "Starter",
      "priceMonthly": 720000,
      "currency": "XOF",
      "maxInstances": 3,
      "monthlyOutboundQuota": 5000,
      ...
    }
  ]
}
```

---

## 2. Get current subscription and usage

```http
GET /api/billing/subscription
Authorization: Bearer <token>
```

Use this to populate the billing dashboard page.

**Response:**

```json
{
  "data": {
    "subscription": {
      "id": "...",
      "planId": "...",
      "status": "active",
      "billingProvider": "dodo",
      "currentPeriodStart": "2026-03-01T00:00:00.000Z",
      "currentPeriodEnd": "2026-04-01T00:00:00.000Z",
      "cancelAtPeriodEnd": false,
      "plan": {
        "code": "starter",
        "name": "Starter",
        "priceMonthly": 720000
      }
    },
    "usage": {
      "messagesCount": 1240,
      "statusesCount": 12,
      "effectiveOutboundUsage": 1252,
      "apiRequestsCount": 3400,
      "activeInstancesCount": 2,
      "activeApiKeysCount": 1
    },
    "period": {
      "start": "2026-03-01T00:00:00.000Z",
      "end": "2026-03-31T23:59:59.999Z"
    }
  }
}
```

---

## 3. Upgrade — checkout flow

### Step 1 — User clicks "Upgrade to Pro"

Call the checkout endpoint with the target plan code:

```http
POST /api/billing/checkout
Authorization: Bearer <token>
Content-Type: application/json

{ "planCode": "pro" }
```

**Response:**

```json
{
  "data": {
    "checkoutUrl": "https://checkout.dodopayments.com/buy/..."
  }
}
```

### Step 2 — Redirect user

Redirect the browser (full page redirect, not iframe) to `checkoutUrl`:

```js
window.location.href = data.checkoutUrl
```

### Step 3 — User completes payment on Dodo's hosted page

The user enters their card details on Dodo's checkout page.
This is fully handled by Dodo — no frontend work needed here.

### Step 4 — Dodo redirects back

After payment, Dodo redirects to:

```
https://app.usesendnow.com/billing?success=true
```

Or on cancellation:

```
https://app.usesendnow.com/billing?cancelled=true
```

### Step 5 — Handle return on /billing page

On mount, read the query params and act accordingly:

```js
const params = new URLSearchParams(window.location.search)

if (params.get('success') === 'true') {
  // Show success toast: "Payment successful! Your plan has been upgraded."
  // Refetch subscription to show the new plan
  await refetchSubscription()
}

if (params.get('cancelled') === 'true') {
  // Show neutral message: "Payment cancelled. Your plan has not changed."
}

// Clean the URL after handling
window.history.replaceState({}, '', '/billing')
```

### Step 6 — Webhook updates the plan (background)

The backend receives the payment webhook from Dodo and automatically upgrades the subscription in the database. This happens server-side — no frontend action needed.

> **Note:** There may be a few seconds delay between the redirect and the webhook being processed. On the success return, wait 1–2 seconds before refetching, or poll `GET /api/billing/subscription` until the plan code changes.

---

## 4. Cancel subscription

```http
POST /api/billing/cancel
Authorization: Bearer <token>
```

This marks `cancelAtPeriodEnd: true`. The user keeps their current plan until `currentPeriodEnd`, then drops to Free automatically.

**Response:**

```json
{ "data": { "cancelled": true } }
```

**UX:** Show a confirmation modal before calling this endpoint. After cancellation, refresh the subscription data and display:

> "Your subscription will be cancelled on [currentPeriodEnd date]. You will keep access to [plan name] until then."

---

## 5. Plan codes reference

| Code | Display name | Price |
|---|---|---|
| `free` | Free | 0 FCFA |
| `starter` | Starter | 7 200 FCFA / 9 EUR |
| `pro` | Pro | 15 200 FCFA / 19 EUR |
| `plus` | Plus | 31 200 FCFA / 39 EUR |

Use `GET /api/billing/plans` as the source of truth — do not hardcode limits or prices in the frontend.

---

## 6. Subscription status values

| Status | Meaning | What to show |
|---|---|---|
| `active` | Subscription is live | Green badge |
| `trialing` | In trial period | Blue badge |
| `past_due` | Last payment failed | Orange warning — prompt to update payment |
| `cancelled` | Will end at period end | Orange — show end date |
| `expired` | Subscription ended | Red — prompt to resubscribe |

---

## 7. Error handling

| Scenario | Error | What to show |
|---|---|---|
| `planCode` not found | `404 NOT_FOUND` | "This plan is not available." |
| `planCode: "free"` | `400 BAD_REQUEST` | Cannot checkout free plan — hide the button |
| No Dodo keys configured | `500 INTERNAL_ERROR` | "Payment is temporarily unavailable. Try again later." |
| User not authenticated | `401 UNAUTHORIZED` | Redirect to login |

---

## 8. Full page flow summary

```
Billing page loads
    │
    ├── GET /api/billing/subscription  → show current plan + usage bars
    │
    ├── User clicks "Upgrade"
    │       │
    │       ├── POST /api/billing/checkout { planCode }
    │       │       → receive checkoutUrl
    │       │
    │       └── window.location.href = checkoutUrl
    │               │
    │               └── [Dodo hosted checkout]
    │                       │
    │                       └── redirect to /billing?success=true
    │                               │
    │                               └── refetch subscription → show new plan
    │
    └── User clicks "Cancel subscription"
            │
            ├── Show confirmation modal
            │
            └── POST /api/billing/cancel
                    └── refetch subscription → show cancellation date
```
