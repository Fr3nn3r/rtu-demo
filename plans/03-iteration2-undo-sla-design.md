# ClaimPilot V2 — Iteration 2: Undo, SLA emphasis, Design fixes

> Session: `b3573c39` | Date: 2026-03-28 | Commit: `533fdbb`

## Context

After the initial build, three issues were identified:
1. **No undo/back capability** — operators can't revert a workflow transition if they made a mistake
2. **SLA emphasis is too subtle** — breached/approaching claims don't stand out enough in the list or on the detail page
3. **Design feedback** (from review scoring 5/10 design, 3/10 originality) — missing New Claim CTA, small text sizes, tab label clarity, and overall visual polish

## Scope decisions

- **Undo:** Back one step only, workflow fields stay populated (no field clearing)
- **SLA:** Row highlighting in claims list + persistent SLA countdown banner on claim detail page + pulsing alert for breached
- **Design:** High-impact only — New Claim button/dialog, text sizing/contrast fixes, tab labels. Skip brand color overhaul and chart restyling.

---

## 1. Undo / Go Back One Step

### Approach

Add a `REVERT_WORKFLOW` reducer action that reverses the most recent `ADVANCE_WORKFLOW`. This requires:

**A. Reverse-lookup function in `workflow-engine.ts`**
- `getPreviousState(claimType, currentState)` — scans the transitions map to find which state(s) have `currentState` as a valid next state
- Returns the most recent completed state from `slaHistory` that matches (handles branching correctly)
- Terminal states (`CLOSED`) and initial state (`NEW`) cannot be reverted

**B. New reducer action `REVERT_WORKFLOW` in `ClaimContext.tsx`**
- Finds previous state from claim's `slaHistory` (the most recently completed SLA record)
- Removes the current active SLA record (the one without `completedAt`)
- Marks the previous SLA record as active again (removes its `completedAt`)
- Sets `claim.status` back to the previous state
- Adds an audit entry: "Status reverted from X to Y"
- Does NOT clear workflow fields — operator keeps entered data

**C. "Go Back" button in the ActionPanel**
- Appears at the top of every action panel except for `NEW` and `CLOSED` states
- Styled as a ghost/outline button with an ArrowLeft icon: "Go Back to [Previous Step]"
- Shows a confirmation: "Are you sure? This will revert the claim to [Previous Step]."
- Uses a simple `window.confirm()` for the prototype (no modal needed)

### Files to modify
- `src/lib/workflow-engine.ts` — add `getPreviousState()` function
- `src/types/index.ts` — add `REVERT_WORKFLOW` to `ClaimAction` union
- `src/context/ClaimContext.tsx` — add `REVERT_WORKFLOW` case to reducer
- `src/components/claims/action-panel.tsx` — add Go Back button

---

## 2. SLA Emphasis

### A. Claims list row highlighting (`claims-list-page.tsx`)

Add conditional background colors to `<tr>` based on SLA status:
- **Breached:** `bg-danger-50/40` — subtle red tint on the entire row
- **Approaching:** `bg-warning-50/40` — subtle amber tint
- **Within / no SLA:** no tint (current behavior)

Computed via `getClaimSLAStatus(claim)` which is already imported.

### B. SLA countdown banner on claim detail page (`claim-detail-page.tsx`)

Insert a prominent banner between the WorkflowStepper and the main content grid. Shows only for active claims with an SLA:

- **Within SLA:** Compact green bar — "SLA: 6 hours remaining"
- **Approaching:** Amber bar with warning icon — "SLA Approaching: 3 hours remaining — act now"
- **Breached:** Red bar with pulsing animation, full width — "SLA BREACHED — 6 hours overdue" with a bold call to action

New component: `src/components/claims/sla-banner.tsx`

### C. Enhanced SLA indicator styling

Current `sla-indicator.tsx` uses `text-xs`. For breached claims:
- Add a subtle pulsing animation (`animate-pulse`) to the breached indicator
- Make the breached badge slightly larger or bolder to draw the eye

### Files to modify/create
- `src/components/claims/sla-banner.tsx` — **new file**, the detail page SLA banner
- `src/pages/claim-detail-page.tsx` — insert SLA banner
- `src/pages/claims-list-page.tsx` — add row tint classes
- `src/components/claims/sla-indicator.tsx` — add pulse to breached state

---

## 3. Design Fixes (High-Impact)

### A. "New Claim" button + dialog

Add a prominent CTA button to the claims list header: `+ New Claim` (primary variant, right-aligned next to the claim count).

Clicking opens a dialog (`new-claim-dialog.tsx`) with:
- Claim type selector (Accident / Theft / Glass) as 3 large radio cards
- Insured name field (text input)
- Vehicle registration field (text input)
- "Create Claim" button that dispatches `ADD_CLAIM` with minimal seed data and navigates to the new claim's detail page

New file: `src/components/claims-list/new-claim-dialog.tsx`

### B. Text sizing / contrast fixes

Global changes across multiple files:
- Replace all `text-[10px]` with `text-[11px]` (minimum 11px per feedback)
- Ensure `text-text-muted` is not used below 12px font size — at 11px, switch to `text-text-secondary` for better contrast
- Specific locations:
  - `claim-detail-page.tsx` — tab badge counts
  - `workflow-stepper.tsx` — step labels (`text-[10px]` → `text-[11px]`)
  - `audit-trail-panel.tsx` — timestamps
  - `documents-panel.tsx` — status labels
  - `communications-panel.tsx` — metadata text

### C. Tab label clarity

In `claim-detail-page.tsx`, rename:
- "Docs" → "Documents"
- "Comms" → "Communications"
- Remove count badges that use tiny text — instead use a small dot indicator for "has items"

### D. Sticky table header

In `claims-list-page.tsx`, make the `<thead>` sticky:
- Add `sticky top-0 z-10` to the header row
- Ensure background color is opaque (`bg-surface-secondary` not transparent)

### E. Sidebar scroll indicator

In `claim-detail-page.tsx`, remove `max-h-[500px]` constraint and replace with a more natural overflow approach or increase the height. Add subtle gradient fade at the bottom to hint at scrollable content.

### Files to modify/create
- `src/components/claims-list/new-claim-dialog.tsx` — **new file**
- `src/pages/claims-list-page.tsx` — add New Claim button, sticky header, row highlighting
- `src/pages/claim-detail-page.tsx` — tab labels, badge styling, sidebar scroll, SLA banner
- `src/components/claims/workflow-stepper.tsx` — text size fix
- `src/components/claims/panels/audit-trail-panel.tsx` — text size fix
- `src/components/claims/panels/documents-panel.tsx` — text size fix
- `src/components/claims/panels/communications-panel.tsx` — text size fix

---

## Build Order

1. **Undo mechanism** — workflow-engine → types → reducer → action panel button
2. **SLA banner** — new component → wire into detail page
3. **Row highlighting** — claims list page
4. **SLA indicator pulse** — sla-indicator component
5. **New Claim dialog** — new component → wire into claims list
6. **Text sizing fixes** — batch update across all files
7. **Tab labels + sticky header + sidebar** — claim detail + claims list

---

## Verification

1. Navigate to CLM-10002 (Policy Validation) → click "Go Back" → claim reverts to NEW
2. CLM-10004 (breached) → red row tint in list, red pulsing SLA banner on detail
3. CLM-10006 (approaching) → amber row tint, amber SLA banner
4. Click "New Claim" on claims list → dialog opens → create claim → redirected to detail
5. All text is >= 11px, no text-[10px] remaining
6. Tab labels read "Documents" and "Communications"
7. Scroll the claims list — header stays visible
