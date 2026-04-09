# ClaimPilot V2 Prototype — Implementation Plan

> Session: `b3573c39` | Date: 2026-03-27 | Commit: `533fdbb`

## Context

RTU Insurance Services (RTUSA) manages motor claims for taxis insured through Renasa. Their current process spans 3 disconnected systems (Zoho, Nimbus, Rock) with manual Google Sheets tracking. ClaimPilot replaces the spreadsheet with a workflow tool.

This plan builds a **frontend-only prototype** in `rtu-demo` for an RTU stakeholder workshop. No backend, no API calls — all state in-memory, all data mocked. The goal is to validate workflows, SLA model, and operator experience before committing to the full MVP build.

**Priority:** Workflow stepper + claim detail page first, then claim list, then dashboard.

---

## Tech Stack (existing in repo)

- React 19 + Vite 8 + Tailwind CSS v4
- Radix UI primitives (dialog, dropdown, label, popover, select, tabs, tooltip)
- React Router v7, Recharts 3, date-fns 4, Lucide React
- IBM Plex Sans font, custom theme tokens (primary/success/warning/danger)
- `cn()`, `formatZAR()`, `copyToClipboard()`, `generateId()` in `src/lib/utils.ts`
- `erasableSyntaxOnly: true` — no TS enums, use string literal unions
- `@/*` path alias → `./src/*`

**To add:** shadcn/ui (init + components) — wraps the already-installed Radix primitives with Tailwind styling.

---

## File Structure

```
src/
  types/
    index.ts                          # All interfaces and type unions
  data/
    workflow-definitions.ts           # Step definitions + transition maps per claim type
    sla-config.ts                     # Default SLA durations per step
    seed-claims.ts                    # 10 pre-loaded claims with relative timestamps
    seed-contacts.ts                  # Assessors, investigators, repairers
  lib/
    utils.ts                          # (existing) cn, formatZAR, copyToClipboard, generateId
    workflow-engine.ts                # Pure functions: getNextStates, computeSLAStatus, getStepperSteps
    communication-templates.ts        # Draft email generators per milestone
    audit.ts                          # createAuditEntry helper
  context/
    ClaimContext.tsx                   # React Context + useReducer for all claim state
    ContactContext.tsx                 # Context for tenant contacts list
  components/
    ui/                               # shadcn/ui components (button, badge, card, input, etc.)
    layout/
      app-shell.tsx                   # TopNav + Outlet
      top-nav.tsx                     # Logo, nav links, user avatar
    claims/
      claim-header.tsx                # ID, type badge, status, SLA indicator, operator
      claim-type-badge.tsx            # Colored badge: Accident/Theft/Glass
      status-badge.tsx                # Current workflow state badge
      sla-indicator.tsx               # Green/amber/red pill with time remaining
      workflow-stepper.tsx            # Horizontal step circles with connectors
      action-panel.tsx                # Render-map dispatcher for step-specific UI
      bridge-step-banner.tsx          # Blue info banner for external system steps
      draft-communication-modal.tsx   # Email draft dialog
      copyable-field.tsx              # Label + value + clipboard button
      actions/                        # One component per action type
        new-claim-review.tsx
        policy-validation.tsx
        register-on-rock.tsx
        appoint-contact.tsx           # Shared: assessor, investigator, glass repairer
        assessment-received.tsx       # Shared: assessment + investigation
        internal-approval.tsx
        qa-decision.tsx
        aol-generated.tsx
        route-type.tsx
        inspection-costing.tsx
        progress-status.tsx           # Shared: repair, total loss, settlement, salvage
        within-excess.tsx
        closed.tsx
      panels/                         # Sidebar tab content
        claim-details-panel.tsx
        documents-panel.tsx
        communications-panel.tsx
        audit-trail-panel.tsx
    claims-list/
      claim-table.tsx
      claim-row.tsx
      claim-filters.tsx
      new-claim-dialog.tsx
    dashboard/
      stat-card.tsx
      claims-by-status-chart.tsx
      claims-by-type-chart.tsx
      sla-compliance-table.tsx
      breached-claims-table.tsx
    contacts/
      contacts-table.tsx
      contact-form-dialog.tsx
  pages/
    claims-list-page.tsx
    claim-detail-page.tsx
    dashboard-page.tsx
    contacts-page.tsx
  App.tsx                             # Router setup
  main.tsx                            # (existing)
  index.css                           # (existing) Tailwind theme
```

---

## Key Decisions

- **Field depth:** Representative subset (~20 core fields per type: insured, vehicle, incident, workflow). Not the full 54-61 field spec. Enough to demonstrate workflow without boilerplate.
- **Invalid + rejection paths:** Include INVALID state (policy validation fails → CLOSED) and REJECTED state (approval denied → CLOSED). Full workflow including unhappy paths.
- **No enums:** `erasableSyntaxOnly: true` — all types are string literal unions.

---

## Data Model (TypeScript interfaces in `src/types/index.ts`)

### Core types

```typescript
type ClaimType = 'accident' | 'theft' | 'glass'

type WorkflowState =
  | 'NEW' | 'POLICY_VALIDATION' | 'INVALID' | 'REGISTERED'
  | 'ASSESSOR_APPOINTED' | 'ASSESSMENT_RECEIVED'
  | 'INVESTIGATOR_APPOINTED' | 'INVESTIGATION_RECEIVED'
  | 'WITHIN_EXCESS' | 'INTERNAL_APPROVAL' | 'QA_APPOINTED' | 'QA_DECISION'
  | 'REJECTED' | 'AOL' | 'ROUTE_TYPE'
  | 'INSPECTION_FINAL_COSTING' | 'REPAIR_IN_PROGRESS'
  | 'TOTAL_LOSS' | 'SETTLEMENT_CONFIRMED' | 'SALVAGE_IN_PROGRESS'
  | 'GLASS_REPAIRER_APPOINTED' | 'REPAIR_COMPLETE'
  | 'CLOSED'

type SLAStatus = 'within' | 'approaching' | 'breached'
type ContactRole = 'assessor' | 'investigator' | 'repairer' | 'glass_repairer'
```

### Claim aggregate

```typescript
interface Claim {
  id: string                    // CLM-XXXXX
  type: ClaimType
  status: WorkflowState
  assignedTo: string
  createdAt: string             // ISO 8601
  updatedAt: string

  insured: InsuredDetails       // Different shape for glass
  broker: BrokerDetails
  driver: DriverDetails
  vehicle: VehicleDetails
  finance?: FinanceDetails      // accident/theft only
  incident: IncidentDetails
  antiTheft?: AntiTheftDetails

  workflow: WorkflowFields      // policyNumber, spmClaimNumber, excess, assessed, etc.
  slaHistory: SLARecord[]       // Entry/due/completed per state
  documents: ClaimDocument[]
  communications: DraftCommunication[]
  auditTrail: AuditEntry[]
}
```

---

## Workflow Engine Design

### Transition maps (in `data/workflow-definitions.ts`)

Each claim type has a `Record<WorkflowState, WorkflowState[]>` defining valid next states. Key branching points:

- **AUTO_ROUTING** (after assessment): branches to WITHIN_EXCESS | INTERNAL_APPROVAL | QA_APPOINTED based on assessed amount vs excess vs R50k threshold
- **INTERNAL_APPROVAL / QA_DECISION**: branches to AOL (approved) | REJECTED → CLOSED
- **ROUTE_TYPE**: branches to INSPECTION_FINAL_COSTING (repair) | TOTAL_LOSS

### Step definitions

Each step has: `state`, `label`, `slaHours`, `isBridgeStep`, `bridgeSystem?`, `description`, `requiredFields?`

### Pure functions (in `lib/workflow-engine.ts`)

- `getStepperSteps(claim)` — returns ordered steps for the stepper (completed + current + projected future)
- `getNextStates(claimType, currentState)` — valid transitions
- `computeSLAStatus(slaRecord)` — { status, percentElapsed, timeRemaining }
- `getStepConfig(claimType, state)` — step definition for the action panel

### SLA computation (client-side)

SLA states derived from entry time + configured hours:
- **Within:** < 75% elapsed
- **Approaching:** 75-99% elapsed
- **Breached:** >= 100% elapsed

Seed data uses relative timestamps (`Date.now() - offsetMs`) so SLA indicators are always fresh.

---

## State Management

**React Context + `useReducer`** — no external library needed for ~10 claims.

### ClaimContext reducer actions

- `ADVANCE_WORKFLOW` — validates transition, creates SLA record, auto-generates communications, appends audit entry
- `UPDATE_CLAIM_FIELD` — edits a claim field, logs to audit trail
- `ADD_CLAIM` — new claim creation
- `UPDATE_DOCUMENT_STATUS` — toggle document received/pending
- `MARK_COMMUNICATION_SENT` — records send in audit trail
- `ASSIGN_CLAIM` — reassign operator

### SLA timer refresh

`useEffect` with 60-second interval increments a tick counter to force re-renders — SLA indicators update live.

---

## Routing

```typescript
<BrowserRouter>
  <Routes>
    <Route element={<AppShell />}>
      <Route index element={<Navigate to="/claims" />} />
      <Route path="/claims" element={<ClaimsListPage />} />
      <Route path="/claims/:claimId" element={<ClaimDetailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

---

## Claim Detail Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ClaimHeader: ID | Type Badge | Status Badge | SLA Indicator │
├─────────────────────────────────────────────────────────────┤
│ WorkflowStepper: ●──●──●──◉──○──○──○                       │
├────────────────────────────────┬────────────────────────────┤
│ ActionPanel (2/3 width)        │ Sidebar Tabs (1/3 width)   │
│ ┌────────────────────────────┐ │ [Details|Docs|Comms|Audit] │
│ │ Bridge Step Banner (blue)  │ │                            │
│ │ Copyable fields            │ │ Collapsible sections:      │
│ │ Input fields               │ │ - Insured Information      │
│ │ Action buttons             │ │ - Vehicle Information      │
│ └────────────────────────────┘ │ - Incident Information     │
│                                │ - Workflow Fields           │
└────────────────────────────────┴────────────────────────────┘
```

### Action panel: render-map pattern

A `Record<WorkflowState, ComponentType>` maps each state to its action component. `ActionPanel` looks up the current state and renders the matching component. Shared components: `AppointContactAction` handles assessor/investigator/glass repairer; `ProgressStatusAction` handles repair/total loss/settlement/salvage.

### Bridge step pattern

Reusable layout: info banner → copyable fields → input fields → action buttons. Each concrete bridge step adds its own inputs (policy number for Nimbus, SPM number for Rock, etc.).

---

## Seed Data (10 claims)

| # | Type | Status | SLA State | Vehicle | Location |
|---|------|--------|-----------|---------|----------|
| 1 | Accident | NEW | Within | Toyota Quantum 2.5D | Gauteng |
| 2 | Accident | POLICY_VALIDATION | Approaching | VW Caddy Maxi 2.0TDI | Gauteng |
| 3 | Theft | REGISTERED | Within | Nissan NV350 Impendulo | KZN |
| 4 | Accident | ASSESSOR_APPOINTED | Breached | Toyota Quantum GL | Gauteng |
| 5 | Theft | INVESTIGATOR_APPOINTED | Within | Toyota HiAce 2.7 | KZN |
| 6 | Accident | INTERNAL_APPROVAL | Approaching | VW Caddy 2.0TDI | Gauteng |
| 7 | Accident | INSPECTION_FINAL_COSTING | Within | Toyota Quantum 2.5D | Gauteng |
| 8 | Accident | REPAIR_IN_PROGRESS | Within | Iveco Daily | KZN |
| 9 | Glass | GLASS_REPAIRER_APPOINTED | Breached | Toyota Quantum 2.5D | Gauteng |
| 10 | Accident | CLOSED | N/A | Nissan NV350 | KZN |

Realistic SA data: policyholder names, Gauteng/KZN registrations, taxi-appropriate vehicles, ZAR amounts.

---

## Build Phases

### Phase 1: Foundation
1. Initialize shadcn/ui, install core components (button, badge, card, input, label, select, dialog, tabs, tooltip, textarea, separator, table)
2. Create `src/types/index.ts` — all interfaces
3. Create `src/data/workflow-definitions.ts` — step definitions + transition maps
4. Create `src/data/sla-config.ts` — SLA durations
5. Create `src/lib/workflow-engine.ts` — pure functions
6. Create `src/lib/audit.ts` — audit entry helper
7. Create `src/lib/communication-templates.ts` — draft generators
8. Create `src/data/seed-contacts.ts` + `src/data/seed-claims.ts`
9. Create `src/context/ClaimContext.tsx` + `src/context/ContactContext.tsx`

### Phase 2: Layout + Routing Shell
10. `src/components/layout/top-nav.tsx` + `app-shell.tsx`
11. Placeholder pages for all 4 routes
12. `src/App.tsx` — router wiring

### Phase 3: Claim Detail Page (priority feature)
13. `ClaimHeader` with `ClaimTypeBadge`, `StatusBadge`, `SlaIndicator`
14. `WorkflowStepper` with step nodes + connectors
15. `CopyableField` + `BridgeStepBanner`
16. `ActionPanel` render-map dispatcher
17. Action components (all ~13):
    - `new-claim-review`, `policy-validation`, `register-on-rock`
    - `appoint-contact`, `assessment-received`
    - `within-excess`, `internal-approval`, `qa-decision`
    - `aol-generated`, `route-type`, `inspection-costing`
    - `progress-status`, `closed`
18. Sidebar panels: Details, Documents, Communications, Audit Trail
19. `DraftCommunicationModal`
20. Wire into `ClaimDetailPage`

### Phase 4: Claims List / Work Queue
21. `ClaimRow` with SLA indicator
22. `ClaimTable` + `ClaimFilters` (type/status/SLA/search)
23. "My Queue" toggle
24. `NewClaimDialog`
25. Wire into `ClaimsListPage`

### Phase 5: Dashboard
26. `StatCard` components (active claims, breached SLAs, avg close time)
27. `ClaimsByStatusChart` (Recharts bar) + `ClaimsByTypeChart` (donut)
28. `SLAComplianceTable` + `BreachedClaimsTable`
29. Wire into `DashboardPage`

### Phase 6: Contacts + Polish
30. `ContactsTable` + `ContactFormDialog`
31. "Fast Forward" demo button (advances a random claim for demos)
32. Empty states, responsive tweaks, final polish

---

## shadcn/ui Setup

Style: **"new-york"** (denser, professional). Components will be installed to `src/components/ui/`. The existing Radix primitives will be used directly — no duplicate installs.

New Radix primitive needed: `@radix-ui/react-collapsible` (for collapsible sections). Also install `sonner` for toast notifications on copy/send actions.

---

## Verification Plan

After each phase, verify:

1. **Phase 1:** `npm run build` succeeds, types compile, seed data renders in console
2. **Phase 2:** Dev server shows nav bar, all routes render placeholder content
3. **Phase 3:** Navigate to any seed claim → stepper shows correct steps, action panel renders for current state, can advance workflow through bridge steps, communications generate, audit trail populates
4. **Phase 4:** Claim list shows all 10 seed claims with correct SLA colors, filters work, clicking a row navigates to detail
5. **Phase 5:** Dashboard shows accurate counts derived from claim state
6. **Full demo:** Walk through creating a new accident claim → policy validation → registration → assessor appointment → assessment → approval → repair → close, verifying SLA indicators, communications, and audit trail at each step
