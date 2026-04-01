# AGENTS.md — UseSendNow Frontend Monorepo

This file is the global reference for any AI coding agent working in this repository.
Read this before writing any code. App-level AGENTS.md files add specifics on top of these rules.

---

## Project Identity

**Product:** UseSendNow — API-first WhatsApp automation platform
**Frontend repo:** usesendnow-frontend (this repo)
**Backend repo:** usesendnow-backend (separate repo, already built)
**Architecture:** Turborepo monorepo with 4 independent Next.js apps

---

## Apps in this repo

| App | Path | URL | Purpose |
|---|---|---|---|
| landing | apps/landing | usesendnow.com | Marketing landing page |
| portal | apps/portal | app.usesendnow.com | User dashboard / control plane |
| docs | apps/docs | docs.usesendnow.com | API and product documentation |
| admin | apps/admin | admin.usesendnow.com | Internal admin panel |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) — always use App Router, never Pages Router
- **Language:** TypeScript strict mode — no `any`, no type suppression
- **Styling:** Tailwind CSS — utility classes only, no custom CSS files unless absolutely necessary
- **Icons:** HugeIcons (`hugeicons-react`) — default icon library
- **UI accents:** Heroicons (`@heroicons/react`) — secondary, use sparingly
- **Animation:** Framer Motion (`framer-motion`) — for transitions and micro-interactions
- **Fonts:** Geist (default UI font) + Poppins (headings and display text)
- **Package manager:** pnpm — never use npm or yarn

---

## Shared Packages

| Package | Import | Purpose |
|---|---|---|
| @usesendnow/ui | `@usesendnow/ui` | Shared components |
| @usesendnow/types | `@usesendnow/types` | Shared TypeScript types |
| @usesendnow/api-client | `@usesendnow/api-client` | Shared API call functions |
| @usesendnow/config | `@usesendnow/config` | Shared Tailwind + TS config |

Always check shared packages before creating something new in an app.
If a component or type will be used in more than one app, it belongs in a shared package.

---

## Code Rules

### General
- All components are functional components with named exports
- No default exports except in Next.js page files (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`)
- No `any` type — ever
- No inline styles — use Tailwind classes only
- No `console.log` left in committed code — use structured logging or remove
- Every file has a single clear responsibility

### File naming
- Components: `PascalCase.tsx` (e.g. `HeroSection.tsx`)
- Utilities: `camelCase.ts` (e.g. `formatDate.ts`)
- Hooks: `use` prefix + `PascalCase.ts` (e.g. `useApiKeys.ts`)
- Types: `PascalCase.types.ts` or defined in `@usesendnow/types`
- Pages: Next.js convention (`page.tsx`, `layout.tsx`)

### Folder structure per app
```
apps/<appname>/
  app/                  ← Next.js App Router pages
    (auth)/             ← route groups where needed
    layout.tsx
    page.tsx
  components/           ← app-specific components
    ui/                 ← small reusable UI pieces
    sections/           ← page sections (landing-specific)
    shared/             ← components shared within this app
  hooks/                ← custom React hooks
  lib/                  ← utilities and helpers
  types/                ← local types (if not shared)
  public/               ← static assets
```

### Components
- Props must always be explicitly typed with an interface
- Interface name: `<ComponentName>Props`
- Keep components under 150 lines — split if larger
- No business logic in components — extract to hooks or lib

### Hooks
- All data fetching lives in custom hooks
- Hooks handle loading, error, and data states explicitly
- Never fetch directly inside a component body

### API calls
- All backend API calls go through `@usesendnow/api-client`
- Never use raw `fetch` directly in components or pages
- Backend base URL always comes from environment variables

---

## Environment Variables

Never hardcode URLs or secrets.
Always use `process.env.NEXT_PUBLIC_*` for client-side variables.

Required variables per app are documented in that app's `.env.example` file.

---

## Animation Rules (Framer Motion)

- Use for: page transitions, component mount/unmount, hover states, loading states
- Keep animations subtle and fast (duration 0.2s–0.4s)
- Never animate layout-breaking properties
- Prefer `variants` pattern for reusable animation configs
- No animation on critical interactive elements (form inputs, buttons mid-action)

---

## Specs

All feature specs live in `/specs` at the monorepo root.
Before implementing any feature, read the relevant spec file completely.
If a spec is missing or unclear, stop and ask — do not invent requirements.

---

## Git Rules

- Branch naming: `feat/<app>-<feature>`, `fix/<app>-<issue>`, `chore/<scope>`
- Commit format: `type(app): description` — e.g. `feat(portal): add login page`
- Never commit directly to `main` or `dev`
- Never commit `.env` files
- Always commit `pnpm-lock.yaml` when dependencies change

---

## What NOT to do

- Do not install new dependencies without checking if one already exists for the purpose
- Do not create a component in an app if it belongs in `@usesendnow/ui`
- Do not use Pages Router — App Router only
- Do not use `any`
- Do not hardcode API URLs
- Do not skip TypeScript types to move faster
- Do not leave TODOs in committed code without a linked spec or issue
