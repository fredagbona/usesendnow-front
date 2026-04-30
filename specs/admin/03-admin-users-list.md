Admin Users List

Goal
- Browse and segment customer accounts.

Endpoint
- `GET /api/admin/users`

Query params
- `page`
- `limit`
- `search`
- `plan`
- `subscriptionStatus`
- `userStatus`
- `activity=active_7d|inactive_7d`
- `from`
- `to`
- `sortBy=createdAt|messagesThisMonth|apiRequestsThisMonth`
- `sortOrder=asc|desc`

Each row contains
- `id`
- `fullName`
- `email`
- `status`
- `emailVerified`
- `planCode`
- `planName`
- `subscriptionStatus`
- `instanceCount`
- `activeApiKeyCount`
- `messagesThisMonth`
- `apiRequestsThisMonth`
- `createdAt`
- `lastActivityAt`

Recommended UI
- search bar
- plan filter
- subscription status filter
- user status filter
- activity filter
- sortable columns
- CSV export button
