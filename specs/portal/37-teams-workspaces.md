# SPEC — Portal / Teams & workspaces

App: portal  
Status: **backend done — portal UI pending**  
Depends on: `specs/23-teams-workspaces.md` · Implemented HTTP contract: `33-teams-api-implementation.md`

---

## Purpose

Deliver **team collaboration** in the customer portal: create teams (Pro/Plus owners only), invite members, accept invitations (email + in-app), manage roles, assign WhatsApp instances to members, manage **team API keys**, and switch the **active workspace** (personal vs team) so all downstream pages and API calls use the correct context.

---

## Product rules (UI)

1. **Workspace switcher** (header or account menu): list **Personal** + every team the user **owns** or **belongs to**. Exactly **one** active item at a time.
2. Changing workspace **clears or refetches** all dependent views (instances, messages, campaigns, contacts, billing entry points, API keys list, webhooks, etc.).
3. **Personal** workspace: today’s behaviour; **no** `X-Team-Id` on public API calls from the portal when using **personal** API keys (if the portal proxies with user’s personal key).
4. **Team** workspace: portal uses **team API keys** for server-side integrations **or** passes `X-Team-Id` only when using team keys from the browser — follow backend spec v1 (**team operations use `TeamApiKey`** for `/api/v1/*`).
5. **Create team** CTA: visible only if user’s effective plan is **Pro** or **Plus** and owned-team cap not reached; otherwise show **upgrade** / **limit** messaging.
6. **Empty team**: cannot submit create form without **at least one** invite (email + role).
7. **Invitations**: show **expires in** countdown (24h from server UTC); **resend** and **revoke** for owner/admin.
8. **Accept invite**: dedicated route from email deep link (`token`) + **Invitations inbox** on dashboard backed by **`GET /api/teams/invitations/mine`**; **Accept** button calls **`POST /api/teams/invitations/accept`** with `{ invitationId }` (JWT must match invite email — no token pasted in UI).
9. **Roles** when inviting: **Admin** or **Collaborator** only (owner is implicit).
10. **Member list**: show role badges; actions **Remove** (owner/admin — **not** for the owner row; admin cannot remove owner); **Leave** (self) for **admin/collaborator only** — **hide** for team owner (owner deletes team instead).
11. **Instance assignment** UI: owner/admin selects from **owner’s instances** and assigns to one or more members; collaborators only see **assigned** instances in team workspace.
12. **Team API keys** page: only in team workspace; **create/list/revoke** for owner/admin; **hidden** or read-only denied for collaborators with clear copy.
13. **Billing**: team workspace **must not** expose owner’s subscription checkout/cancel to **admin** or **collaborator**; only **owner** sees billing controls (align with backend matrix).

---

## Backend endpoints (console — indicative)

Align route names with final OpenAPI; examples mirror `specs/23-teams-workspaces.md` §7.1:

| Area | Examples |
|------|-----------|
| Teams CRUD | `GET/POST /api/teams`, `GET/PATCH/DELETE /api/teams/:teamId` |
| Invites (mine + accept) | `GET /api/teams/invitations/mine`, `POST /api/teams/invitations/accept` |
| Invites (team admin) | `POST /api/teams/:teamId/invitations`, `POST .../resend`, `DELETE ...` |
| Members | `DELETE /api/teams/:teamId/members/:userId`, `POST /api/teams/:teamId/members/leave` |
| Instance assign | `POST/DELETE /api/teams/:teamId/instance-assignments` |
| Team keys | `GET/POST/DELETE /api/teams/:teamId/api-keys` |

Team-scoped **resource** lists (messages, campaigns, …) use either nested routes under `/api/teams/:teamId/...` or agreed query param — **must match** backend OpenAPI once implemented.

---

## Layout & key components

### Global: `WorkspaceSwitcher`

* Props: `teams[]`, `activeWorkspace`, `onChange(workspace)`.
* Renders: **Personal** + team names; optional “Owner” badge on owned teams.

### `TeamsListPage` (optional hub)

* Cards per team: name, role (You are owner / Admin / Collaborator), seat usage `n / max`, link **Open**.

### `TeamCreatePage` / modal

* Fields: `name`, invite table `[{ email, role }]`, validation ≥1 row.
* Submit errors: `TEAM_LIMIT_REACHED`, `TEAM_FEATURE_UNAVAILABLE`, validation.

### `TeamDetailPage`

* Tabs suggested: **Overview** | **Members** | **Invitations** | **Instances** | **API keys** (owner/admin) | **Danger zone** (owner: delete team).

### `InvitationsInbox` (personal context)

* On load: **`GET /api/teams/invitations/mine`**.
* Row actions: **Accept** → `POST /api/teams/invitations/accept` with `{ invitationId }`; show errors (`INVITE_INVALID_OR_EXPIRED`, etc.).
* **Decline** optional v1 — if omitted, invite expires at 24h or user ignores.

### Empty & edge states

* **No teams** (member-only user): switcher shows only Personal + hint if pending invites exist.
* **Downgrade blocked** (owner): toast from `PLAN_CHANGE_BLOCKED_ACTIVE_TEAMS` with CTA **Manage teams**.

---

## Pricing & marketing (mandatory copy tasks)

Update **both**:

1. **Marketing landing** — pricing table for **Pro** and **Plus**: add row or bullet **Teams** (seat limits + max teams per owner: Pro 2 teams × 4 seats; Plus 4 teams × 8 seats — use final marketing wording).
2. **Portal pricing / upgrade** screens — same capability callout so in-app upgrade matches landing.

Mention **Starter/Free**: teams **not** available for creating; **can join** teams when invited.

---

## FAQ (add to portal FAQ content + Mintlify `resources/faq` when API ships)

Suggested entries:

* What is the difference between **personal** and **team** workspace?
* Who pays for messages sent in a team?
* What happens to my data if the team owner deletes the team?
* Can I be in several teams?
* Why can’t I downgrade my plan?
* What is a team API key vs my personal API key?
* Invitation expired — what do I do?

---

## Analytics (optional)

Track: `team_created`, `invite_sent`, `invite_accepted`, `workspace_switched`, `team_deleted` (privacy-safe, no PII in event names).

---

## Acceptance (portal)

* [ ] Switcher switches context; refresh data; correct keys/headers for API.
* [ ] Pro/Plus owner flow: create with invite, resend, accept from email and dashboard.
* [ ] Roles: admin cannot billing/delete team; collaborator cannot team keys / delete instance.
* [ ] Pricing surfaces updated (landing + portal).
* [ ] FAQ entries published.

