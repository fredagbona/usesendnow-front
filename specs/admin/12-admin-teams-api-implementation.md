# Admin — Teams API (implemented backend)

Status: backend **implemented** (2026-05). Admin UI to wire these routes.

Auth: **`Authorization: Bearer <admin JWT>`** (same as other `/api/admin/*` routes).

## List teams

| Method | Path | Query |
|--------|------|--------|
| `GET` | `/api/admin/teams` | `page`, `limit`, `search` (team name or owner email) |

Response shape: `{ data: { items, page, limit, total } }` — each item: `id`, `name`, `ownerUserId`, `owner`, `activeMemberCount`, `deletedAt`, `createdAt`.

## Team detail

| Method | Path |
|--------|------|
| `GET` | `/api/admin/teams/:id` |

Returns members (incl. status), invitation history (no secrets / no token hashes), and **`usageThisMonth`** aggregated from `UsageRecord` for that `teamId` (current calendar month).
