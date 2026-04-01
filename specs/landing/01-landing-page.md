# SPEC — Landing Page
App: landing
Status: ready
URL: usesendnow.com
Language: French

---

## What this is

The public marketing landing page for UseSendNow.
Goal: convert visitors into signups or API trial users.
Primary CTA: "Commencer gratuitement" → app.usesendnow.com/signup
Secondary CTA: "Voir la documentation" → docs.usesendnow.com

---

## Visual Universe — Neo-Brutalist Creator

### Design Philosophy
"Chantier propre" — bold, structured, functional.
High contrast. Geometric. Dark mode. Punchy green accents.

### Colors
| Token | Value | Usage |
|---|---|---|
| bg-primary | #0B0E11 | Page background |
| accent | #25D366 | CTA, borders, highlights, diagram |
| text-primary | #F0F0F0 | Body text |
| text-heading | #FFFFFF | Headlines |
| black | #000000 | Shadows, borders |

### Typography
- Headlines: Geist Sans — font-bold, letter-spacing: -0.03em, text-white
- Body: Poppins — font-normal, text-[#F0F0F0]
- No other font families

### Key Component Signatures

**Hard Shadow Button (CTA)**
```
bg-[#25D366] text-black font-bold
box-shadow: 4px 4px 0px #000000
border: 2px solid #000000
hover: translate-x-[2px] translate-y-[2px] shadow-none (Framer Motion)
```

**Navbar**
```
position: fixed, top-0, w-full
backdrop-filter: blur(10px)
background: rgba(11,14,17,0.8)
border-bottom: 1px solid rgba(255,255,255,0.08)
height: 60px
```

**Bento Card**
```
border: 2px solid rgba(255,255,255,0.08)
border-radius: 16px or 0px (alternating — some sharp, some rounded)
background: rgba(255,255,255,0.03)
hover: border-color → #25D366 (Framer Motion)
```

**Central Pill Diagram**
```
shape: rounded-full (very large oblong)
border: 2px solid #000000
background: #25D366
color: #000000 font-bold
SVG arrows: minimal, black, 1.5px stroke
```

---

## Page Structure

### 0. NAVBAR

**Layout:** fixed top, full width, blur background
**Left:** Logo — "UseSendNow" in Geist Bold + green dot accent
**Center (desktop):** navigation links
**Right:** two buttons

**Nav links:**
- Fonctionnalités
- Tarifs
- Documentation
- API

**Right buttons:**
- "Se connecter" — ghost, text-white, border border-white/20
- "Commencer" — Hard Shadow CTA button (green)

**Mobile:** hamburger menu, full screen overlay, same links stacked

---

### 1. HERO SECTION

**Layout:** full viewport height, centered flex col, padding-top 120px

**Above headline pill badge:**
```
"✦ Propulsé par Evolution API v2"
style: small pill, border border-[#25D366]/40, text-[#25D366], text-sm
```

**Headline (H1):**
```
L'infrastructure WhatsApp
pour vos produits et
vos automatisations.
```
- Geist Bold, text-5xl md:text-7xl, text-white, letter-spacing -0.03em
- Line 3 "vos automatisations." has color #25D366

**Subheadline:**
```
Connectez vos applications WhatsApp en quelques minutes.
Envoyez des messages, planifiez des campagnes, recevez des
webhooks — via une API propre et documentée.
```
- Poppins, text-lg md:text-xl, text-[#F0F0F0]/70, max-w-2xl, centered

**CTA row:**
- Primary: "Commencer gratuitement →" — Hard Shadow green button, large
- Secondary: "Lire la documentation" — ghost button, text-white, underline on hover

**Social proof line below CTAs:**
```
"Aucune carte bancaire requise · Plan gratuit disponible · API prête en 5 minutes"
```
- Poppins text-sm, text-white/40, centered

**Hero visual below (Central Pill Diagram):**
Large SVG/div illustration showing the flow:
```
[Votre App] ──→ (( UseSendNow API )) ──→ [WhatsApp]
                        ↑
               [Webhooks & Événements]
```
- Central pill: rounded-full, bg-[#25D366], border-2 border-black
- Text inside pill: "UseSendNow API" in Geist Bold black
- Side nodes: dark cards with white text
- Arrows: minimal SVG, black stroke 1.5px
- Framer Motion: nodes fade in sequentially on mount

---

### 2. LOGOS / SOCIAL PROOF BAR

**Headline:**
```
Conçu pour s'intégrer partout
```
- Poppins text-sm text-white/40, uppercase, letter-spacing wide, centered

**Content:** horizontal scrolling row of integration logos/names:
- Make (Integromat)
- n8n
- Zapier
- WordPress
- Shopify
- Node.js
- Python
- REST API

Style: grayscale, opacity-40, hover opacity-100 transition
Framer Motion: marquee auto-scroll infinite

---

### 3. FEATURES — BENTO GRID

**Section headline:**
```
Tout ce dont vous avez besoin.
Rien de superflu.
```
- Geist Bold, text-4xl md:text-5xl, text-white, centered

**Section subheadline:**
```
UseSendNow est une plateforme API-first. Chaque fonctionnalité
est accessible via API ou depuis votre tableau de bord.
```
- Poppins, text-white/60, centered

**Bento Grid layout:** asymmetric grid, 12 columns
Mix of wide cards (col-span-7) and narrow cards (col-span-5), alternating

**Card 1 — Wide — Messagerie complète**
```
Titre: "8 types de messages supportés"
Body: "Texte, image, vidéo, audio, note vocale, document,
localisation, carte contact. Envoyez via API avec un seul endpoint."
Visual: row of 8 pill badges, each with icon + label, bg-white/5
Border-radius: 0px (sharp corners — Neo-Brutalist contrast)
Accent border-left: 4px solid #25D366
```

**Card 2 — Narrow — Planification**
```
Titre: "Planification intelligente"
Body: "Définissez un scheduledAt et le message part exactement
au bon moment. Géré par BullMQ avec retry automatique."
Visual: small timeline SVG — dot at now, dot at scheduled time, green line between
Border-radius: 24px (rounded)
```

**Card 3 — Narrow — Campagnes**
```
Titre: "Campagnes en masse"
Body: "Ciblez tous vos contacts ou filtrez par tags.
Chaque destinataire reçoit un job individuel avec retry."
Visual: progress bar component, green fill, showing 847/1000 envois
Border-radius: 0px
```

**Card 4 — Wide — Webhooks**
```
Titre: "Webhooks temps réel"
Body: "Recevez les événements de livraison, lecture et réponse
directement sur votre endpoint. Signés HMAC-SHA256."
Visual: fake terminal/code block showing webhook payload JSON:
{
  "event": "message.delivered",
  "messageId": "msg_abc123",
  "to": "+22901000000",
  "timestamp": "2026-03-27T10:00:00Z"
}
style: bg-black, text-[#25D366], font-mono text-sm, rounded-lg
Border-radius: 16px
```

**Card 5 — Full width — API Keys & Sécurité**
```
Titre: "Clés API. Contrôle total."
Body: "Générez jusqu'à 10 clés selon votre plan. Format usn_live_xxxx.
Révocation instantanée. Hash SHA-256 en base — la clé brute n'est jamais stockée."
Visual: fake API key display:
  usn_live_a3f9●●●●●●●●●●●●●●●●  [Copier] [Révoquer]
Border-radius: 16px
bg slightly lighter than page: #111418
```

**Card 6 — Narrow — Statuts WhatsApp**
```
Titre: "Publiez des statuts"
Body: "Texte ou image. Les statuts comptent dans votre quota
d'envoi mensuel."
Visual: phone mockup outline with green status bar (SVG, minimal)
Border-radius: 24px
```

**Card 7 — Narrow — Multi-instances**
```
Titre: "Plusieurs comptes WhatsApp"
Body: "Jusqu'à 20 instances selon votre plan. Chaque instance
a son propre lifecycle et son état de connexion."
Visual: 3 stacked instance cards with green/grey status dots
Border-radius: 0px
```

---

### 4. HOW IT WORKS

**Section headline:**
```
En production en moins de 10 minutes.
```
- Geist Bold, text-4xl, text-white

**3 steps — horizontal on desktop, vertical on mobile**

**Step 1:**
```
Badge: "01"  (Geist Bold, text-[#25D366], text-6xl, opacity-20 behind)
Titre: "Créez votre compte"
Body: "Inscrivez-vous, choisissez votre plan, accédez immédiatement
à votre tableau de bord."
```

**Step 2:**
```
Badge: "02"
Titre: "Connectez WhatsApp"
Body: "Scannez un QR code ou entrez un code de couplage.
Votre instance est en ligne en 30 secondes."
```

**Step 3:**
```
Badge: "03"
Titre: "Appelez l'API"
Body: "Générez une clé API et envoyez votre premier message.
Un seul endpoint, une documentation claire."
```

**Code block below steps:**
```json
POST https://api.usesendnow.com/api/v1/messages/send
x-api-key: usn_live_xxxxxxxxxxxx

{
  "instanceId": "inst_abc123",
  "to": "+22901000000",
  "type": "text",
  "text": { "body": "Bonjour 👋 depuis UseSendNow !" }
}
```
Style: bg-black, rounded-xl, border border-white/10, font-mono text-sm
Syntax highlighting: keys in white/60, values in #25D366, strings in white

Framer Motion: code block slides up on scroll enter

---

### 5. PRICING

**Section headline:**
```
Simple. Transparent. Sans surprise.
```
- Geist Bold, text-4xl, text-white, centered

**Section subheadline:**
```
Commencez gratuitement. Passez à l'échelle quand vous êtes prêt.
Conversion fixe : 1 EUR = 800 FCFA.
```

**Toggle:** Mensuel (default) — no annual option in v1

**4 pricing cards — horizontal row on desktop**

**Card: Gratuit**
```
Prix: 0 FCFA / mois
Badge: none
Limites:
  - 1 instance WhatsApp
  - 20 messages / mois
  - 1 000 requêtes API / mois
  - Pas de clé API
  - Pas de campagnes
  - Pas de statuts
CTA: "Commencer gratuitement" — ghost button, border white/20
Style: border border-white/10, rounded-2xl
```

**Card: Starter**
```
Prix: 7 200 FCFA / mois  (9 EUR)
Badge: none
Limites:
  - 1 instance WhatsApp
  - 5 000 messages / mois
  - 20 000 requêtes API / mois
  - 3 clés API
  - Campagnes ✓
  - Statuts ✓
CTA: "Choisir Starter" — ghost button
Style: border border-white/10, rounded-2xl
```

**Card: Pro — FEATURED**
```
Prix: 15 200 FCFA / mois  (19 EUR)
Badge: "Le plus populaire" — pill bg-[#25D366] text-black text-xs font-bold
Limites:
  - 5 instances WhatsApp
  - 25 000 messages / mois
  - 100 000 requêtes API / mois
  - 5 clés API
  - Campagnes ✓
  - Statuts ✓
CTA: "Choisir Pro" — Hard Shadow green button
Style: border-2 border-[#25D366], rounded-2xl, slightly elevated (scale-105)
```

**Card: Plus**
```
Prix: 31 200 FCFA / mois  (39 EUR)
Badge: none
Limites:
  - 20 instances WhatsApp
  - 150 000 messages / mois
  - 500 000 requêtes API / mois
  - 10 clés API
  - Campagnes ✓
  - Statuts ✓
CTA: "Choisir Plus" — ghost button
Style: border border-white/10, rounded-2xl
```

**Below cards:**
```
"Vous avez des besoins spécifiques ? Contactez-nous pour un plan sur mesure."
```
- Poppins text-sm text-white/40, centered, with mailto link

---

### 6. FAQ

**Section headline:**
```
Questions fréquentes
```
- Geist Bold, text-4xl, text-white

**Accordion component — 8 items**
Style: each item has border-bottom border-white/10, expands with Framer Motion
```
Q: Qu'est-ce qu'une instance WhatsApp ?
R: Une instance correspond à un numéro WhatsApp connecté à la plateforme.
Vous pouvez en connecter plusieurs selon votre plan (1 à 20).

Q: Puis-je tester la plateforme gratuitement ?
R: Oui. Le plan Gratuit vous donne accès à 1 instance, 20 messages
et 1 000 requêtes API par mois — sans carte bancaire.

Q: Comment fonctionne la planification des messages ?
R: Vous passez un champ scheduledAt (ISO 8601) dans votre requête API.
Le message est mis en file d'attente et envoyé exactement à l'heure indiquée.

Q: Les statuts WhatsApp comptent-ils dans mon quota ?
R: Oui. Les statuts et les messages partagent le même quota d'envoi mensuel.

Q: Que se passe-t-il si j'atteins mon quota ?
R: Les envois sont bloqués jusqu'à la fin du mois. Aucun dépassement
n'est facturé en v1. Vous pouvez upgrader votre plan à tout moment.

Q: Comment sont sécurisées mes clés API ?
R: Seul le hash SHA-256 de votre clé est stocké en base. La clé brute
vous est montrée une seule fois à la création et n'est jamais récupérable.

Q: Puis-je recevoir des événements en temps réel ?
R: Oui. Enregistrez un endpoint webhook depuis votre tableau de bord.
Chaque événement est signé HMAC-SHA256 pour que vous puissiez vérifier
l'authenticité de la requête.

Q: Quels outils no-code sont compatibles ?
R: Tout outil supportant les requêtes HTTP fonctionne avec UseSendNow :
Make, n8n, Zapier, Bubble, et tout autre outil avec un module HTTP natif.
```

---

### 7. FINAL CTA SECTION

**Layout:** full-width section, bg slightly lighter (#111418), large padding

**Headline:**
```
Prêt à connecter WhatsApp
à vos produits ?
```
- Geist Bold, text-5xl, text-white, centered
- "WhatsApp" in #25D366

**Subheadline:**
```
Rejoignez les makers et développeurs qui automatisent
leurs communications avec UseSendNow.
```
- Poppins, text-white/60, centered

**CTA row:**
- Primary: "Commencer gratuitement →" — Hard Shadow green button, large
- Secondary: "Lire la documentation" — ghost

**Below:** same social proof line as hero
```
"Aucune carte bancaire requise · Plan gratuit disponible · API prête en 5 minutes"
```

---

### 8. FOOTER

**Layout:** 4 columns on desktop, stacked on mobile
**Top border:** 1px solid white/10

**Column 1 — Brand**
```
Logo: "UseSendNow" Geist Bold + green dot
Tagline: "L'infrastructure WhatsApp pour vos produits."
Poppins text-sm text-white/40
```

**Column 2 — Produit**
```
Fonctionnalités
Tarifs
Documentation
Changelog
```

**Column 3 — Développeurs**
```
API Reference
Webhooks
SDKs
Status
```

**Column 4 — Entreprise**
```
À propos
Contact
Conditions d'utilisation
Politique de confidentialité
```

**Bottom bar:**
```
"© 2026 UseSendNow. Tous droits réservés."    |    "Fait avec ✦ en Afrique de l'Ouest"
```
- Poppins text-xs text-white/30
- Both on same row, space-between

---

## Animations (Framer Motion)

| Element | Animation |
|---|---|
| Hero headline | Words fade + slide up, staggered 0.1s |
| Hero pill badge | Fade in, scale from 0.9, delay 0.2s |
| CTA buttons | Fade in delay 0.5s |
| Hero diagram | Nodes appear sequentially, 0.15s stagger |
| Logos bar | Auto-scroll marquee, infinite |
| Bento cards | Fade + slide up on scroll enter, stagger 0.08s |
| How it works steps | Slide in from left, stagger 0.15s |
| Code block | Slide up on scroll enter |
| Pricing cards | Fade + scale from 0.97 on scroll enter |
| FAQ accordion | Height expand, opacity fade, spring easing |
| Final CTA | Fade + slide up on scroll enter |
| Hard Shadow buttons | On hover: translate(2px,2px) + shadow-none |
| Bento cards | On hover: border-color → #25D366 |

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| mobile (< 768px) | Single column, stacked sections, hamburger nav |
| tablet (768–1024px) | 2-column bento, 2-column pricing |
| desktop (> 1024px) | Full layout as described above |

---

## SEO

**Title:** `UseSendNow — API WhatsApp pour makers et développeurs`
**Description:** `Envoyez des messages, planifiez des campagnes et recevez des webhooks WhatsApp via une API propre. Commencez gratuitement.`
**OG image:** dark card, green logo, tagline (to be designed separately)
**Lang:** fr

---

## Files to create
```
apps/landing/
  app/
    layout.tsx          ← fonts, metadata, global styles
    page.tsx            ← assembles all sections
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
      Button.tsx        ← Hard Shadow CTA + ghost variants
      BentoCard.tsx     ← reusable bento card wrapper
      Badge.tsx         ← pill badge component
      CodeBlock.tsx     ← syntax-highlighted code display
      AccordionItem.tsx ← FAQ accordion row
```

---

## Out of scope for v1

- Blog
- Live chat widget
- Testimonials / case studies (no users yet)
- Video demo embed
- Annual/monthly pricing toggle
- Cookie consent banner (add later)
