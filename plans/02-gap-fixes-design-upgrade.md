# ClaimPilot Prototype v2 — Gap Fixes & Design Upgrade

> Session: `27150414` | Date: 2026-03-27 | Commit: `533fdbb`

## Context

The ClaimPilot prototype (React 19 + Tailwind CSS v4 + Lucide icons) was built for an RTU Insurance stakeholder workshop demo. The first pass covers the full workflow but has 10 gaps vs the spec. The user specifically asked for:
- A **visual workflow stepper** showing where each claim is in its journey
- **Auto-generated communications** at every workflow transition
- **Modern glassmorphism SaaS design** across all cards and key surfaces
- All remaining spec gaps fixed

---

## Files Overview

| File | Action | Purpose |
|------|--------|---------|
| `src/data/workflow-steps.ts` | CREATE | Step definitions, icon mapping, `getWorkflowSteps()` engine |
| `src/data/communications.ts` | CREATE | 18 email templates, `generateCommunications()`, `generateSlaReminders()` |
| `src/components/workflow/WorkflowStepper.tsx` | CREATE | Full glassmorphism stepper for claim detail |
| `src/components/workflow/MiniStepper.tsx` | CREATE | Compact dot stepper for claim list table |
| `src/components/claim-detail/ClaimDetailPage.tsx` | MODIFY | Stepper integration, Rock bridge step, draft badge, inline editing, glassmorphism |
| `src/components/claim-list/ClaimListPage.tsx` | MODIFY | MiniStepper column, My Queue default, filters, SPM search |
| `src/components/dashboard/DashboardPage.tsx` | MODIFY | Glassmorphism KPI/chart cards |
| `src/components/layout/AppLayout.tsx` | MODIFY | Glass nav bar, toast styling |
| `src/context/AppContext.tsx` | MODIFY | Wire communications engine, SLA reminders on fast-forward, toast format |
| `src/index.css` | MODIFY | Gradient background, step-pulse animation keyframes |

---

## Implementation Plan (10 Gaps)

### Gap 1: Visual Workflow Stepper (CRITICAL)

**New file: `src/data/workflow-steps.ts`**
- Define `WorkflowStep` type: `{ status, label, icon, state: 'completed'|'current'|'upcoming'|'terminal', terminalType: 'success'|'failure'|'neutral'|null }`
- 3 step templates per claim type:
  - **Accident:** NEW → Policy Validation → Registered → Assessor → Assessment → Approval → Repair/Total Loss → Closed (8-10 steps)
  - **Theft:** NEW → Policy Validation → Registered → Investigator → Assessment → Approval → Repair/Total Loss → Closed
  - **Glass:** NEW → Policy Validation → Registered → Glass Repairer → Closed (5 steps)
- `getWorkflowSteps(claimType, currentStatus, auditTrail)` function:
  - Resolves branch paths by scanning audit trail (post-assessment routing, repair vs total loss)
  - Shows generic "Approval" placeholder for claims that haven't reached the branch yet
  - Marks steps as completed/current/upcoming/terminal
- `extractVisitedStatuses(auditTrail)` helper: scans audit entry `details` for status names
- Icon mapping: `FilePlus` (NEW), `ShieldCheck` (Validation), `ClipboardList` (Registered), `Search` (Assessor), `UserCheck` (Investigator), `FileSearch` (Assessment), `Scale` (Approval), `Wrench` (Repair), `Car` (Total Loss), `CheckCircle2` (Closed), etc.

**New file: `src/components/workflow/WorkflowStepper.tsx`**
- Glassmorphism container: `backdrop-blur-xl bg-white/70 border border-white/20 shadow-lg rounded-xl`
- Horizontal stepper on desktop (flex items-center), vertical on mobile (sm:hidden)
- Step circles: 40px, border-2, with icon inside
  - Completed: `border-success-500 bg-success-50 text-success-600` + Check icon
  - Current: `border-primary-500 bg-primary-50 text-primary-600` + step icon + glow `shadow-[0_0_12px_rgba(14,165,233,0.4)]` + pulse animation
  - Upcoming: `border-gray-200 bg-gray-50 text-gray-400`
  - Terminal failure: `border-danger-500 bg-danger-50 text-danger-600`
  - Terminal success: `border-success-500 bg-success-50 text-success-600`
- Connector lines between steps: completed=`bg-success-400`, current=gradient, upcoming=`bg-gray-200`
- Step labels below each circle: `text-[11px] font-medium max-w-[80px]`

**New file: `src/components/workflow/MiniStepper.tsx`**
- Row of small dots (1.5px completed, 2.5px current, 1.5px upcoming)
- Colors match full stepper states
- Radix Tooltip on hover shows step label (dependency already installed)
- Fits in a table cell (~80-100px wide for Accident, ~40px for Glass)

**Integration:**
- `ClaimDetailPage.tsx`: Insert `<WorkflowStepper>` between Zone 1 (header) and Zone 2 (action card)
- `ClaimListPage.tsx`: Add "Progress" column between "Status" and "SLA" columns, render `<MiniStepper>`

**CSS addition in `src/index.css`:**
```css
@keyframes step-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.3); }
  50% { box-shadow: 0 0 0 6px rgba(14, 165, 233, 0); }
}
```

---

### Gap 2: Auto-Generated Communications (CRITICAL)

**New file: `src/data/communications.ts`**

18 email template functions generating `Communication` objects at transitions:

| Transition Target | Communications Generated |
|---|---|
| `POLICY_VALIDATION` | Acknowledgement → policyholder |
| `REGISTERED` | Registration confirmation (with SPM) → policyholder |
| `ASSESSOR_APPOINTED` | Assessment request → assessor; Appointment notice → policyholder |
| `INVESTIGATOR_APPOINTED` | Investigation request → investigator; Appointment notice → policyholder |
| `GLASS_REPAIRER_APPOINTED` | Replacement request → glass repairer; Appointment notice → policyholder |
| `ASSESSMENT_RECEIVED` | Assessment outcome → policyholder |
| `WITHIN_EXCESS` | Within-excess notification → policyholder |
| `REPAIR_IN_PROGRESS` | Repair authorisation → repairer; Repair approved → policyholder |
| `TOTAL_LOSS` | Settlement notification → policyholder |
| `CLOSED` (from repair) | Repair completion → policyholder |
| `CLOSED` (from glass) | Glass completion → policyholder |
| `CLOSED` (from salvage) | Claim finalised → policyholder |
| `REJECTED` | Rejection notification → policyholder |
| SLA breach (any) | Overdue reminder → external party |

Exports:
- `generateCommunications(claim, newStatus, { currentTime, currentOperator })` → `Communication[]`
- `generateSlaReminders(claims, newTime)` → `{ claimId, communications }[]`
- `lookupEmail(name, role)` helper using assessors/investigators/repairers/glassRepairers arrays

**Integration in `src/context/AppContext.tsx`:**

1. In `performTransition`: After each `transitionClaim()` call, run `generateCommunications()` and append results to `claim.communications`
2. For `CONFIRM_REPORT_RECEIVED` (two-step): Generate comms for both `ASSESSMENT_RECEIVED` and the auto-routed status
3. In `advanceTime`: Call `generateSlaReminders(claims, newTime)`, merge results into claims, show warning toast with count

**UI indicators in `ClaimDetailPage.tsx`:**
- `DraftBadge` component on every active action card: amber pill showing "X drafts ready to send" with Mail icon
- Communications tab button: amber count badge when drafts exist
- `CommunicationsTab`: Sort drafts first; add `border-l-4 border-l-warning-500` left accent on draft items; "NEW" label on freshly created drafts

---

### Gap 3: "Register on Rock" Bridge Step

**File: `src/components/claim-detail/ClaimDetailPage.tsx`**

Two-phase action card for `REGISTERED` status using `claim.spmNumber` as discriminator:

- **Phase 1** (`!claim.spmNumber`): Card titled "Register on Rock"
  - Display fields with copy: Policyholder Name, ID Number, Vehicle, Registration, Policy Number, Excess Amount, Incident Location
  - Input: SPM Claim Number
  - Button: "Confirm Registered" → calls `updateClaim(claim.id, { spmNumber })`

- **Phase 2** (`claim.spmNumber` is set): Existing appointment cards (Assessor/Investigator/Glass Repairer) — no changes needed

No state machine changes required. The `REGISTERED` status stays the same; only the action card becomes two-phase.

---

### Gap 4: My Queue Default ON

**File:** `ClaimListPage.tsx` line 84
```diff
- const [myQueue, setMyQueue] = useState(false)
+ const [myQueue, setMyQueue] = useState(true)
```

---

### Gap 5: Missing Filters (Date Range, Assignee)

**File: `ClaimListPage.tsx`**

Add two new filter controls to the filter bar:

1. **Date range dropdown** (Calendar icon): All Dates / Today / Last 7 Days / Last 30 Days
2. **Assignee dropdown** (Users icon): All / Vassen Pillay / Mike Roberts / Thabo Mokoena

Add state variables, filter logic in the `useMemo` (compare `createdAt` against cutoff date, match `assignedTo`), and UI dropdowns following the existing pattern (select with icon overlays).

---

### Gap 6: SPM Number Searchable

**File:** `ClaimListPage.tsx` line 104
```diff
- const hay = `${c.id} ${c.policyNumber} ${c.vehicleReg} ${c.policyholderName}`.toLowerCase()
+ const hay = `${c.id} ${c.policyNumber} ${c.vehicleReg} ${c.policyholderName} ${c.spmNumber}`.toLowerCase()
```

---

### Gap 7: "Draft Ready" Indicator on Action Card

Covered in Gap 2 UI section — `DraftBadge` component rendered inside every active action card.

---

### Gap 8: Inline Editing on Details Tab

**File: `ClaimDetailPage.tsx`**

- Modify `SectionHeader` to accept `onEdit`/`editing` props, render a Pencil icon toggle
- Create `EditableDetailRow` component: shows input when editing, read-only `DetailRow` otherwise
- Add per-section edit state (`editingInsured`, `editingVehicle`, `editingIncident`, `editingFinance`)
- On Save: call `updateClaim(claim.id, { ...draftValues })`
- Editable fields: policyholderName, phone, email, vehicle description/reg/value, incident location/description, policyNumber, excessAmount
- Read-only: ID number, assignedTo, assessor/investigator/repairer (set by workflow)

---

### Gap 9: Fast-Forward SLA Reminders + Toast Format

**File: `src/context/AppContext.tsx`**

1. `advanceTime` generates SLA reminders (wired via Gap 2)
2. Toast message includes current time:
   ```
   "Time advanced by X hours. Current time: 28 Mar 2026 04:41"
   ```
3. If reminders generated, second toast: "X SLA breach reminder(s) auto-drafted" (warning type)

---

### Gap 10: Glassmorphism Design Upgrade

**Background gradient** in `src/index.css`:
```css
body {
  background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f0fdf4 100%);
}
```

**Glass card pattern** (Tailwind classes, no config changes needed):
```
rounded-xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5
```

Apply to these surfaces:
- **Nav bar** (`AppLayout.tsx`): Replace `bg-surface` with glass pattern
- **Claim detail header** card
- **Action card** wrapper (keep `border-l-4 border-l-primary-500`)
- **Workflow stepper** container (new component, built with glass from start)
- **Dashboard KPI cards** (4 cards)
- **Dashboard chart containers**
- **Toast notifications**: Add `backdrop-blur-md bg-white/80`

**DO NOT apply** to: data tables, filter bar, tab content areas (need solid bg for readability).

---

## Execution Order

Sequenced to minimize merge conflicts and maximize parallel work:

| Phase | Tasks | Files touched |
|-------|-------|---------------|
| 1. Quick fixes | Gap 4 (My Queue ON), Gap 6 (SPM search), Gap 9 toast format | `ClaimListPage.tsx`, `AppContext.tsx` |
| 2. Data layer | Gap 2 engine (`communications.ts`), Gap 1 engine (`workflow-steps.ts`) | New files only |
| 3. Stepper components | Gap 1 UI (`WorkflowStepper.tsx`, `MiniStepper.tsx`) | New files + `index.css` |
| 4. ClaimDetail overhaul | Gap 3 (Rock bridge), Gap 7 (draft badge), Gap 8 (inline edit), integrate stepper | `ClaimDetailPage.tsx` |
| 5. ClaimList enhancements | Gap 5 (filters), integrate MiniStepper column | `ClaimListPage.tsx` |
| 6. State wiring | Gap 2 + Gap 9 integration into AppContext | `AppContext.tsx` |
| 7. Glassmorphism sweep | Gap 10 across all card surfaces | All component files + `index.css` |

Phases 2 & 3 can run in parallel (new files, no conflicts).
Phase 4 & 5 can run in parallel (different files).

---

## Verification Plan

1. **TypeScript check**: `npx tsc --noEmit` — zero errors
2. **Build**: `npm run build` — clean output
3. **Visual verification** (Playwright browser):
   - Claims list: verify MiniStepper dots on each row, My Queue ON by default, date/assignee filters work, SPM search works
   - Claim detail (CLM-10002 at POLICY_VALIDATION): verify stepper shows step 2 highlighted, action card has Nimbus bridge step
   - Walk through full workflow: NEW → validate → register on Rock (enter SPM) → appoint assessor → confirm report → auto-route → approve → repair → close
   - At each transition: verify communications auto-generated (check Communications tab)
   - Fast-forward: verify SLA reminders appear, toast shows current time
   - Dashboard: verify glassmorphism on KPI cards and charts
   - Inline editing: edit policyholder name on Details tab, verify save works
4. **Demo walkthrough**: Follow spec section 8 end-to-end
