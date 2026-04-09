# Workshop Prep & Demo Update — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare meeting brief, update demo with corrected naming/SLAs/real data/Radx mock/SPM prominence/auto-close, update POC doc and diagrams — all before tomorrow's RTU workshop.

**Architecture:** Data-only and UI-text changes dominate. One new component (Radx benchmark). One behavioral change (within-excess auto-close). No new state machine states, no structural refactoring.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite 8, date-fns, shadcn/ui

---

### Task 1: Meeting Prep Brief

**Files:**
- Create: `docs/meeting-prep-brief.md`

- [ ] **Step 1: Create the meeting prep brief**

```markdown
# RTU Workshop — Meeting Prep Brief
**Date:** 2026-04-10
**Attendees:** Mike Mgodeli, Vassen Moodley, Steve Cory (RTU) / Reuben John, Fred Brunner (True Aim)

---

## Proposed Agenda (60 min)

| Time | Topic | Goal |
|------|-------|------|
| 0–3 min | Opening | Set goals: align on claim intake, validate assumptions, define Phase 1 scope |
| 3–23 min | Demo walkthrough | Live demo with corrected naming, SLAs, real data patterns. One accident claim end-to-end, one glass claim. Show Radx benchmark mock at assessment step. |
| 23–35 min | Claim intake deep-dive | How does a claim arrive today? What does ClaimPilot replace? Validate proposed intake flow (manual form upload, documents added along the way). |
| 35–50 min | Assumption validation | Walk assumption table below. Get explicit confirm/correct on each. |
| 50–60 min | Phase 1 scope definition | In/out/deferred. Get explicit prioritization from RTU. |

---

## What We Changed in the Demo (Based on Your Inputs)

- **Naming corrected**: Nimbus → Nimbis, Rock → ROC throughout the application
- **SLA timings aligned**: ROC submission 4hr, internal approval 4hr, QA appointment 4hr, QA decision 48hr (per your working document)
- **Claim type distribution**: Now reflects real split — ~50% glass, ~44% accident, ~6% theft
- **Real data patterns**: Toyota Corolla Quest, Etios, Quantum fleet. Broker names (Oaksure, Primak, Ikhethelo). SA phone formats. Realistic ZAR amounts.
- **SPM number as primary identifier**: SPM claim number shown first in headers and claim list
- **Within-excess auto-close**: Claims within excess now auto-close with notification (per Steve's direction)
- **Radx parts benchmark**: Mock comparison shown at assessment step — assessor quote vs Radx benchmark pricing

---

## Data Insights from Your SQL Dumps

We analyzed 4 datasets (1,000 records each):

| Metric | Value |
|--------|-------|
| Claim type split | Glass 52%, Accident 47%, Theft <1% |
| Average claim payout | R35,188 |
| Highest single claim | R485,182 |
| Active brokers | 20+ (top 3: Oaksure 12%, Primak 8%, Ikhethelo 8%) |
| Fleet profile | Toyota Corolla Quest 15%, Etios 7%, Quantum 10%+ |
| Primary market | Gauteng 26%, KwaZulu-Natal 6% |
| Client email coverage | 98% — strong foundation for digital comms |
| Vehicle registrations | GP (Gauteng), ND (KZN) format dominant |

---

## Assumptions to Validate

### Workflow

| # | Assumption | Current Behavior | Risk if Wrong | Question |
|---|-----------|-----------------|---------------|----------|
| 1 | Nimbis validation (12hr) and ROC submission (4hr) are two separate SLA-tracked steps | We model ROC submission as a 4hr SLA step after policy validation | Workflow structure changes | Are these distinct steps with separate deadlines, or one combined step? |
| 2 | Within-excess claims auto-close without human approval | Auto-close with notification generated | May need operator confirmation in some cases | Steve said no human approval needed — confirm this is the desired behavior for all cases? |
| 3 | QA decision SLA is 48 hours | We use 48hr from your working doc | If shorter (6hr as we had before), demo will look wrong | Confirm: 48 hours for QA to make a decision after appointment? |
| 4 | Internal approval SLA is 4 hours | Updated to 4hr | If too tight, operators will always breach | Confirm: 4 hours for internal approval on claims under R50k? |
| 5 | All theft claims go to QA regardless of value | Mandatory QA, no amount-based routing | If some low-value thefts can skip QA, workflow changes | Confirm: every theft claim must go through QA? |

### Data & Integration

| # | Assumption | Risk if Wrong | Question |
|---|-----------|---------------|----------|
| 6 | SPM number from ROC is the primary claim identifier | UI redesign if RTU uses a different primary reference | Is SPM the number your team references when discussing claims? |
| 7 | Driver and insured are usually the same person for taxi claims | May need more prominent driver entity separation | How often is the driver different from the policy holder? |
| 8 | Claim intake is manual form upload by handlers | May need Zoho integration or policyholder portal | How do claims arrive today? Zoho form → handler → manual entry? |
| 9 | Finance details are captured but not acted on | May need finance company notifications at settlement | Do finance companies need to be notified when claims settle? |

### Operations

| # | Assumption | Risk if Wrong | Question |
|---|-----------|---------------|----------|
| 10 | SLAs run 24/7 calendar hours | Need business-hours mode with weekend/holiday exclusions | Do claims handlers work 7 days a week? |
| 11 | English-only for all communications | Need multilingual templates | Are all policyholder/broker communications in English? |
| 12 | Closed claims cannot be reopened | May need reopening capability for disputes | Has RTU ever needed to reopen a closed claim? |
| 13 | Single operator role (no permissions) | May need manager vs handler views | Do you need role-based access for Phase 1? |
| 14 | SLA reminders at 75%/90%/100% thresholds | RTU working doc suggests absolute countdowns (36hr, 24hr before breach) | Which reminder model do you prefer: percentage-based or absolute countdown? |

---

## Open Items Pending from RTU

| Item | Owner | Status | Impact |
|------|-------|--------|--------|
| Screen-recorded video walkthrough of ROC + Nimbis workflow | Mike | Not started | Critical for understanding bridge step UX |
| Fixed list of assessors/investigators with contact details | Mike | Not started | Needed for managed contact lists |
| Minimum 50 historical claims for testing | RTU | Not started | Needed for realistic demo and validation |
| Operational metrics for dashboard | Vassen | Not started | Dashboard KPI configuration |
| Process flow documentation (stages, SLA, interaction logging) | Vassen | Not started | Detailed workflow specification |
| Default SLA values confirmation | RTU + True Aim | Pending | SLA tuning |
| Desired rejection codes/categories | Vassen | Not started | Structured rejection reasons |

---

## Phase 1 Scope Proposal

### In Scope (Proposed)

- Three claim type workflows (accident, theft, glass) with corrected SLAs
- Manual bridge steps for Nimbis and ROC (copy-paste, no API)
- SLA tracking and breach alerts
- Draft email generation at all workflow triggers
- Operator dashboard with SLA performance metrics
- Managed contact lists (assessors, investigators, repairers)
- Audit trail for all claim actions
- Manual claim intake (operator uploads form, adds documents along the way)

### Deferred (Discuss Priority)

| Feature | Reason to Defer | Reason to Include |
|---------|----------------|-------------------|
| Fraud routing | Scoring model not yet defined | Addresses pain point #9 |
| Towing-triggered claims | Intake path unclear | Affects claim creation UX |
| Radx parts integration (functional) | API/data access TBD | Directly addresses cost leakage pain point #8 |
| Broker as first-class entity | UI scoping needed | 20+ brokers, need filtering/reporting |
| Zoho integration | API access TBD | Removes manual data re-entry |
| Role-based access | One role sufficient for pilot | Needed for manager vs handler distinction |
| Claim reopening | Edge case | May be needed for disputes |

---

## Demo Walkthrough Script

### Accident Claim (Full Path)
1. Show claims list — point out SPM numbers, SLA indicators, real vehicle data
2. Open new accident claim — show Corolla Quest, Oaksure broker
3. Policy Validation — show Nimbis bridge step with copy fields
4. Register on ROC — show 4hr SLA, enter SPM number
5. Appoint Assessor — show contact selection, draft email generated
6. Assessment Received — enter R14,000 assessed amount, **show Radx benchmark comparison** (R1,330 potential saving)
7. Auto-route to Internal Approval (under R50k)
8. Approve → AOL → Route to Repair
9. Show SLA tracking throughout

### Glass Claim (Short Path)
1. Open glass claim — show stone chip on Etios windscreen
2. Policy Validation → Register → Appoint Glass Repairer → Done
3. Emphasize: this is 52% of their volume — fast, efficient path

### Dashboard
1. Show SLA compliance by step
2. Show breached claims list
3. Point out operator workload distribution
```

- [ ] **Step 2: Commit**

```bash
git add docs/meeting-prep-brief.md
git commit -m "docs: add meeting prep brief for RTU workshop"
```

---

### Task 2: Naming Corrections — Types & Bridge Banner

**Files:**
- Modify: `src/types/index.ts:230`
- Modify: `src/components/claims/bridge-step-banner.tsx:5,11-12`

- [ ] **Step 1: Update bridgeSystem type in types/index.ts**

Change line 230 from:
```typescript
  bridgeSystem?: 'nimbus' | 'rock'
```
to:
```typescript
  bridgeSystem?: 'nimbis' | 'roc'
```

- [ ] **Step 2: Update bridge-step-banner.tsx**

Change the interface type (line 5) from:
```typescript
  system: 'nimbus' | 'rock'
```
to:
```typescript
  system: 'nimbis' | 'roc'
```

Change the systemNames map (lines 11-12) from:
```typescript
  nimbus: 'Nimbus',
  rock: 'Rock',
```
to:
```typescript
  nimbis: 'Nimbis',
  roc: 'ROC',
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/components/claims/bridge-step-banner.tsx
git commit -m "refactor: rename bridge systems Nimbus→Nimbis, Rock→ROC in types"
```

---

### Task 3: Naming Corrections — Workflow Definitions & SLA Updates

**Files:**
- Modify: `src/data/workflow-definitions.ts`

This task does both naming AND SLA value changes in one file.

- [ ] **Step 1: Update accident steps — naming and SLAs**

Replace all `bridgeSystem: 'nimbus'` with `bridgeSystem: 'nimbis'` and all `bridgeSystem: 'rock'` with `bridgeSystem: 'roc'` throughout the file (use replace_all).

Update descriptions — replace all occurrences of:
- `"on Nimbus"` → `"on Nimbis"`
- `"on Rock"` → `"on ROC"`
- `"from Rock"` → `"from ROC"`

Update SLA values in accident steps:
- REGISTERED (line 26): `slaHours: null` → `slaHours: 4`
- INTERNAL_APPROVAL (line 61): `slaHours: 24` → `slaHours: 4`
- QA_APPOINTED (line 69): `slaHours: 6` → `slaHours: 4`
- QA_DECISION (line 78): `slaHours: 6` → `slaHours: 48`

Remove the comment on REGISTERED line 26: `// included in policy validation SLA`

- [ ] **Step 2: Update theft steps — naming and SLAs**

Same naming changes for theft steps.

Update SLA values in theft steps:
- REGISTERED (line 211): `slaHours: null` → `slaHours: 4`
- QA_APPOINTED (line 238): `slaHours: 6` → `slaHours: 4`
- QA_DECISION (line 248): `slaHours: 6` → `slaHours: 48`

- [ ] **Step 3: Update glass steps — naming and SLAs**

Same naming changes for glass steps.

Update SLA value in glass steps:
- REGISTERED (line 379): `slaHours: null` → `slaHours: 4`

- [ ] **Step 4: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/workflow-definitions.ts
git commit -m "fix: correct system names (Nimbis/ROC) and SLA timings per RTU working doc"
```

---

### Task 4: Naming Corrections — UI Components

**Files:**
- Modify: `src/components/claims/actions/policy-validation.tsx:39-42,54`
- Modify: `src/components/claims/actions/register-on-rock.tsx` (rename file + update content)
- Modify: `src/components/claims/actions/appoint-contact.tsx:46-47`
- Modify: `src/components/claims/actions/qa-decision.tsx:41-42`
- Modify: `src/components/claims/actions/aol-generated.tsx:20-21,25`
- Modify: `src/components/claims/action-panel.tsx:9,67`

- [ ] **Step 1: Update policy-validation.tsx**

Change `system="nimbus"` to `system="nimbis"` (line 39).

Change description strings (lines 41-42):
```typescript
          ? "Look up the insured on Nimbus using the details below. Verify the policy is active, then enter the policy number."
          : "Look up the insured on Nimbus using the details below. Verify the policy is active, then enter the policy number and excess amount."
```
to:
```typescript
          ? "Look up the insured on Nimbis using the details below. Verify the policy is active, then enter the policy number."
          : "Look up the insured on Nimbis using the details below. Verify the policy is active, then enter the policy number and excess amount."
```

Change heading (line 54): `"Enter from Nimbus"` → `"Enter from Nimbis"`

- [ ] **Step 2: Rename register-on-rock.tsx → register-on-roc.tsx and update content**

Rename the file: `src/components/claims/actions/register-on-rock.tsx` → `src/components/claims/actions/register-on-roc.tsx`

Update the export name: `RegisterOnRock` → `RegisterOnROC`

Change `system="rock"` to `system="roc"` (line 33).

Change instruction (line 34):
```typescript
        instruction="Register this claim on Rock using the data below. Enter the SPM claim number once registration is complete."
```
to:
```typescript
        instruction="Register this claim on ROC using the data below. Enter the SPM claim number once registration is complete."
```

Change heading (line 51): `"Enter from Rock"` → `"Enter from ROC"`

- [ ] **Step 3: Update appoint-contact.tsx**

Change `system="rock"` to `system="roc"` (line 46).

Change instruction (line 47):
```typescript
          instruction={`Select a ${roleLabels[contactRole].toLowerCase()} and confirm the appointment on Rock.`}
```
to:
```typescript
          instruction={`Select a ${roleLabels[contactRole].toLowerCase()} and confirm the appointment on ROC.`}
```

- [ ] **Step 4: Update qa-decision.tsx**

Change `system="rock"` to `system="roc"` (line 41).

Change instruction (line 42):
```typescript
          instruction="QA has been appointed on Rock. Awaiting the QA decision."
```
to:
```typescript
          instruction="QA has been appointed on ROC. Awaiting the QA decision."
```

- [ ] **Step 5: Update aol-generated.tsx**

Change `system="rock"` to `system="roc"` (line 20).

Change instruction (line 21):
```typescript
        instruction="Generate the Authority of Loss (AOL) on Rock for this claim, then confirm below."
```
to:
```typescript
        instruction="Generate the Authority of Loss (AOL) on ROC for this claim, then confirm below."
```

Change body text (line 25): `"on Rock"` → `"on ROC"`

- [ ] **Step 6: Update action-panel.tsx import and usage**

Change import (line 9):
```typescript
import { RegisterOnRock } from './actions/register-on-rock'
```
to:
```typescript
import { RegisterOnROC } from './actions/register-on-roc'
```

Change usage (line 67):
```typescript
      return <RegisterOnRock claim={claim} />
```
to:
```typescript
      return <RegisterOnROC claim={claim} />
```

- [ ] **Step 7: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: rename Nimbus→Nimbis, Rock→ROC across all UI components"
```

---

### Task 5: Seed Contacts Update

**Files:**
- Modify: `src/data/seed-contacts.ts`

- [ ] **Step 1: Rewrite seed contacts with more glass repairers and operator personas**

Replace the full content of `src/data/seed-contacts.ts` with:

```typescript
import type { Contact } from '@/types'

export const seedContacts: Contact[] = [
  // Assessors
  {
    id: 'CON-001',
    name: 'Pieter van der Merwe',
    email: 'pieter@assessments.co.za',
    phone: '+27 82 555 0101',
    role: 'assessor',
  },
  {
    id: 'CON-002',
    name: 'Thandiwe Nkosi',
    email: 'thandiwe@motorassess.co.za',
    phone: '+27 83 555 0202',
    role: 'assessor',
  },
  {
    id: 'CON-003',
    name: 'Rajesh Govender',
    email: 'rajesh@autoassess.co.za',
    phone: '+27 84 555 0303',
    role: 'assessor',
  },
  // Investigators
  {
    id: 'CON-004',
    name: 'Sipho Dlamini',
    email: 'sipho@investigate.co.za',
    phone: '+27 72 555 0404',
    role: 'investigator',
  },
  {
    id: 'CON-005',
    name: 'Jacques Fourie',
    email: 'jacques@claimsinvest.co.za',
    phone: '+27 76 555 0505',
    role: 'investigator',
  },
  // Repairers
  {
    id: 'CON-006',
    name: "Vusi's Auto Repairs",
    email: 'vusi@autorepairs.co.za',
    phone: '+27 11 555 0606',
    role: 'repairer',
  },
  {
    id: 'CON-007',
    name: 'Peninsula Panel Beaters',
    email: 'info@peninsulapanel.co.za',
    phone: '+27 21 555 0707',
    role: 'repairer',
  },
  // Glass repairers (expanded — glass is 52% of claim volume)
  {
    id: 'CON-008',
    name: 'PG Glass Johannesburg',
    email: 'claims@pgglass.co.za',
    phone: '+27 11 555 0808',
    role: 'glass_repairer',
  },
  {
    id: 'CON-009',
    name: 'Autoglass Durban',
    email: 'service@autoglass.co.za',
    phone: '+27 31 555 0909',
    role: 'glass_repairer',
  },
  {
    id: 'CON-010',
    name: 'PG Glass Pretoria',
    email: 'pretoria@pgglass.co.za',
    phone: '+27 12 555 1010',
    role: 'glass_repairer',
  },
  {
    id: 'CON-011',
    name: 'Windscreen Express Cape Town',
    email: 'info@windscreenexpress.co.za',
    phone: '+27 21 555 1111',
    role: 'glass_repairer',
  },
]

export function getContactsByRole(role: Contact['role']): Contact[] {
  return seedContacts.filter(c => c.role === role)
}

export function getContactById(id: string): Contact | undefined {
  return seedContacts.find(c => c.id === id)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/seed-contacts.ts
git commit -m "data: update seed contacts with SA phone format, add glass repairers"
```

---

### Task 6: Seed Claims Rewrite

**Files:**
- Modify: `src/data/seed-claims.ts`

- [ ] **Step 1: Rewrite seed claims with real data patterns**

Replace `src/data/seed-claims.ts` with 16 claims reflecting real distribution: 8 glass, 7 accident, 1 theft. Use real broker names (Oaksure, Primak, Ikhethelo, Taccsure, Synergy), real vehicle models (Corolla Quest 1.6, Etios 1.5, Quantum 2.5D-4D, Almera 1.5), operator names (Nikki Pearmain, Nombuso Ncube, Shanaaz Smith), SA phone format (+27...), GP/ND registrations, and realistic ZAR amounts (glass R1,500–R4,500, accident R8,000–R180,000).

Key changes to the file structure:
- Change `operators` array from `['Vincent Pillay', 'Thabo Mokoena', 'Mhay Robarts']` to `['Nikki Pearmain', 'Nombuso Ncube', 'Shanaaz Smith']`
- Update the `makeSLA` function's REGISTERED step SLA references to use `4` instead of `12` where appropriate (since REGISTERED now has a 4hr SLA)
- Ensure all `slaHistory` records for INTERNAL_APPROVAL use `4` (not `24`), for QA steps use `4`/`48` as appropriate

Claims to include (covering workflow demo variety):

| # | Type | Status | SLA State | Broker | Vehicle | Amount |
|---|------|--------|-----------|--------|---------|--------|
| 1 | accident | NEW | within | Oaksure Financial Services | 2022 Toyota Corolla Quest 1.6 | — |
| 2 | accident | POLICY_VALIDATION | approaching | Primak Insurance Brokers | 2021 Toyota Quantum 2.5D-4D GL | — |
| 3 | accident | ASSESSOR_APPOINTED | breached | Ikhethelo Brokers | 2020 Nissan Almera 1.5 Acenta | R10K excess |
| 4 | accident | ASSESSMENT_RECEIVED | within | Taccsure Insurance Brokers | 2021 Toyota Etios 1.5 Xi | R35K assessed |
| 5 | accident | INTERNAL_APPROVAL | approaching | Synergy Risk Managers | 2019 VW Caddy 2.0TDI | R42K assessed |
| 6 | accident | INSPECTION_FINAL_COSTING | within | Oaksure Financial Services | 2022 Toyota Quantum 2.5D-4D GL | R28K |
| 7 | accident | CLOSED | — | Primak Insurance Brokers | 2020 Nissan NV350 Impendulo 2.5i | R18.5K |
| 8 | theft | INVESTIGATOR_APPOINTED | within | Ikhethelo Brokers | 2023 Toyota Quantum 2.5D-4D GL | R95K value |
| 9 | glass | NEW | within | Oaksure Financial Services | 2021 Toyota Corolla Quest 1.6 | — |
| 10 | glass | POLICY_VALIDATION | within | Taccsure Insurance Brokers | 2022 Toyota Etios 1.5 Xi | — |
| 11 | glass | REGISTERED | within | Primak Insurance Brokers | 2020 Nissan Almera 1.5 Acenta | — |
| 12 | glass | GLASS_REPAIRER_APPOINTED | breached | Synergy Risk Managers | 2021 Toyota Quantum 2.5D-4D GL | — |
| 13 | glass | GLASS_REPAIRER_APPOINTED | within | Ikhethelo Brokers | 2022 Toyota Corolla Quest 1.6 | — |
| 14 | glass | REPAIR_COMPLETE | — | Oaksure Financial Services | 2020 Toyota Etios 1.5 Xi | — |
| 15 | glass | CLOSED | — | Taccsure Insurance Brokers | 2019 Toyota Corolla Quest 1.6 | R2,200 |
| 16 | glass | CLOSED | — | Primak Insurance Brokers | 2021 Nissan Almera 1.5 Acenta | R3,800 |

Each claim should follow the existing seed-claims.ts patterns (same `makeSLA`, `makeDocs` helpers, same data structure). Use SPM numbers like `SPM-2026-04-XXXX`.

Glass claims use incident details with `causeOfLoss` (stone chip, crack, vandalism) and `vehicleLocation` instead of `policeReference`.

Accident/theft claims include police references in format `XXX-CAS-2026/04/XXXX`.

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/data/seed-claims.ts
git commit -m "data: rewrite seed claims with real RTU data patterns (16 claims, correct distribution)"
```

---

### Task 7: Update Claims List — SPM Prominence & Current User

**Files:**
- Modify: `src/pages/claims-list-page.tsx:28,142,167,221-224`

- [ ] **Step 1: Update currentUser to match new operator name**

Change line 28:
```typescript
  const currentUser = 'Vincent Pillay'
```
to:
```typescript
  const currentUser = 'Nikki Pearmain'
```

- [ ] **Step 2: Update search placeholder**

Change the placeholder (line 142):
```typescript
            placeholder="Search by ID, name, registration, policy..."
```
to:
```typescript
            placeholder="Search by SPM #, name, registration, policy..."
```

- [ ] **Step 3: Update table header**

Change the first column header (line 167):
```typescript
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Claim</th>
```
to:
```typescript
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">SPM #</th>
```

- [ ] **Step 4: Update ClaimRow to show SPM number as primary**

Change lines 221-224 in the ClaimRow function:
```typescript
      <td className="px-4 py-2.5">
        <Link to={`/claims/${claim.id}`} className="text-sm font-medium text-primary-600 hover:underline">
          {claim.id}
        </Link>
      </td>
```
to:
```typescript
      <td className="px-4 py-2.5">
        <Link to={`/claims/${claim.id}`} className="text-sm font-medium text-primary-600 hover:underline">
          {claim.workflow.spmClaimNumber || claim.id}
        </Link>
        {claim.workflow.spmClaimNumber && (
          <div className="text-[11px] text-text-muted">{claim.id}</div>
        )}
      </td>
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/claims-list-page.tsx
git commit -m "ui: SPM number as primary identifier in claims list"
```

---

### Task 8: Update Claim Header — SPM Prominence

**Files:**
- Modify: `src/components/claims/claim-header.tsx:22-27`

- [ ] **Step 1: Show SPM as primary, internal ID as secondary**

Change lines 22-27:
```typescript
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{claim.id}</h1>
            <ClaimTypeBadge type={claim.type} />
            <StatusBadge status={claim.status} />
            <SlaIndicator claim={claim} />
          </div>
```
to:
```typescript
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold">
                {claim.workflow.spmClaimNumber || claim.id}
              </h1>
              {claim.workflow.spmClaimNumber && (
                <span className="text-xs text-text-muted">{claim.id}</span>
              )}
            </div>
            <ClaimTypeBadge type={claim.type} />
            <StatusBadge status={claim.status} />
            <SlaIndicator claim={claim} />
          </div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/claims/claim-header.tsx
git commit -m "ui: SPM number as primary identifier in claim header"
```

---

### Task 9: Within-Excess Auto-Close

**Files:**
- Modify: `src/components/claims/actions/within-excess.tsx`

- [ ] **Step 1: Replace manual close button with auto-close info**

Replace the entire content of `within-excess.tsx`:

```typescript
import { useEffect } from 'react'
import type { Claim } from '@/types'
import { useClaims } from '@/context/ClaimContext'
import { formatZAR } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

export function WithinExcess({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()

  useEffect(() => {
    // Auto-close: dispatch after a brief delay so the user sees the info card
    const timer = setTimeout(() => {
      dispatch({
        type: 'ADVANCE_WORKFLOW',
        claimId: claim.id,
        toState: 'CLOSED',
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [claim.id, dispatch])

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-success-200 bg-success-50/50 p-4">
        <CheckCircle2 className="mt-0.5 size-5 text-success-500 flex-shrink-0" />
        <div>
          <div className="text-sm font-medium text-success-700">Auto-Closing — Within Excess</div>
          <p className="mt-1 text-sm text-text-secondary">
            The assessed amount of {formatZAR(claim.workflow.assessedAmount ?? 0)} is within the
            policy excess of {formatZAR(claim.workflow.excessAmount ?? 0)}.
            This claim is being auto-closed. A draft notification has been generated for the policyholder and broker.
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/claims/actions/within-excess.tsx
git commit -m "feat: within-excess auto-close (no human approval per Steve Cory)"
```

---

### Task 10: Radx Benchmark Mock Component

**Files:**
- Create: `src/components/claims/actions/radx-benchmark.tsx`
- Modify: `src/components/claims/actions/assessment-received.tsx`

- [ ] **Step 1: Create the Radx benchmark component**

Create `src/components/claims/actions/radx-benchmark.tsx`:

```typescript
import { TrendingDown } from 'lucide-react'
import { formatZAR } from '@/lib/utils'

interface BenchmarkPart {
  name: string
  assessorQuote: number
  radxBenchmark: number
}

const mockParts: BenchmarkPart[] = [
  { name: 'Front bumper', assessorQuote: 4200, radxBenchmark: 3680 },
  { name: 'Headlight LH', assessorQuote: 2800, radxBenchmark: 2450 },
  { name: 'Bonnet', assessorQuote: 5100, radxBenchmark: 4890 },
  { name: 'Fender RH', assessorQuote: 1900, radxBenchmark: 1650 },
]

export function RadxBenchmark() {
  const totalAssessor = mockParts.reduce((sum, p) => sum + p.assessorQuote, 0)
  const totalRadx = mockParts.reduce((sum, p) => sum + p.radxBenchmark, 0)
  const totalSaving = totalAssessor - totalRadx
  const totalPercent = Math.round((totalSaving / totalAssessor) * 100)

  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="size-4 text-primary-600" />
        <h4 className="text-sm font-semibold text-primary-700">Radx Parts Benchmark</h4>
        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-600 uppercase">
          Preview
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-primary-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary-50/50">
              <th className="px-3 py-1.5 text-left text-[11px] font-medium text-text-secondary uppercase">Part</th>
              <th className="px-3 py-1.5 text-right text-[11px] font-medium text-text-secondary uppercase">Assessor</th>
              <th className="px-3 py-1.5 text-right text-[11px] font-medium text-text-secondary uppercase">Radx</th>
              <th className="px-3 py-1.5 text-right text-[11px] font-medium text-text-secondary uppercase">Variance</th>
            </tr>
          </thead>
          <tbody>
            {mockParts.map(part => {
              const saving = part.assessorQuote - part.radxBenchmark
              const percent = Math.round((saving / part.assessorQuote) * 100)
              return (
                <tr key={part.name} className="border-t border-primary-100">
                  <td className="px-3 py-1.5 text-text-primary">{part.name}</td>
                  <td className="px-3 py-1.5 text-right text-text-secondary">{formatZAR(part.assessorQuote)}</td>
                  <td className="px-3 py-1.5 text-right text-text-secondary">{formatZAR(part.radxBenchmark)}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-success-600">
                    -{formatZAR(saving)} ({percent}%)
                  </td>
                </tr>
              )
            })}
            <tr className="border-t-2 border-primary-200 bg-primary-50/30 font-semibold">
              <td className="px-3 py-2 text-text-primary">Total</td>
              <td className="px-3 py-2 text-right">{formatZAR(totalAssessor)}</td>
              <td className="px-3 py-2 text-right">{formatZAR(totalRadx)}</td>
              <td className="px-3 py-2 text-right text-success-600">
                -{formatZAR(totalSaving)} ({totalPercent}%)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-text-muted">
        Potential saving: {formatZAR(totalSaving)} ({totalPercent}%) based on Radx OEM pricing database.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Integrate Radx into assessment-received.tsx**

Add import at the top of `src/components/claims/actions/assessment-received.tsx` (after existing imports):
```typescript
import { RadxBenchmark } from './radx-benchmark'
```

Add the Radx component after the auto-route info box and before the submit button. Replace the return JSX block (lines 37-78) with:

```typescript
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Enter the assessed amount from the {isInvestigation ? 'investigation' : 'assessment'} report.
        The system will auto-route the claim based on the amount.
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-surface-secondary p-3">
          <div className="text-[11px] font-medium text-text-muted uppercase">Excess Amount</div>
          <div className="text-lg font-semibold">{formatZAR(excess)}</div>
        </div>
        <div>
          <Label htmlFor="assessedAmount">Assessed Amount (ZAR)</Label>
          <Input
            id="assessedAmount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 35000"
            className="mt-1"
          />
        </div>
      </div>

      {route && (
        <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50/50 p-3 text-sm">
          <ArrowRight className="size-4 text-primary-500 flex-shrink-0" />
          <div>
            <span className="font-medium text-primary-700">Auto-route: </span>
            <span className="text-text-secondary">{routeLabels[route]}</span>
          </div>
        </div>
      )}

      {claim.type === 'accident' && <RadxBenchmark />}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!amount || assessedNum <= 0}>
          Submit {isInvestigation ? 'Investigation' : 'Assessment'} & Route
        </Button>
      </div>
    </div>
  )
```

The only change is the addition of `{claim.type === 'accident' && <RadxBenchmark />}` after the auto-route info box.

- [ ] **Step 3: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/claims/actions/radx-benchmark.tsx src/components/claims/actions/assessment-received.tsx
git commit -m "feat: add Radx parts benchmark mock at assessment step (accident only)"
```

---

### Task 11: Update Mermaid Diagrams

**Files:**
- Modify: `docs/diagrams/workflow-accident.mmd`
- Modify: `docs/diagrams/workflow-theft.mmd`
- Modify: `docs/diagrams/workflow-glass.mmd`

- [ ] **Step 1: Update accident diagram**

Key changes to `docs/diagrams/workflow-accident.mmd`:
- `Bridge: Nimbus` → `Bridge: Nimbis` in PV node
- `Bridge: Rock` → `Bridge: ROC` in REG, ASSESS_APPT, QA, AOL1, AOL2 nodes
- `"12hr SLA"` on NEW→PV stays 12hr
- Add `"4hr SLA"` label on PV→REG (currently no SLA label on this edge)
- `"12hr SLA"` on REG→ASSESS_APPT stays 12hr
- `"24hr SLA"` on INT_APPR approve → change to `"4hr SLA"`
- `"6hr SLA"` on QA→QA_DEC → change to `"48hr SLA"`
- WITHIN_EX text: change from `"WITHIN EXCESS<br/>Draft notification to<br/>policyholder & broker"` to `"WITHIN EXCESS<br/>Auto-close &amp; draft notification<br/>to policyholder &amp; broker"`
- Add annotation: `RADX["🔍 Radx Parts<br/>Benchmark"]` near ASSESS_RCV with dashed styling

- [ ] **Step 2: Update theft diagram**

Key changes to `docs/diagrams/workflow-theft.mmd`:
- `Bridge: Nimbus` → `Bridge: Nimbis`
- `Bridge: Rock` → `Bridge: ROC`
- Add `"4hr SLA"` on REG step (edge from PV→REG implied)
- `"6hr SLA"` on QA→QA_DEC → `"48hr SLA"`

- [ ] **Step 3: Update glass diagram**

Key changes to `docs/diagrams/workflow-glass.mmd`:
- `Bridge: Nimbus` → `Bridge: Nimbis`
- `Bridge: Rock` → `Bridge: ROC`
- Add `"4hr SLA"` on REG step

- [ ] **Step 4: Commit**

```bash
git add docs/diagrams/workflow-accident.mmd docs/diagrams/workflow-theft.mmd docs/diagrams/workflow-glass.mmd
git commit -m "docs: update workflow diagrams with corrected naming and SLA timings"
```

---

### Task 12: POC Document Update

**Files:**
- Modify: `docs/RTUSA-POC-V2.md`

- [ ] **Step 1: Add V2.4 changelog entry**

Add below the existing V2.3 changelog entry:

```markdown
**V2.4 (2026-04-09)** — RTU working document alignment

- **System naming corrected throughout.** Nimbus → Nimbis, Rock → ROC to match RTU's actual system names.
- **SLA timings updated from RTU working document (section 6).** ROC submission: added 4-hour SLA (was bundled with policy validation). Internal approval: 24h → 4h. QA appointment: 6h → 4h. QA decision: 6h → 48h.
- **Within-excess auto-close (section 5.6.6).** Per Steve Cory's direction, claims within excess now auto-close with policyholder/broker notification — no operator confirmation required.
- **Radx parts benchmark preview (section 5.6.5).** Mock comparison of assessor quotes against Radx OEM pricing shown at assessment received step for accident claims. Read-only preview; functional integration deferred.
- **Seed data aligned to real RTU data patterns.** Claim type distribution (52% glass, 47% accident, <1% theft), real broker names, real vehicle models, realistic ZAR amounts.
- **SPM claim number promoted to primary identifier** in claim headers and list views.
- **New assumptions added for workshop validation (section 15).** Towing-triggered claims, fraud routing, broker entity model, Radx functional integration, reminder cadence model.
```

- [ ] **Step 2: Global find-and-replace Nimbus→Nimbis, Rock→ROC**

Replace all occurrences of `Nimbus` with `Nimbis` and `Rock` with `ROC` throughout the document. Be careful not to replace "rock" in non-system contexts (e.g., "rocket", "bedrock"). The document uses "Rock" and "Nimbus" as proper nouns referring to systems.

- [ ] **Step 3: Update SLA table**

Find the SLA configuration table and update values:
- ROC submission (REGISTERED): add `4 hours` (was listed as included in policy validation)
- Internal approval: `24 hours` → `4 hours`
- QA appointment: `6 hours` → `4 hours`
- QA decision: `6 hours` → `48 hours`

- [ ] **Step 4: Add new assumptions to section 15**

Add these items to the assumptions table:

| # | Assumption | Risk if Wrong |
|---|-----------|---------------|
| 9 | Towing-triggered claims follow the same workflow as form-submitted claims | May need separate intake path and different initial data |
| 10 | Fraud routing is post-MVP (no fraud module in Phase 1) | If RTU expects fraud flagging in Phase 1, scope changes significantly |
| 11 | Broker is a field on the claim, not a first-class entity with its own views | 20+ active brokers may need filtered dashboards or portal access |
| 12 | Radx parts integration is read-only preview in Phase 1 | If RTU expects actionable cost intervention, scope increases |
| 13 | SLA reminders use percentage-based thresholds (75%, 90%, 100%) | RTU working doc suggests absolute countdowns (36hr, 24hr before breach); model may need to change |

- [ ] **Step 5: Commit**

```bash
git add docs/RTUSA-POC-V2.md
git commit -m "docs: update POC to V2.4 — naming, SLAs, auto-close, new assumptions"
```

---

### Task 13: Final Build Verification

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors (warnings acceptable).

- [ ] **Step 3: Start dev server and verify**

Run: `npm run dev`

Visually verify:
- Claims list shows SPM numbers as primary, internal ID as subtitle
- Bridge step banners say "Nimbis" and "ROC"
- Glass claims dominate the list (~50%)
- Real broker names and vehicle models visible
- Opening an accident claim at ASSESSMENT_RECEIVED shows Radx benchmark table
- SLA indicators reflect corrected timings

- [ ] **Step 4: Stop dev server**
