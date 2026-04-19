Spec — Frontend Onboarding Page

This document defines the interactive onboarding page for the UseSendNow frontend.

The onboarding page is a dedicated product experience designed to:

* guide new users step by step,
* explain technical concepts in context,
* reduce first-day confusion,
* accelerate time-to-first-value,
* and reduce early churn.

This is a frontend-oriented spec, but it also references the backend data and actions the page depends on.

It should be read together with:

* PROJECT_BRIEF — UseSendNow Platform
* specs/auth-api-keys.md
* specs/instances.md
* specs/messages.md
* specs/campaigns.md
* specs/webhooks.md
* specs/usage-billing.md
* specs/announcements-banners-changelog.md

⸻

1. Goal

The goal of this page is to help a newly signed-up user understand the product and complete the first essential actions needed to become successful.

Success in this context means the user should quickly understand:

* what an instance is,
* what an API key is,
* what a webhook is,
* how sending works,
* how campaigns work,
* and what action they should take next.

This page is not meant to be a generic product tour.
It is a dedicated onboarding flow with education, UI previews, and clear actions.

⸻

2. Product Intent

UseSendNow is an API-first platform, but the onboarding page exists because users still need a human-friendly entry point.

Many of the core concepts are technical:

* instance
* API key
* webhook
* campaign
* public API

If these concepts are presented only through docs, many users will drop before understanding the value.

The onboarding page solves that by explaining the right concept at the right time and connecting each concept to a concrete user action.

⸻

3. Format

Form

A dedicated full-page onboarding experience.

Style

An interactive, guided checklist with contextual explanations and animated UI previews.

Important rule

This should not be implemented as:

* a simple modal,
* a tooltip-only tour,
* a static FAQ page.

It must feel like a guided product experience.

⸻

4. Primary UX Structure

The page should be structured as a three-part layout.

4.1 Left column — Progress and checklist

Displays:

* step list
* progress state
* current step highlight
* completed steps with check icons

4.2 Main content area — Explanation and action

Displays:

* current step title
* short explanation
* why this matters
* what the user should do now
* primary CTA
* secondary help links if needed

4.3 Right column or lower panel — Animated UI preview

Displays:

* visual preview of the relevant product screen or flow
* iconography
* subtle motion/animation
* optional mini schema or payload example

This area makes the page feel real and product-driven rather than text-heavy.

⸻

5. Target Users

This onboarding page is primarily for:

* newly signed-up users,
* users with no instance connected yet,
* users who have not generated an API key yet,
* users who have not sent their first message.

It is especially important for:

* makers,
* semi-technical users,
* non-technical users trying to understand how the platform works.

⸻

6. Key Onboarding Principles

6.1 Explain concepts in context

Do not explain everything at once.
Explain a concept when the user reaches the step where it matters.

6.2 Each step should map to a real product action

The onboarding should not remain theoretical.
Each step should move the user closer to activation.

6.3 Keep text concise

The page should teach, but not overwhelm.
Text should be short, clear, and actionable.

6.4 Visuals should reinforce understanding

The previews should not be decorative only.
They must help the user understand what they will see or do next.

6.5 The user should feel momentum

The checklist and motion should create a feeling of progress.

⸻

7. Recommended Step Flow

The onboarding page should include these steps.

7.1 Step 1 — Understand the basics

Goal

Introduce the core concepts.

Concepts to explain briefly

* instance = a connected WhatsApp account
* API key = how external apps use the platform
* webhook = how your app receives events
* message = outbound communication unit
* campaign = multi-recipient sending flow

CTA

* Continuer

Preview idea

A small conceptual diagram:

Your App → UseSendNow API → WhatsApp
                ↑
             Webhooks

⸻

7.2 Step 2 — Create your first instance

Goal

Explain that the user needs a WhatsApp instance before sending anything.

Explanation

An instance is a connected WhatsApp account used to send messages and campaigns.

CTA

* Créer une instance

Preview idea

A stylized card showing:

* instance name
* connection status
* create button

⸻

7.3 Step 3 — Connect your WhatsApp account

Goal

Explain QR/pairing and the connection flow.

Explanation

The user connects their real WhatsApp account through QR or pairing code.

CTA

* Connecter mon numéro

Preview idea

Animated QR card / pairing card

* QR code frame appears
* connection status changes from pending to connected

⸻

7.4 Step 4 — Generate your first API key

Goal

Explain how external tools and apps authenticate.

Explanation

An API key lets your application send messages, launch campaigns, and use the public API securely.

CTA

* Créer une clé API

Preview idea

API key card with:

* masked secret
* copy button
* small header example:

x-api-key: usn_live_xxx

⸻

7.5 Step 5 — Register a webhook

Goal

Explain how the user’s app receives delivery and status events.

Explanation

A webhook lets your app know when messages are sent, delivered, or when an instance changes state.

CTA

* Ajouter un webhook

Preview idea

Mini event flow diagram:

UseSendNow → Your webhook URL

With event chips like:

* message.sent
* message.delivered
* instance.connected

⸻

7.6 Step 6 — Send your first message

Goal

Help the user understand the basic send flow.

Explanation

Once your instance is connected and your API key is ready, you can send your first message.

CTA

* Envoyer un premier message
* optional Voir un exemple API

Preview idea

Send message form preview:

* instance selector
* phone field
* message body
* send button

Optional code snippet preview.

⸻

7.7 Step 7 — Launch your first campaign

Goal

Show the higher-level automation value of the platform.

Explanation

Campaigns help you send messages to many contacts with controls, scheduling, and safety rules.

CTA

* Créer une campagne

Preview idea

Campaign card showing:

* name
* audience size
* status
* start/pause controls

Include a small note about warmup/safety if relevant.

⸻

8. Checklist Behavior

The onboarding checklist should show each step as:

* locked
* available
* completed
* current

Completion logic

Completion should ideally be based on real backend state, not just local clicks.

Examples:

* step “Create instance” completed when at least 1 instance exists
* step “Connect WhatsApp” completed when an instance is connected
* step “Generate API key” completed when at least 1 active API key exists
* step “Register webhook” completed when at least 1 webhook endpoint exists
* step “Send first message” completed when at least 1 outbound message exists

Important rule

Users should be able to move through the onboarding manually, but completed states should come from real data when possible.

⸻

9. Backend Data Needed

The frontend onboarding page needs lightweight activation-state data.

9.1 Recommended endpoint

A single summary endpoint would make this easier.

Example

GET /api/onboarding

Response example

{
  "data": {
    "hasInstance": true,
    "hasConnectedInstance": false,
    "hasApiKey": true,
    "hasWebhook": false,
    "hasSentMessage": false,
    "hasCampaign": false,
    "currentPlan": "starter",
    "canUseCampaigns": true
  }
}

Why this is useful

It avoids the frontend having to combine multiple endpoints just to decide checklist state.

⸻

10. CTA Behavior

Each step CTA should point to a real page or flow in the app.

Example mappings

* Create instance → /dashboard/instances
* Connect WhatsApp → /dashboard/instances/:id/connect
* Create API key → /dashboard/api-keys
* Add webhook → /dashboard/webhooks
* Send message → /dashboard/messages/new
* Create campaign → /dashboard/campaigns/new

Important rule

The onboarding page should not trap the user inside itself.
It should hand off naturally to the real product screens.

⸻

11. Frontend Design System / Libraries

11.1 Recommendation

Build this page as a custom frontend experience using the app’s own component system.

Strong recommendation

Use:

* Next.js
* Tailwind CSS if already used
* Motion for animation
* icon set such as Lucide

Why

This page needs custom layout, custom visuals, and custom pacing.
It is better suited to a purpose-built page than to a generic “tour” library.

11.2 Optional later enhancement

If the team later wants in-app guided tours attached to real page elements, a separate onboarding-tour library may be used.
But it is not required for this page.

⸻

12. Animation Guidelines

Animations should make the experience feel premium and alive, not distracting.

12.1 Recommended animation types

* fade + slide transitions between steps
* animated checklist progress
* subtle card entrance animations
* soft hover/focus states on CTAs
* light motion on preview mockups

12.2 Not recommended

* heavy looping animations
* noisy motion effects
* playful gimmicks that reduce clarity

General rule

Animations should support comprehension and momentum.

⸻

13. Visual Components Needed

Recommended reusable frontend components:

Layout components

* OnboardingLayout
* OnboardingChecklist
* OnboardingStepPanel
* OnboardingPreviewPanel

Content components

* ConceptCard
* StepCtaCard
* StepHint
* MiniCodeSnippet
* FlowDiagram

Progress components

* ChecklistStepItem
* OnboardingProgressBar
* CompletionBadge

Preview/mockup components

* InstancePreviewCard
* QrConnectPreviewCard
* ApiKeyPreviewCard
* WebhookFlowPreview
* SendMessagePreview
* CampaignPreviewCard

⸻

14. Design Style Recommendations

The page should feel modern, calm, and product-driven.

Recommended style

* generous spacing
* rounded cards
* soft shadows
* light gradients where appropriate
* clear typography hierarchy
* restrained but clear use of icons

Tone

The design should feel:

* premium,
* modern,
* easy to understand,
* not overly corporate,
* not overly playful.

⸻

15. Content Style Recommendations

Text should be:

* short,
* clear,
* contextual,
* action-oriented.

Avoid

* long paragraphs
* abstract technical jargon without explanation
* generic product marketing language inside the onboarding flow

Prefer

* one clear explanation per step
* one main CTA per step
* one visual metaphor or preview per step

⸻

16. Persistence / Re-entry Behavior

The onboarding page should support users who leave and come back later.

Recommended behavior

* real completion state comes from backend summary data
* current step position may be remembered client-side or server-side later
* completed steps stay visibly completed

Optional v1 simplification

If needed, current step can be frontend-local at first, while completion still comes from backend activation state.

⸻

17. Relationship with Announcements System

This onboarding page is different from the announcements/banners system.

Onboarding page

* educational
* structured
* step-driven
* activation-focused

Announcements system

* news/release communication
* temporary product communication
* banners and changelog

They may coexist, but should not be merged into one feature.

⸻

18. Logging / Analytics Recommendations

Even if full analytics is not implemented immediately, the following events are useful:

* onboarding page viewed
* step opened
* CTA clicked
* onboarding completed
* onboarding skipped

This can help later with:

* activation optimization
* product UX review
* churn reduction analysis

⸻

19. Testing Requirements

Frontend tests should cover:

* checklist rendering
* current/completed step rendering
* backend onboarding summary mapping to step states
* CTA navigation behavior
* step transitions
* conditional display based on plan/capabilities

If visual testing exists, snapshots or story coverage for the main step components are useful.

⸻

20. Acceptance Criteria

This onboarding page is done when:

1. a new user can access a dedicated onboarding page
2. the page presents the agreed step sequence
3. each step explains a product concept in context
4. each step links to a real product action
5. the checklist shows progress and completed states
6. animated UI previews exist for the main steps
7. the page feels visually polished and guided, not static
8. backend onboarding summary data can drive completion state
9. the page supports re-entry without feeling broken or reset randomly

⸻

21. Summary

The onboarding page is a strategic activation surface.

It exists to bridge the gap between:

* a technical API-first product,
* and the real understanding new users need to succeed quickly.

It should combine:

* explanation,
* motion,
* real product previews,
* and clear action.

If done well, it will become one of the most important pages in the product for reducing early churn and improving first-week activation.