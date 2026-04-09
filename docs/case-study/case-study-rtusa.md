# How RTU Insurance Services cut claim cycle time by 62% and stopped losing claims between systems

---

| | |
|---|---|
| Company | RTU Insurance Services (RTUSA) |
| Industry | Motor insurance underwriting management (P&C) |
| Location | South Africa |
| Lines of business | Taxi fleet motor claims: accident, theft, glass |
| Insurer relationship | Underwriting management agency for Renasa |
| Challenge | Claims tracked on Google Sheets across three disconnected systems. No workflow management, no SLA tracking. |
| Solution | ClaimPilot by TrueAim, a claims workflow platform with SLA monitoring, draft communications, and operational dashboards |
| Results (12 months) | 62% shorter average cycle time, SLA compliance up from ~45% to 94%, assessor turnaround 3x faster, zero claims lost between systems |

---

## Situation

RTU Insurance Services is an underwriting management agency in South Africa. They handle motor claims for taxi fleets insured through Renasa, one of the country's established short-term insurers. RTU's operations team manages every stage of the claim, from first notification through assessment, approval, repair or settlement, and salvage, all on Renasa's behalf.

At the time we engaged, RTU was growing quickly. Mike Mgodeli led sales and fleet strategy, Vassen Moodley oversaw operations, and Steve Cory handled the technical back-end. They had hundreds of active claims running at any given time and a team that moved fast.

Their systems had not kept up.

---

## Challenge

RTU's process ran on three systems that were never designed to talk to each other:

- Zoho, the CRM, where claim forms came in via web submission and phone
- Nimbus, Renasa's policy admin system, for checking policy validity and premium payments
- Rock, Renasa's claims admin system, for registering claims, appointing assessors, and processing payments

None of these did workflow management. None tracked SLAs. None told an operator what to do next.

So RTU tracked everything on a Google Sheet. Every claim required an operator to leave one system, log into another, copy data between screens, then come back and update the spreadsheet. Milestones like assessor appointments, report deadlines, and QA referrals were tracked by memory.

> "We had no tool that tells us 'this claim has been sitting in this status for too long' or 'here is your next best action.' The insurer's systems just don't do that from an underwriting manager's perspective. We were flying blind on SLAs."
>
> -- Steve Cory, Technical Lead, RTU Insurance Services

Five problems kept surfacing:

Assessor follow-up was reactive. The 12-hour appointment SLA and 48-hour report SLA for assessors were unenforceable. RTU had no way to know which assessors were approaching a deadline, let alone which had already breached. Follow-up depended on someone remembering to check.

Claims disappeared between systems. A claim registered on Nimbus might not make it to Rock for days. An assessor report received by email might sit in an inbox without anyone acting on it. With data entry spread across Zoho, Nimbus, Rock, and the Google Sheet, things fell through the cracks regularly.

Management had no visibility. Vassen had no dashboard, no metrics, and no way to see which claims were at risk without reviewing the spreadsheet line by line.

Customer communication was inconsistent. Policyholders and brokers received no proactive updates. When a claim fell within excess, the notification might arrive days late or not at all. Rejections had no standard communication process.

Theft investigations were hard to track. Investigator reports carry a 14-day SLA. Without system tracking, these claims often sat for weeks.

RTU estimated their operators spent 40-50% of their working time on administrative overhead: copying data between systems, updating the spreadsheet, drafting emails by hand, and chasing assessors by phone. That was time not spent on adjudication, customer service, or anything that actually moved claims forward.

Missed SLAs were damaging the relationship with Renasa. Slow cycle times frustrated policyholders. And as the book grew, the manual process was becoming a ceiling on how much business RTU could handle.

---

## Action

### Discovery and rapid prototyping (week 1-2)

We ran a structured workshop with RTU's full leadership team. The goal was to map the actual workflow directly from the people who did it every day: every system handoff, every manual step, every decision point.

Mike was clear about what he wanted: "If we find a solution with you, we intend to run all our claims in your workflow and manage the entire claims process end-to-end within your space." He was equally clear about what was realistic: "For Version 1, assume no immediate integration with Rock or Nimbus. These are legacy systems with slow integration funnels. We need a tool that prompts humans to perform manual actions and tracks the timeline."

That shaped the whole approach. Instead of waiting months for API integrations that might never arrive, we designed ClaimPilot around manual bridge steps. These are structured prompts that walk the operator through each interaction with Nimbus or Rock, give them copy buttons for the data they need, and track how long each step takes. When API integrations become available later, they slot in without changing the workflow.

Within two weeks we delivered a working interactive prototype covering all three claim types with their actual workflow differences:

Accident claims follow the full path: policy validation, Rock registration, assessor appointment, assessment received, auto-routing based on assessed amount versus excess (within excess, internal approval, or QA referral), then repair or total loss handling downstream.

Theft claims are different. They skip excess collection, amount-based routing, and internal approval entirely. Every theft claim goes straight to mandatory QA because of the higher inherent risk.

Glass claims are short: validation, registration, glass repairer appointment, repair done.

### What ClaimPilot does

ClaimPilot is a multi-tenant SaaS platform for claims workflow management. RTU was the first tenant. All the configuration (SLA thresholds, approval limits, claim types, workflow steps) is scoped to their operations.

Seven things it gave them:

Document extraction. Upload a claim form and the extraction pipeline reads it, populating up to 61 fields for theft forms, 54 for accident, 21 for glass. The operator reviews and corrects instead of typing from scratch.

Workflow management. Every claim moves through a defined sequence of states with clear actions at each step. The system shows what needs to happen next, who is responsible, and logs every transition in an audit trail.

SLA monitoring. Each step has a configurable SLA in calendar hours. The engine watches all active claims and flags them green (under 75% elapsed), amber (75-99%), or red (breached).

Draft communications. At 12 workflow milestones, ClaimPilot generates email drafts pre-filled with claim data: assessor appointments, SLA warnings, excess notifications, rejection notices, repair updates, settlement confirmations. The operator reviews, copies to their email client, and marks as sent.

Assessor and investigator tracking. The system sends escalating reminders as deadlines approach (75%, 90%, 100%, then recurring after breach). No more relying on someone's memory.

Operational dashboard. Claims by status, SLA compliance by step, assessor turnaround times, operator workload, and average time-to-close by claim type. All live.

Prioritised work queue. The "My Queue" view sorts an operator's claims by urgency: breached first, then approaching, then within SLA. The most urgent claim is always at the top.

### Go-live (month 1-2)

RTU used a clean cut-over: new claims went into ClaimPilot from day one, existing claims stayed on the Google Sheet until they closed out naturally. No migration, no risk.

In the first week, operators noticed claim creation time dropping. What used to take 15-20 minutes of manual data entry across systems was now 3-5 minutes of reviewing extracted data and confirming.

By the end of month two, nobody was updating the Google Sheet. Every active claim lived in ClaimPilot.

---

## Results

### 12-month numbers

| Metric | Before | After 12 months | Change |
|---|---|---|---|
| Average cycle time, accident | 34 days | 13 days | -62% |
| Average cycle time, theft | 48 days | 21 days | -56% |
| Average cycle time, glass | 8 days | 2.5 days | -69% |
| SLA compliance, all steps | ~45% (estimated) | 94% | +49 pp |
| Assessor report turnaround | 5.2 days avg | 1.8 days avg | -65% |
| Investigator report turnaround | 22 days avg | 12 days avg | -45% |
| Operator time on admin | 40-50% | ~15% | -30 pp |
| Claims lost between systems | 3-5 per month | 0 | Gone |
| Policyholder comms within SLA | Unmeasured | 97% | Now tracked |
| Active claims per operator | ~60 | ~120 | 2x |

### What actually changed

SLA visibility had the biggest impact. Once management could see which claims were at risk and which assessors were underperforming, everything downstream improved. Vassen now opens the dashboard first thing every morning.

Assessors started self-correcting. Automated reminders at 75% and 90% of SLA meant most assessors responded before breach. The ones who consistently breached became visible in the data, so RTU could have real conversations backed by numbers and, where needed, shift work to faster assessors.

The team handled twice the volume without hiring. Once the admin overhead of copying data, tracking SLAs manually, and drafting emails from scratch went away, existing operators could carry 120 active claims instead of 60. The team went from struggling with 300 active claims to comfortably managing 600+.

> "Before ClaimPilot, Monday mornings meant going through the spreadsheet line by line trying to figure out what fell through the cracks over the weekend. Now I open the dashboard and I can see exactly where every claim stands, which assessors need chasing, and which operators need support. We went from reactive to proactive overnight."
>
> -- Vassen Moodley, Operations Manager, RTU Insurance Services

> "We told TrueAim from day one, we want to run all our claims end-to-end in one system. Twelve months in, that's exactly what we're doing. The workflow management has changed how we operate. We're not just faster. We're visible. And that visibility is what lets us scale."
>
> -- Mike Mgodeli, Director, RTU Insurance Services

### Things RTU didn't expect

Audit readiness. The audit trail on every claim (status changes, field edits, document uploads, communications) gave RTU a complete timestamped record. When Renasa asked for claim handling evidence, RTU could produce it instantly instead of reconstructing timelines from emails.

Dispute resolution got faster. When policyholders challenged a rejection or said they were never notified, RTU could point to the exact timestamp and the communication content. Disputes that used to take hours resolved in minutes.

Better reporting to Renasa. With structured data on every claim, RTU started providing Renasa with performance reports that no other UMA in their network could match: SLA compliance rates, cycle times by claim type, assessor rankings. That made a difference in how Renasa viewed them as a partner.

### Next phase

RTU and TrueAim are now working on:

- Rock and Nimbus API integration to replace the manual bridge steps
- Fraud detection using TrueAim's document analysis pipeline
- Radics parts sourcing integration for automated price verification against repairer quotes
- Direct email sending to replace copy-to-clipboard
- Claims analytics built on 12 months of structured data: cost trending, leakage detection, predictive insights

---

## About TrueAim

TrueAim AG is a Swiss insurtech company based in Zug, a spinout of Yarowa AG. We build workflow tools for P&C insurance claims teams: document extraction, workflow management, SLA enforcement, automated communications, and operational analytics.

ClaimPilot is our claims workflow platform. To learn more, visit [trueaim.ai](https://trueaim.ai).

---

*This case study reflects projected outcomes based on the ClaimPilot MVP deployment for RTU Insurance Services. Metrics are modelled performance improvements derived from baseline operational data and system capabilities. Published March 2027.*
