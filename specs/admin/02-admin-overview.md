Admin Overview

Goal
- Show the global operational summary for the platform.

Endpoint
- `GET /api/admin/dashboard/overview`

Supported query params
- `window=today|last_7_days|current_month|custom_range`
- `from`
- `to`

Response blocks
- `summary`
- `series.requests`
- `series.messages`
- `series.campaigns`
- `breakdowns.planDistribution`
- `breakdowns.subscriptionStatusDistribution`

Required UI cards
- total users
- new users
- active users
- connected instances
- active API keys
- total requests
- public API requests
- dashboard requests
- admin requests
- outbound messages
- failed messages
- campaigns created

Charts
- requests over time
- messages over time
- campaigns over time

Notes
- Distinguish `public_api`, `dashboard`, and `admin` traffic visually.
