Admin Actions

Goal
- Let operators apply a small set of auditable actions.

Endpoints
- `POST /api/admin/users/:id/suspend`
- `POST /api/admin/users/:id/reactivate`
- `POST /api/admin/api-keys/:id/revoke`
- `POST /api/admin/instances/:id/deactivate`
- `GET /api/admin/action-logs`

Action payload
```json
{
  "reason": "Fraud investigation",
  "note": "Internal note for support"
}
```

Frontend rules
- always require a reason
- show a confirmation modal before sending
- after success, refresh the affected record
- display recent action history

Important product rule
- user-facing emails are sent automatically by the backend
- internal notes must never be shown to end users
