---
title: ClaimPilot — SA Regulatory Landscape, Executive Brief
status: working-draft
audience: Reuben (CEO)
author: Fred (CTO)
purpose: Strategic, commercial and contractual overview for CEO-led conversations with customers, underwriters, and counsel
last_updated: 2026-04-11
related: sa-regulatory-compliance-spec.md (detailed), sa-compliance-requirements.md (engineering scope)
---

# ClaimPilot — SA Regulatory Landscape, Executive Brief

> **Who this is for.** Reuben, for leading strategy, commercial, and contractual conversations. Everything below is framed for business decisions, not engineering. If you need the underlying detail, the two companion documents have it.
>
> **One-minute read.** §1 is the TL;DR — five bullets you can quote verbatim. The rest of the document is there when a conversation goes deeper.

---

## 1. TL;DR

1. **South Africa's financial regulator has shifted from guidance to enforcement.** 2,374 data-breach notifications in 2024/25, R120m in FSCA penalties last year, the insurance sector named as a 2026 audit priority. Compliance is no longer a paperwork exercise — it is a board-level risk.
2. **RTUSA's single biggest compliance exposure is in claims record-keeping** — exactly the area ClaimPilot addresses. This is tailwind, not headwind.
3. **RTUSA cannot lawfully use ClaimPilot in production until three legal artefacts exist** — an Information Officer registered with the Information Regulator, a signed POPIA operator agreement between RTUSA and True Aim, and (if RTUSA holds binder authority from its underwriter) an updated binder agreement that acknowledges True Aim's role. None of these are engineering tasks; all are commercial/legal gates we control.
4. **The real compliance spec will come from RTUSA's underwriter contract, not from the regulator.** Asking for a copy of RTUSA's binder/intermediary agreement — as part of the normal commercial conversation — answers half our open scoping questions for free.
5. **Compliance-native is a moat.** Generic SaaS claims tools do not handle POPIA, the Policyholder Protection Rules, FICA sanctions screening, or insurer audit rights out of the box. If we build for this, we can sell it — to RTUSA and to every SA broker after them.

---

## 2. The regulatory landscape in one page

South African insurance is a "twin peaks" regime: the **FSCA** regulates conduct (how you treat customers); the **Prudential Authority** regulates financial soundness. On top of those, two horizontal laws reach everyone handling personal data: **POPIA** (data protection) and **FICA** (anti-money-laundering / sanctions).

For a claims management platform like ClaimPilot operating inside a South African short-term insurance broker, five things matter:

**1. FAIS — the broker's core rulebook.** Every authorised broker must keep a full record of advice, instructions, communications, complaints and decisions for **five years**. Records must be retrievable on seven days' notice. This is not new, but the FSCA is now actively inspecting — the most common finding is "cannot produce records when asked." ClaimPilot solves that problem by design.

**2. PPR Rule 17 — how claims must be handled.** Insurers (and brokers acting on their behalf) must run a documented claims management framework. The hard numbers: claimants must be notified of a decision within **10 days**; repudiation letters must include specific content (reasons, policy clause, 90-day right of representation, ombud details, time-bar); complaints must be tracked in 9 defined categories; claims must be recorded by the next business day. These requirements are specific enough that a system can either pass or fail them cleanly.

**3. POPIA — data protection.** The Information Regulator has teeth now — multi-million rand fines against schools and healthcare providers in 2025, and a published priority list that names insurance for 2026. Key obligations: appoint an Information Officer, sign operator agreements with any SaaS provider, log breaches within reasonable time via the Regulator's online portal, keep processing records, honour data-subject access rights. Motor claims carry "special personal information" (medical, injury) which triggers extra safeguards.

**4. FICA — much lighter than most people assume.** Short-term insurance brokers were deliberately excluded from the full FICA accountable-institution regime. No Know-Your-Customer file, no Risk Management Compliance Programme, no quarterly returns. But three obligations still apply to any person: **sanctions screening** against the FIC's Targeted Financial Sanctions list, **suspicious transaction reporting** via goAML if something looks like money laundering or fraud, and the **tipping-off prohibition** (cannot alert the subject). This is a commercial advantage — other industries (legal, accounting, estate agents) have it much worse.

**5. The Binder regime.** If RTUSA has authority from its underwriter to settle claims below a threshold (our R50k auto-route strongly suggests they do), they are a "binder holder." Binder holders are bound by a contract the insurer signs, and the insurer has court-enforceable rights to inspect the binder holder's systems and records at any time. The binder fee for claims settlement is capped at 4% of premium and must be "commensurate with the actual work performed" — meaning the broker must be able to *evidence* the work, which is exactly what ClaimPilot's audit trail produces.

**Three regimes that do NOT directly bind RTUSA** (confirmed by follow-up research): Joint Standard 1 of 2023 on IT Governance, Joint Standard 2 of 2024 on Cybersecurity, and Cybercrimes Act s54 (72-hour reporting). The first two only cover banks, insurers, and certain larger FSP categories — not a pure short-term broker. The third has been gazetted but never commenced. All three will, however, reach RTUSA contractually through their underwriter's flow-down requirements.

---

## 3. What this means for RTUSA (our customer)

### 3.1 The compliance "shopping list" RTUSA must deliver on — with or without us

These are obligations RTUSA owes regardless of what tool they use to run claims. They are relevant to us because they define what any product RTUSA chooses must be able to support.

1. **Appoint and register an Information Officer** with the Information Regulator, publish a PAIA manual. Baseline POPIA hygiene; no technology needed; free to do.
2. **Maintain full claim records for 5 years** including every communication with the claimant. Today they track this across spreadsheets and three disconnected systems — this is their core pain.
3. **Send structured repudiation letters** that meet PPR Rule 17.6 content requirements. Today this is done manually and inconsistently — it is the single most common reason brokers lose at the Ombud.
4. **Notify claimants within 10 days** of any decision. Today there is no enforced clock.
5. **Track complaints in 9 regulatory categories**, linked to the underlying claim, with root-cause analysis. Today there is no complaints register at all.
6. **Screen every payout** against the FIC sanctions list "without delay." Today this is not happening.
7. **Produce a full claim file on 7 days' notice** for any FSCA inspection or Ombud case. Today they physically cannot do this from three separate systems.

Every single one of these is a direct ClaimPilot value proposition. We are selling into a real pain, not a hypothetical.

### 3.2 Where RTUSA is most exposed today

From the research: the FSCA's top inspection finding against brokers is **"cannot produce records when asked."** The Ombud's commentary on why brokers lose cases consistently cites four things — inadequate repudiation reasons, no contemporaneous file note of the decision reasoning, missing assessor reports, and communications that can't be produced because the broker used personal email or WhatsApp. All four are directly addressed by ClaimPilot's core features. We are not building compliance *on top of* the product — compliance *is* the product.

### 3.3 What RTUSA should be getting from their underwriter

When Reuben next sits with RTUSA, three asks are free and will massively clarify scope on both sides:

1. **"Can we see a copy of the binder / intermediary agreement you have with your underwriter?"** This document tells us what the insurer expects from RTUSA (bordereaux format, data feeds, audit rights, reporting cadence, cybersecurity flow-down). It is the effective specification for half of ClaimPilot's features. It is also the one document that removes ambiguity about whether RTUSA actually holds binder authority.
2. **"Has your underwriter pushed down any cybersecurity or outsourcing clauses to you in the last 12 months?"** Joint Standard 2 of 2024 commenced June 2025 and insurers are actively updating their broker agreements. RTUSA may already have received flow-down requirements they haven't read.
3. **"Who is your Information Officer under POPIA?"** If they cannot answer this, they have a gap today — unrelated to us — and we can help them close it.

---

## 4. What this means for ClaimPilot (our product)

### 4.1 The compliance substrate we need

ClaimPilot is currently a working prototype with in-memory state. To touch real production data, it needs the infrastructure a "real" SaaS product has — authentication, persistent storage, a proper audit log, document integrity, and actual outbound email sending. None of this is surprising; all of it was going to happen anyway if we were serious about production.

The regulatory research changes what we build *on top of* that substrate: a structured repudiation workflow instead of a free-text rejection box; a complaints module with the 9 PPR categories; sanctions screening at three points in the claim lifecycle; an incident/breach workflow for POPIA s22; a retention engine with legal-hold capability; and a handful of compliance-grade exports (claims pack, bordereaux, Ombud response bundle).

**The total scope is bigger than "just" a prototype-to-production upgrade, but smaller than people usually assume.** Most of what we need is already designed into the UX — we just need the backend to make it evidentiary.

### 4.2 What I recommend we commit to externally

- **"ClaimPilot is designed to be audit-ready out of the box."** True today for the demo; a roadmap commitment for production.
- **"We handle POPIA, the Policyholder Protection Rules, and FICA sanctions obligations as product features, not as paperwork customers have to add on top."** This is our differentiation against Zoho/Salesforce/custom spreadsheets.
- **"We maintain a structured compliance spec for the South African market and keep it current with regulatory change."** We do. It's in the repo. This is rare in the SaaS market.

### 4.3 What I recommend we *not* commit to externally yet

- Any specific go-live date for RTUSA production use. There are legal gates (§5) that sit outside engineering and can't be collapsed by working harder.
- Any specific underwriter audit support until we've seen RTUSA's binder agreement.
- Formal regulatory certifications (ISO 27001, SOC 2) — these are Phase 3 conversations.

---

## 5. What this means for our contractual framework

This is where Reuben's negotiation work has the most leverage. Three documents matter, in order:

### 5.1 Operator Agreement between RTUSA and True Aim (POPIA s20/s21) — MANDATORY

Under POPIA, RTUSA is the "responsible party" (accountable for the data) and True Aim is the "operator" (processing it for RTUSA). **A written operator agreement between them is legally required before any production personal data touches ClaimPilot.** Without it, RTUSA bears liability it cannot offload, and True Aim has no contractual ceiling on its own exposure.

**This is the single most important artefact for the commercial relationship.** It should cover, at minimum:

- True Aim processes data only on RTUSA's documented instructions
- Security measures True Aim commits to
- Breach notification from True Aim to RTUSA within a defined window (industry standard is 24–48 hours)
- Confidentiality obligations on True Aim's staff
- RTUSA's right to audit True Aim
- Data residency commitments (in-country hosting)
- Exit plan / data portability at termination
- Sub-processor list (any third party True Aim uses — hosting provider, email relay, screening vendor — and how RTUSA is notified of changes)

**Recommendation: True Aim should prepare a standard template and hand it to RTUSA, not wait for RTUSA to draft one.** This is a mark of professionalism and it means we control the starting position. Budget for legal counsel to draft it. We will reuse this template for every subsequent customer.

### 5.2 RTUSA's binder/intermediary agreement with their underwriter — READ, DO NOT SIGN

We are not party to this document, but it defines what RTUSA owes their underwriter and therefore what ClaimPilot must be able to deliver. Asking for a copy during the commercial conversation is legitimate, helpful framing:

> *"We want to make sure we build for your full compliance footprint, not just for what the regulator says. The most efficient way to do that is to see what your underwriter is asking of you."*

What to look for (and flag to Reuben so he knows what questions to ask if RTUSA pushes back):

- **Audit rights.** Does the insurer have the right to inspect RTUSA's systems and records on short notice? Almost certainly yes. ClaimPilot must support this.
- **Data-access / inspection rights.** Is there language saying the insurer can demand a full data dump? Almost certainly yes. Defines our export requirements.
- **Reporting cadence.** Daily, weekly, monthly bordereaux? Defines our reporting features.
- **Cybersecurity flow-down.** Has the insurer pushed any MFA / encryption / incident-notification clauses down? Defines our security baseline.
- **Termination / exit.** What happens to the data if RTUSA's binder is terminated? Affects our retention and portability features.

### 5.3 Master Services Agreement between RTUSA and True Aim — THE COMMERCIAL DOCUMENT

The MSA is the normal commercial contract for SaaS use. In this market it should include two clauses that aren't boilerplate:

- **Compliance-support SLA.** True Aim commits to maintaining the platform in line with applicable SA regulation (POPIA, PPR, FICA residual). When a regulation changes, we update — at no extra cost within the subscription. This is a customer-facing promise that backs up the "compliance-native" positioning.
- **Insurer audit cooperation.** True Aim commits to supporting RTUSA when its underwriter demands an audit of claims records, including producing the claims pack in the format the insurer requires. This is the operational promise behind the commercial promise.

Both clauses make the MSA stickier and make True Aim's contribution tangible. Both are defensible because they reflect things the platform will do anyway.

---

## 6. Strategic & commercial implications

### 6.1 The SA market is moving in our direction

- **Enforcement is accelerating.** FATF grey-list exit in October 2025 did not slow anything down. The Information Regulator and FSCA both report record enforcement years. Insurance is named on the 2026 audit priority list.
- **COFI Bill is coming.** Cabinet-approved in March/April 2026, expected to pass within the year, with a ~3-year transition. It replaces FAIS category licensing with activity-based licensing and hard-codes Treating Customers Fairly as an outcome supervisors will measure — not a box-ticking exercise. **The winners under COFI will be brokers and insurers who can evidence outcomes; the losers will be those running on spreadsheets.** ClaimPilot's audit trail is the evidence layer.
- **The Ombud consolidation** (NFO since 1 March 2024) means a single, professionalised dispute body with more rigorous case-file demands. Brokers without structured claim records will lose more cases.

All three trends favour a compliance-native product. None of them favour Zoho-plus-spreadsheets.

### 6.2 The commercial opportunity this creates

- **For RTUSA specifically:** the pitch is no longer "replace your three systems with one"; it is "pass your next insurer audit." Both are true, but the second has a much sharper CFO / risk-officer resonance.
- **For the next customer after RTUSA:** everything we build for RTUSA's compliance footprint is re-usable by any SA short-term broker. The research, the spec, the operator agreement template — all of it becomes product IP.
- **For investors:** "SA insurtech building the audit-ready claims layer ahead of COFI enforcement" is a sharper narrative than "claims workflow tool." Same product, different story, different valuation multiple.
- **For our underwriter conversations later:** if we can show an insurer that their binder holders running on ClaimPilot will pass the insurer's own audits, we can sell to the insurer directly on behalf of their broker network. Bigger deal size, bigger stakes.

### 6.3 The risks to manage actively

- **Legal-gate risk.** RTUSA cannot go live without an Information Officer registered, an operator agreement signed, and their binder agreement acknowledging True Aim. If we let these slip, we hit a hard stop no matter how fast we build. **These are commercial / legal tasks, not engineering tasks — they are yours to drive.**
- **Scope creep risk.** The regulation is rich and it is tempting to build for everything. The companion engineering document is prioritised P0 → P1 → P2 for exactly this reason. Hold the line on P0 for the first production release.
- **Customer expectation risk.** If RTUSA treats ClaimPilot as a silver bullet for their compliance problems, they may relax internal discipline. We should be explicit that the tool supports compliance but does not replace the Information Officer, the rep register, the operator agreement, or RTUSA's own governance.
- **Positioning risk.** Compliance-heavy language turns off some buyers. The research gives us a defensible compliance story; the sales conversation should lead with "audit-ready claims" not "POPIA s17 compliant."

---

## 7. What I need from you next

Four concrete asks, all yours to drive:

1. **At the next RTUSA conversation, ask for a copy of their binder / intermediary agreement** with their underwriter(s). Frame it as "we want to make sure we build for your full compliance footprint." This unblocks ~50% of our open scoping questions.
2. **Confirm with RTUSA** whether they have an appointed and registered Information Officer, and whether they have the PAIA manual published. If not, this is a gap they have today that we can help them close as part of the onboarding conversation — it is good customer intimacy work and it costs nothing.
3. **Engage True Aim legal counsel** to draft a template POPIA operator agreement. This is a one-time cost, reusable across every future customer, and it is the document that unblocks RTUSA's production go-live. Without it, we cannot safely touch their data.
4. **Decide the external positioning.** My recommendation: lead commercial conversations with "audit-ready claims for SA short-term brokers" rather than "claims workflow tool." The research supports it, the market trends support it, and it differentiates us from every generic SaaS in the category. Your call on how hard to lean in.

If you want to go deeper on any of the above, the detailed regulatory spec (`docs/sa-regulatory-compliance-spec.md`) and the engineering scope (`docs/sa-compliance-requirements.md`) are both in the repo. I will keep them current as the conversation with RTUSA evolves.

---

## Change log

| Date | Change | Author |
|---|---|---|
| 2026-04-11 | Initial brief for CEO, framed for strategy / commercial / contractual conversations. | Fred |
