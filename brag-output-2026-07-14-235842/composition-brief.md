# Hyperframes Composition Brief: MsgFlash

## Objective
Create a short product-launch brag video for MsgFlash, an API-first WhatsApp business event automation platform.

## Output
- Composition directory: `brag-output-2026-07-14-235842/composition/`
- Rendered video: `brag-output-2026-07-14-235842/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material
- Project root: `/Users/freddyagbona/Documents/workspace/projects/useSendNow/dev/usesendnow-frontend`
- Primary files read: `apps/landing/app/page.tsx`, `apps/landing/app/globals.css`, `apps/landing/lib/brand.ts`, `apps/landing/lib/landing-v2-copy.ts`
- Product name: MsgFlash
- Tagline / strongest claim: `Run your business. Every customer stays informed automatically.`
- Key UI or visual moment to recreate: business event stream resolving through a MsgFlash Flow to WhatsApp, paired with the real `Business Flows`, `Campaigns`, and `Analytics` images from the landing.
- Copy that must appear verbatim:
  - `Every business runs on events.`
  - `The right message. Exactly when it matters.`
  - `Keep business flowing.`
  - `Start your free trial.`

## Creative Direction
- Tone preset: polished
- Creative direction: confident editorial product launch card for MsgFlash
- Interpretation: light surfaces, sharp editorial type, generous holds, and restrained motion with yellow and green signal accents.
- Angle: business events are already happening; MsgFlash turns them into timely, traceable WhatsApp communication.
- Hook: `Every business runs on events.` with a measured event stream.
- Outro / punchline: `Keep business flowing.`
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Dark-mode presentation
  - Unreadable rapid text
  - Unrelated visual redesign

## Visual Identity
- Background: `#FCFAF4`
- Text: `#171515`
- Accent: `#FFD600`, with `#25D366` for the flow signal
- Display font: Geist-like heavy sans fallback
- Body font: Poppins-like sans fallback
- Visual references from the project: landing page palette, yellow call-to-action signal, black editorial typography, local feature images in `assets/images/`.

## Storyboard
Use `brag-plan.md` as the creative contract.

Scene summary:
1. The business is moving — 3.5s — headline and event pills
2. Connect the event to the customer — 4.5s — flow diagram
3. The product surface — 6.5s — real feature image strip
4. The promise — 3.5s — concise event-to-communication statement
5. Outro — 2s — mark, promise, CTA

## Audio
- Audio role: warm professional bed with sparse interface accents
- Audio arc: low bed, lift on the flow reveal, quiet fade under the mark
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Music treatment: volume around 0.18, fade in 0.4s, fade out during final hold
- Music cue guidance: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`; use 1-2 nearby strong cues for the flow reveal and final mark, never at the expense of readable copy.
- Audio-reactive treatment: subtle; modulate the signal line glow and image presence with the music energy, no waveform graphics.
- Audio-coupled moments:
  - Scene 1 — first/last event pill — soft drop accents
  - Scene 2 — MsgFlash node — one quiet confirmation hit
  - Scene 5 — logo landing — one subtle confirmation hit
- SFX selection guidance: use low-frequency-risk `interface/drop_*`, `interface/select_008`, or a quiet `bong_001` only if it remains restrained.
- SFX analysis guidance: `~/.agents/skills/brag/assets/sfx/sfx-analysis.md`
- Exact SFX choice: choose after the visual timeline is implemented.
- Audio files: all selected assets are already copied into `composition/assets/`.

## Hyperframes Instructions
Use the current Hyperframes HTML composition contract. Keep one paused GSAP timeline registered as `window.__timelines["main"]`. Keep the full-screen background on a child element, use deterministic finite animations, and keep every required text line readable. Use the real local MsgFlash feature images; do not substitute generic stock visuals.
