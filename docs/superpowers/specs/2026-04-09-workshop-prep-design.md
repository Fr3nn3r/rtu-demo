# Workshop Prep & Demo Update — Design Spec

**Date:** 2026-04-09
**Context:** RTU shared a Phase 0 working document and SQL data dumps. Gap analysis revealed naming mismatches, SLA discrepancies, workflow gaps, and opportunities to use real data. Workshop with RTU is tomorrow — goal is impression-first: show we've deeply analyzed their inputs.

## Deliverables

### 1. Meeting Prep Brief (`docs/meeting-prep-brief.md`)

Single standalone document for the workshop.

**Agenda (60 min):**
1. Opening (3 min) — Goal: align on claim intake, validate assumptions, define Phase 1 scope
2. Demo walkthrough (20 min) — Live demo with corrected naming, SLAs, real data patterns. One accident end-to-end, one glass claim. Show Radx benchmark mock at assessment step.
3. Claim intake deep-dive (12 min) — How does a claim arrive today? What does ClaimPilot replace? Validate proposed intake flow (manual form upload, documents dropped along the way).
4. Assumption validation (15 min) — Walk the assumptions table, priority items flagged.
5. Phase 1 scope definition (10 min) — In/out/deferred. Get explicit prioritization.

**Content sections:**
- Data insights summary (one page, bullets): 52% glass/47% accident/<1% theft, R35K avg payout, 20+ brokers, Corolla Quest fleet, Gauteng primary market, 98% email coverage
- Changes made to demo — bullet list of what we corrected and why
- Assumptions to validate — table with 12-15 items: assumption, current behavior, risk if wrong, question for RTU. Grouped: Workflow, Data, Operations.
- Open items tracker — pending from RTU: video walkthrough, assessor list, historical dataset, operational metrics
- Phase 1 scope proposal — two-column In/Deferred list as discussion starting point

### 2. Demo Code Changes

#### A. Seed claims rewrite (`src/data/seed-claims.ts`)
16 claims matching real distribution:
- 8 glass (stone damage windscreens, Corolla Quest/Etios/Quantum)
- 7 accident (amounts R8K–R180K, one above R50K for QA path)
- 1 theft (Quantum, R95K)
- Spread across workflow states for demo variety
- Real broker names (Oaksure, Primak, Ikhethelo, Taccsure, Synergy)
- SA phone formats (+27...), GP/ND/KZN registrations
- Realistic ZAR amounts (glass: R1,500–R4,500, accident: R8K–R180K)

#### B. Seed contacts update (`src/data/seed-contacts.ts`)
- Keep structure, update to more authentic SA names
- Add more glass repairers (glass is 52% of volume)
- Operator personas: Nikki Pearmain, Nombuso Ncube (from real data)

#### C. Naming corrections (global)
All files — find and replace:
- `Nimbus` → `Nimbis` in labels, descriptions, UI text
- `Rock` → `ROC` in labels, descriptions, UI text
- `nimbus` → `nimbis` in bridgeSystem type and references
- `rock` → `roc` in bridgeSystem type and references
- TypeScript type `'nimbus' | 'rock'` → `'nimbis' | 'roc'`

#### D. SLA corrections (`src/data/workflow-definitions.ts`)
| Step | Old SLA | New SLA | Rationale |
|------|---------|---------|-----------|
| REGISTERED (ROC submission) | null | 4hr | RTU working doc: 4hr SLA for ROC submission |
| INTERNAL_APPROVAL | 24hr | 4hr | RTU working doc: 4hr SLA |
| QA_APPOINTED | 6hr | 4hr | RTU working doc: 4hr SLA for appointment |
| QA_DECISION | 6hr | 48hr | RTU working doc: 48hr for QA review and decision |

Apply same SLA changes to theft and glass step definitions where applicable.

#### E. Within-excess auto-close
When auto-routing determines WITHIN_EXCESS:
- Still generate draft notification to policyholder and broker
- Auto-advance to CLOSED (remove operator confirmation requirement)
- `within-excess.tsx` action component becomes info/confirmation view showing what happened, not requiring action to close
- Workflow engine change: in the advance logic, when entering WITHIN_EXCESS, immediately queue transition to CLOSED

#### F. SPM number prominence
- Claim header: SPM number displayed first, larger. Internal claim ID shown as secondary (smaller, muted).
- Claim table: column header "SPM #" instead of "Claim ID". Internal ID as subtitle or tooltip.
- Claim list page: search placeholder mentions SPM number first.
- Handle case where SPM is not yet assigned (pre-registration claims show internal ID only).

#### G. Radx benchmark mock (`src/components/claims/actions/radx-benchmark.tsx`)
New component shown at ASSESSMENT_RECEIVED step for accident claims only.

Static comparison table with hardcoded mock data:

| Part | Assessor Quote | Radx Benchmark | Variance |
|------|---------------|----------------|----------|
| Front bumper | R4,200 | R3,680 | -R520 (12%) |
| Headlight LH | R2,800 | R2,450 | -R350 (13%) |
| Bonnet | R5,100 | R4,890 | -R210 (4%) |
| Fender RH | R1,900 | R1,650 | -R250 (13%) |
| **Total** | **R14,000** | **R12,670** | **-R1,330 (10%)** |

Visual treatment:
- Card with "Radx Parts Benchmark" header and small "Beta" or "Preview" badge
- Green text on savings, red on overages
- Summary row bold with total potential saving
- Subtle background (e.g., light blue card) to distinguish from primary action panel
- Purely visual — no logic, no state changes

Integrated into `action-panel.tsx` dispatch: when claim is accident type and status is ASSESSMENT_RECEIVED, render RadxBenchmark below the main action component.

#### H. Operator personas
Replace operator names in seed data:
- `Vincent Pillay` → `Nikki Pearmain`
- `Thabo Mokoena` → `Nombuso Ncube`
- Keep a third generic name or add `Shanaaz Smith` (also from real data)

### 3. POC Document Update (`docs/RTUSA-POC-V2.md`)

Targeted edits only:
- Version bump to V2.4 with changelog entry
- Global naming: Nimbus→Nimbis, Rock→ROC
- SLA table: updated values (4hr ROC, 4hr internal approval, 4hr QA appt, 48hr QA decision)
- Context section: correct system names
- Workflow descriptions: ROC submission now has 4hr SLA, within-excess is auto-close
- Assumptions section: add new items from gap analysis (towing trigger, fraud routing, broker entity, Radx) as "pending validation"
- Do NOT add ROC_SUBMISSION as new formal workflow state — flag for workshop validation

### 4. Diagram Updates

**Accident (`docs/diagrams/workflow-accident.mmd`):**
- Nimbus→Nimbis, Rock→ROC in all labels
- SLA labels: REG "4hr SLA", INT_APPR "4hr SLA", QA "4hr SLA", QA_DEC "48hr SLA"
- WITHIN_EX text: "AUTO-CLOSE / Draft notification to policyholder & broker"
- Dashed annotation near ASSESS_RCV: "Radx benchmark comparison"

**Theft (`docs/diagrams/workflow-theft.mmd`):**
- Nimbis/ROC naming
- REG "4hr SLA", QA "4hr SLA", QA_DEC "48hr SLA"

**Glass (`docs/diagrams/workflow-glass.mmd`):**
- Nimbis/ROC naming
- REG "4hr SLA"

## Files Touched

| File | Change |
|------|--------|
| `docs/meeting-prep-brief.md` | New |
| `docs/RTUSA-POC-V2.md` | Edit — naming, SLAs, version bump, assumptions |
| `docs/diagrams/workflow-accident.mmd` | Edit — naming, SLAs, auto-close, Radx note |
| `docs/diagrams/workflow-theft.mmd` | Edit — naming, SLAs |
| `docs/diagrams/workflow-glass.mmd` | Edit — naming, SLAs |
| `src/types/index.ts` | Edit — bridgeSystem type `'nimbis' \| 'roc'` |
| `src/data/workflow-definitions.ts` | Edit — naming, SLA values, bridge types |
| `src/data/seed-claims.ts` | Rewrite — 16 claims with real data patterns |
| `src/data/seed-contacts.ts` | Edit — names, add glass repairers |
| `src/lib/workflow-engine.ts` | Edit — within-excess auto-close logic |
| `src/components/claims/actions/radx-benchmark.tsx` | New — mock parts comparison |
| `src/components/claims/actions/assessment-received.tsx` | Edit — integrate Radx component |
| `src/components/claims/action-panel.tsx` | Possible edit — Radx rendering dispatch |
| `src/components/claims/claim-header.tsx` | Edit — SPM prominence |
| `src/components/claims-list/claim-table.tsx` | Edit — SPM as primary column |
| `src/pages/claims-list-page.tsx` | Edit — search placeholder |
| Multiple component files | Edit — Nimbus→Nimbis, Rock→ROC in strings |

## Out of Scope (Workshop Discussion Items)

- ROC_SUBMISSION as separate workflow state (validate first)
- Fraud routing placeholder
- Towing-triggered claims path
- Broker as first-class entity
- Functional Radx integration (mock only)
- Claim technician vs handler dual-role model
- Rejection codes (need list from Vassen)
