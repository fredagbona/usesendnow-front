# CLAUDE.md — UseSendNow Frontend Monorepo

This file is for Claude Code (claude.dev CLI agent).
Read AGENTS.md first — all rules there apply here.
This file adds Claude-specific context and instructions.

---

## What this project is

UseSendNow is an API-first WhatsApp automation platform.
This repository is the frontend monorepo containing 4 Next.js apps.
The backend is a separate Node.js/TypeScript/Express API already fully built.

You are working on the frontend only.
Do not attempt to modify backend code from this repo.

---

## How to navigate this repo

- Global rules → `AGENTS.md` (this directory)
- App-specific rules → `apps/<appname>/AGENTS.md`
- Feature specs → `specs/<appname>/<spec-file>.md`
- Shared components → `packages/ui/`
- Shared types → `packages/types/`
- Shared API calls → `packages/api-client/`

Always read the relevant spec before implementing a feature.
Always check shared packages before creating something new.

---

## Running apps locally
```bash
pnpm dev:landing    # http://localhost:3000
pnpm dev:portal     # http://localhost:3001
pnpm dev:docs       # http://localhost:3002
pnpm dev:admin      # http://localhost:3003
pnpm dev            # all apps simultaneously
```

---

## How to implement a feature

1. Read the spec in `specs/<appname>/`
2. Read `apps/<appname>/AGENTS.md` for app-specific rules
3. Check `packages/` for any reusable code that already exists
4. Create your branch: `feat/<app>-<feature>`
5. Implement following the structure in AGENTS.md
6. Do not add dependencies without confirming with the spec

---

## Backend API

- Base URL comes from `NEXT_PUBLIC_API_URL` environment variable
- Console routes use JWT (`Authorization: Bearer <token>`)
- Public API routes use API key (`x-api-key: usn_live_<key>`)
- All API calls go through `@usesendnow/api-client` — never raw fetch

---

## TypeScript

- Strict mode is on — respect it
- Types for backend responses belong in `@usesendnow/types`
- Never use `any` — use `unknown` and narrow, or define a proper type

---

## When you are unsure

- Missing spec → do not invent requirements, flag it
- Ambiguous design → implement the simpler version and flag it
- Missing type → define it in `packages/types` and flag it
- Dependency needed → confirm it fits the stack before installing

---

## Deployment

- All 4 apps deploy to Vercel independently
- Each app is a separate Vercel project pointing to this repo
- Root directory per project: `apps/<appname>`
- Backend deploys separately on Coolify — not your concern from this repo
