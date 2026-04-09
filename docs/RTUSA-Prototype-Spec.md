# ClaimPilot prototype specification

## RTU Insurance Services (RTUSA)

**Version:** 2.0
**Date:** 2026-03-29
**Author:** TrueAim.ai
**Purpose:** Self-contained demo for RTU stakeholder workshop
**PRD alignment:** V2.3 (2026-03-29)

### Change log

**V2.0 (2026-03-29)** — PRD V2.3 alignment

- **Theft workflow corrected.** Theft claims no longer collect excess, auto-route by amount, or pass through internal approval. All theft claims go from investigation received directly to QA. INVESTIGATION RECEIVED is now a distinct state from ASSESSMENT RECEIVED.
- **SLA visual design section added (section 3).** Cross-cutting design principles, color system, per-screen SLA prominence, progress track spec. SLA visibility is the hero concern of the prototype.
- **Step revert added (section 9).** Operators can revert a claim to its previous workflow state from any active step.
- **Communication templates enumerated (section 5.5).** 11 auto-generated draft templates with trigger conditions, recipients, and content summaries.
- **Claim type comparison matrix added (section 8.3).** Side-by-side differences to prevent one flow being modelled as a copy of another.
- **Fast-forward options updated.** Now +1h, +3h, +6h, +12h, +24h, +7d (was +1h, +4h, +12h, +24h).
- **QA step differentiated by claim type** in action cards and state machine.
- **Action card fields scoped by claim type.** Excess hidden for theft at policy validation; assessment received is accident-only; investigation received is theft-only.

---

## 1. Purpose and audience

Front-end-only prototype of the full ClaimPilot workflow. No backend, no API calls, no real extraction. All state in-memory, all data mocked.

**Audience:** RTU stakeholders (Mike, Vassen) in a live workshop setting. The goal is to validate the workflow, SLA model, and operator experience before committing to the full build.

**What RTU should be able to evaluate after the demo:**
- Does the claim lifecycle match their actual process?
- Are the bridge steps (Nimbus, Rock) clear and usable?
- Does the SLA visibility give operators and management what they need?
- Do the draft communications cover the right trigger points?
- Does the work queue help operators prioritize?
- Are the theft, accident, and glass workflows correctly differentiated?

---

## 2. Technical approach

| Aspect | Decision |
|---|---|
| Framework | React + Tailwind CSS + shadcn/ui |
| State | In-memory (React state / context), no persistence |
| Backend | None |
| Data | Hardcoded mock data, generated on load |
| Extraction | Simulated (pre-populated fields, no actual parsing) |
| Email | Draft display only (no sending) |
| Deployment | Static build, hostable anywhere (Vercel, local, etc.) |

---

## 3. SLA visual design (cross-cutting)

SLA visibility is the single most important UI concern in ClaimPilot. RTU's current process has zero SLA tracking — claims sit in Google Sheets with no deadline awareness. The prototype must make SLA state impossible to ignore, at every level of the UI.

### 3.1 Design principles

1. **SLA is never hidden.** Every screen where a claim appears shows its SLA state. There is no view of a claim that omits the deadline.
2. **Color is the primary signal.** Green / amber / red is used consistently across all SLA indicators — table badges, header banner, action panel context line, dashboard KPIs, performance tables. The operator should internalize the color language within minutes.
3. **Time is always shown.** Badges never show just a color dot. They always include the time remaining or time overdue in human-readable format (e.g., "4h 12m left", "6h 23m overdue"). Relative time, not absolute timestamps.
4. **Breached claims demand attention.** Red badges and bars use a subtle pulse animation. The dashboard breached KPI card uses a red background. Breached claims sort to the top of every list.
5. **The step name accompanies the time.** Operators need to know *what* is being waited on, not just *how long*. SLA indicators include the current step name (e.g., "Assessor report · 36h 15m remaining").

### 3.2 SLA color system

| State | Condition | Background | Text | Animation |
|---|---|---|---|---|
| Within | <75% elapsed | `bg-emerald-500` | White | None |
| Approaching | 75–99% elapsed | `bg-amber-500` | Dark | Subtle pulse |
| Breached | ≥100% elapsed | `bg-red-500` | White | Persistent pulse |
| Inactive | CLOSED / INVALID | `bg-gray-200` | Gray | None |

### 3.3 SLA display by screen

| Screen | SLA element | Prominence |
|---|---|---|
| Claim list (table) | Color badge + time + step name per row | High — widest non-text column, sorted by urgency in "My queue" |
| Claim detail (header) | Full-width color bar with progress track | Very high — first thing the operator sees |
| Claim detail (action panel) | Context line below action title | Medium — reinforces urgency in the work area |
| Dashboard (KPI cards) | Breached count (hero card), approaching count | Very high — the management landing view |
| Dashboard (compliance table) | Per-step compliance bars, color-coded | High — identifies systemic bottlenecks |
| Dashboard (breached list) | Sorted table of overdue claims | High — actionable drill-down |

### 3.4 SLA progress track

On the claim detail header banner, a thin horizontal track visualizes elapsed vs total SLA duration:

```
[████████████░░░░░░░░] 62% — 14h 23m remaining
[██████████████████░░] 91% — 2h 10m remaining (approaching)
[████████████████████] 127% — 6h 23m overdue (breached, bar fills red past 100%)
```

The track fills left-to-right. At 100%, it is full. Beyond 100%, the entire track turns red and the overdue time is shown.

---

## 4. Seed data

### 4.1 Pre-loaded claims

10 claims loaded on startup, distributed across workflow states and SLA conditions:

| # | Claim type | Status | SLA state | Notes |
|---|---|---|---|---|
| 1 | Accident | NEW | Within | Just created |
| 2 | Accident | POLICY VALIDATION | Approaching | 9 hours elapsed of 12-hour SLA |
| 3 | Theft | REGISTERED | Within | Ready for investigator appointment (no excess collected) |
| 4 | Accident | ASSESSOR APPOINTED | Breached | Report overdue by 6 hours |
| 5 | Theft | INVESTIGATOR APPOINTED | Within | 3 days into 14-day SLA |
| 6 | Accident | INTERNAL APPROVAL | Approaching | Assessed R35k, excess R5k, 20 hours into 24-hour SLA |
| 7 | Accident | INSPECTION & FINAL COSTING | Within | Approved, awaiting final costing from repairer |
| 8 | Accident | REPAIR IN PROGRESS | Within | Repair underway |
| 9 | Glass | GLASS REPAIRER APPOINTED | Breached | Glass replacement overdue |
| 10 | Accident | CLOSED | N/A | Completed last week |

Each seed claim has realistic mock data: South African policyholder names, Gauteng/KZN vehicle registrations, taxi-appropriate vehicle descriptions (Toyota Quantum, VW Caddy, Nissan NV350), ZAR amounts, Johannesburg/Durban/Cape Town locations.

**Theft-specific seed data:** Claims 3 and 5 have no excess amount, no assessed amount, and no auto-routing fields. Their workflow history reflects the theft path (no internal approval step).

### 4.2 Mock external parties

Hardcoded list, not editable in the prototype:

**Assessors:**
- Pieter van der Merwe, pieter@assessments.co.za, 082-555-0101
- Thandiwe Nkosi, thandiwe@motorassess.co.za, 083-555-0202
- Rajesh Govender, rajesh@autoassess.co.za, 084-555-0303

**Investigators:**
- Sipho Dlamini, sipho@investigate.co.za, 072-555-0404
- Jacques Fourie, jacques@claimsinvest.co.za, 076-555-0505

**Repairers:**
- Vusi's Auto Repairs, vusi@autorepairs.co.za, 011-555-0606
- Peninsula Panel Beaters, info@peninsulapanel.co.za, 021-555-0707

**Glass repairers:**
- PG Glass Johannesburg, claims@pgglass.co.za, 011-555-0808
- AutoGlass Durban, service@autoglass.co.za, 031-555-0909

### 4.3 Mock operators

- Vassen Pillay (current user, 5 assigned claims)
- Mike Roberts (3 assigned claims)
- Thabo Mokoena (2 assigned claims)

---

## 5. Screen inventory

### 5.1 Claim list / work queue

The main screen after login.

**Layout:**
- Top bar: "My queue" toggle (default on), claim type filter tabs (All / Accident / Theft / Glass)
- Filter row: status dropdown, SLA status dropdown, date range, assignee
- Search bar: free-text search across policy number, vehicle reg, policyholder name, SPM number
- Table: Claim ID, type, policyholder name, vehicle reg, status, SLA indicator (color-coded with time remaining/overdue), assigned to, created date

**SLA column (prominent — this is the primary urgency signal):**

The SLA column is visually the loudest element in the table. It is wider than a typical badge column and uses color, iconography, and motion to draw operator attention to claims that need action.

- **Green badge:** within SLA (<75% elapsed). Shows time remaining in hours/minutes (e.g., "4h 12m left"). Solid green background, white text.
- **Amber badge:** approaching SLA (75–99% elapsed). Shows time remaining. Amber background, dark text. A subtle pulse animation draws the eye without being distracting.
- **Red badge:** breached (≥100% elapsed). Shows time overdue (e.g., "6h 23m overdue"). Red background, white text. Persistent pulse animation — this is the highest-urgency visual in the entire UI.
- **Grey badge:** no active SLA (CLOSED, INVALID). Shows "—".

The badge also displays the current step name below the time (e.g., "4h 12m left · Assessor report") so the operator can see at a glance *what* is being waited on.

**"My queue" mode:**
- Filters to current operator's claims
- Sorted by urgency: breached first (most overdue at top), then approaching, then within SLA

**Simulation controls (top right, clearly marked as demo-only):**
- "New accident claim" button
- "New theft claim" button
- "New glass claim" button
- "Fast forward" button row: +1h, +3h, +6h, +12h, +24h, +7d

### 5.2 Claim detail view

Single-page view for one claim. Three zones:

**Zone 1: Header**
- Claim ID, type badge, status badge
- Assigned operator
- Created / last updated timestamps
- **SLA banner (full-width, below the header row):** A prominent, color-coded bar showing the current step's SLA state. This is the single most visible element on the claim detail page.
  - **Within SLA:** Green bar — "{Step name} · {time remaining} remaining" (e.g., "Assessor report · 36h 15m remaining")
  - **Approaching:** Amber bar with pulse — "{Step name} · {time remaining} remaining — approaching deadline"
  - **Breached:** Red bar with pulse — "{Step name} · {time overdue} overdue" (e.g., "Assessor report · 6h 23m overdue")
  - The bar includes a thin progress track showing elapsed vs total SLA duration as a visual proportion

**Zone 2: Action panel (top of content area)**

Changes based on current workflow state. Each card follows the same pattern:

1. Title: what needs to happen ("Validate policy on Nimbus")
2. **SLA context line:** directly below the title — "Due in {time remaining}" (green text), "Due in {time remaining} — approaching" (amber), or "{time overdue} overdue" (red, bold). This ensures the operator sees the urgency without scrolling.
3. Data display: fields the operator needs in the external system, each with a copy button
4. Input fields: data to bring back (policy number, excess amount, SPM number, etc.)
5. Confirm button: advances the claim to the next state
6. **Revert button:** "Back to [Previous Step]" — available on all active steps except NEW (see section 9)

Action cards by state:

| State | Card title | Data displayed (with copy) | Input fields | Actions |
|---|---|---|---|---|
| POLICY VALIDATION | Validate policy on Nimbus | Policyholder name, ID number, vehicle reg | Policy number, excess amount (accident/glass only — hidden for theft) | Confirm valid / Mark invalid |
| REGISTERED | Register on Rock | All claim details needed by Rock | SPM claim number | Confirm registered |
| ASSESSOR APPOINTED | Awaiting assessor report | Assessor name, appointment date, **SLA deadline with countdown** | Assessed amount, report upload (simulated) | Confirm report received |
| INVESTIGATOR APPOINTED | Awaiting investigation report | Investigator name, appointment date, **SLA deadline with countdown** | Report upload (simulated) | Confirm report received |
| ASSESSMENT RECEIVED (accident only) | Review assessment | Assessed amount, excess amount, routing result | (none, auto-routed) | (auto-advances) |
| INVESTIGATION RECEIVED (theft only) | Investigation report received | Investigator name, report date | (none — no financial data entered) | (auto-advances to QA) |
| INTERNAL APPROVAL (accident only) | Approve or reject claim | Assessed amount, excess, claim summary | Rejection reason + supporting docs (if rejecting) | Approve / Reject |
| QA APPOINTED | Awaiting QA decision | See QA context below | Rejection reason + supporting docs (if rejecting) | Record approved / Record rejected |
| INSPECTION & FINAL COSTING | Awaiting final costing | Repairer/assessor name, vehicle details | Final cost amount | Confirm costing received |
| REPAIR IN PROGRESS | Track repair | Repairer name, appointment date | (none) | Mark repair complete |
| TOTAL LOSS | Total loss: request Natis docs | Settlement amount, insured contact | (none) | Confirm Natis docs received |
| SETTLEMENT CONFIRMED | Awaiting receipt confirmation | Settlement date, amount | (none) | Confirm receipt received |
| SALVAGE IN PROGRESS | Track salvage | Settlement date | (none) | Mark salvage complete |
| GLASS REPAIRER APPOINTED | Awaiting glass replacement | Repairer name, vehicle location, glass details | (none) | Mark replacement complete |

**QA context by claim type:**
- **Accident:** QA panel shows assessed amount, excess amount, and the threshold that triggered QA referral (>R50,000). The operator sees why the claim was escalated.
- **Theft:** QA panel shows "QA review is mandatory for all theft claims" — no amount comparison is displayed, because theft claims do not collect excess or assessed amounts.

**Zone 3: Tabbed content area**

- **Details tab:** All claim data in read-only sections (insured, vehicle, driver, incident, finance, workflow fields). Edit button per section opens inline editing. Theft claims: excess and assessed amount fields are not shown. Glass claims: finance section is not shown.
- **Documents tab:** List of uploaded documents with type labels. "Upload" button (simulated: picks from mock files, adds to list).
- **Communications tab:** List of draft emails with status (pending / sent). Click to open draft panel. See section 5.5 for the full template list.
- **Audit trail tab:** Chronological log of all actions on this claim, including step reverts.

### 5.3 Draft email panel

Opens as a side panel or modal from the Communications tab or from a "Draft ready" indicator on the action card.

- To: pre-filled recipient
- Subject: pre-filled
- Body: pre-filled with claim context
- "Copy to clipboard" button (copies full email body)
- "Mark as sent" button (records in audit trail, updates communication status)

### 5.4 Dashboard

Accessible from the top navigation. Populated from seed data and any claims created during the demo.

**KPI cards (top row):**
- Active claims (count)
- **Breached SLAs (count, red background if > 0, pulse animation)** — this is the hero metric. It is visually the largest card and uses the same red pulse treatment as breached badges elsewhere. Clicking it filters to breached claims.
- **Approaching SLAs (count, amber background if > 0)** — second-priority metric. Clicking filters to approaching claims.
- Claims closed this week
- Average time to close

**SLA performance section (dedicated panel, positioned prominently):**

This section is the primary management view. It answers "where are we losing time?" at a glance.

- **SLA compliance by step:** Horizontal bar chart. Each workflow step shows a bar with the percentage of claims that completed within SLA. Bars are color-coded: green (≥90%), amber (70–89%), red (<70%). This immediately highlights which steps are bottlenecks.
- **SLA heatmap (optional, if time permits):** A matrix of workflow steps (rows) × time periods (columns: today, this week, this month). Each cell is color-coded by compliance rate. Gives management a temporal view of where SLA performance is trending.
- **Breached claims list:** Sorted by most overdue first. Columns: claim ID, claim type, current step, SLA deadline, time overdue, assigned operator. Each row uses the red badge treatment. Clicking a row navigates to the claim detail.
- **Approaching deadline list:** Same format as breached, but amber badges. Sorted by time remaining (least first). Shows claims that will breach soon if not acted on.

**Assessor / investigator performance:**
- Table with name, active assignments, average turnaround time, **SLA compliance %** (color-coded: green/amber/red). This lets management identify which external parties are consistently missing deadlines.

**Operator workload:**
- Table with name, active claims, **overdue items (count, red if > 0)**, approaching items (count, amber if > 0). Overdue column is visually prominent.

### 5.5 Communication templates

The system auto-generates draft emails at workflow transitions. In the prototype, templates use hardcoded mock data. Each template pulls claim ID, vehicle details, insured name, and incident context.

| # | Trigger state | Template | Recipient | Subject pattern | Content summary |
|---|---|---|---|---|---|
| 1 | ASSESSOR APPOINTED | assessor_appointed | Appointed assessor | "Assessment Required — {ClaimID} \| {Vehicle}" | Claim details, vehicle info, incident description, insured contact, report deadline |
| 2 | INVESTIGATOR APPOINTED | investigator_appointed | Appointed investigator | "Investigation Required — {ClaimID} \| {Vehicle}" | Vehicle theft details, police reference, insured contact, 14-day report deadline |
| 3 | GLASS REPAIRER APPOINTED | glass_repairer_appointed | Appointed glass repairer | "Glass Replacement Required — {ClaimID} \| {Vehicle}" | Vehicle location, glass type, insured contact details |
| 4 | WITHIN EXCESS | within_excess | Insured (policyholder) | "Claim {ClaimID} — Within Excess Notification" | Assessed amount vs excess amount, no further action |
| 5 | REPAIR IN PROGRESS | repair_started | Insured (policyholder) | "Claim {ClaimID} — Repair Commenced" | Cost authorization confirmed, repair notification |
| 6 | TOTAL LOSS | claim_approved_total_loss | Insured (policyholder) | "Claim {ClaimID} — Total Loss Notification" | AOL notification, request for Natis documents |
| 7 | SETTLEMENT CONFIRMED | settlement_issued | Insured (policyholder) | "Claim {ClaimID} — Settlement Notification" | Settlement amount, request for confirmation of receipt |
| 8 | REJECTED | claim_rejected | Insured (policyholder) | "Claim {ClaimID} — Claim Declined" | Rejection reason, 30-day dispute window |
| 9 | INVALID | invalid_policy | Insured (policyholder) | "Claim {ClaimID} — Invalid Policy" | Policy validation failure, instruction to contact broker |
| 10 | (SLA approaching) | sla_warning | Assigned contact | "REMINDER: {ClaimID} — Action Required" | SLA urgency warning, time remaining |
| 11 | (Post-repair) | repair_follow_up | Repairer | "Status Update Request — {ClaimID}" | Request for repair progress update |

**Broker handling:** Wherever a draft is generated for the policyholder, a copy is drafted for the broker.

**Draft lifecycle:** Auto-generated → operator clicks "Copy to clipboard" → sends manually from email client → clicks "Mark as sent" in ClaimPilot.

---

## 6. Time simulation

### 6.1 Fast-forward control

A row of buttons in the demo controls bar. Options: +1h, +3h, +6h, +12h, +24h, +7d.

When activated:
- All SLA timestamps (entered, due, completed) are shifted backward by the selected duration across all claims
- The SLA engine calculates higher elapsed percentages, simulating the passage of time
- SLA indicators recalculate immediately
- Claims that cross SLA thresholds change color (green to amber, amber to red)
- New draft reminders appear on claims that hit reminder trigger points

### 6.2 Visual feedback

When time advances:
- A brief toast notification: "Clock advanced by X hours"
- SLA badges update across all visible claims
- The breached claims count on the dashboard updates

**Scope:** Global — affects all claims simultaneously. Does not change claim states or trigger any workflow transitions.

---

## 7. Claim creation flow

### 7.1 Quick create buttons

Three buttons in the demo controls: "New accident claim", "New theft claim", "New glass claim."

Each button:
1. Generates a new claim with realistic mock data appropriate to the type
2. Sets status to NEW
3. Assigns to the current operator
4. Shows a brief confirmation toast
5. The claim appears at the top of the claim list

The claim is immediately created with mock extracted data. No upload step, no extraction review. The operator can view it and begin the workflow.

### 7.2 Mock data generation

Each generated claim uses randomized but realistic data:
- Policyholder: random South African name from a pool
- Vehicle: random taxi-appropriate vehicle (Toyota Quantum 2.5D, VW Caddy Maxi, Nissan NV350 Impendulo, etc.)
- Registration: random Gauteng/KZN format (e.g., GP 123-456, ND 78-901)
- Incident: random Johannesburg/Durban location, date within last 48 hours
- Amounts: vehicle value R150k-R450k, excess R3k-R10k

**Type-specific generation:**
- **Accident:** All fields populated including excess, assessed (if past assessment step), finance details
- **Theft:** No excess amount, no assessed amount, police reference always populated
- **Glass:** Excess populated, no finance details, glass-specific fields (cause of loss, glass to replace, vehicle location)

---

## 8. Workflow transitions

### 8.1 State machine

Each claim's workflow state is managed by a simple state machine in memory. Allowed transitions:

**Accident:**
```
NEW → POLICY_VALIDATION → REGISTERED → ASSESSOR_APPOINTED
→ ASSESSMENT_RECEIVED → WITHIN_EXCESS (closed)
                      → INTERNAL_APPROVAL → APPROVED → AOL_GENERATED
                                          → REJECTED (closed, requires supporting docs)
                      → QA_APPOINTED → APPROVED → AOL_GENERATED
                                     → REJECTED (closed, requires supporting docs)

AOL_GENERATED → INSPECTION_FINAL_COSTING → REPAIR_IN_PROGRESS → CLOSED
              → TOTAL_LOSS → SETTLEMENT_CONFIRMED → SALVAGE → CLOSED

POLICY_VALIDATION → INVALID (closed)
```

**Theft:**
```
NEW → POLICY_VALIDATION → REGISTERED → INVESTIGATOR_APPOINTED
→ INVESTIGATION_RECEIVED → QA_APPOINTED → APPROVED → AOL_GENERATED
                                        → REJECTED (closed, requires supporting docs)

AOL_GENERATED → INSPECTION_FINAL_COSTING → REPAIR_IN_PROGRESS → CLOSED
              → TOTAL_LOSS → SETTLEMENT_CONFIRMED → SALVAGE → CLOSED

POLICY_VALIDATION → INVALID (closed)
```

Theft claims skip excess collection, excess-based auto-routing, within-excess, and internal approval. All theft claims go directly from investigation received to QA, because theft claims are inherently higher risk and require QA oversight.

**Glass:**
```
NEW → POLICY_VALIDATION → REGISTERED → GLASS_REPAIRER_APPOINTED → CLOSED
POLICY_VALIDATION → INVALID (closed)
```

### 8.2 Auto-routing (accident only)

When an operator confirms ASSESSMENT RECEIVED on an **accident** claim and the assessed amount is populated:
- If assessed <= excess: auto-transition to WITHIN EXCESS, generate draft notification
- If assessed > excess AND <= R50,000: auto-transition to INTERNAL APPROVAL
- If assessed > R50,000: auto-transition to QA APPOINTED

The auto-routing result is displayed briefly before transitioning.

**Theft and glass claims do not undergo auto-routing.** Theft claims advance from investigation received to QA unconditionally. Glass claims have no assessment step.

### 8.3 Claim type comparison

| Capability | Accident | Theft | Glass |
|---|---|---|---|
| Excess collected at policy validation | Yes | **No** | Yes |
| Assessed amount entered | Yes (from assessor report) | **No** | No |
| Auto-routing (assessed vs excess) | Yes | **No** | No |
| Within Excess path | Yes | **No** | No |
| Internal Approval path (<=R50k) | Yes | **No** | No |
| QA path | >R50k only | **All claims** (mandatory) | No |
| External party appointed | Assessor | Investigator | Glass repairer |
| Report SLA | 48h (assessor) | 14 days (investigator) | N/A |
| Repair / total loss routing | Yes | Yes | No |
| Total loss / salvage path | Yes | Yes | No |
| Police reference required | Yes | Yes | No |
| Finance details captured | Yes | Yes | No |

---

## 9. Step revert

Operators can revert a claim to its previous workflow state from any active step. This supports corrections when a claim was advanced prematurely or when new information requires revisiting a prior step.

**Behaviour:**
- A "Back to [Previous Step]" button appears on the action panel for all claims not in NEW or CLOSED state
- Clicking the button requires confirmation before the revert executes
- The claim's status returns to the previous state as determined by its SLA history (the most recently completed state)
- The current step's active SLA record is removed
- The previous step's SLA record is re-opened (completion timestamp cleared), so the SLA timer resumes from where it was
- All workflow field data entered during the reverted step is preserved — no data is lost
- All draft communications generated during the reverted step are preserved
- An audit trail entry is logged: "Status reverted from [Current] to [Previous]"
- The revert follows the claim's actual path through the workflow, not a generic state machine order

**Constraints:**
- Cannot revert from NEW (no previous state exists)
- Cannot revert from CLOSED (terminal state)
- Revert is a single-step operation — to go back multiple steps, the operator must revert repeatedly

---

## 10. Demo walkthrough script

Suggested demo flow for the RTU workshop:

**Opening — SLA first impression (3 min):**
1. Show the claim list with 10 pre-loaded claims in various states
2. **Call out the SLA column immediately** — green, amber, red badges with time + step name. "This is how you see at a glance what needs attention."
3. Point to Claim #4 (ASSESSOR APPOINTED, breached) — "This assessor report is 6 hours overdue. Red, pulsing. You can't miss it."
4. Point to Claim #2 (POLICY VALIDATION, approaching) — "This one is amber — 9 of 12 hours gone. Still time to act."
5. Toggle "My queue" — "Breached sorts to the top. Your most urgent work is always first."

**Claim creation (3 min):**
6. Click "New accident claim" — show the new claim appear
7. Open the claim — **immediately point out the green SLA banner** across the top: "Policy validation · 12h 0m remaining". The progress track is empty (just started).
8. Walk through the detail tabs: data, documents, communications, audit trail

**Accident workflow + SLA progression (14 min):**
9. Start from the new claim at POLICY VALIDATION. Note the SLA context line on the action card: "Due in 12h 0m"
10. Show the bridge step card: "here's what you need for Nimbus" with copy buttons
11. Enter policy number and excess, click "Confirm valid"
12. Claim advances to REGISTERED — **new SLA starts, banner resets to green**, show the Rock bridge step card
13. Enter SPM number, confirm
14. Select an assessor, confirm appointment — point out the draft email includes vehicle location, photos, and quotes. **New 48-hour SLA starts on the banner.**
15. **Fast-forward +24h** — banner turns amber: "Assessor report · 24h remaining — approaching deadline". Progress track is half-full. Badge on the claim list updates simultaneously.
16. **Fast-forward +24h again** — banner turns red with pulse: "Assessor report · 0h overdue". Progress track is full red. Toast notification shows "Clock advanced by 24h".
17. **Show the draft SLA reminder email** that appeared on the Communications tab — the system generated it when the SLA crossed the warning threshold
18. Enter assessed amount (R35,000 with R5,000 excess), confirm report received
19. Show auto-routing to INTERNAL APPROVAL — **new 24-hour SLA starts**, banner green again
20. Approve, select "Repair" — AOL generated on Rock
21. Show INSPECTION & FINAL COSTING step — **12-hour SLA on the banner**. Confirm final costing.
22. Show REPAIR IN PROGRESS, point out repairer notification drafted to insured and broker
23. Mark repair complete, claim closes — **SLA banner shows grey "Closed"**

**Theft workflow — key differences (5 min):**
24. Click "New theft claim" — point out no excess field at policy validation
25. Walk through validation (no excess collected) → registration → investigator appointment
26. **Point out the 14-day SLA on the banner** (vs 48h for accident assessor) — "Investigations take longer. The system knows."
27. Confirm investigation report received — no financial data entered
28. Show automatic routing to QA — **6-hour SLA starts on the banner**
29. Point out QA context shows "mandatory for theft" rather than amount threshold
30. Approve at QA — same repair/total loss routing as accident from here

**Glass workflow (3 min):**
31. Click "New glass claim" — show the shorter form
32. Walk through the glass-specific steps (validation with excess, registration, repairer appointment, done)
33. Point out the shorter path compared to accident (no assessment, no approval, no inspection)

**Step revert demo (2 min):**
34. Open a claim in an active state
35. Show the "Back to [Previous Step]" button
36. Demonstrate revert — **point out SLA timer resumes from where it was** (not reset), data preserved, audit trail entry

**Dashboard — SLA management view (3 min):**
37. Switch to dashboard — **the breached SLA hero card is red and pulsing** with the count of overdue claims
38. Show the SLA compliance by step chart — "Which steps are bottlenecks? Where are assessors consistently late?"
39. Click into the breached claims list — sorted by most overdue, each row is a direct link to the claim
40. Show assessor performance table — **SLA compliance % per assessor**, color-coded. "This is how management holds external parties accountable."
41. Show operator workload — overdue column highlights who needs help

**Wrap-up:**
42. Key message: "Every claim, every step, every deadline — visible. No more claims slipping through the cracks on a spreadsheet."
43. Open Q&A with RTU

---

## 11. Out of scope for prototype

- Real backend or API calls
- Actual document upload or extraction
- Real authentication (no login screen, pre-set as Vassen)
- Editable external party list
- Tenant configuration screens
- Persistent state (refresh = reset)
- Print or export
- Mobile layout
- Real email sending (draft display only)
