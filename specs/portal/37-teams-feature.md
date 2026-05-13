# 32 — Teams feature: single source of truth for the frontend

> Last updated: 2026-05-12
>
> **Scope.** This document is the *only* spec needed for portal/frontend integration of the **Teams** feature. It supersedes the older split specs (`32-teams-workspaces.md`, `33-teams-api-implementation.md`, `34-frontend-workspace-integration.md`) which have been removed. If you find anything in another file that contradicts this one, this one wins.

---

## 1. Mental model

The console exposes two **workspaces**:

| Workspace | Selector | Quotas billed to | Resources |
|---|---|---|---|
| **Personal** | No `X-Team-Id` header (default) | The logged-in user's subscription | The user's own resources |
| **Team** | `X-Team-Id: <teamId>` header | The **team owner's** subscription | The team's shared resources |

Server side, every request that goes through `requireAuth + resolveJwtWorkspace` carries a `WorkspaceScope` of shape:

```ts
{
  dataUserId: string;          // owner of the data (= team owner in team mode)
  teamId: string | null;       // null => personal
  actingUserId: string;        // who is logged in (you)
  memberRole: 'owner' | 'admin' | 'collaborator' | null;
}
```

You never construct that scope on the frontend — you just set `X-Team-Id` and the server figures it out.

---

## 2. Bootstrap flow at every page load / workspace switch

The portal needs three things at boot:

1. **Who am I?**           → `GET /api/auth/me` (now also returns `teams[]`)
2. **What's the active workspace?** → `GET /api/workspace/current` (with `X-Team-Id` if any)
3. **My inbound invitations** → `GET /api/teams/invitations/mine`

That's it. No more combining `/teams/:id` + `/billing/subscription` + entitlements + role checks. `/workspace/current` returns everything you need to render the layout and gate features.

### 2.1 `GET /api/auth/me`

Headers: `Authorization: Bearer <jwt>`. **Do not** send `X-Team-Id` here.

```json
{
  "data": {
    "id": "user-uuid",
    "fullName": "Awa Doe",
    "email": "awa@example.com",
    "phone": "+33612345000",
    "plan": "pro",
    "displayName": null,
    "avatarUrl": null,
    "teams": [
      { "id": "team-uuid", "name": "Marketing", "role": "owner",         "isOwner": true },
      { "id": "team-uuid", "name": "Support",   "role": "collaborator",  "isOwner": false }
    ]
  }
}
```

Use `teams[]` to populate the workspace switcher immediately at boot. `plan` is the **personal** plan; do not gate features on it — always read `/workspace/current` for limits/features.

### 2.2 `GET /api/workspace/current`

Headers: `Authorization: Bearer <jwt>`, optional `X-Team-Id`.

Response (team mode):

```json
{
  "data": {
    "kind": "team",
    "viewer":  { "id": "viewer-uuid",  "email": "...", "fullName": "...", "displayName": null, "avatarUrl": null },
    "owner":   { "id": "owner-uuid",   "email": "...", "fullName": "...", "displayName": null, "avatarUrl": null },
    "team":    { "id": "team-uuid", "name": "Marketing", "role": "admin", "isOwner": false, "createdAt": "..." },
    "plan":    { "code": "pro", "name": "Pro" },
    "limits":  { "maxInstances": 5, "maxApiKeys": 10, "maxWebhookEndpoints": 10, "monthlyOutboundQuota": 5000, "monthlyApiRequestQuota": 50000 },
    "features": { "campaigns": true, "statuses": true, "voiceNotes": true, "webhooks": true, "numberLookups": true },
    "subscription": { "plan": { ... }, "scheduledPlan": null, "scheduledPlanAt": null, "scheduledAction": null },
    "usage":   { "messagesCount": 0, "statusesCount": 0, "effectiveOutboundUsage": 0, "apiRequestsCount": 0, "activeInstancesCount": 1, "activeApiKeysCount": 1 },
    "period":  { "start": "2026-05-01T00:00:00.000Z", "end": "2026-05-31T23:59:59.999Z" },
    "capabilities": {
      "canSendMessages": true,
      "canCreateCampaigns": true,
      "canPublishStatuses": true,
      "canUseWebhooks": true,
      "canUseNumberLookups": true,
      "canMutateBilling": false,
      "canViewPayments": false,
      "canManageMembers": true,
      "canManageInstances": true,
      "canManageApiKeys": true,
      "canManageWebhooks": true,
      "canManageTemplates": true,
      "isRestrictedCollaborator": false
    }
  }
}
```

Personal mode returns the same shape with `kind: "personal"`, `team: null`, `viewer === owner`, and `capabilities` flags all true (for the user).

**`capabilities` is the source of truth for UI gating.** Use it instead of inferring from role yourself.

Errors:

| Code | HTTP | When |
|---|---|---|
| `TEAM_NOT_FOUND` | 404 | `X-Team-Id` is not a team you actively belong to. |

---

## 3. Use cases end-to-end

This section walks through every user-facing scenario chronologically. Each one lists the **trigger**, the **API calls** in order, the **side effects** the portal must run, and the **failure modes** to anticipate. Use this as the screen-by-screen blueprint; § 4 onwards is the reference.

### 3.1 First boot of the portal (any user, any plan)

**Trigger.** Page load after `/login` callback succeeds (JWT is in storage).

**Sequence.**

1. `GET /api/auth/me` → user profile + `teams[]` (id, name, role, isOwner).
2. Read `localStorage['msgflash_portal_workspace_v1']`. Possible values: `null` or `{ teamId: '<uuid>' }`.
3. `GET /api/workspace/current` (with `X-Team-Id` if step 2 had one).
4. `GET /api/teams/invitations/mine` (in parallel with step 3 — independent).

**Side effects.**

- Populate the workspace switcher with `me.teams` + a static **Personal** entry.
- Render the layout (sidebar plan badge, quota bar) from `workspace.current.{plan, limits, usage}`.
- Use `workspace.current.capabilities` to gate menu items at render time (don't compute role logic in the frontend).
- If step 3 returns `404 TEAM_NOT_FOUND`, drop the stale localStorage entry, set `active = null`, replay step 3 without `X-Team-Id`, toast `Workspace not available; switched to personal.`

**No backend side effects** other than `lastUsedAt` style writes (logging only).

### 3.2 Creating the first team (Pro / Plus owner)

**Trigger.** Owner clicks **Create team** on the empty teams page or in the workspace switcher footer.

**Form fields.** `name` (string), `invites: [{ email, role: 'admin' | 'collaborator' }]` (at least one — the backend rejects empty arrays with `BAD_REQUEST`).

**Sequence.**

1. `POST /api/teams` body `{ name, invites }`.
2. On `201`, the response is the **full team object** (members + pending invitations). No need to re-fetch.
3. Append the new team to `me.teams[]` cache and switch the workspace to it (write localStorage, dispatch `msgflash:workspace-changed`).
4. Re-fetch `GET /api/workspace/current` for the new team to refresh the layout.

**Failure modes.**

| Code | HTTP | Where to surface |
|---|---|---|
| `TEAM_FEATURE_UNAVAILABLE` | 403 | Inline form error + CTA *Upgrade to Pro*. |
| `TEAM_LIMIT_REACHED` | 403 | Inline error: *You already own N teams (the maximum on your plan). Delete one to create another.* |
| `TEAM_SEAT_LIMIT_REACHED` | 403 | Per-row inline error on the invitations list. |
| `BAD_REQUEST` (`At least one invitation is required` / `Duplicate invite emails` / `Cannot invite yourself`) | 400 | Inline form error. |

**Email side effect.** Each invitee receives an email containing a link `${PORTAL_URL}/teams/invite?token=<raw>`. The token TTL is **24 hours**.

### 3.3 Receiving and accepting an invitation

There are **two entry points** — both end on `POST /api/teams/invitations/accept`.

**Entry A — Email link.**

1. User opens the link → portal route `/teams/invite?token=…`.
2. If the user is not signed in: bounce to login, preserve the `token` query param across the auth flow.
3. Once signed in: `POST /api/teams/invitations/accept` body `{ token: '<raw>' }`.
4. On `200 { teamId, role }`: write localStorage `{ teamId }`, dispatch `msgflash:workspace-changed`, push `/dashboard`.
5. The new team must appear in the workspace switcher immediately → re-fetch `/api/auth/me` or update the local `teams[]` cache by prepending `{ id: teamId, name: '?', role, isOwner: false }` (you can resolve the name with the next `/workspace/current` call).

**Entry B — In-app inbox.**

1. The sidebar already shows a badge based on `/api/teams/invitations/mine.length` from the boot fetch.
2. User opens the inbox panel; portal already has the invite list (no need to re-fetch unless stale).
3. On *Accept*: `POST /api/teams/invitations/accept` body `{ invitationId: '<uuid>' }`.
4. On *Decline*: there is currently **no decline endpoint** — the invite will auto-expire after 24h. The portal can hide it from the inbox optimistically and rely on TTL on the server. *(See § 13 follow-up: add `DELETE /api/teams/invitations/:invitationId/decline` later.)*
5. Same UI completion as Entry A: switch workspace, push `/dashboard`.

**Failure modes.**

| Code | HTTP | UX |
|---|---|---|
| `INVITE_INVALID_OR_EXPIRED` | 410 | Full-screen empty state: *This invitation is no longer valid. Ask the team owner to send a new one.* |
| `INVITE_EMAIL_MISMATCH` | 403 | Modal: *This invitation was sent to `<inviteEmail>`. Sign in with that address to accept.* Provide a logout button. |
| `INVITE_DUPLICATE_MEMBER` | 409 | Toast: *You're already a member of `<teamName>`.* Switch to that workspace directly. |

### 3.4 Switching workspace (personal ⇄ team or team A ⇄ team B)

**Trigger.** Click on a team entry in the switcher.

**Sequence (atomic — must run in order).**

1. **Write** `localStorage['msgflash_portal_workspace_v1']` to `null` (for Personal) or `{ teamId }`.
2. **Dispatch** `msgflash:workspace-changed` on `window`.
3. **Invalidate** every cached query keyed by workspace: `queryClient.invalidateQueries()` (React Query) or `mutate(() => true, undefined, { revalidate: true })` (SWR).
4. **Reset** any in-memory pagination state (cursors, page numbers, multi-select selections).
5. **Re-fetch** `GET /api/workspace/current` so the layout/sidebar immediately reflects the new plan badge / quota bar.
6. Optionally `router.push('/dashboard')` if the current route doesn't make sense in the new workspace (e.g. you were on the team settings page).

The API client's request interceptor reads localStorage before every call, so no other code change is needed — every subsequent fetch automatically targets the new workspace.

### 3.5 Browsing & using a team (member POV)

Once switched, the user behaves exactly as in personal — but every `/api/*` call carries `X-Team-Id` and returns the **team's shared data**.

| Action | What changes vs personal |
|---|---|
| Send a message | Uses an instance belonging to the team owner (subject to assignment for collaborators). Counts on the **owner's** outbound quota. The `Message.actingUserId` is set so the audit trail keeps track of who did it. |
| Create a contact / group / template | Stored under `userId = ownerId, teamId = teamId`. Visible to all members. |
| Run a campaign | Same instance / quota rules as messages. |
| Create a webhook | Uses the team's webhook slot. Counts against the owner's `maxWebhookEndpoints`. |
| Number lookup | Same — owner's quota, owner's plan feature gate. |
| API key | Use `/api/api-keys` with `X-Team-Id` (the response `kind` is `'team'`, the secret is `msgf_team_…`). |

**Collaborator restrictions.** When `workspace.current.capabilities.isRestrictedCollaborator === true`:

- Hide every instance not present in the team's instance assignments for the viewer. The portal can compute this from `/api/teams/:teamId` (`memberships + instanceAssignments`) **once** at workspace boot, then cache.
- If the collaborator still manages to hit a forbidden instance (deep link), the server returns `403 INSTANCE_NOT_ASSIGNED` — show a toast *You don't have access to this instance.*

### 3.6 Owner / admin managing members

**Add an invitation.**

```
POST /api/teams/:teamId/invitations
body { email, role: 'admin' | 'collaborator' }
```

UI: a single email field + role dropdown on the team settings page. After `201`, append to the team's `pendingInvitations` array in cache; no re-fetch needed.

**Resend an invitation.**

```
POST /api/teams/:teamId/invitations/:invitationId/resend
```

The backend revokes the old invitation, issues a new token, sends a new email. Update the row in place with the new `expiresAt` from the response.

**Revoke an invitation.**

```
DELETE /api/teams/:teamId/invitations/:invitationId  → 204
```

Optimistically remove the row.

**Remove a member.**

```
DELETE /api/teams/:teamId/members/:userId  → 204
```

Disable the *Remove* button for the owner row (the backend will return `TEAM_ACCESS_DENIED` if you try). Optimistically remove the row; on confirmation refresh `/api/teams/:teamId` to make sure invitation counts are right.

**Failure modes (add invitation).**

| Code | HTTP | UX |
|---|---|---|
| `TEAM_SEAT_LIMIT_REACHED` | 403 | Inline error: *No seats left for new members. Remove a member or upgrade the plan.* |
| `INVITE_DUPLICATE_MEMBER` | 409 | Inline error: *This user is already a member.* |
| `CONFLICT` (pending dup) | 409 | Inline error: *There is already a pending invitation for this email.* |

### 3.7 Assigning instances to collaborators

**Trigger.** Owner / admin opens the team settings → **Instances & access** tab.

**Read (single call covers everything).**

```
GET /api/teams/:teamId
```

Returns `members[]`, `pendingInvitations[]`, and **`instanceAssignments[]`** in one payload. See § 4.1 for the exact shape and § 4.2 for a ready-to-paste React grid.

Pair it with `GET /api/instances` (with `X-Team-Id`) when you want to render the full list of team-owned instances — assigned **and** unassigned — as columns in the grid.

**Refresh-only fetch.** If you've already loaded the team and just need to repoll after a toggle:

```
GET /api/teams/:teamId/instance-assignments    → assignments[]
```

**Write.**

```
POST /api/teams/:teamId/instance-assignments
body { instanceId, memberUserId }  → 204
```

```
DELETE /api/teams/:teamId/instance-assignments?instanceId=<uuid>&memberUserId=<uuid>
                                                                                 → 204
```

UX: a per-collaborator grid of toggles, one per team-owned instance. Owner and admin rows are non-interactive (they have access to everything implicitly — don't render a row for them).

### 3.8 Quitting a team (member point of view)

**Trigger.** Member clicks *Leave team* on the team settings page.

```
POST /api/teams/:teamId/members/leave  → 204
```

The data the member created **stays** in the team — it's the team's, not the member's. On `204`:

1. Remove the team from the local `me.teams[]` cache.
2. If the active workspace was that team, reset localStorage to `null`, dispatch `msgflash:workspace-changed`, push `/dashboard`.

**Failure mode.** Owner cannot leave (`BAD_REQUEST` *Owner cannot leave — delete the team instead.*). The portal should hide *Leave* and show *Delete team* for owners.

### 3.9 Deleting a team (owner only)

**Trigger.** Owner on team settings clicks *Delete team* → confirmation modal asking to type the team name.

```
DELETE /api/teams/:teamId  → 204
```

**Consequences (must be in the confirmation modal copy).**

- All shared resources (contacts, templates, campaigns, messages, webhooks) become **inaccessible** (`TEAM_NOT_FOUND` on subsequent calls).
- All team API keys are revoked immediately (`team.deletedAt` rejects the public-API auth path).
- Outstanding invitations are made moot.
- The team's monthly usage stays attributed to the owner's account for billing history purposes (the records keep `teamId` set even after delete for audit).
- The owner's personal workspace is unaffected.

**Portal side effects.**

1. Remove the team from `me.teams[]`.
2. If it was the active workspace, switch to personal as in § 3.4.
3. Hard-refresh the API keys page (the listed team keys are now dead).

### 3.10 Owner downgrading their plan with active teams

**Trigger.** Owner picks a lower plan in the Billing page → *Confirm downgrade*.

```
POST /api/billing/downgrade  body { plan: 'starter' }
```

If the target plan cannot host the current teams or seats, the backend returns `409 PLAN_CHANGE_BLOCKED_ACTIVE_TEAMS` with `details.teamIds`. The portal must:

1. Block the downgrade.
2. Show a dedicated screen listing the offending team IDs (use `/api/teams` cache to render names) with two CTAs per team: *Delete team* and *Remove members*.
3. Once the owner is back below the target plan's limits, re-trigger `POST /api/billing/downgrade`.

### 3.11 Managing API keys per workspace

**Personal workspace.**

```
GET    /api/api-keys                         → list (kind: 'personal')
POST   /api/api-keys  { name }               → create (secret in response, kind: 'personal')
DELETE /api/api-keys/:id                     → revoke
GET    /api/api-keys/usage[?periodKey=YYYY-MM]
```

**Team workspace.** Same routes, just with `X-Team-Id` injected — the API client interceptor already does that.

```
GET    /api/api-keys  (X-Team-Id: ...)       → list (kind: 'team')
POST   /api/api-keys  (X-Team-Id: ...)       → create msgf_team_… (admin/owner only)
DELETE /api/api-keys/:id (X-Team-Id: ...)    → revoke (admin/owner only)
GET    /api/api-keys/usage (X-Team-Id: ...)  → usage by team key
```

The portal renders **one** API keys page that adapts: header label "Team API keys" if `workspace.current.kind === 'team'`. Use `kind` from each row only as a discriminator for the avatar / icon.

**Failure modes specific to the team mode.**

| Code | HTTP | UX |
|---|---|---|
| `TEAM_ACCESS_DENIED` | 403 | Hide the *Create* button for collaborators via `capabilities.canManageApiKeys`. |
| `MAX_API_KEYS_REACHED` | 403 | Empty-state CTA: *Limit reached. Revoke unused keys or upgrade.* — **note**: the cap is owner-plan-wide, not per-team, so the count surfaces personal + every team key the owner has issued. |
| `API_KEYS_NOT_AVAILABLE_ON_PLAN` | 403 | Free plan disabled state on the page. |

### 3.12 Billing in a team workspace

The Billing page must adapt based on `workspace.current.capabilities`:

| Capability | Effect |
|---|---|
| `canMutateBilling: false` (admin / collaborator in team) | Read-only mode. Disable *Checkout*, *Cancel*, *Downgrade*, *Cancel scheduled change*. Tooltip: *Only the team owner can change billing.* |
| `canViewPayments: false` | Hide the *Payment history* card entirely. |

Reads (`subscription`, `usage`, `period`) return the **owner's** data when `X-Team-Id` is present. This is what powers the team's quota bar in the sidebar — same components as personal mode, the backend just returns the right numbers.

### 3.13 Logout, OAuth callbacks, deep links

- **Logout.** Always `localStorage.remove('msgflash_portal_workspace_v1')` before clearing the JWT. Otherwise the next user on the device would inherit the previous active workspace.
- **OAuth callback** (`/oauth/google`, etc.). Strip the active workspace **before** parsing the JWT, in case the user logs in with a different account that doesn't have access to that team. After the JWT is in place, run § 3.1 (first boot).
- **Deep link to a team route** (e.g. `/dashboard?teamId=<uuid>` shared by a teammate). Treat `teamId` as a hint:
  1. Write it to localStorage.
  2. Run § 3.4 sequence.
  3. If `/api/workspace/current` returns `TEAM_NOT_FOUND`, fall back to personal and toast.

### 3.14 Quota-imputation cheat sheet (read this once)

Every quota / billing decision in team mode follows **one** rule: it's the **owner's** account that pays.

| Triggered by | Charged to | Recorded as |
|---|---|---|
| Member sends a message | Owner's `monthlyOutboundQuota` | `UsageRecord(userId=owner, teamId=team, actingUserId=member, type=message_sent)` |
| Member publishes a status | Owner's `monthlyOutboundQuota` (and `features.statuses` gate on owner's plan) | `UsageRecord(userId=owner, teamId=team, actingUserId=member, type=status_published)` |
| v1 API key (team) request | Owner's `monthlyApiRequestQuota` | `UsageRecord(userId=owner, teamId=team, actingUserId=createdByUserId, type=api_request)` |
| Member creates a new instance | Owner's `maxInstances` | Counted via `prisma.instance.count({ userId: owner })` |
| Member creates a webhook | Owner's `maxWebhookEndpoints` | Counted on owner |
| Owner or admin creates a team API key | Owner's **shared** `maxApiKeys` pool (personal + team keys cumulated) | `TeamApiKey(team)` row + `UsageRecord` with `teamId` |
| Member creates a contact group | Owner's `maxContactGroups` (account-wide, not per team — see § 13 follow-up) | `ContactGroup(userId=owner, teamId=team)` |

The sidebar usage bar in team mode therefore shows: **what the owner has consumed across all his workspaces (personal + every team he owns) for that billing period** — because the underlying `UsageSnapshot` is keyed by `(userId, periodKey)` alone. If the owner is also member of another team they don't own, that other team's usage is *not* in their snapshot (it's the **other** owner's quota).

---

## 4. Team admin surface — `/api/teams/*`

These routes **do not** read `X-Team-Id` — the team is in the path. They are accessible from any workspace and are used to *manage* teams.

| Method | Path | Role | Body | Notes |
|---|---|---|---|---|
| `GET` | `/api/teams` | any | — | List of teams the user belongs to. Returns `[{ id, name, role, isOwner, ownerUserId, joinedAt, createdAt }]`. |
| `POST` | `/api/teams` | requester | `{ name, invites: [{ email, role }] }` | Creates a team. Requester becomes owner. Plan gates: `TEAM_FEATURE_UNAVAILABLE` (Free/Starter), `TEAM_LIMIT_REACHED`, `TEAM_SEAT_LIMIT_REACHED`. |
| `GET` | `/api/teams/:teamId` | member | — | Team detail with `members[]`, `pendingInvitations[]`, **and `instanceAssignments[]`** in a single call. See § 4.2 for the shape. |
| `PATCH` | `/api/teams/:teamId` | owner/admin | `{ name }` | Rename. |
| `DELETE` | `/api/teams/:teamId` | owner | — | Soft delete (24h restore window not exposed yet). |
| `POST` | `/api/teams/:teamId/invitations` | owner/admin | `{ email, role: 'admin' \| 'collaborator' }` | Sends an invite email. Errors: `TEAM_SEAT_LIMIT_REACHED`, `INVITE_DUPLICATE_MEMBER`, `CONFLICT` (pending dup). |
| `POST` | `/api/teams/:teamId/invitations/:invitationId/resend` | owner/admin | — | Revokes the previous one and issues a new email. |
| `DELETE` | `/api/teams/:teamId/invitations/:invitationId` | owner/admin | — | Revokes a pending invite. |
| `DELETE` | `/api/teams/:teamId/members/:userId` | owner/admin | — | Removes member (cannot remove owner). |
| `POST` | `/api/teams/:teamId/members/leave` | non-owner member | — | Leaves the team. Owner must delete instead. |
| `GET` | `/api/teams/:teamId/instance-assignments` | member | — | Lists current assignments. Same shape as `instanceAssignments[]` in § 4.2. Use this for refresh-only views (after a `POST`/`DELETE` you can just refetch this endpoint instead of re-fetching the entire team). |
| `POST` | `/api/teams/:teamId/instance-assignments` | owner/admin | `{ instanceId, memberUserId }` | Assigns a team owner's instance to a collaborator. Returns `204`. |
| `DELETE` | `/api/teams/:teamId/instance-assignments?instanceId=…&memberUserId=…` | owner/admin | — | Unassign. Returns `204`. |
| `GET` | `/api/teams/:teamId/api-keys` | owner/admin | — | Same shape as the unified `/api/api-keys` (see § 5). |
| `POST` | `/api/teams/:teamId/api-keys` | owner/admin | `{ name }` | Creates a `msgf_team_…` key. `secret` shown once. Plan gate: `MAX_API_KEYS_REACHED`. |
| `DELETE` | `/api/teams/:teamId/api-keys/:keyId` | owner/admin | — | Revokes. |

### 4.1 `GET /api/teams/:teamId` response shape

Single source for the *Team settings* page. Everything the portal needs to render the **Members** tab, the **Pending invitations** banner, and the **Instances & access** grid comes from this one call.

```json
{
  "data": {
    "id": "team-uuid",
    "name": "Acme",
    "ownerUserId": "owner-uuid",
    "createdAt": "2026-05-01T10:00:00.000Z",

    "members": [
      {
        "id": "user-uuid",
        "email": "alice@acme.io",
        "fullName": "Alice Doe",
        "role": "owner",
        "joinedAt": "2026-05-01T10:00:00.000Z"
      },
      {
        "id": "user-uuid-2",
        "email": "bob@acme.io",
        "fullName": "Bob Stone",
        "role": "admin",
        "joinedAt": "2026-05-02T09:00:00.000Z"
      },
      {
        "id": "user-uuid-3",
        "email": "carol@acme.io",
        "fullName": "Carol Lee",
        "role": "collaborator",
        "joinedAt": "2026-05-03T11:00:00.000Z"
      }
    ],

    "pendingInvitations": [
      {
        "id": "inv-uuid",
        "email": "dave@acme.io",
        "role": "collaborator",
        "expiresAt": "2026-05-13T09:00:00.000Z",
        "createdAt": "2026-05-12T09:00:00.000Z"
      }
    ],

    "instanceAssignments": [
      {
        "teamId": "team-uuid",
        "instanceId": "inst-uuid-1",
        "userId": "user-uuid-3",
        "assignedByUserId": "user-uuid",
        "createdAt": "2026-05-03T11:30:00.000Z",
        "instance": {
          "id": "inst-uuid-1",
          "name": "Acme Support",
          "waNumber": "+33611111111",
          "status": "connected"
        }
      }
    ]
  }
}
```

**Reading rules.**

- `members[]` always contains the **owner** + **admins** + **collaborators**. Render the role badge from `role`. Don't infer "is current user" from this — get it from `/api/workspace/current` (`team.role`, `team.isOwner`).
- `pendingInvitations[]` is intentionally separate from members: they don't exist as users yet. Show them in a *Pending* tab with a *Resend* / *Revoke* action.
- `instanceAssignments[]` is **only** relevant for collaborators. Owners and admins implicitly have access to every team instance, so the absence of an assignment row for them means nothing. To render the *Instances & access* grid, iterate `members` and only show the toggle column for `role === 'collaborator'`. Cross-reference each cell with `instanceAssignments.find(a => a.userId === member.id && a.instanceId === instance.id)`.
- The `instance` sub-object on each assignment is denormalized for convenience (no extra `/api/instances` call needed if you only render the assigned ones). If you want the **full** list of team instances (including unassigned), still call `GET /api/instances` with `X-Team-Id`.

### 4.2 Frontend snippet — building the access grid

```tsx
function InstanceAccessGrid({ team, instances }: {
  team: TeamDetail;
  instances: Instance[];
}) {
  const collaborators = team.members.filter((m) => m.role === 'collaborator');
  const has = (userId: string, instanceId: string) =>
    team.instanceAssignments.some(
      (a) => a.userId === userId && a.instanceId === instanceId
    );

  return (
    <Table>
      <thead>
        <tr>
          <th>Collaborator</th>
          {instances.map((i) => <th key={i.id}>{i.name}</th>)}
        </tr>
      </thead>
      <tbody>
        {collaborators.map((c) => (
          <tr key={c.id}>
            <td>{c.fullName ?? c.email}</td>
            {instances.map((i) => (
              <td key={i.id}>
                <Toggle
                  checked={has(c.id, i.id)}
                  onChange={(on) =>
                    on
                      ? api.teams.assignInstance(team.id, { instanceId: i.id, memberUserId: c.id })
                      : api.teams.unassignInstance(team.id, { instanceId: i.id, memberUserId: c.id })
                  }
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
```

After `assign` / `unassign` (both return `204`), refetch either the full team (`GET /api/teams/:teamId`) or just the assignments (`GET /api/teams/:teamId/instance-assignments`) and update local state.

### 4.3 Inbox & accept

| Method | Path | Headers | Body | Notes |
|---|---|---|---|---|
| `GET` | `/api/teams/invitations/mine` | JWT | — | Lists invites addressed to the user's email. Use to display the "You have N pending invites" banner. |
| `POST` | `/api/teams/invitations/accept` | JWT | `{ token }` *or* `{ invitationId }` | Use `token` when coming from the email link, `invitationId` when accepting from the inbox banner. Errors: `INVITE_INVALID_OR_EXPIRED`, `INVITE_EMAIL_MISMATCH`, `INVITE_DUPLICATE_MEMBER`. Returns `{ teamId, role }` so the portal can switch immediately. |

---

## 5. API keys — **unified** surface (changed)

Previously the portal had to call `/api/api-keys` in personal mode and `/api/teams/:id/api-keys` in team mode. **That's no longer required.**

`/api/api-keys` is now workspace-aware: send `X-Team-Id` and you'll get the team's keys back. Same routes, same shapes, with one extra `kind` discriminator (`'personal' | 'team'`).

| Method | Path | Headers | Behavior |
|---|---|---|---|
| `GET` | `/api/api-keys` | JWT (+ optional `X-Team-Id`) | Lists personal **or** team keys depending on workspace. |
| `POST` | `/api/api-keys` | JWT (+ optional `X-Team-Id`) | Creates a `msgf_live_…` (personal) or `msgf_team_…` (team) key. Returns `secret` **once**. |
| `DELETE` | `/api/api-keys/:id` | JWT (+ optional `X-Team-Id`) | Revokes the key (must belong to the active workspace). |
| `GET` | `/api/api-keys/usage` | JWT (+ optional `X-Team-Id`) | Per-key request counts in the active workspace for the current period (or `?periodKey=YYYY-MM`). |

Unified response shape for list / create / usage:

```json
{
  "data": [
    {
      "id": "key-uuid",
      "name": "Production",
      "keyPrefix": "msgf_team_a1b2c3",
      "kind": "team",
      "lastUsedAt": "2026-05-12T18:00:00.000Z",
      "revokedAt": null,
      "createdAt": "2026-05-01T00:00:00.000Z"
    }
  ]
}
```

`usage` endpoint:

```json
{
  "data": {
    "periodKey": "2026-05",
    "totalRequests": 1234,
    "apiKeys": [
      {
        "id": "key-uuid",
        "name": "Production",
        "keyPrefix": "msgf_team_a1b2c3",
        "kind": "team",
        "requestCount": 1234,
        "lastRequestAt": "2026-05-12T18:00:00.000Z",
        "lastUsedAt": "2026-05-12T18:00:00.000Z",
        "revokedAt": null,
        "createdAt": "2026-05-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Plan limits.** Team and personal keys share the same `maxApiKeys` pool of the owner's plan. Creation in either workspace returns `MAX_API_KEYS_REACHED` (or `API_KEYS_NOT_AVAILABLE_ON_PLAN` on Free) when the cap is hit.

**Role gate (team mode).** Only `owner` and `admin` can create/list/revoke. A `collaborator` hitting `/api/api-keys` in a team workspace gets `403 TEAM_ACCESS_DENIED`.

**Legacy.** `/api/teams/:teamId/api-keys` is kept for backward compatibility but you should converge on the unified `/api/api-keys` surface and just toggle `X-Team-Id`.

---

## 6. Billing — `/api/billing/*`

All billing routes are JWT + `X-Team-Id` aware. Plan catalog is public.

| Method | Path | Headers | Role | Notes |
|---|---|---|---|---|
| `GET` | `/api/billing/plans` | none | — | Public catalog. |
| `GET` | `/api/billing/subscription` | JWT (+ `X-Team-Id`?) | any member | Returns the **owner's** subscription + usage + period when team. |
| `GET` | `/api/billing/usage` | JWT (+ `X-Team-Id`?) | any member | Same as `subscription` but only the `usage` + `period` slice. |
| `POST` | `/api/billing/checkout` | JWT (+ `X-Team-Id`?) | owner only in team | `{ planCode }` → returns Dodo Payments URL. Non-owner: `BILLING_TEAM_MUTATION_FORBIDDEN`. |
| `POST` | `/api/billing/cancel` | JWT (+ `X-Team-Id`?) | owner only in team | Schedules cancellation at end of period. |
| `POST` | `/api/billing/downgrade` | JWT (+ `X-Team-Id`?) | owner only in team | Schedules a plan change. Pre-validates teams/seats; rejects with `PLAN_CHANGE_BLOCKED_ACTIVE_TEAMS` otherwise. |
| `POST` | `/api/billing/cancel-scheduled-change` | JWT (+ `X-Team-Id`?) | owner only in team | Undoes a scheduled cancel/downgrade. |
| `GET` | `/api/billing/payments?page=&limit=` | JWT (+ `X-Team-Id`?) | owner only in team | Non-owner in a team: `BILLING_PAYMENTS_TEAM_OWNER_ONLY`. |

UI rule: when `kind === 'team' && !capabilities.canMutateBilling`, render mutation buttons as disabled with a tooltip "Owner only".

---

## 7. Resource routes that honor `X-Team-Id`

Every workspace-scoped resource route picks the active workspace from `X-Team-Id`. **Send the header on every request whose result depends on the active workspace.** Cache by `(route, X-Team-Id)`.

| Group | Base | Workspace-aware |
|---|---|---|
| Instances | `/api/instances/**` | ✅ |
| Contacts | `/api/contacts/**` | ✅ |
| Contact groups | `/api/contacts/groups/**` | ✅ |
| Contact imports | `/api/contacts/imports/**` | ✅ |
| Contact bulk jobs | `/api/contacts/bulk-jobs/**` | ✅ |
| Messages | `/api/messages/**` | ✅ |
| Campaigns | `/api/campaigns/**` | ✅ |
| Templates | `/api/templates/**` | ✅ |
| Webhooks | `/api/webhooks/**` | ✅ |
| Statuses | `/api/statuses/**` | ✅ |
| Media | `/api/media/**` | ✅ |
| Number lookups | `/api/number-lookups/**` | ✅ |
| Search | `/api/search/**` | ✅ |
| Billing | `/api/billing/**` | ✅ (see § 6) |
| API keys | `/api/api-keys/**` | ✅ (see § 5) |
| Workspace bootstrap | `/api/workspace/current` | ✅ |

Not workspace-aware (by design):
- `/api/auth/**` — about the **user**, not the workspace.
- `/api/teams/**` — team admin (selector is in the path).
- `/api/admin/**` — admin panel (separate auth).
- `/api/payments/webhook` — provider callback.

---

## 8. Public API v1 — team keys

The public API (`/api/v1/*`) uses **API keys**, not JWT.

| Key shape | Header `X-Team-Id` | Effective workspace |
|---|---|---|
| `msgf_live_…` (personal) | must **not** be sent | Personal (the key owner) |
| `msgf_team_…` (team) | **required**, must match the team bound to the key | Team workspace |

Personal-only routes (team keys → `403 TEAM_KEY_NOT_ALLOWED`):

- `GET /api/v1/me`
- `GET /api/v1/usage`
- `GET /api/v1/billing/subscription`
- `GET /api/v1/billing/usage`
- `GET /api/v1/billing/payments`

Everything else under `/api/v1/*` is workspace-aware.

---

## 9. Role × action matrix

| Action | Owner | Admin | Collaborator |
|---|:---:|:---:|:---:|
| View team detail / members / invites | ✅ | ✅ | ✅ |
| Create / rename / delete team (owner-only delete) | ✅ | rename only | ❌ |
| Invite / revoke / resend invitations | ✅ | ✅ | ❌ |
| Remove members | ✅ | ✅ (cannot remove owner) | ❌ |
| Leave team | n/a (owner must delete) | ✅ | ✅ |
| Manage team instances (assign / unassign) | ✅ | ✅ | ❌ |
| Use **any** team instance for message/campaign | ✅ | ✅ | only assigned (`INSTANCE_NOT_ASSIGNED` otherwise) |
| Manage team API keys (`/api/api-keys` in team mode) | ✅ | ✅ | ❌ (`TEAM_ACCESS_DENIED`) |
| Manage team webhooks / templates / campaigns / statuses | ✅ | ✅ | ✅ (subject to instance assignment) |
| `GET /api/billing/subscription`, `usage` (team) | ✅ | ✅ | ✅ (read-only) |
| `POST /api/billing/checkout|cancel|downgrade|cancel-scheduled-change` (team) | ✅ | ❌ `BILLING_TEAM_MUTATION_FORBIDDEN` | ❌ |
| `GET /api/billing/payments` (team) | ✅ | ❌ `BILLING_PAYMENTS_TEAM_OWNER_ONLY` | ❌ |

---

## 10. Error codes

Show those errors verbatim — the message is i18n-ready on the frontend side and the code is stable.

| Code | HTTP | When | Suggested UX |
|---|:---:|---|---|
| `TEAM_NOT_FOUND` | 404 | `X-Team-Id` is not a team you actively belong to. | Drop the header from local storage, fall back to personal, toast "Workspace not available". |
| `TEAM_ACCESS_DENIED` | 403 | Role not allowed for the action. | Disable the button at render time using `capabilities` to avoid hitting this. |
| `TEAM_FEATURE_UNAVAILABLE` | 403 | Plan doesn't allow team creation (Free / Starter). | CTA "Upgrade to Pro". |
| `TEAM_LIMIT_REACHED` | 403 | Owner reached the max number of teams for the plan. | Show plan-aware copy with delete-other-team CTA. |
| `TEAM_SEAT_LIMIT_REACHED` | 403 | Team already full. | "No seats left. Remove a member or upgrade plan." |
| `TEAM_KEY_REQUIRED` | 403 | Personal v1 key sent with `X-Team-Id`. | Public-API doc only. |
| `TEAM_KEY_NOT_ALLOWED` | 403 | Team v1 key on a personal-only route. | Public-API doc only. |
| `INSTANCE_NOT_ASSIGNED` | 403 | Collaborator hit an instance not assigned to them. | UI should hide unassigned instances in the picker. |
| `INVITE_INVALID_OR_EXPIRED` | 410 | Token/id unknown or past 24h expiry. | "This invitation is no longer valid. Ask for a new one." |
| `INVITE_EMAIL_MISMATCH` | 403 | Signed-in email ≠ invite email. | "Sign in with the invited address." |
| `INVITE_DUPLICATE_MEMBER` | 409 | Already a member. | Switch to that team directly. |
| `BILLING_TEAM_MUTATION_FORBIDDEN` | 403 | Non-owner tries to checkout/cancel/downgrade. | Tooltip "Owner only", disable button. |
| `BILLING_PAYMENTS_TEAM_OWNER_ONLY` | 403 | Non-owner reads payments. | Hide payments page in team mode for non-owners. |
| `PLAN_CHANGE_BLOCKED_ACTIVE_TEAMS` | 400 | Downgrade target plan cannot host current teams/seats. | "Delete teams or reduce seats first." |
| `MAX_API_KEYS_REACHED` | 403 | Plan cap hit (counts personal + all team keys owned). | "Limit reached. Revoke unused keys or upgrade." |
| `API_KEYS_NOT_AVAILABLE_ON_PLAN` | 403 | Free plan, no API keys. | "Upgrade to use API keys." |

---

## 11. Frontend implementation checklist

This is the only checklist that matters now — every other portal-integration doc that mentions team behavior should defer to this section.

### 11.1 Active workspace contract

- LocalStorage key: `msgflash_portal_workspace_v1`
  - Value: `null` (personal) or `{ teamId: string }`.
- Event: dispatch `msgflash:workspace-changed` on `window` whenever the value changes (workspace switcher click, deep link, OAuth callback returning to a team URL).
- API client: read the localStorage key in a request interceptor and inject `X-Team-Id` on **every** `/api/*` call **except** `/api/auth/**`, `/api/teams/**`, `/api/admin/**`.

### 11.2 Boot sequence

```
1. await api.auth.me()                  // populates user + teams[]
2. let active = readLocalStorage(...)   // may reference a deleted team
3. let workspace = await api.workspace.current(active?.teamId)
4. if response is 404 TEAM_NOT_FOUND:
     localStorage.remove(...)
     active = null
     workspace = await api.workspace.current()   // personal
```

### 11.3 On workspace switch

```
1. write localStorage
2. dispatch 'msgflash:workspace-changed'
3. queryClient.invalidateQueries()       // React Query: invalidate everything
   // or SWR: revalidate all keys
4. await api.workspace.current(newTeamId) // refresh sidebar plan/usage
5. router.push('/dashboard') or stay on the current page — but reset paginators
```

Every screen that paginates must reset to page 1 / first cursor on the switch event.

### 11.4 UI gating

- Render mutation buttons disabled when `capabilities.<action>` is `false`. Show a tooltip with the reason ("Owner only", "Upgrade to Pro", etc.).
- Hide entirely the screens that are 100% gated (e.g. payment history in team mode for non-owners).
- Show a "Restricted to assigned instances" banner when `capabilities.isRestrictedCollaborator` is `true`.

### 11.5 OAuth, deep links, logout

- OAuth callback URLs **must not** carry `X-Team-Id` and should reset the active workspace to personal *before* parsing the JWT, to avoid landing in a team the user no longer belongs to.
- Logout: `localStorage.remove('msgflash_portal_workspace_v1')`.
- Deep links to a team route (`/dashboard?teamId=…`) should call `/workspace/current?X-Team-Id=…` *first*; if it returns 404, drop the param and load personal.

### 11.6 Cache key strategy

Every workspace-scoped API call must include the active `teamId` (or the literal `'personal'`) in its query key:

```ts
['contacts.list', activeTeamId ?? 'personal', { cursor, search, sort }]
['workspace.current', activeTeamId ?? 'personal']
['api-keys.list', activeTeamId ?? 'personal']
```

That way React Query / SWR will refetch automatically on switch — no need for manual `invalidate` for new screens.

### 11.7 PR review checklist (apply on every team-related PR)

1. Does the new API call include `X-Team-Id` (via the shared interceptor)?
2. Is the response cached with `teamId` in the key?
3. Does the screen gate its actions on `capabilities.*` from `/workspace/current`?
4. Does pagination reset on `msgflash:workspace-changed`?
5. If the screen mutates billing, is the button disabled when `!canMutateBilling`?
6. Are these errors mapped to a clean toast? `TEAM_NOT_FOUND`, `TEAM_ACCESS_DENIED`, `BILLING_TEAM_MUTATION_FORBIDDEN`, `BILLING_PAYMENTS_TEAM_OWNER_ONLY`, `INSTANCE_NOT_ASSIGNED`, `MAX_API_KEYS_REACHED`, `PLAN_CHANGE_BLOCKED_ACTIVE_TEAMS`?
7. Does the OAuth / logout / deep link flow correctly clear the active workspace?

---

## 12. Quick endpoint reference card

For copy-paste convenience.

```
# Bootstrap
GET  /api/auth/me                          (JWT)
GET  /api/workspace/current                (JWT [+X-Team-Id])
GET  /api/teams                            (JWT)
GET  /api/teams/invitations/mine           (JWT)
POST /api/teams/invitations/accept         (JWT)              body: {token} | {invitationId}

# Team admin
POST   /api/teams                          (JWT)              body: {name, invites: [{email, role}]}
GET    /api/teams/:teamId                  (JWT)
PATCH  /api/teams/:teamId                  (JWT)              body: {name}
DELETE /api/teams/:teamId                  (JWT)
POST   /api/teams/:teamId/invitations      (JWT)              body: {email, role}
POST   /api/teams/:teamId/invitations/:invitationId/resend
DELETE /api/teams/:teamId/invitations/:invitationId
DELETE /api/teams/:teamId/members/:userId
POST   /api/teams/:teamId/members/leave
GET    /api/teams/:teamId/instance-assignments
POST   /api/teams/:teamId/instance-assignments        body: {instanceId, memberUserId}
DELETE /api/teams/:teamId/instance-assignments?instanceId=&memberUserId=

# Unified API keys (use X-Team-Id to operate on a team)
GET    /api/api-keys                       (JWT [+X-Team-Id])
POST   /api/api-keys                       (JWT [+X-Team-Id]) body: {name}
DELETE /api/api-keys/:id                   (JWT [+X-Team-Id])
GET    /api/api-keys/usage[?periodKey=]    (JWT [+X-Team-Id])

# Billing (X-Team-Id => team owner's subscription)
GET  /api/billing/plans                    (public)
GET  /api/billing/subscription             (JWT [+X-Team-Id])
GET  /api/billing/usage                    (JWT [+X-Team-Id])
POST /api/billing/checkout                 (JWT [+X-Team-Id]) body: {planCode}
POST /api/billing/cancel                   (JWT [+X-Team-Id])
POST /api/billing/downgrade                (JWT [+X-Team-Id]) body: {plan}
POST /api/billing/cancel-scheduled-change  (JWT [+X-Team-Id])
GET  /api/billing/payments?page=&limit=    (JWT [+X-Team-Id], owner only in team)

# Resource routes (all accept optional X-Team-Id)
/api/instances/**, /api/contacts/**, /api/messages/**, /api/campaigns/**,
/api/templates/**, /api/webhooks/**, /api/statuses/**, /api/media/**,
/api/number-lookups/**, /api/search/**
```

That's the entire feature. If you implement § 11 to the letter, the portal is workspace-aware end to end.

---

## 13. Open follow-ups (not blocking this milestone)

These are known gaps. Build around them; we'll close them in a follow-up PR.

1. **Decline invitation endpoint** — currently invitations only disappear by acceptance or 24h TTL. Track: add `DELETE /api/teams/invitations/:invitationId/decline` (no auth required beyond JWT; matches email-recipient). Until then, the portal can hide declined invites optimistically and rely on TTL.
2. **Per-team resource caps** — `maxContactGroups`, `maxTemplates`, etc. are counted account-wide (owner's plan), not per team. The product impact is: a contact-group-heavy team can consume the owner's entire allotment. Cosmetically, the portal can show a *Shared with all your workspaces* tooltip on the usage bar.
3. **Owner switching team ownership** — there is no transfer-ownership endpoint yet. The current workaround is *invite as admin* + *delete the team* + *new admin recreates it*. We'll add `POST /api/teams/:teamId/transfer-ownership { newOwnerUserId }` later.
4. **Real-time membership updates** — there's no WebSocket/SSE channel telling the portal "you were just removed from team X". Until we add one, the portal must handle the 404/403 codes documented in § 10 as a soft fallback.

---

## Table of contents

1. Mental model
2. Bootstrap flow at every page load / workspace switch
3. **Use cases end-to-end** ← walk through every screen, in order, with API calls & failure modes
4. Team admin surface — `/api/teams/*`
5. API keys — **unified** surface (changed)
6. Billing — `/api/billing/*`
7. Resource routes that honor `X-Team-Id`
8. Public API v1 — team keys
9. Role × action matrix
10. Error codes
11. Frontend implementation checklist
12. Quick endpoint reference card
13. Open follow-ups
