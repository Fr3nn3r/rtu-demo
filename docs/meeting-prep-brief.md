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
| 35–45 min | Communication plan review | Walk through proposed communication matrix ([docs/communication-matrix.md](communication-matrix.md)). Current prototype has 11 templates covering service providers and outcomes — proposed plan adds insured lifecycle updates (acknowledgment, approval, completion) and broker copies at every touchpoint. Get RTU input on: which insured notifications are expected vs nice-to-have, broker template strategy, whether combined close emails are acceptable. Key decisions in section 5 of the matrix doc. |
| 45–55 min | Assumption validation | Walk assumption table below. Get explicit confirm/correct on each. |
| 55–65 min | Phase 1 scope definition | In/out/deferred. Get explicit prioritization from RTU. |

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
| 3 | QA decision SLA is 48 hours | We use 48hr from your working doc | If shorter, demo will look wrong | Confirm: 48 hours for QA to make a decision after appointment? |
| 4 | Internal approval SLA is 4 hours | Updated to 4hr | If too tight, operators will always breach | Confirm: 4 hours for internal approval on claims under R50k? |
| 5 | All theft claims go to QA regardless of value | Mandatory QA, no amount-based routing | If some low-value thefts can skip QA, workflow changes | Confirm: every theft claim must go through QA? |

### Data and Integration

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
