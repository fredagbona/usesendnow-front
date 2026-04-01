# AGENTS.md — Landing App
App: landing
URL: usesendnow.com

Read the root AGENTS.md first. All global rules apply.
This file adds landing-specific rules only.

---

## Purpose

This app is the public marketing landing page for UseSendNow.
It is a static/SSG Next.js app — no authentication, no API calls at runtime.
Goal: convert visitors into signups. Every decision serves that goal.

---

## Spec to implement

`specs/landing/01-landing-page.md`
Read it completely before writing any code.

---

## Design Universe

Neo-Brutalist Creator. Light mode. No dark mode. No toggle.
When in doubt on a design decision — go bolder, not safer.

### Colors — use only these
```
bg-white              → page background
bg-[#F5F7FA]          → elevated surfaces (FinalCTA, BentoCard elevated)
bg-black/2            → default bento card background
text-[#0B0E11]        → headlines
text-[#3D4450]        → body text
text-[#25D366]        → accent, CTA, highlights
border-[#25D366]      → active borders
black/8–10            → default borders
#000000               → shadows only
bg-[#1A1D23]          → code block backgrounds (dark contrast, always)
```
Never introduce new colors outside this palette.

### Icons — HugeIcons only
Use `hugeicons-react` for all icons. No emojis, no other icon libraries.
Import example:
```tsx
import { ArrowRight01Icon, Tick01Icon, Cancel01Icon } from "hugeicons-react"
```
Common icon reference:
| Purpose         | Icon                  |
|---|---|
| Arrow right     | `ArrowRight01Icon`    |
| Checkmark       | `Tick01Icon`          |
| Close / X       | `Cancel01Icon`        |
| Add / Plus      | `Add01Icon`           |
| Stars / sparkle | `StarsIcon`           |
| Chat message    | `BubbleChatIcon`      |
| Image           | `Image01Icon`         |
| Video           | `Video01Icon`         |
| Audio           | `MusicNote01Icon`     |
| Microphone      | `Mic01Icon`           |
| File            | `File01Icon`          |
| Location        | `Location01Icon`      |
| Contact         | `Contact01Icon`       |

### Typography — strict rules
```
font-(family-name:--font-geist-sans)  → all headlines, nav logo, badges, step numbers
font-(family-name:--font-poppins)     → all body text, subheadlines, labels, footer
```

Headlines: always font-bold, tracking-tight (letter-spacing: -0.03em)
Body: font-normal, leading-relaxed
Never use Geist for body. Never use Poppins for headlines.

### Tailwind class conventions
Always use canonical Tailwind v4 class names:
- `bg-black/2` not `bg-black/[0.02]`
- `border-l-4` not `border-l-[4px]`
- `h-15` not `h-[60px]`
- `pt-30` not `pt-[120px]`
- `top-15` not `top-[60px]`
- `max-w-65` not `max-w-[260px]`
- `bg-linear-to-r` not `bg-gradient-to-r`
- `font-(family-name:--font-geist-sans)` not `font-[family-name:var(--font-geist-sans)]`
- `shrink-0` not `flex-shrink-0`

### Hard Shadow Button — exact implementation
```tsx
// Primary CTA
variant="cta" → bg-[#25D366] text-black font-bold border-2 border-black
                style={{ boxShadow: "4px 4px 0px #000000" }}
                whileHover: { x: 2, y: 2, boxShadow: "none" }

// Ghost button
variant="ghost" → text-[#0B0E11] border border-black/20
                  hover:border-black/40
```
Wrap hover state in Framer Motion `whileHover` — not pure CSS.

### Bento Card — exact implementation
```tsx
// Sharp variant (Neo-Brutalist)
rounded="sharp" → border-2 border-black/[0.07] rounded-none bg-black/2 p-6

// Rounded variant
rounded="rounded" → border-2 border-black/[0.07] rounded-2xl bg-black/2 p-6

// Elevated variant (lighter bg)
elevated={true} → bg-[#F5F7FA]

// Hover on all variants (Framer Motion whileHover)
borderColor: "#25D366"
transition: { duration: 0.2 }
```
Alternate between sharp and rounded — never two sharp or two rounded side by side.

---

## Animations

Use Framer Motion for everything. No CSS keyframes.
Import pattern:
```tsx
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
```

### Standard variants — define once in lib/animations.ts, reuse everywhere
```ts
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }
}
```

### Animation timing reference
| Element | Variant | Delay |
|---|---|---|
| Hero badge | fadeIn | 0s |
| Hero headline words | fadeUp staggered | 0.1s per word |
| Hero subheadline | fadeUp | 0.3s |
| Hero CTAs | fadeIn | 0.5s |
| Hero diagram nodes | fadeIn staggered | 0.15s per node |
| Section headlines | fadeUp | on scroll |
| Bento cards | fadeUp staggered | 0.08s per card |
| Steps | slideLeft staggered | 0.15s per step |
| Pricing cards | scaleIn staggered | 0.1s per card |
| FAQ rows | height expand | spring |
| Buttons | translate + shadow | whileHover 150ms |

Keep animations subtle. Duration never exceeds 0.5s.
Never animate color — only opacity, transform, scale.

---

## Component Rules

### Section wrapper pattern
Every section component uses this exact wrapper:
```tsx
<section className="w-full px-4 md:px-8 lg:px-16 py-24">
  <div className="max-w-7xl mx-auto">
    {/* content */}
  </div>
</section>
```
Never put max-width directly on the section tag.

### Section headline pattern
```tsx
<div className="flex flex-col items-center text-center gap-4 mb-16">
  <h2 className="font-(family-name:--font-geist-sans) font-bold text-4xl md:text-5xl text-[#0B0E11] tracking-[-0.03em]">
    {title}
  </h2>
  <p className="font-(family-name:--font-poppins) text-lg text-[#3D4450]/60 max-w-2xl">
    {subtitle}
  </p>
</div>
```

### No hardcoded copy in JSX
All text content lives in a `content` object or array at the top of
the component file, above the component function.
This makes copy updates easy without touching JSX.
```tsx
// ✅ correct
const FAQS = [
  { q: "Qu'est-ce qu'une instance ?", a: "Une instance correspond à..." },
]

// ❌ wrong — copy buried in JSX
<p>Qu'est-ce qu'une instance ?</p>
```

### Props interfaces
Every component has an explicit props interface even if it has no props:
```tsx
interface HeroSectionProps {}
export function HeroSection({}: HeroSectionProps) {
```

---

## File Structure
```
apps/landing/
  app/
    layout.tsx            ← fonts, metadata, light bg, global html attrs
    page.tsx              ← imports and orders all sections, no logic
  components/
    sections/
      Navbar.tsx
      HeroSection.tsx
      LogosBar.tsx
      FeaturesGrid.tsx
      HowItWorks.tsx
      Pricing.tsx
      FAQ.tsx
      FinalCTA.tsx
      Footer.tsx
    ui/
      Button.tsx          ← variant="cta" | variant="ghost"
      BentoCard.tsx       ← rounded="sharp" | "rounded" | "large", elevated prop
      Badge.tsx           ← variant="accent" | "featured"
      CodeBlock.tsx       ← mono code display with green syntax, always dark bg
      AccordionItem.tsx   ← single FAQ row, animated
  lib/
    animations.ts         ← all Framer Motion variants (defined once)
```

page.tsx must only contain:
```tsx
import { Navbar } from "@/components/sections/Navbar"
// ... other imports
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogosBar />
        <FeaturesGrid />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
```
No logic, no state, no hooks in page.tsx.

---

## Fonts Setup

In app/layout.tsx:
```tsx
import { Geist, Geist_Mono, Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
})

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${poppins.variable}`}>
      <body className="bg-white text-[#3D4450] antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

## What NOT to do in this app

- No authentication logic — this is a public static page
- No API calls at runtime — all content is hardcoded from the spec
- No dark mode — light only, no theme toggle
- No new colors outside the defined palette
- No emojis — use HugeIcons (`hugeicons-react`) for all icons
- No other icon libraries (no Heroicons, no Lucide in this app)
- No CSS files — Tailwind only
- No useEffect for animations — use Framer Motion + useInView
- No images from external URLs — use SVG or local assets only
- No placeholder lorem ipsum — use the French copy from the spec exactly
- No extra sections not listed in the spec
- No third-party UI component libraries (no shadcn, no radix in this app)
  — build from scratch to match the Neo-Brutalist design exactly
