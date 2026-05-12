# Portal — Teams API (implemented backend)

Status: backend **implemented** (2026-05). Portal UI still to consume these routes.

Base URL: same as console, prefix **`/api/teams`**. Auth: **`Authorization: Bearer <JWT>`**.

## List my pending invitations

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/api/teams/invitations/mine` | — | `{ data: [{ invitationId, teamId, teamName, role, invitedBy, expiresAt, createdAt }] }` |

## Accept invitation

| Method | Path | Body | Notes |
|--------|------|------|--------|
| `POST` | `/api/teams/invitations/accept` | `{ "invitationId": "<uuid>" }` **or** `{ "token": "<from email>" }` | Exactly one field. JWT user email must match invite. |

## Teams CRUD & members

| Method | Path | Body / query |
|--------|------|----------------|
| `POST` | `/api/teams` | `{ "name": string, "invites": [{ "email", "role": "admin"\|"collaborator" }] }` — min 1 invite |
| `GET` | `/api/teams` | — |
| `GET` | `/api/teams/:teamId` | — |
| `PATCH` | `/api/teams/:teamId` | `{ "name" }` |
| `DELETE` | `/api/teams/:teamId` | — owner only |
| `POST` | `/api/teams/:teamId/invitations` | `{ "email", "role" }` |
| `POST` | `/api/teams/:teamId/invitations/:invitationId/resend` | — |
| `DELETE` | `/api/teams/:teamId/invitations/:invitationId` | — |
| `DELETE` | `/api/teams/:teamId/members/:userId` | — owner/admin; cannot remove owner |
| `POST` | `/api/teams/:teamId/members/leave` | — self; owner cannot leave |

## Instance assignment

| Method | Path | Body / query |
|--------|------|----------------|
| `POST` | `/api/teams/:teamId/instance-assignments` | `{ "instanceId", "memberUserId" }` |
| `DELETE` | `/api/teams/:teamId/instance-assignments?instanceId=&memberUserId=` | — |

## Team API keys (owner/admin)

| Method | Path | Body |
|--------|------|------|
| `GET` | `/api/teams/:teamId/api-keys` | — |
| `POST` | `/api/teams/:teamId/api-keys` | `{ "name" }` — response includes **`secret`** once (`msgf_team_…`) |
| `DELETE` | `/api/teams/:teamId/api-keys/:keyId` | — |

## Public API (team workspace)

- Key prefix: **`msgf_team_`** (not `msgf_live_`).
- Header **`X-Team-Id: <teamUuid>`** required and must match the key’s team.
- **`POST /api/v1/messages/send`** and **`POST /api/v1/messages/schedule`** support team context; quotas apply to the **team owner’s** plan.
- Collaborators must have the instance **assigned** in the team (owner/admin may use any owner instance).

## Error codes (non-exhaustive)

`TEAM_FEATURE_UNAVAILABLE`, `TEAM_LIMIT_REACHED`, `TEAM_SEAT_LIMIT_REACHED`, `TEAM_NOT_FOUND`, `TEAM_ACCESS_DENIED`, `INVITE_INVALID_OR_EXPIRED`, `INVITE_EMAIL_MISMATCH`, `INVITE_DUPLICATE_MEMBER`, `INSTANCE_NOT_ASSIGNED`, `PLAN_CHANGE_BLOCKED_ACTIVE_TEAMS`, `TEAM_KEY_REQUIRED` (personal key + `X-Team-Id`).
