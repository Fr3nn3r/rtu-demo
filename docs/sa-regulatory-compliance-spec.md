---
title: ClaimPilot — South African Regulatory Compliance Spec
status: working-draft
owners: Fred (CTO), Reuben (CEO)
last_research: 2026-04-11
---

# ClaimPilot — South African Regulatory Compliance Spec

> **Purpose.** Working document that distils the SA regulatory research into the concrete audit and record-keeping features ClaimPilot must support before it can handle production data for RTU Insurance Services (RTUSA). This is engineering scope, not a legal opinion — every assumption flagged here must be confirmed with RTUSA's compliance officer and insurer legal counsel.
>
> **Context.** ClaimPilot is currently a frontend-only React prototype with in-memory state; it is fit for customer-demo use against seed data but must not touch production data until the capabilities in §3 are in place.

---

## 1. Applicable regulatory regimes

| Regime | Reaches RTUSA? | Primary impact on ClaimPilot |
|---|---|---|
| **FAIS Act 37 of 2002** + General Code of Conduct (BN 80 of 2003, as amended) | Direct | 5-year record retention; every verbal and written communication logged; per-user attribution to a registered representative |
| **Short-term Insurance Act + Policyholder Protection Rules (GN 1433 of 2017, amended GN 996 of 2018)** — Rule 17 Claims, Rule 18 Complaints | Flow-down via insurer / binder | **10-day** (calendar, per strict reading of Rule 17.6.2 — the defined term "business day" is deliberately not used) decision-to-notification timer; structured repudiation letters; 9-category complaints register (Rule 18.5.1 a–i) |
| **Binder Regulations (STIA s48A, Reg 6.3)** | **If RTUSA settles claims** — needs confirmation; the R50k auto-route in the current workflow implies settlement authority | 4% fee cap for claims-settlement function; court-enforceable insurer audit rights over systems; bordereaux reporting; daily/60-day data feeds |
| **Joint Standard 1 of 2024 — Outsourcing by Insurers** | Carve-out where activity falls inside binder (Reg 6.3 governs instead); residual catch for non-binder outsourcing | Insurer will push equivalent controls down contractually regardless |
| **Joint Standard 1 of 2023 — IT Governance & Risk Management** | **Not directly applicable** — confirmed. Closed scope list covers banks, mutual banks, insurers, CIS managers, market infrastructures, Cat II and Cat III FSPs. Cat I pure short-term brokers are not included. | Flows down contractually via insurer's third-party risk framework; FAIS GCoC s.11 risk-management duty still applies directly |
| **Joint Standard 2 of 2024 — Cybersecurity & Cyber Resilience** | **Not directly applicable** — confirmed. Same closed list, with Cat I carve-in only for "Cat I FSP that provides investment fund administration services" (para (g) of the definition). A pure short-term motor broker does not meet that condition. | Flows down contractually via insurer; FAIS GCoC s.11 still applies directly |
| **POPIA Act 4 of 2013** | Direct — RTUSA is "responsible party", True Aim operator | §2 below |
| **FICA Act 38 of 2001 — full accountable-institution regime (s21 CDD, s22 records, s42 RMCP, Directive 6 return)** | **NOT applicable** — short-term brokers deliberately excluded from Schedule 1 | No full KYC / CDD / RMCP obligation |
| **FICA residual — s29 STRs, s26A–C Targeted Financial Sanctions, POCDATARA** | Direct — applies to "any person" | Sanctions screening + STR workflow mandatory |
| **ECTA Act 25 of 2002 (ss14–17)** | Direct — enabling framework for electronic records | Defines the integrity, retention, production and admissibility tests ClaimPilot's audit log must satisfy |
| **ECTA s13 (electronic signatures)** | Direct | Ordinary electronic signatures sufficient for claim forms, repudiations, AOL, settlements; AES not required for normal claims documentation |
| **Cybercrimes Act 19 of 2020 — s54** | **Not yet in force** — explicitly excluded from Proclamation 42 of 2021 (commenced 1 Dec 2021); form-and-manner regulations under s54(2) have not been gazetted. No commencement date announced as of 2026-04. | POPIA s22 (which IS live since 1 April 2025) is the operative breach-notification obligation. Build s54 as a dormant future obligation; do not wire to SAPS as a legal duty until commencement. |
| **Consumer Protection Act 68 of 2008** | Mostly carved out (s5(2)(d) FAIS exemption) | Plain-language principles still good defensive posture |
| **COFI Bill** | **Cabinet-approved for submission to Parliament (March–April 2026)** but not yet tabled; with Office of the Chief State Law Adviser for certification; no B-number; activity taxonomy not yet public. Historical industry expectation: ~3-year transition after enactment. | Activity-based licensing will replace FAIS categories; tag workflow steps with likely activity labels now to ease future re-licensing |

### 1.1 POPIA key facts

- **RTUSA = responsible party, True Aim = operator** (POPIA s1). A written operator agreement (ss20–21) is mandatory before any production data touches the system.
- **Information Officer** must be appointed and **registered on the Regulator's E-Services Portal** before processing can be lawful (s55(2)).
- **PAIA s51 manual** must be published by RTUSA.
- **Motor claims routinely contain special personal information** (medical reports, injury photos, criminal-conduct allegations) — s26–s33 apply. Brokers rely on s32 (insurance) or s27 (legal obligation) + s33 (criminal) as the processing justification, with confidentiality undertakings required from every operator with access.
- **Breach notification (s22)** "as soon as reasonably possible" after discovery, through the Regulator's online portal (mandatory since 1 April 2025).
- **Cross-border transfer (s72)** — AWS Cape Town (af-south-1) is the cleanest path. Any EU/US hosting or third-party integration (Zoho, SMTP, Gmail, screening providers) must be logged with a s72 justification.

---

## 2. Retention matrix

| Category | Minimum | Trigger | Source |
|---|---|---|---|
| Records of advice, intermediary services, client communications | **5 years** | End of product / end of service | FAIS GCoC s3(2), FAIS Act s18 |
| Complaints register + file + outcome | 5 years | Resolution | FAIS s18, PPR Rule 18.8 |
| Claims register (binder holder) | 5 years | After termination of binder / final settlement | STIA Reg 6.3, PPR Rule 17 |
| Records underlying a filed s29 STR | 5 years | From STR submission | FICA s22 residual |
| Sanctions screening logs | 5 years | Per-screen | Defensive — evidences s26A–C compliance |
| Tax-linked records | 5 years | Filing | Tax Administration Act |
| Personal information (POPIA) | "No longer than necessary" but **POPIA s14(1)(a) permits retention where required by another law** — the above floors apply | Purpose completion or legal floor | POPIA s14 |
| Disputed / litigated matters | Duration of dispute + prescription (3 years delict / 5–6 years contract) | Extended | Common law + POPIA s14 |

**Practical rule for ClaimPilot**: store everything for **5 years post claim closure**, configurable upward per underwriter, with a `legal_hold` flag that suspends retention-driven purge.

---

## 3. Audit capability checklist (priority-ordered)

### 3.1 P0 — foundational (blocking for production use)

- [ ] **Persistent append-only audit log** — every state transition, document upload, communication, edit, view, login. Hash-chained, NTP-anchored UTC timestamps from a trusted source. No updates/deletes permitted on the table.
- [ ] **Per-user authentication + RBAC + MFA** — no shared operator accounts, no "system" actors on audited events. Every action ties to an authenticated representative who was on the FSCA rep register at the time.
- [ ] **Document hashing on upload** (SHA-256) + content-addressed storage; versioning; WORM where available. Satisfies the ECTA s14 integrity test.
- [ ] **Structured repudiation workflow** — cannot close a repudiated claim unless all of: (a) reason code (enum), (b) specific policy clause reference, (c) plain-language explanation, (d) **90-day** claimant right-to-representation notice (Rule 17.6.3(b)), (e) NFO contact details, (f) time-bar clause from the policy **plus** the **6-month minimum period for legal action after expiry of the 90-day representation window** (Rule 17.6.8(b)), (g) fallback to Prescription Act period where no time-bar clause exists (Rule 17.6.3(f)) are all populated in the letter. Enforces PPR Rule 17.6.
- [ ] **Rule 17.6.2 decision-notification timer** (**10 days** — NOT "business days"; the defined term "business day" is deliberately absent from 17.6.2) from decision → claimant notification, as a first-class state-machine constraint. Not user-configurable. **Confirm calendar-vs-business-day reading with legal counsel before wiring.**
- [ ] **Rule 17.6.5 representation-response timer** (**45 days** from receipt of claimant's representation → insurer's notification of revised/confirmed decision).
- [ ] **Rule 17.8.7 first-business-day recording** — a claim must be recorded in ClaimPilot **by no later than the first business day after the date the initial claim is received**, even if supporting requirements are incomplete.
- [ ] **Communications archive** — capture the *final sent message*, not just the draft. The current copy-paste-and-send pattern loses the audit trail; add BCC-to-archive or an SMTP relay under ClaimPilot's control.
- [ ] **Sanctions screening integration points** — claim registration, pre-payout (any payee, not just claimant), every bank-account change. **Event-driven, not batch** — PCC 44A "without delay" + FATF R.6 "within hours" rule out weekly manual pulls. Phase 1: local mirror of the FIC TFS XML feed (`transfer.fic.gov.za/.../Consolidated United Nations Security Council Sanctions List.xml`) polled every 6 hours with ETag check, **+ subscribe to FIC email alerts** at tfs.fic.gov.za. Phase 2: commercial API (ComplyAdvantage / Sanction Scanner / sanctions.io at low-mid 5-figure ZAR p.a., or enterprise World-Check / Bridger if underwriter demands). The FIC list is a **UNSC mirror only** — no SA domestic entries — so OFAC / EU / UK HMT screening is only needed if an underwriter is US/EU owned or a payee is foreign.
- [ ] **Sanctions data model** — `sanctions_list_version` (hash, fetched_at, source_url), `sanctions_screening_event` (claim_id, event_type, list_version_hash, query_payload, result, reviewer, disposition), `tpr_submission` (goAML reference + receipt PDF). Every claim carries `last_sanctions_screen_at` + `sanctions_status` (clean / possible / hit / escalated).
- [ ] **Suspicious-claim flag workflow** — raise / escalate / disposition / optional goAML STR reference. **Tipping-off prevention**: flagged claims (status `hit` or `escalated`) must hard-suppress all 11 templates in `src/lib/communication-templates.ts` — add a pre-send guard on every template. Mandatory disposition ("no concerns" / "flagged, no STR" / "flagged, STR #…") before claim can close.
- [ ] **Bank-account change = high-risk event** — dedicated step, second approver, re-screen, rationale field, full audit entry.
- [ ] **Operator agreement (POPIA s20/s21)** signed between RTUSA and True Aim — legal, not engineering.
- [ ] **Information Officer appointed & registered** with the Info Regulator; PAIA s51 manual published — legal, not engineering.

### 3.2 P1 — required before first insurer audit

- [ ] **Complaints register** linked 1:1 to claims, tagged with the **nine PPR Rule 18.5.1 categories (a)–(i)** — motor-claim complaints land in category **(h) "insurance risk claims, including non-payment of claims"**. Must maintain the eight Rule 18.8.3 counts: received / upheld / rejected with reasons / escalated internally / referred to ombud with outcome / compensation payments / goodwill payments / outstanding. "Reportable complaint" is defined in Rule 18.1 as any complaint not upheld immediately or within the insurer's ordinary query process in **≤5 business days**.
- [ ] **NFO RFI-response claims pack** — single signed bundle (PDF/A for humans + JSON for machines + manifest with file hashes + signature) producible on demand when the NFO opens a case. Must include: policy schedule + wording in force at DOL, proposal form, claim form, assessor/investigator reports, internal decision memo, repudiation letter as issued, complete communications log, internal-escalation correspondence, prior-claims history, payments history. Auto-lock the claim file once an `ombud_rfi_received_at` is set; countdown RFI deadline with 7-day and 3-day escalations. Same bundle format satisfies ECTA s17 + FAIS s3(2) + insurer audit rights.
- [ ] **Bordereaux export per underwriter** — weekly/monthly, line-item reconcilable to source claim IDs. Required only if RTUSA holds a binder.
- [ ] **Breach detection + incident workflow** — **POPIA s22** notification "as soon as reasonably possible" via the Info Regulator's online portal (mandatory channel since 1 April 2025). **Cybercrimes Act s54 is NOT yet in force** (excluded from the 1 Dec 2021 proclamation; no form-and-manner regulations gazetted as of 2026-04) — build the 72-hour SAPS reporting path as a dormant future obligation, not a live legal duty. Preservation hold on affected records is still good practice today.
- [ ] **Legal hold flag** suspending retention-driven purge; audit log of hold applied/released.
- [ ] **Data-subject indexing** — retrieve PI by data-subject ID (policyholder, driver, passenger, witness, third party), not just by claim. Currently the schema is claim-centric and cannot answer a POPIA s23 request cleanly.
- [ ] **Special-personal-information tagging** at ingestion (medical reports, injury photos, criminal-conduct allegations). Stricter ACL, read events logged in addition to writes.

### 3.3 P2 — nice-to-have / future-proofing

- [ ] **Insurer audit mode** — time-bounded, scoped read-only external login for an underwriter's auditor; logs what they viewed.
- [ ] **Configuration change log** — every change to authority limits (R50k threshold), routing rules, SLA targets, templates.
- [ ] **Fee evidence log** — per-claim record of work performed to defend the 4% claims-settlement binder fee as "commensurate with activity".
- [ ] **Activity tagging** of workflow steps, for COFI activity-based licensing readiness.
- [ ] **Outcome metrics** dashboard (time-to-decision, repudiation rate by reason, complaint-per-claim rate, reopen rate) for future supervisory returns.

---

## 4. Top 10 red flags in the current prototype

1. **In-memory React state, resets on refresh** — fine for demos, blocker for production.
2. **"Fast forward" and "revert workflow"** — regulator-facing disaster if these carry into production. Ring-fence to a non-production flag only.
3. **No per-user attribution** — events logged as generic system actions are fatal at FSCA inspection.
4. **Copy-paste-to-send communications pattern** — no archive of the final outbound message.
5. **No document hashing** — ECTA integrity test fails.
6. **No retention engine** — records accumulate forever (POPIA s14 violation) or are deleted prematurely (FAIS s3(2) violation).
7. **Claim-centric schema** — cannot answer a POPIA s23 data-subject access request.
8. **Special personal info treated identically to ordinary PI** — medical reports and injury photos need isolation.
9. **No sanctions screening before payout** — single most common FIC inspection finding.
10. **No breach detection / incident workflow** — POPIA s22 is live (online portal mandatory since 1 April 2025); Cybercrimes s54 is dormant but should be built into the incident playbook now.

---

## 5. Mandatory claim-register fields

Per claim, ClaimPilot must be able to export all of the following. Source: **PPR Rule 17.7.2–17.7.3** (which mandates capture of "all relevant details of the claimant and the subject matter of the claim", "copies of all relevant evidence, correspondence and decisions", "progress and status of the claim", and ongoing data on claims received / paid / repudiated with reasons / escalated / referred to ombud / outstanding), plus **FAIS s3(2)** record-keeping and binder-holder expectations:

- Unique claim reference (RTUSA + insurer if different)
- Policyholder ID + contact details
- Claimant ID + contact details (if different — e.g. injured taxi passenger)
- Policy number, product, insurer, binder reference
- Date of loss / notification / registration / each state transition
- Claim type (accident / theft / glass) and peril
- Cause-of-loss description
- Vehicle registration + description
- Sum claimed / assessed / excess / settled (or NIL with repudiation reason + policy clause)
- Decision date + decision-maker (authenticated user ID)
- Repudiation reason enum + policy clause reference + plain-language text
- Full immutable event log with timestamps + actors for every state transition
- Every inbound/outbound communication (content, channel, timestamp, delivery status)
- Documents with hashes, filenames, upload metadata
- Assessor / investigator / repairer identities + appointment + report references
- Internal-escalation / NFO referral status
- SLA performance per step (duration vs target, breached Y/N, reason if breached)
- Fraud flag + SAICB reference (if submitted)
- FICA disposition ("no concerns" / "flagged, no STR" / "flagged, STR #…")
- Sanctions screening snapshot (list version, query, decision)
- RAF referral flag + case reference (passenger injury in taxi accidents)
- Complaint linkage (complaint ID, category, outcome)

---

## 6. Communication-content requirements

Regulators and Ombud rulings focus on the *content* of claimant communications, not just the SLA clock. Templates in ClaimPilot must guarantee:

- **Plain language** (PPR Rule 17 + TCF Outcome 6).
- **Repudiation letters** (PPR Rule 17.6.3): full reasons in sufficient detail; 90-day representation window; internal escalation/review process details; NFO right-to-lodge with contact details and time limits; either (a) the policy's time-bar clause and its implications, or (b) the Prescription Act period; for post-1 Jan 2011 policies, the 6-month minimum period for legal action after expiry of the 90-day window.
- **Acknowledgements**: what happens next + expected timeframes + how to provide additional info + how to complain (PPR Rule 17.3).
- **Sender identification**: RTUSA legal name, FSP number, underlying insurer identity (ECTA s43 + FAIS disclosure rules).

---

## 7. Open questions — confirm before production

The regulatory regime that applies to ClaimPilot depends on several business-level facts that are not yet confirmed. These must be resolved with Reuben, RTUSA's compliance officer, and underwriter legal counsel.

1. **Does RTUSA hold a binder (s48A / Reg 6.3), and for which functions?** The R50k auto-route suggests claim-settlement authority but this needs explicit confirmation. Drives the entire binder-compliance surface (bordereaux, 4% fee cap, insurer audit rights).
2. **Which underwriter(s)** does RTUSA place taxi fleet business with? Each binder is per-insurer.
3. **Is any underwriter a cell captive?** FSCA Conduct Standard 2 of 2022 adds obligations if yes.
4. **Does RTUSA sell any life-risk products** (group life / funeral / PA riders)? That sleeve would become a full FICA accountable institution.
5. **Does RTUSA hold a premium float, a claims float, both, or neither?** Drives separate-account and monthly-return rules.
6. **Is ClaimPilot the system of record, or do Rock / Zoho remain SoR?** Determines whether ClaimPilot owns the 5-year retention story or just needs clean hand-off.
7. **Hosting location** — in-country (AWS af-south-1) or cross-border? POPIA s72 and underwriter data-residency clauses.
8. **Has RTUSA appointed and registered an Information Officer** with the Info Regulator?
9. **Has RTUSA registered on goAML** as a non-AI reporter (free but required to file s29 STRs)?
10. **Existing binder / intermediary agreement** — what does it say about records, audit rights, data-access SLAs, cybersecurity flow-down? That document is the effective specification for many of ClaimPilot's audit features.

### 7.1 Open questions remaining after follow-up research

Most of the regulatory ambiguities from the initial pass have been resolved (see §7.2). The residual points below need direct human confirmation — either by reading a specific PDF, contacting the underwriter, or briefing RTUSA's compliance officer:

1. **Rule 17.6.2 — "10 days" calendar vs business-day interpretation.** The strict reading is calendar days (the defined term "business day" is not used). Industry practice may treat it as business days. **Confirm with RTUSA compliance officer before wiring the state-machine constraint.**
2. **PPR tranche 3 amendments.** A draft amendment package was published 30 July 2021 for public comment. No evidence found that it has been finalised and gazetted as of April 2026. Confirm with an FSCA practitioner.
3. **PCC 44A exact "without delay" paragraph.** Research agent could not parse the source PDF directly; secondary sources used. Compliance officer should read the FIC PCC 44A PDF and confirm the operative paragraphs before production sanctions screening goes live.
4. **NFO Scheme Rules — binding-determination threshold, 6-week rule exact text, appeal route, case-fee model.** Same issue — source PDF could not be parsed. **~30 minutes of desk work for the compliance officer.** File: `https://ombudcouncil.org.za/wp-content/uploads/2024/02/NFO-Scheme-Rules-Final-approved-version-published-on-Ombud-Council-website.23-February-2024.pdf`.
5. **Does the NFO Non-Life division take commercial taxi-fleet complaints?** Historically OSTI took small-business complaints below a turnover threshold; NFO Rules carry this over. Material because RTUSA's book is commercial fleets, not retail. If excluded, NFO RFI-response feature is less critical.
6. **Broker-vs-insurer complaint routing.** Complaints about RTUSA conduct as an FSP (advice, disclosure) may route to the **FAIS Ombud**, while claims-handling disputes go to the **NFO Non-Life division**. ClaimPilot's complaints register should distinguish.
7. **Underwriter-contractual screening vendor requirement.** Common flow-down from US/EU reinsurers. Drives Phase 1 vs Phase 2 decision on sanctions vendor.
8. **Whether any RTUSA underwriter is US/EU owned** — triggers OFAC / EU / UK HMT screening flow-down in addition to the FIC list.

### 7.2 Resolved regulatory findings (2026-04-11 follow-up research)

**Joint Standard 1 of 2023 (IT Governance) — NOT directly applicable.** Both JS 1/2023 and JS 2/2024 use a **closed scope list** that expressly overrides the broader FSR Act "financial institution" definition ("notwithstanding the definition of 'financial institution' in the Act"). The closed list covers banks, mutual banks, insurers + controlling companies, CIS managers, market infrastructures, Cat II discretionary FSPs, and Cat III administrative FSPs. **JS 1/2023 does not include any Cat I sub-category at all.** JS 2/2024 adds one Cat I carve-in at para (g): "a Category I FSP ... that provides investment fund administration services" — which a pure short-term motor broker does not satisfy. RTUSA is therefore outside direct scope of both instruments. FAIS GCoC s.11 still imposes a general risk-management duty on the broker, and insurer flow-down via binder/outsourcing contracts will push equivalent controls down contractually. The FSCA 2025–2028 Regulation Plan flags a new **Joint Standard on third-party / outsourcing service provision** drawing on the FSB 2023 Toolkit; consultation draft expected 2026/27 — watch this space, likely route by which Cat I brokers are brought formally in scope. Sources: Moonstone "Cyber compliance is now a mandatory aspect of an FSP's risk management"; Masthead "Joint Standard on IT Governance and Risk Management – for Cat II and other financial institutions"; primary text of JS 2/2024 para 2 definitions read from FSCA/PA PDF via Juta CompliNEWS.

**PPR Rule 17 and Rule 18 — 2017 text remains in force.** Promulgated GN 1433 in GG 41329 (15 Dec 2017), commenced 1 Jan 2018, administratively amended by GN 996 (Sept 2018, substituting "Registrar" → "Authority", "managing executive" → "senior manager"). The 30 July 2021 tranche 3 draft has not been finalised. Key numeric constraints now verified verbatim from the primary text:
- **Rule 17.6.2** — decision notification "within **10 days**" of the decision. Rule deliberately does not use the defined term "business day"; strict reading is calendar days.
- **Rule 17.6.3(b)** — claimant representation period minimum **90 days** from receipt of decision notice.
- **Rule 17.6.5** — insurer must respond to representations within **45 days** of receipt.
- **Rule 17.6.8(b)** — for policies from 1 Jan 2011, time-bar clauses must allow **≥6 months** for legal action after expiry of the 90-day representation window.
- **Rule 17.8.7** — claims must be recorded **by no later than the first business day after receipt**, regardless of supporting-document status.
- **Rule 18.5.1** — **nine** complaint categories (a)–(i); claims disputes land in category (h) "insurance risk claims, including non-payment of claims".
- **Rule 18.1 "reportable complaint"** — any complaint not upheld immediately or within the insurer's ordinary query process in **≤5 business days**.
- **Rule 18.8.3** — eight mandatory count fields: received / upheld / rejected-with-reasons / escalated / ombud-referred with outcome / compensation payments / goodwill payments / outstanding.

**Cybercrimes Act s54 — NOT in force.** Section 54 was **explicitly excluded** from Proclamation 42 of 2021 (GG 45562, 30 Nov 2021) which commenced Chapters 2 (excl. Part VI), 3, 4, 7 and 8 "excluding section 54" on 1 Dec 2021. The form-and-manner regulations the Minister of Police must gazette under s54(2) have not been published; no commencement date announced. RTUSA has no live 72-hour SAPS reporting duty under s54 as of April 2026. **POPIA s22** is the operative breach-notification obligation (online portal mandatory since 1 April 2025).

**COFI Bill — Cabinet-approved, pre-introduction.** Approved by Cabinet in the 25 March and 1 April 2026 meetings for submission to Parliament; currently with the Chief State Law Adviser for certification; not yet tabled in the National Assembly; no B-number assigned; not yet publicly available. Passage expected within calendar 2026; historical industry guidance projects ~3-year transition. Activity taxonomy will be in subordinate regulations and is not yet public. FAIS Cat I authorisation will not carry over automatically — RTUSA will need to re-license under the COFI activity framework. Source: Business Day 7 April 2026; Moonstone "COFI Bill approved for submission to Parliament"; Treasury COFI policy paper.

**Omni-CBR / FSCA conduct-of-business return — paused.** The original Omni-CBR programme has been paused; the FSCA is rebuilding the framework as the **Integrated Regulatory Solution (IRS)** platform with the **Omni-Risk Return (ORR)** as its first modular return. Industry pilot expected mid-2026; full go-live targeted September 2026. Primary submission obligation for short-term insurance conduct data sits with the **insurer**, not the Cat I broker. RTUSA's own direct obligation remains the legacy FAIS return on its FSP profile. The insurer will contractually demand line-level claims-register and complaints-register feeds from RTUSA to compile its return — ClaimPilot's bordereaux export (§3.2) is the right place to build this. Indicative claims fields track PPR Rule 17.7.3 almost exactly plus TCF-outcome tagging and structured repudiation reason codes. Source: FAnews "OMNI-CBR on pause as FSCA rebuilds the framework" (Nov 2025); Masthead "A closer look at the FSCA's new Omni-Risk Return".

**FIC TFS list — operational detail.** Published at `https://tfs.fic.gov.za/` in **PDF, Excel and XML** formats from a `transfer.fic.gov.za` CDN, updated within 24 hours of UNSC changes, with a free email-alert subscription at `https://tfs.fic.gov.za/Pages/Subscriptions`. **XML is the preferred format for automation.** There is no public FIC REST API. The FIC list is a **UNSC mirror only** (resolutions 1267/1988/1373 and successors); South Africa has no operational domestic sanctions feed. **PCC 44A (29 Feb 2024)** confirms ss26A–C apply to "all persons", not only accountable institutions — RTUSA is caught regardless of Schedule 1 status. Screening triggers: (a) onboarding, (b) transaction, (c) ongoing, (d) whenever the TFS list is updated. "Without delay" is interpreted per FATF R.6 as "within hours" of designation. **Weekly manual pull is not acceptable** — screening must be event-driven at claim registration, pre-payout and every bank-account change, backed by a local mirror refreshed at least daily. For a small broker: OpenSanctions mirror (commercial licence ~EUR 1–5k p.a.) + ComplyAdvantage or Sanction Scanner API (low-mid 5-figure ZAR) is the pragmatic stack. Phase 1 minimum viable: FIC XML poll every 6 hours with ETag check + FIC email alert subscription. Sources: FIC TFS portal (https://tfs.fic.gov.za/); PCC 44A via Masthead / Moonstone / ncino summaries; OpenSanctions `za_fic_sanctions` dataset.

**NFO Non-Life division — operational since 1 March 2024.** Consolidates the former OSTI, OLTI, Banking and Credit Ombud schemes under the NFO Scheme Rules approved by the Ombud Council 23 Feb 2024. Jurisdictional caps: **R5 million for most short-term cover**, **R10 million for homeowners / buildings**. Free to complainants. The 6-week rule: complainant must first lodge an internal complaint and allow six weeks for internal resolution before approaching the NFO (carryover from OSTI; PPR Rule 18.7 sets the minimum internal-resolution window). 2024 stats (first 10 months): **11,217 non-life cases opened**, **9,289 closed**, **R94.16m recovered**. Top motor dispute drivers: exclusion-based rejection (especially "failure to take reasonable care", +11% YoY), quantum disputes, non-disclosure at inception. **Four recurring reasons brokers lose at NFO, all addressable by ClaimPilot**: (1) inadequate reasons in repudiation letter; (2) no contemporaneous file note of decision reasoning; (3) missing or unsupportive assessor/investigator reports; (4) communications that can't be produced because the broker used personal email / WhatsApp without archive. Sources: nfosa.co.za; Moonstone "Non-life insurance ombud sees 11% drop in complaints in 2024"; Lexology "A new National Financial Ombudsman's office"; IISA "The new ombud regime from 01 March 2024".

---

## 8. Research source index

The full research bundle lives in the conversation history from 2026-04-11 (six parallel research threads: POPIA, FAIS, PPR/Insurance Act, FICA, ECTA/Cybercrimes, Binder/Outsourcing). Key authoritative sources:

- `popia.co.za` — section-by-section POPIA
- `fsca.co.za` — FSCA regulated-entities documents, board notices, conduct standards
- `inforegulator.org.za` — Information Regulator guidance and breach-notification guidelines
- `fic.gov.za` — FICA directives, PCCs, TFS list, goAML
- `resbank.co.za` — Prudential Authority joint standards
- `gov.za` / `saflii.org` — primary Act and regulation text
- `justice.gov.za` — Acts and Cybercrimes Act commencement
- Law-firm memos: ENSafrica, Webber Wentzel, Bowmans, Cliffe Dekker Hofmeyr, Norton Rose Fulbright, Fasken, Michalsons, Clyde & Co
- `masthead.co.za`, `moonstone.co.za` — FSP compliance commentary
- `nfosa.co.za` — National Financial Ombud Scheme
- `saicb.co.za` — South African Insurance Crime Bureau

---

## 9. Change log

| Date | Change | Author |
|---|---|---|
| 2026-04-11 | Initial draft from consolidated SA regulatory research (6 parallel threads). | Fred / Claude |
| 2026-04-11 | Follow-up research (3 parallel threads) resolved open items §7.1. Corrections: Rule 17.6.2 timer is 10 days (not "business days"); JS 1/2023 and JS 2/2024 confirmed NOT directly applicable to Cat I pure short-term broker; Cybercrimes Act s54 NOT yet in force; COFI Bill only Cabinet-approved pre-introduction as of April 2026; Omni-CBR paused, replaced by Omni-Risk Return on IRS platform; complaints register is 9 PPR categories (a)–(i), not 6; added PPR Rule 17 time limits (90-day representation, 45-day response, 6-month legal-action floor, first-business-day recording); added FIC TFS XML feed details and NFO Non-Life division operational facts. New §7.2 captures resolved findings. | Fred / Claude |
