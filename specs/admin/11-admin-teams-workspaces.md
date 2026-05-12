# SPEC — Admin / Teams & workspaces

App: admin console  
Status: **backend list/detail done — admin UI pending**  
Depends on: `specs/23-teams-workspaces.md` · `12-admin-teams-api-implementation.md`

---

## Purpose

Give **platform administrators** visibility into **all teams**, **memberships**, **invitations** (pending/expired/revoked), **historical changes**, and **usage** related to teams for support, fraud review, and compliance — without exposing secrets (API keys, raw invite tokens).

---

## Auth

All endpoints: `Authorization: Bearer <admin_jwt>` (existing admin auth).

---

## Suggested admin API (indicative)

Implement under `/api/admin/...` with RBAC (`super_admin` / `admin`) consistent with existing admin routes.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/teams` | Paginated list: filters `ownerEmail`, `teamId`, `status`, date range |
| `GET` | `/api/admin/teams/:teamId` | Detail: team metadata, owner, seat usage, `createdAt`, `deletedAt` |
| `GET` | `/api/admin/teams/:teamId/members` | Membership history (active + removed + left) with timestamps |
| `GET` | `/api/admin/teams/:teamId/invitations` | Invitation audit (no token hash; show status expired/accepted/revoked) |
| `GET` | `/api/admin/teams/:teamId/usage` | Aggregated usage for team workspace (messages, statuses, API requests if tracked) by period |
| `GET` | `/api/admin/users/:userId/teams` | Teams a user owns or belongs to (support lookup) |

**Do not return:** `TeamApiKey` secret, `keyHash`, raw invitation token, `tokenHash`.

---

## UI — suggested screens

### `AdminTeamsList`

* Columns: Team name, Owner (email + user id), Plan (owner’s effective plan), Seats `used/max`, Status (`active` / `deleted`), Created, Actions **View**.

### `AdminTeamDetail`

* Sections: **Summary**, **Members** (role, joined, removed by), **Invitations timeline**, **Usage by month** (read-only charts/tables), **Instance assignments** (instance id, assigned user), **Billing owner** link to user detail.

### Cross-link from `AdminUserDetail`

* Card **Teams**: list owned + member-of with role; deep-link to `AdminTeamDetail`.

---

## Audit & history

* Surface `BillingEvent` / future audit rows for: `team.created`, `team.deleted`, `member.invited`, `member.joined`, `member.removed`, `member.left`, `invite.resent`, `team_api_key.created`, `team_api_key.revoked`.
* Show **actor** `userId` where available.

---

## Acceptance (admin)

* [ ] List/search teams with pagination.
* [ ] Open team detail: members + invites + usage without secrets.
* [ ] User detail shows team associations.
* [ ] Access restricted to admin JWT roles as per existing admin patterns.

