# ClaimPilot Communication Matrix

**Version:** 1.0
**Date:** 2026-04-09
**Status:** Draft for RTU workshop validation (2026-04-10)

---

## 1. Design principles

1. **Visibility without spam.** The insured and broker hear from RTU at meaningful milestones — when something changes that affects them. Internal routing decisions (auto-route logic, QA referral) don't generate external comms.
2. **Broker is always in the loop.** Every notification to the insured is also sent to the broker. Same content, separate draft. The broker is RTU's primary relationship; they should never be surprised by what the policyholder knows.
3. **Service providers get actionable comms only.** Appointment instructions, deadline reminders, follow-up requests. No FYI messages.
4. **Escalating urgency on reminders.** One template per severity tier, not one generic reminder. The tone and subject line should convey urgency proportional to SLA proximity.
5. **One draft per recipient per trigger.** If both insured and broker need to be notified, that's two drafts from the same trigger — not one email with CC. This keeps the operator in control of each send.

---

## 2. Stakeholder communication map

### 2.1 Insured (policyholder)

These are the moments the policyholder hears from RTU. Ordered by workflow progression.

| # | Trigger | Template key | When | Content summary | Claim types |
|---|---------|-------------|------|-----------------|-------------|
| P1 | Claim created | `claim_acknowledged` | NEW → POLICY_VALIDATION | "We've received your claim. Reference: {ClaimID}. We're validating your policy and will be in touch within [SLA]." | All |
| P2 | Policy invalid | `invalid_policy` | → INVALID | Policy couldn't be validated. Contact your broker. | All |
| P3 | Assessor appointment confirmed | `insured_assessor_appointed` | → ASSESSOR_APPOINTED (operator confirms only after assessor accepts) | "{AssessorName} has been appointed to assess your vehicle. Expect contact within [SLA]. Please make the vehicle available at {location}." | Accident |
| P4 | Investigator appointment confirmed | `insured_investigator_appointed` | → INVESTIGATOR_APPOINTED (operator confirms only after investigator accepts) | "{InvestigatorName} has been appointed to investigate your claim. They may contact you for additional information." | Theft |
| P5 | Glass repairer dispatch confirmed | `insured_glass_dispatched` | → GLASS_REPAIRER_APPOINTED (operator confirms only after repairer accepts) | "{RepairerName} will contact you to arrange glass replacement at {vehicleLocation}." | Glass |
| P6 | Within excess | `within_excess` | → WITHIN_EXCESS | Assessed damage ({amount}) falls within your excess ({excess}). No further action on this claim. | Accident |
| P7 | Claim approved | `claim_approved` | → AOL_GENERATED | "Your claim has been approved and authorised. We will advise on next steps shortly." | Accident, Theft |
| P8 | Claim rejected | `claim_rejected` | → REJECTED | Claim declined. Reason provided. 30-day dispute window. | Accident, Theft |
| P9 | Repair commenced | `repair_started` | → REPAIR_IN_PROGRESS | Repairs authorised and underway. Repairer details, expected timeline. | Accident, Theft |
| P10 | Repair complete | `repair_complete` | → CLOSED (from repair) | "Repairs on your {vehicle} are complete. Please arrange collection." | Accident, Theft |
| P11 | Total loss | `total_loss_notification` | → TOTAL_LOSS | Vehicle assessed as total loss. Natis documents required for settlement. | Accident, Theft |
| P12 | Settlement issued | `settlement_issued` | → SETTLEMENT_CONFIRMED | Settlement of {amount} processed. Please confirm receipt. | Accident, Theft |
| P13 | Glass replacement complete | `glass_complete` | → CLOSED (from glass) | "Glass replacement on your {vehicle} has been completed." | Glass |
| P14 | Claim closed | `claim_closed` | → CLOSED (all paths) | "Your claim {ClaimID} has been finalised and closed. Thank you for your patience." | All |

**Notes:**
- P1 (acknowledgment) is the highest-impact addition. It sets expectations and gives the insured a reference number immediately.
- P7 (claim approved) bridges the silence between assessment and repair/total loss. Without it, the insured doesn't know their claim was approved until the repairer calls.
- P10 and P13 (repair/glass complete) close the communication loop. The insured should know their vehicle is ready.
- P14 (claim closed) could be combined with P10/P12/P13 for the relevant close paths to avoid sending two emails in quick succession. Discuss with RTU: separate "closed" confirmation, or fold it into the final action email?

### 2.2 Broker

Every insured communication (P1–P14) generates a parallel broker draft. The broker version uses professional/operational tone rather than customer-facing tone.

| # | Template key | Mirrors | Tone difference |
|---|-------------|---------|-----------------|
| B1 | `broker_claim_acknowledged` | P1 | Includes policy number, claim type, assigned operator name |
| B2 | `broker_invalid_policy` | P2 | "Policy could not be validated on Nimbis. Please verify with your client." |
| B3 | `broker_assessor_appointed` | P3 | Includes assessor contact details and report SLA |
| B4 | `broker_investigator_appointed` | P4 | Includes investigator contact details and report SLA |
| B5 | `broker_glass_dispatched` | P5 | Includes repairer contact details |
| B6 | `broker_within_excess` | P6 | Includes assessed vs excess breakdown |
| B7 | `broker_claim_approved` | P7 | Includes approval path (internal/QA), authorised amount |
| B8 | `broker_claim_rejected` | P8 | Includes rejection reason, supporting documentation reference |
| B9 | `broker_repair_started` | P9 | Includes repairer details, final authorised cost |
| B10 | `broker_repair_complete` | P10 | Includes final cost, repair duration |
| B11 | `broker_total_loss` | P11 | Includes settlement process next steps |
| B12 | `broker_settlement_issued` | P12 | Includes settlement amount, payment reference |
| B13 | `broker_glass_complete` | P13 | Includes completion confirmation |
| B14 | `broker_claim_closed` | P14 | Includes claim summary: type, duration, outcome |

**Pragmatic simplification option:** Rather than 14 separate broker templates, broker drafts could reuse the insured template body with a broker-specific greeting and an additional "operational details" section appended. This halves the template authoring effort. Discuss with RTU which approach they prefer.

### 2.3 Service providers (assessors, investigators, repairers)

| # | Trigger | Template key | Recipient | Content summary | Claim types |
|---|---------|-------------|-----------|-----------------|-------------|
| S1 | Appointment confirmed | `assessor_appointed` | Assessor | Claim details, vehicle info, incident, insured contact, report deadline | Accident |
| S2 | Appointment confirmed | `investigator_appointed` | Investigator | Theft details, police ref, insured contact, 14-day deadline | Theft |
| S3 | Dispatch confirmed | `glass_repairer_appointed` | Glass repairer | Vehicle location, glass type, insured contact | Glass |
| S4 | SLA approaching (75%) | `sla_reminder_approaching` | Assigned contact | "Friendly reminder: your report for {ClaimID} is due in {timeRemaining}." | All |
| S5 | SLA critical (90%) | `sla_reminder_urgent` | Assigned contact | "URGENT: your report for {ClaimID} is due in {timeRemaining}. Please prioritise." | All |
| S6 | SLA breached (100%) | `sla_reminder_breached` | Assigned contact | "OVERDUE: the SLA for {ClaimID} has been breached. Please submit immediately or advise on delay." | All |
| S7 | Post-breach escalation | `sla_reminder_escalation` | Assigned contact | "ESCALATION: {ClaimID} is {hoursOverdue} hours overdue. This has been flagged to management." | All |
| S8 | Repair follow-up | `repair_follow_up` | Repairer | Status update request, expected completion date | Accident, Theft |
| S9 | Salvage follow-up | `salvage_follow_up` | Salvage handler | Status update on salvage process | Accident, Theft |
| S10 | Inspection request | `inspection_request` | Repairer/Assessor | Final costing required. Authorised repair amount, vehicle details. | Accident, Theft |

**Notes:**
- S4–S7 replace the single generic `sla_warning` template with a graduated set. Subject lines escalate: "Reminder" → "URGENT" → "OVERDUE" → "ESCALATION". This gives the operator appropriate drafts to send at each stage.
- S7 (escalation) is the post-breach follow-up described in section 6.4 of the spec. The "flagged to management" line creates accountability without RTU needing to make a separate call.
- S10 (inspection request) covers the gap at the inspection & final costing step where no communication was defined.

---

## 3. Communication matrix by workflow state

This table shows the complete trigger map — which drafts are generated at each state transition.

| Workflow state entered | Insured draft | Broker draft | Service provider draft |
|----------------------|---------------|--------------|----------------------|
| POLICY_VALIDATION | P1 Acknowledged | B1 Acknowledged | — |
| INVALID | P2 Invalid policy | B2 Invalid policy | — |
| REGISTERED | — | — | — |
| ASSESSOR_APPOINTED | P3 Assessor appointed | B3 Assessor appointed | S1 Assessor instructions |
| INVESTIGATOR_APPOINTED | P4 Investigator appointed | B4 Investigator appointed | S2 Investigator instructions |
| GLASS_REPAIRER_APPOINTED | P5 Glass dispatched | B5 Glass dispatched | S3 Glass repairer instructions |
| ASSESSMENT_RECEIVED | — | — | — |
| INVESTIGATION_RECEIVED | — | — | — |
| WITHIN_EXCESS | P6 Within excess | B6 Within excess | — |
| INTERNAL_APPROVAL | — | — | — |
| QA_APPOINTED | — | — | — |
| QA_DECISION | — | — | — |
| REJECTED | P8 Rejected | B8 Rejected | — |
| AOL_GENERATED | P7 Approved | B7 Approved | — |
| INSPECTION_FINAL_COSTING | — | — | S10 Inspection request |
| REPAIR_IN_PROGRESS | P9 Repair started | B9 Repair started | — |
| TOTAL_LOSS | P11 Total loss | B11 Total loss | — |
| SETTLEMENT_CONFIRMED | P12 Settlement | B12 Settlement | — |
| SALVAGE_IN_PROGRESS | — | — | — |
| GLASS_REPAIR_COMPLETE | P13 Glass complete | B13 Glass complete | — |
| CLOSED | P14 Closed | B14 Closed | — |

**SLA-triggered (not state-based):**

| Condition | Insured draft | Broker draft | Service provider draft |
|-----------|---------------|--------------|----------------------|
| 75% SLA elapsed | — | — | S4 Approaching |
| 90% SLA elapsed | — | — | S5 Urgent |
| 100% SLA elapsed | — | — | S6 Breached |
| Post-breach interval | — | — | S7 Escalation |
| Repair in progress (periodic) | — | — | S8 Repair follow-up |
| Salvage in progress (periodic) | — | — | S9 Salvage follow-up |

---

## 4. Volume estimate

Based on the current claim distribution (52% glass, 47% accident, <1% theft):

| Path | Insured emails | Broker emails | Provider emails | Total per claim |
|------|---------------|---------------|-----------------|----------------|
| Glass (happy path) | 4 (P1, P5, P13, P14) | 4 | 1 (S3) | **9** |
| Accident — within excess | 3 (P1, P3, P6) | 3 | 1 (S1) | **7** |
| Accident — repair | 6 (P1, P3, P7, P9, P10, P14) | 6 | 2 (S1, S10) | **14** |
| Accident — total loss | 6 (P1, P3, P7, P11, P12, P14) | 6 | 1 (S1) | **13** |
| Accident — rejected | 3 (P1, P3, P8) | 3 | 1 (S1) | **7** |
| Theft — repair | 6 (P1, P4, P7, P9, P10, P14) | 6 | 2 (S2, S10) | **14** |

This is reasonable for an insurance claim lifecycle. Glass claims (majority of volume) get 4 insured emails across the entire claim — not excessive.

---

## 5. Decisions for RTU

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Separate "claim closed" email or fold into final action email? | (a) Always send P14 separately (b) Combine P10+P14, P12+P14, P13+P14 into one | (b) Combine — avoids two emails minutes apart |
| 2 | Broker template strategy | (a) 14 separate broker templates (b) Reuse insured body + broker header/footer | (b) Reuse — less maintenance, faster to build |
| 3 | P1 claim acknowledgment — send before or after policy validation? | (a) Immediately on claim creation (b) After successful validation | (a) Immediately — insured shouldn't wait for internal validation |
| 4 | SLA reminder cadence for post-breach | (a) Every 24 hours (b) Every 48 hours (c) Configurable | (c) Configurable, default 24h |
| 5 | Should insured/broker be notified when SLA is breached? | (a) No — internal matter (b) Yes — "We're aware your claim is taking longer than expected" | (a) for MVP. Proactive delay comms are valuable but complex to get right |
| 6 | Repair complete: separate from claim closed? | (a) Two emails: "vehicle ready" then "claim closed" (b) One email: "repair done, claim closed" | (b) One email for repair path — the insured cares about their vehicle, not the claim status |

---

## 6. Template count summary

| Category | Current (spec V2.4) | Proposed | Delta |
|----------|---------------------|----------|-------|
| Insured templates | 7 | 14 (or 11 if combining per decision #1/#6) | +4 to +7 |
| Broker templates | 0 | 14 (or fewer if reusing insured body) | +14 |
| Service provider templates | 4 | 10 | +6 |
| **Total** | **11** | **38 (or ~30 with simplifications)** | **+19 to +27** |

With the pragmatic simplifications (combining close emails, reusing insured body for broker), the real authoring work is approximately **15 new templates** on top of the existing 11.

---

## 7. Implementation notes (for prototype)

- Broker drafts require the broker email field to be populated on the claim. Current seed data should include broker emails.
- The `transitionTriggers` map in `communication-templates.ts` needs to expand from 9 state mappings to cover all states in section 3.
- Multi-draft generation: some transitions now produce 2–3 drafts (insured + broker + provider). The `generateCommunication` function should return an array rather than a single draft.
- SLA-triggered reminders (S4–S7) are event-driven, not state-transition-driven. They need a separate trigger mechanism tied to the SLA engine, not the workflow state machine.
