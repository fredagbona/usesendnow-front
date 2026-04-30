Admin Portal Config (Pre-Implementation Gate)

Goal
- Define non-negotiable architecture and UI rules before implementing specs `01` to `10`.
- Ensure the admin portal matches existing product design language and reuses shared building blocks.

Scope
- Applies to all admin portal work from auth to exports/actions.
- Must be validated before starting feature implementation.

Mandatory principles
- Reuse first:
  - If a component already exists in the project, use it.
  - If a similar component exists in an app-specific folder, move/refactor it to shared and consume the shared version.
- Design consistency:
  - Admin portal must follow the same DA (spacing, typography, surfaces, colors, motion, states) as current portals.
- Shared infra:
  - Reuse existing utils, hooks patterns, API client conventions, auth/token handling patterns, table/pagination patterns, and formatting helpers.
- No parallel design system:
  - Do not create a second admin-only UI system unless explicitly justified and approved.

Information architecture & layout
- Required admin shell:
  - Top nav/header aligned with existing platform style.
  - Left sidebar must be collapsable (expanded/collapsed states).
  - Responsive behavior for desktop/tablet/mobile.
- Navigation structure:
  - Sidebar entries map to specs `02` to `10`.
  - Active state, hover state, keyboard focus state must be visible and accessible.

Theme requirements
- Must support light and dark themes from day one.
- Use existing theme tokens/providers already used in the project.
- Components/pages must be visually correct in both themes (contrast, borders, background layers, charts/cards, badges).

Shared components policy
- Before creating any new admin component:
  1. Search existing shared components.
  2. If existing component is close, extend it safely (variant/props) instead of duplicating.
  3. If app-local component is reusable, promote it to shared.
- Expected reusable component families:
  - Layout shell (header/sidebar/content wrapper)
  - Cards, tables, badges, alerts, empty states, skeletons, modals, pagination
  - Filters, selects, inputs, date range, tabs, stat tiles
  - Theme/language toggles if needed

Libraries & dependencies
- Reuse current workspace libraries first (UI, API client, charting, date formatting, etc.).
- Avoid introducing new dependency when existing stack already covers the use case.
- Any new dependency must be justified in PR notes (why existing libs are insufficient).

Data/API conventions
- Keep API typing consistent with existing typed client patterns.
- Follow existing error handling conventions:
  - Loading, empty, partial error, retry states.
  - User-facing messages mapped from known API error codes.
- Keep query/filter/pagination conventions aligned with current platform behavior.

Accessibility baseline
- Keyboard navigable sidebar and tables.
- Visible focus rings.
- Semantic headings and landmarks.
- Color contrast acceptable in both themes.

Performance baseline
- Avoid unnecessary client-side heavy rendering.
- Paginate large lists by default.
- Use skeleton/loading placeholders for perceived performance.

Pre-flight checklist (must be green before spec `01`)
- [ ] Admin app path and routing structure validated.
- [ ] Admin shell implemented (header + collapsable sidebar + content area).
- [ ] Light/dark theme works globally in admin shell.
- [ ] Shared component audit done (reuse/refactor list documented).
- [ ] Any to-be-created components are justified as genuinely missing.
- [ ] API client and auth strategy for admin confirmed.
- [ ] Basic page template (loading/empty/error/success) prepared and reusable.

Definition of done for this spec
1. `00-config` constraints are accepted and used as implementation guardrails.
2. Team can start `01-admin-auth.md` with shared-first and DA consistency guaranteed.
3. No admin feature should be merged if it violates this config spec.
