# AGENTS.md — Portal App
App: portal
URL: app.usesendnow.com

Read the root AGENTS.md first. All global rules apply.
This file adds portal-specific rules only.

---

## Purpose

The portal is the human control plane of UseSendNow.
It is a technical console — not a marketing interface.
Users come here to configure, connect, monitor and manage.
Every UI decision must serve clarity and speed, not aesthetics.

---

## Specs to implement

All specs live in `specs/portal/`.
Read the directives file first: `specs/portal/00-portal-directives.md`
Then read the specific page spec before touching any file.
Never implement a page without a spec. If the spec is missing — stop and ask.

---

## Theme — Light only

Light mode. Always. No toggle. No dark mode.
The landing is dark. The portal is light. This contrast is intentional.

---

## Color palette — use only these tokens

| Token | Value | Tailwind class |
|---|---|---|
| bg-base | #FFFFFF | bg-white |
| bg-subtle | #F8F9FA | bg-[#F8F9FA] |
| bg-card | #FFFFFF | bg-white |
| border | #E5E7EB | border-[#E5E7EB] |
| border-strong | #D1D5DB | border-[#D1D5DB] |
| text-primary | #111827 | text-[#111827] |
| text-secondary | #6B7280 | text-[#6B7280] |
| text-muted | #9CA3AF | text-[#9CA3AF] |
| accent | #25D366 | bg-[#25D366] |
| accent-hover | #1EBF5A | hover:bg-[#1EBF5A] |
| accent-subtle | #F0FDF4 | bg-[#F0FDF4] |
| destructive | #EF4444 | bg-[#EF4444] |
| destructive-subtle | #FEF2F2 | bg-[#FEF2F2] |
| warning | #F59E0B | text-[#F59E0B] |
| warning-subtle | #FFFBEB | bg-[#FFFBEB] |

Never introduce a color outside this list.

---

## Typography

Font: Geist Sans only. No Poppins in the portal.

| Role | Classes |
|---|---|
| Page title | `text-xl font-semibold text-[#111827] tracking-tight` |
| Section title | `text-base font-medium text-[#111827]` |
| Body | `text-sm text-[#374151]` |
| Secondary | `text-sm text-[#6B7280]` |
| Muted | `text-xs text-[#9CA3AF]` |
| Mono | `font-mono text-sm text-[#111827]` |

Use mono for: API keys, IDs, endpoint URLs, code snippets, tokens.

---

## Layout

### Shell structure
```
┌──────────────────────────────────────────────────┐
│  Sidebar 240px (fixed)  │  Main content area      │
│                         │                         │
│  Logo                   │  Page header            │
│  Nav items              │  ───────────────────    │
│  ─────────────────      │  Page content           │
│  User info              │                         │
│  Plan badge             │                         │
│  ─────────────────      │                         │
│  Usage widget           │                         │
└──────────────────────────────────────────────────┘
```

### Sidebar rules
- Width: 240px fixed, full height, position fixed left
- bg-[#F8F9FA], border-r border-[#E5E7EB]
- Tablet: icon-only collapsed mode (64px wide)
- Mobile: slide-in drawer, overlay bg-black/40

### Main content rules
- margin-left: 240px on desktop
- padding: p-8
- bg-white
- No max-width constraint — fills available space

### Page header — use this pattern on every page
```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-xl font-semibold text-[#111827] tracking-tight">
      {title}
    </h1>
    <p className="text-sm text-[#6B7280] mt-0.5">{description}</p>
  </div>
  <div>{/* primary CTA for this page */}</div>
</div>
```

### Public pages (login, signup, auth/callback)
No sidebar. Centered layout. bg-[#F8F9FA] full page.

---

## File structure
```
apps/portal/
  app/
    (auth)/
      login/
        page.tsx
      signup/
        page.tsx
      callback/
        page.tsx
    (portal)/
      layout.tsx          ← shell with sidebar, requires auth
      dashboard/
        page.tsx
      instances/
        page.tsx
        [id]/
          page.tsx
      api-keys/
        page.tsx
      messages/
        page.tsx
        [id]/
          page.tsx
      webhooks/
        page.tsx
      billing/
        page.tsx
      campaigns/
        page.tsx
        [id]/
          page.tsx
      contacts/
        page.tsx
      templates/
        page.tsx
      statuses/
        page.tsx
  components/
    layout/
      Sidebar.tsx
      SidebarNavItem.tsx
      PageHeader.tsx
      MobileDrawer.tsx
    ui/
      Button.tsx
      Card.tsx
      Badge.tsx
      Input.tsx
      Modal.tsx
      Table.tsx
      TableRow.tsx
      EmptyState.tsx
      Skeleton.tsx
      QuotaBar.tsx
      CodeSnippet.tsx
      Toast.tsx           ← wraps sonner
    forms/
      LoginForm.tsx
      SignupForm.tsx
      CreateInstanceForm.tsx
      CreateApiKeyForm.tsx
      SendMessageForm.tsx
      CreateWebhookForm.tsx
      CreateContactForm.tsx
      CreateTemplateForm.tsx
      CreateCampaignForm.tsx
      PublishStatusForm.tsx
  hooks/
    useAuth.ts
    useInstances.ts
    useApiKeys.ts
    useMessages.ts
    useCampaigns.ts
    useWebhooks.ts
    useContacts.ts
    useTemplates.ts
    useBilling.ts
    useStatuses.ts
  lib/
    auth.ts               ← token read/write/clear from localStorage
    animations.ts         ← portal Framer Motion variants
  types/
    ← local types if not yet in @usesendnow/types
```

---

## Component rules

### Button — exact implementation
```tsx
// variants
primary:   "bg-[#25D366] text-white hover:bg-[#1EBF5A]"
secondary: "bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F8F9FA]"
danger:    "bg-[#EF4444] text-white hover:bg-[#DC2626]"
ghost:     "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FA]"

// base classes always applied
"px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150
 disabled:opacity-50 disabled:cursor-not-allowed"
```
No Hard Shadow. No box-shadow. That's the landing, not the portal.

### Card
```tsx
"bg-white border border-[#E5E7EB] rounded-xl p-6"
```
No shadow by default.
Interactive card: add `hover:border-[#25D366] cursor-pointer transition-colors`

### Input
```tsx
"w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm text-[#111827]
 placeholder:text-[#9CA3AF]
 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent
 transition-all duration-150"
```

### Badge
```tsx
const variants = {
  success: "bg-[#F0FDF4] text-[#15803D]",
  error:   "bg-[#FEF2F2] text-[#DC2626]",
  warning: "bg-[#FFFBEB] text-[#B45309]",
  neutral: "bg-[#F3F4F6] text-[#6B7280]",
}
// base: "text-xs font-medium px-2.5 py-0.5 rounded-full"
```

### Table
```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-[#E5E7EB]">
      <th className="text-left text-xs font-medium text-[#6B7280]
                     uppercase tracking-wide pb-3 pr-4">
```
Row hover: `hover:bg-[#F0FDF4]` if row is clickable
Alternating rows: `even:bg-[#F8F9FA]`

### EmptyState
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <HugeIcon className="w-10 h-10 text-[#9CA3AF] mb-4" />
  <p className="text-sm font-medium text-[#111827]">{title}</p>
  <p className="text-sm text-[#6B7280] mt-1 mb-4">{description}</p>
  {cta && <Button variant="primary">{cta}</Button>}
</div>
```

### Skeleton
```tsx
// inline usage
<div className="h-4 w-32 bg-[#F3F4F6] rounded animate-pulse" />
<div className="h-4 w-full bg-[#F3F4F6] rounded animate-pulse" />
```
Always show skeleton while loading. Never show spinner for page-level loads.
Spinner acceptable only for button loading states (inline, small).

### Modal
```tsx
// overlay
"fixed inset-0 bg-black/40 backdrop-blur-sm z-50
 flex items-center justify-center p-4"

// panel
"bg-white rounded-2xl p-6 shadow-xl w-full max-w-md"
```
Every modal has: title + optional description + content + action buttons.
Destructive confirm modal: always requires explicit text confirmation
or a clearly labelled danger button.

### QuotaBar
```tsx
// usage bar for billing and sidebar widget
<div className="w-full bg-[#F3F4F6] rounded-full h-1.5">
  <div
    className="h-1.5 rounded-full transition-all"
    style={{
      width: `${percent}%`,
      backgroundColor: percent >= 90 ? "#EF4444"
                     : percent >= 70 ? "#F59E0B"
                     : "#25D366"
    }}
  />
</div>
```

### CodeSnippet
```tsx
// for API keys, IDs, endpoints, token display
"font-mono text-sm bg-[#F8F9FA] border border-[#E5E7EB]
 rounded-lg px-3 py-2 text-[#111827] select-all"
```
Always include a copy-to-clipboard button alongside.

### Toast
Use `sonner`. Configure once in the portal layout:
```tsx
import { Toaster } from "sonner"
<Toaster position="bottom-right" richColors />
```
Call via:
```tsx
import { toast } from "sonner"
toast.success("Clé API créée")
toast.error("Erreur lors de la création")
```

---

## Auth rules

### Token management — lib/auth.ts
```ts
const TOKEN_KEY = "usn_token"

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
export const isAuthenticated = () => !!getToken()
```

### Protected routes
The `(portal)/layout.tsx` checks for token on mount.
If no token → redirect to /login immediately.
No flash of protected content.

### Request header
Every API call in `@usesendnow/api-client` must attach:
```ts
headers: {
  "Authorization": `Bearer ${getToken()}`,
  "Content-Type": "application/json"
}
```

### Google OAuth callback — /auth/callback
```ts
// on mount
const token = new URLSearchParams(window.location.search).get("token")
if (token) {
  setToken(token)
  router.replace("/dashboard")
} else {
  router.replace("/login?error=oauth_failed")
}
```

---

## Data fetching rules

All data fetching lives in hooks under `hooks/`.
Never fetch inside a component or a page directly.

### Hook pattern — follow this exactly
```ts
export function useInstances() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstances = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.instances.list()
      setInstances(data.instances)
    } catch (err) {
      setError("Impossible de charger les instances")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInstances() }, [])

  return { instances, loading, error, refetch: fetchInstances }
}
```

Every hook exposes: `{ data, loading, error, refetch }` at minimum.
Mutation hooks also expose: `{ mutate, loading, error }`.

---

## Error handling rules

### API error codes → user messages (French)
```ts
const ERROR_MESSAGES: Record<string, string> = {
  MAX_INSTANCES_REACHED:           "Limite d'instances atteinte pour votre plan.",
  API_KEYS_NOT_AVAILABLE_ON_PLAN:  "Les clés API ne sont pas disponibles sur le plan gratuit.",
  MAX_API_KEYS_REACHED:            "Limite de clés API atteinte pour votre plan.",
  WEBHOOKS_NOT_AVAILABLE_ON_PLAN:  "Les webhooks ne sont pas disponibles sur votre plan.",
  MAX_WEBHOOK_ENDPOINTS_REACHED:   "Limite d'endpoints webhook atteinte.",
  CAMPAIGNS_NOT_AVAILABLE_ON_PLAN: "Les campagnes ne sont pas disponibles sur votre plan.",
  STATUSES_NOT_AVAILABLE_ON_PLAN:  "Les statuts ne sont pas disponibles sur votre plan.",
  MONTHLY_OUTBOUND_QUOTA_EXCEEDED: "Quota mensuel d'envoi atteint.",
  MONTHLY_API_REQUEST_QUOTA_EXCEEDED: "Quota mensuel de requêtes API atteint.",
  SUBSCRIPTION_INACTIVE:           "Votre abonnement est inactif.",
  UNAUTHORIZED:                    "Session expirée. Veuillez vous reconnecter.",
  FORBIDDEN:                       "Vous n'avez pas accès à cette ressource.",
  NOT_FOUND:                       "Ressource introuvable.",
  VALIDATION_ERROR:                "Données invalides. Vérifiez le formulaire.",
}

export const getErrorMessage = (code: string): string =>
  ERROR_MESSAGES[code] ?? "Une erreur est survenue. Réessayez."
```

On 401 UNAUTHORIZED → clear token + redirect to /login.
On plan restriction errors (403) → show upgrade prompt, not just an error.

---

## Animations — portal

Framer Motion — subtle and fast.
Data must appear fast. Animation never delays information.
```ts
// lib/animations.ts — portal variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
}

export const slideUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
}

export const modalScale = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: "easeOut" } }
}
```

| Element | Animation | Notes |
|---|---|---|
| Page mount | fadeIn 0.2s | on every page |
| Modal open | modalScale 0.15s | always |
| Empty state | slideUp 0.2s | |
| Toast | slide from right | handled by sonner |
| Sidebar item hover | bg transition 0.1s | CSS transition ok here |
| Skeleton→content | fadeIn 0.2s | |

No stagger on tables or lists.
No animation on quota bars — they render at final value immediately.

---

## Plan restriction UX pattern

When a feature is blocked by plan, never just show an error toast.
Show an inline upgrade prompt on the page:
```tsx
<div className="flex items-center gap-3 p-4 bg-[#F0FDF4]
                border border-[#25D366]/30 rounded-xl">
  <InfoIcon className="w-5 h-5 text-[#25D366] shrink-0" />
  <div>
    <p className="text-sm font-medium text-[#111827]">
      Fonctionnalité non disponible sur votre plan
    </p>
    <p className="text-sm text-[#6B7280]">
      Passez au plan Starter pour accéder aux {featureName}.
    </p>
  </div>
  <Button variant="primary" size="sm" href="/billing">
    Upgrader
  </Button>
</div>
```

---

## Icons

Primary: HugeIcons (`hugeicons-react`)
Secondary: Heroicons (`@heroicons/react`) — only if HugeIcons doesn't have it

Icon sizing convention:
```
navigation icons  → w-5 h-5
page/section icons → w-6 h-6
empty state icons  → w-10 h-10
inline/badge icons → w-4 h-4
```

---

## Sidebar navigation items
```ts
const NAV_ITEMS = [
  { label: "Tableau de bord", href: "/dashboard",  icon: HomeIcon },
  { label: "Instances",       href: "/instances",   icon: DeviceIcon },
  { label: "Messages",        href: "/messages",    icon: MessageIcon },
  { label: "Campagnes",       href: "/campaigns",   icon: MegaphoneIcon },
  { label: "Statuts",         href: "/statuses",    icon: CircleIcon },
  { label: "Contacts",        href: "/contacts",    icon: ContactIcon },
  { label: "Templates",       href: "/templates",   icon: FileIcon },
  { label: "Webhooks",        href: "/webhooks",    icon: WebhookIcon },
  // divider
  { label: "Clés API",        href: "/api-keys",    icon: KeyIcon },
  // divider
  { label: "Abonnement",      href: "/billing",     icon: CreditCardIcon },
]
```

Active state: `bg-[#F0FDF4] text-[#15803D] font-medium`
Inactive state: `text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111827]`

---

## What NOT to do in this app

- No dark mode — ever
- No colors outside the palette
- No Poppins — Geist only
- No Hard Shadow buttons — that's the landing
- No decorative images or illustrations
- No raw fetch — everything through @usesendnow/api-client
- No business logic in components — hooks only
- No JWT token hardcoded anywhere
- No console.log in committed code
- No page implementation without a spec in specs/portal/
- No spinner for page-level loading — skeleton only
- No toast for plan restriction errors — inline upgrade prompt instead
- No English copy — all UI text in French
