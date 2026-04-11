---
title: ClaimPilot — SA Compliance Requirements & Project Impact Analysis
status: working-draft
owners: Fred (CTO), Reuben (CEO)
companion_to: sa-regulatory-compliance-spec.md
last_updated: 2026-04-11
---

# ClaimPilot — SA Compliance Requirements & Project Impact Analysis

> **Purpose.** Translate the regulatory findings in `sa-regulatory-compliance-spec.md` into concrete functional and technical requirements for ClaimPilot, with an honest impact assessment against the current prototype. Each requirement cites its regulatory source so scope can be re-debated without losing the lineage.
>
> **Reading order.** §1 executive summary → §2 architectural impact → §3 functional requirements → §4 technical requirements → §5 file-by-file impact on the current codebase → §6 phasing → §7 risks. Compliance IDs cross-reference the spec (e.g. *FAIS s3(2)*, *PPR 17.6.2*, *POPIA s17*) so you can always jump back to the authority.

---

## 1. Executive summary

**ClaimPilot today is a single-page React application with in-memory state, no auth, no persistence, no server, no immutable audit store, no breach detection, no sanctions screening, and no complaints or incident data model.** It is fit for customer demos against seed data. It is not fit to touch production personal data under any of POPIA, FAIS, the Short-term Insurance PPR, or FICA residual obligations.

Closing the gap requires three things to happen, in order:

1. **Introduce a backend.** Persistent storage, authentication, server-side business logic, and a server-side audit store are all prerequisites. Every compliance requirement collapses without them.
2. **Add six new first-class domain aggregates** — User, AuditEvent, Complaint, Incident, SanctionsScreening, LegalHold — alongside the existing Claim. Three of these (User, AuditEvent, SanctionsScreening) are P0 blockers for production data.
3. **Re-wire the existing Claim aggregate** so that repudiation, communications, documents, workflow transitions, and the R50k routing threshold are all evidentiary artefacts, not throwaway UI state. The schema change is mostly additive; the behavioural change is substantial.

The total scope is **24 P0 functional requirements** (blocking for production), **18 P1 requirements** (required before first insurer audit), and **9 P2 requirements** (post-launch hardening). Technical requirements cluster around authentication, the audit store, data model migration, and server-side business rules. A "compliance spike" — auth + audit store + user/session plumbing — should be the first feature branch, because it is a prerequisite for every other requirement in this document.

This is not a retrofit of the prototype. It is a re-platforming, with the prototype acting as an executable specification for the UX, workflows, and seed data.

---

## 2. Architectural impact

### 2.1 Current architecture

- **Frontend:** React 19 + TypeScript + Vite + Tailwind + shadcn/ui. Router has four pages (`/claims`, `/claims/:id`, `/dashboard`, `/contacts`).
- **State:** `ClaimProvider` + `useReducer` over an array of `Claim` aggregates. `ContactProvider` holds static seed contacts. State resets on page refresh.
- **Data model:** A single rich `Claim` interface nests `InsuredDetails`, `BrokerDetails`, `DriverDetails`, `VehicleDetails`, `IncidentDetails`, `WorkflowFields`, `SLARecord[]`, `ClaimDocument[]`, `DraftCommunication[]`, and `AuditEntry[]`. No User, Complaint, Incident, Sanctions, or LegalHold entities.
- **Workflow engine:** `src/lib/workflow-engine.ts` — state machine with per-claim-type transitions (`accident` / `theft` / `glass`), SLA tracking via `SLARecord`, `resolveAutoRoute(assessed, excess, threshold=50_000)` for the auto-routing logic, `getPreviousState` for revert.
- **Audit trail:** `src/lib/audit.ts` — module-level `auditCounter`, client-generated `AuditEntry` with free-text `user` string, limited enum of action types, no before-state/after-state snapshots beyond `oldValue`/`newValue`, no hash chain, no NTP binding, mutable array in memory. Export is a client-side markdown download.
- **Communications engine:** `src/lib/communication-templates.ts` — 11 template generators that produce `DraftCommunication` objects on state transitions. Operator marks drafts as sent via a `MARK_COMMUNICATION_SENT` action that sets a `sentAt` timestamp. **No actual send**; the operator copies text to their own email client.
- **Bridge systems:** Nimbus and ROC are UI-only affordances — step banners and copy-paste fields. No real integration.
- **Fast-forward:** `FAST_FORWARD` reducer shifts SLA timestamps backwards to simulate time passage for demos.

### 2.2 Target architecture (high level)

```
┌──────────────────────────────────────────────────────────────┐
│  ClaimPilot frontend (React SPA)                             │
│  - Same UX contract as today; swaps in-memory state for API │
│  - Authenticated via OIDC / MFA; per-user session           │
│  - Routes: existing + /complaints /incidents /reports       │
│    /data-subjects /legal-holds /admin/audit                 │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS (TLS 1.3) + short-lived JWT
┌──────────────────────┴───────────────────────────────────────┐
│  ClaimPilot API (Node/TypeScript or similar)                 │
│  - RBAC middleware (Cat I FSP rep register → user role)     │
│  - Workflow engine (server-side; the client can no longer   │
│    be trusted as the source of truth)                       │
│  - Business rules: Rule 17.6.2 timer, repudiation content   │
│    validator, sanctions gate, tipping-off guard, retention  │
│    policy engine                                            │
│  - Append-only audit writer + hash chain                    │
│  - Communication dispatcher (SMTP relay or provider API)    │
│  - Sanctions screening worker (poll FIC XML + on-event)     │
│  - Breach detection / incident workflow                     │
│  - Report generators (bordereaux, Omni-Risk feeder, claims  │
│    pack PDF/A+JSON bundle)                                  │
└──┬────────────┬────────────┬────────────┬───────────────────┘
   │            │            │            │
┌──┴───┐    ┌───┴───┐    ┌───┴────┐   ┌───┴──────────┐
│ PG   │    │ Object│    │Audit   │   │Secrets /KMS  │
│ (OLTP│    │store  │    │store   │   │              │
│ data)│    │(docs) │    │(WORM / │   │              │
│      │    │       │    │append- │   │              │
│      │    │       │    │only)   │   │              │
└──────┘    └───────┘    └────────┘   └──────────────┘
```

- **Primary store:** PostgreSQL in `af-south-1` (POPIA s72 — keep data in country unless counsel explicitly authorises otherwise).
- **Document store:** S3-compatible object store with object lock / WORM, in the same region.
- **Audit store:** logical separation — append-only, hash-chained, signed; anchored daily to an immutable location. Can be a dedicated Postgres schema with revoked UPDATE/DELETE grants or a purpose-built log (e.g. immudb, QLDB).
- **Auth:** OIDC provider (Auth0 / Azure AD B2C / Cognito) with MFA enforced. Users map to RTUSA's FAIS rep register.
- **Observability:** structured logging, metrics, tracing. Retain logs ≥ 13 months for breach forensics.

### 2.3 Gap summary

| Dimension | Current | Target | Gap |
|---|---|---|---|
| Persistence | In-memory | Persistent, transactional | Full |
| Auth / RBAC / MFA | None | OIDC + MFA + role-based | Full |
| Audit log | Client-generated, mutable | Server-written, append-only, hash-chained | Full |
| Audit actor | Free-text `assignedTo` string | Authenticated user ID + rep-register snapshot | Full |
| Document integrity | Filename only | SHA-256 hash + WORM storage | Full |
| Communications | Draft only, copy-paste | SMTP relay or provider API, capture of sent body | Full |
| Sanctions screening | None | Event-driven at registration / payout / bank-change | Full |
| Complaints | No data model | First-class `Complaint` aggregate, PPR Rule 18 fields | Full |
| Incident / breach | No data model | First-class `Incident` with 72-hour clock | Full |
| Retention | None | Policy engine + legal hold | Full |
| Data subject queries | Claim-centric schema | Subject-indexed retrieval | Partial — needs new index |
| Special info tagging | None | Per-document classification + tighter ACL | Full |
| Bordereaux / reporting | Dashboard only | Structured exports per underwriter | Partial |
| Fast-forward / revert | Enabled in app | Dev-only, flag-gated | Code change |
| Repudiation workflow | Free-text reason | Structured reason enum + policy clause + plain-language + NFO details + 90-day window + time-bar | Partial — data model additions |

---

## 3. Functional requirements

Each requirement has an ID, description, regulatory source, acceptance criteria, and priority (P0 / P1 / P2). Requirements are grouped by capability area.

### 3.1 FR-AUTH — Authentication, Authorisation & Rep Register

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-AUTH-001 | P0 | Every human user authenticates via OIDC with MFA enforced on every login. No shared or anonymous accounts. | FAIS s13 fit-and-proper; POPIA s19 | Login flow requires MFA; failed attempts logged; session timeout ≤ 12h |
| FR-AUTH-002 | P0 | Each user has a persistent `User` record with: legal name, ID number, FSP rep-register number, sub-category authorisations, role, status (active/inactive/debarred), fit-and-proper attestation date. | FAIS BN 194 of 2017 | Schema + admin CRUD + seed with RTUSA's actual reps |
| FR-AUTH-003 | P0 | Role-based access control with at minimum: `claim_handler`, `senior_handler`, `compliance_officer`, `information_officer`, `admin`, `read_only_auditor`. Default deny. | POPIA s19; FAIS s18 | Permission matrix enforced server-side; UI hides unavailable actions |
| FR-AUTH-004 | P0 | Every workflow-advancing action, document upload, communication send, and sanctions decision is attributed to a specific authenticated `User.id` — **never** to a "system" actor or the `assignedTo` free-text field. | FAIS rep-register evidence | Audit entries carry `actor_user_id` FK; system-originated events (scheduled jobs) tagged with `actor_type='system'` and a clear job identifier |
| FR-AUTH-005 | P0 | User must have the required sub-category authorisation to act on a given claim type (e.g. short-term personal lines for taxi fleets). Actions by unauthorised users are blocked server-side. | FAIS s13 | 403 on blocked actions; attempt logged |
| FR-AUTH-006 | P1 | Quarterly access review — compliance officer can run a report of active users, last login, assigned roles, and attest in-app. | FSCA conduct expectations | Access-review report + attestation record |
| FR-AUTH-007 | P1 | Break-glass procedure: temporary elevated access with mandatory rationale, time-bounded, fully logged, notified to compliance. | POPIA s19; FSCA | Break-glass audit row with rationale |
| FR-AUTH-008 | P2 | Debarment sync: if an FSCA rep-register entry is debarred, ClaimPilot blocks login within 15 days. | BN 194 of 2017 | Manual-for-now import of debarment list |

### 3.2 FR-AUDIT — Immutable Audit Trail

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-AUDIT-001 | P0 | All audit events are written server-side to an append-only store. Application roles have INSERT-only grants; UPDATE/DELETE require out-of-band admin action with its own audit trail. | POPIA s17; ECTA s14; FAIS s3(2) | Migration revokes UPDATE/DELETE on the table; verified via DB policy test |
| FR-AUDIT-002 | P0 | Every event captures: `event_id` (UUID), `event_type`, `claim_id` (FK or null), `complaint_id` (FK or null), `actor_user_id`, `actor_display_name_snapshot`, `actor_role_snapshot`, `actor_rep_number_snapshot`, `server_timestamp_utc` (NTP-bound), `client_timestamp`, `source_ip`, `user_agent`, `before_state` (JSONB), `after_state` (JSONB), `payload` (JSONB), `preservation_hold` (bool), `retention_class`. | POPIA s17; ECTA s14–s15 | Schema + insertion helper + contract tests |
| FR-AUDIT-003 | P0 | Each event row carries a hash-chain link: `prev_hash` = SHA-256 over the canonical serialisation of the previous row + its `prev_hash`. The chain head is anchored daily to an immutable external location (e.g. signed to a compliance mailbox + WORM object store). | ECTA s15(3) weight; industry practice | Chain integrity verifier job passes; anchor log exists |
| FR-AUDIT-004 | P0 | All server timestamps are UTC from a trusted NTP source. NTP drift is monitored and logged. Client-supplied timestamps are stored but never authoritative. | ECTA s16(c) | NTP drift metric published |
| FR-AUDIT-005 | P0 | Event types cover: `auth.login`, `auth.logout`, `auth.mfa_failed`, `auth.session_timeout`, `claim.created`, `claim.state_changed`, `claim.field_updated`, `claim.viewed`, `document.uploaded`, `document.viewed`, `document.downloaded`, `document.deleted`, `communication.drafted`, `communication.sent`, `communication.suppressed`, `sanctions.screened`, `sanctions.list_refreshed`, `sanctions.flagged`, `complaint.lodged`, `complaint.state_changed`, `incident.detected`, `incident.reported`, `legal_hold.applied`, `legal_hold.released`, `data_subject_request.received`, `data_subject_request.fulfilled`, `retention.destroyed`, `config.changed`. | POPIA s17 | Enum defined; all writes use the enum |
| FR-AUDIT-006 | P0 | **Read events are logged for records tagged as special personal information** (POPIA s26). Ordinary reads are logged at session-start granularity. | POPIA s26–s33 | Read-event insertion on special-info view |
| FR-AUDIT-007 | P0 | Audit rows have `retention_class` that resolves to the longest applicable retention period across overlapping legal bases (FAIS 5y, FICA residual 5y from STR, disputed matter + prescription). Default ≥ 5 years from claim closure. | FAIS s18; POPIA s14; FICA s22 | Retention resolver + unit tests |
| FR-AUDIT-008 | P1 | Auditor role can export a tamper-evident bundle covering any claim or time range (PDF/A + JSON + manifest with file hashes + signature over manifest). | ECTA s17; FAIS s3(2); binder audit rights | Export produces bundle verifiable by external tooling |
| FR-AUDIT-009 | P1 | The existing client-side markdown export stays (for quick operator use) but is clearly labelled as "informal"; the P1 bundle is the authoritative export. | — | Both exports exist |

### 3.3 FR-CLAIM — Claim Lifecycle, PPR Rule 17 & Repudiation

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-CLAIM-001 | P0 | On inbound FNOL, a claim record is persisted **no later than the first business day after receipt**, even if supporting requirements are incomplete. The first-business-day deadline is enforced by a reminder workflow, not discarded if missed. | PPR Rule 17.8.7 | Missed-deadline alert + audit event |
| FR-CLAIM-002 | P0 | Decision-notification timer: once a decision (accept / repudiate / dispute / partial) is recorded, the system starts a **10-day** clock and alerts at 7-day and 3-day marks. **Legal counsel must confirm calendar-vs-business-day reading before release** — the state-machine constraint supports both values via configuration flag. | PPR Rule 17.6.2 | Configurable `decision_notification_days`; test covering both readings |
| FR-CLAIM-003 | P0 | Repudiation workflow cannot close a rejected claim unless all of the following are captured in structured fields: (a) `repudiation_reason_code` from enum; (b) `policy_clause_reference` (policy ID + clause identifier); (c) `plain_language_explanation` (text, min length + readability validator); (d) `representation_deadline` computed as receipt + **90 days** (Rule 17.6.3(b)); (e) `nfo_contact_block` rendered from a centralised contact directory; (f) `time_bar_clause_snapshot` or Prescription Act fallback (Rule 17.6.3(f)); (g) `legal_action_window` ≥ **6 months** after the 90-day deadline for policies post-1 Jan 2011 (Rule 17.6.8(b)). | PPR Rule 17.6.3–17.6.8 | Server-side validator + UI form rendering all seven fields; closing a repudiated claim without them returns 422 |
| FR-CLAIM-004 | P0 | Representation-response timer: when a claimant lodges representations, a **45-day** clock starts. Breaching the clock surfaces on the claim and on the compliance dashboard. | PPR Rule 17.6.5 | Clock + alerts + audit event |
| FR-CLAIM-005 | P0 | `REVERT_WORKFLOW` and `FAST_FORWARD` are **disabled in production** by environment flag. In dev/demo environments they are permitted but every use is logged. | Regulator expectation; spec §4 red flag 2 | Env-gated; production build rejects dispatch |
| FR-CLAIM-006 | P0 | The R50k auto-route threshold is stored as versioned configuration with change audit; every routing decision records the threshold value that applied at that moment. | Binder Reg 6.3; FAIS record-keeping | Config table + per-decision snapshot |
| FR-CLAIM-007 | P1 | Claim file can be locked (read-only) by a compliance officer when an NFO RFI is received — prevents post-hoc edits until case closes. | NFO practice; evidentiary integrity | Lock flag + audit + UI affordance |
| FR-CLAIM-008 | P1 | Every claim has a `financial_service_terminated_at` timestamp that anchors the 5-year retention clock (FAIS s18). | FAIS s18 | Field + retention-engine consumer |
| FR-CLAIM-009 | P1 | RAF referral flag + RAF case reference + RAF 1 / RAF 4 form tracking for taxi passenger injury claims. | PPR practice, RAF Act | Fields + UI + report inclusion |

### 3.4 FR-COMM — Communications Archive & Tipping-Off

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-COMM-001 | P0 | Outbound communications are dispatched by ClaimPilot itself via an SMTP relay or provider API. The copy-paste-and-send pattern is removed. | FAIS s3(2) | Communications actually leave the system; no reliance on operator's personal email |
| FR-COMM-002 | P0 | The final dispatched payload (headers, subject, body, attachments' hashes, recipient list, timestamps, delivery status) is stored immutably and linked to both the source draft and the claim. | FAIS s3(2); ECTA s14 | Sent-message archive with 5-year retention |
| FR-COMM-003 | P0 | **Tipping-off guard**: every template generator and dispatcher checks `claim.sanctions_status`. If status is `hit` or `escalated`, the dispatch is suppressed and a `communication.suppressed` audit event is written. | FICA s29(3); PCC 44A | Unit tests cover every current and future template; UI surfaces suppression |
| FR-COMM-004 | P0 | Repudiation letter template enforces FR-CLAIM-003 content (reason code, clause, plain language, 90-day window, NFO details, time-bar) via a validator before send. | PPR Rule 17.6.3 | Letter validator + test |
| FR-COMM-005 | P1 | Inbound communications (replies, operator-uploaded call notes, SMS logs) are captured as first-class records linked to the claim. A call-note form with mandatory timestamp + counterparty fields is provided for phone conversations. | FAIS s3(2) verbal communications | Call-note form; inbound email integration (bounce handler minimum) |
| FR-COMM-006 | P1 | Templates can be A/B versioned and every sent message records the template version that produced it. | Evidentiary | `template_version` field |
| FR-COMM-007 | P2 | Integration with RTUSA's PABX for call-recording metadata linkage (if one exists). | FAIS s3(2) | Optional |

### 3.5 FR-DOC — Document Integrity & Special Personal Information

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-DOC-001 | P0 | Every uploaded file is hashed (SHA-256) at ingest, stored by content address, and served by signed URL. Hash is included in audit events and in every export bundle. | ECTA s14 integrity | Upload pipeline + hash verification test |
| FR-DOC-002 | P0 | Documents are stored in object storage with object lock / versioning. Delete requires an explicit retention expiry or legal-hold release. | POPIA s14; ECTA s16 | Bucket policy + integration test |
| FR-DOC-003 | P0 | Document classification enum includes `standard` and `special_personal_information`. Upload UI prompts the operator to classify; automated classifiers (OCR + keyword match for medical / ID docs) flag suspected special info. | POPIA s26–s33 | Classification required on upload |
| FR-DOC-004 | P0 | Special-info documents apply stricter ACL (default deny outside `senior_handler` / `compliance_officer`). Every read is logged (FR-AUDIT-006). | POPIA s26–s33 | ACL enforced server-side |
| FR-DOC-005 | P1 | Operator confidentiality undertakings — every user with access to special-info records has signed a written NDA/undertaking recorded in their User profile. | POPIA s32 | Attestation tracked; blocks special-info access if missing |
| FR-DOC-006 | P1 | Photo and document metadata capture: original filename, MIME type, size, upload source (drag-drop vs email vs integration), uploader user ID. | ECTA s14; PPR 17.7.2 | Metadata stored |
| FR-DOC-007 | P2 | Virus scanning on upload (EICAR test covered). | POPIA s19 security | AV integration |

### 3.6 FR-COMPL — Complaints Management (PPR Rule 18)

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-COMPL-001 | P0 | New `Complaint` aggregate, 1:n from Claim, capturing: `complainant_role` (policyholder / member / beneficiary / claimant / potential policyholder / third-party), `received_at`, `channel`, `category` (enum matching Rule 18.5.1 (a)–(i), **nine** categories), `description`, `initial_assignee`, `status`, `is_reportable` (auto-set unless resolved in ≤5 business days per Rule 18.1). | PPR Rule 18.1, 18.5 | Schema + API + UI |
| FR-COMPL-002 | P0 | Motor-claim complaints auto-map to category **(h) "insurance risk claims, including non-payment of claims"**. Category remains editable by compliance officer. | PPR Rule 18.5.1(h) | Default + override path |
| FR-COMPL-003 | P0 | Complaint escalation & review workflow: `received` → `acknowledged` → `under_review` → `escalated_internal` → `upheld` / `rejected` / `withdrawn`, with audit. Internal escalation handled by a functionary independent of the original decision-maker. | PPR Rule 18.6 | State machine + RBAC constraint |
| FR-COMPL-004 | P0 | 6-week internal-process timer from `received_at`. Expiry surfaces the complainant's right to refer to the NFO (if applicable). | PPR Rule 18.7; NFO practice | Timer + UI alert |
| FR-COMPL-005 | P0 | Root-cause field with enum + free text on every closed complaint; counts feed §FR-REP exports. | PPR Rule 18.3.1(e); TCF Outcome 6 | Field required to close |
| FR-COMPL-006 | P1 | Rule 18.8.3 counts (received / upheld / rejected with reasons / escalated / ombud-referred with outcome / compensation payments / goodwill payments / outstanding) computable on demand per period. | PPR Rule 18.8.3 | Report query |
| FR-COMPL-007 | P1 | Distinguish `fais_ombud_referrable` (advice / disclosure disputes → FAIS Ombud) from `nfo_referrable` (claims-handling disputes → NFO Non-Life division). | FAIS Ombud vs NFO jurisdiction | Flag + routing guidance in UI |
| FR-COMPL-008 | P1 | NFO RFI case: `ombud_case_ref`, `rfi_received_at`, `rfi_due`, `rfi_submitted_at`, `ombud_outcome`, `ombud_determination_binding` flag. On `rfi_received_at` set, trigger FR-CLAIM-007 file lock and FR-REP-003 claims-pack generation. | NFO Scheme Rules; PPR Rule 18.10 | Fields + workflow |
| FR-COMPL-009 | P2 | Commercial-complainant flag (`complainant_is_consumer`) — distinguishes retail individual from commercial taxi-fleet business. Affects whether the NFO has jurisdiction. | NFO Rules (to be confirmed) | Field |

### 3.7 FR-SANC — Sanctions, STRs & FICA Residual

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-SANC-001 | P0 | `SanctionsListVersion` table stores the FIC TFS list with fields: `fetched_at`, `source_url`, `file_hash`, `entry_count`, `etag`. Background job polls the FIC XML feed every 6 hours with ETag check; new versions persisted. FIC email subscription enrolled out-of-band. | FICA s26A–C; PCC 44A | Cron job + snapshot + monitoring |
| FR-SANC-002 | P0 | `SanctionsScreeningEvent` table stores every screening run with fields: `event_id`, `claim_id` (FK), `event_trigger` (enum: `claim_registered` / `pre_payout` / `bank_account_changed` / `manual` / `list_refresh`), `list_version_id` (FK), `query_payload` (JSONB — names, IDs, nationalities, DoBs), `match_score`, `result` (`clean` / `possible` / `hit`), `reviewer_user_id`, `disposition`, `disposition_notes`, `triggered_at`. | FICA s26A–C; PCC 44A | Schema + event emitter |
| FR-SANC-003 | P0 | Screening is triggered on three events: (a) `CLAIM_REGISTERED`, (b) any transition into a state that authorises payment (`AOL`, `INSPECTION_FINAL_COSTING`, `TOTAL_LOSS`, `SETTLEMENT_CONFIRMED`, `REPAIR_COMPLETE`), (c) every change to payee bank-account details. | FICA s26A–C; PCC 44A | Workflow-engine hook |
| FR-SANC-004 | P0 | Each claim has derived fields `last_sanctions_screen_at` and `sanctions_status` (`clean` / `possible` / `hit` / `escalated`). A claim cannot advance past a payment gate without a current `clean` status (freshness threshold configurable, default 7 days). | FICA s26A–C | Workflow guard |
| FR-SANC-005 | P0 | On `possible` or `hit` result, claim advancement is blocked, workflow state transitions into a compliance hold, and a task is assigned to the compliance officer. All operator-facing communications are suppressed (see FR-COMM-003). | FICA s29(3); PCC 44A | Integration test |
| FR-SANC-006 | P0 | `SuspiciousClaimFlag` workflow — separate from sanctions screening, for ML/fraud indicators (inflated claim, repeat claimant, early-life claim, beneficiary switch, document-tampering hash collision). Fields: `raised_by`, `indicator_type`, `evidence_links`, `disposition` (`no_concerns` / `flagged_no_str` / `str_filed`), `goaml_reference` (optional). Mandatory disposition before claim can close. | FICA s29 | Schema + UI + close-blocker |
| FR-SANC-007 | P0 | Bank-account changes are a first-class workflow event. Requires (a) second-approver, (b) structured `rationale`, (c) mandatory re-screen, (d) audit entry. The old and new account holder names both screened. | FICA practice; beneficiary-switching fraud | Dedicated workflow step + RBAC |
| FR-SANC-008 | P1 | goAML integration (phase 1: manual filing with upload of goAML submission PDF as attachment; phase 2: programmatic if the FIC opens an API). | FICA s29 | PDF upload path |
| FR-SANC-009 | P1 | Per-underwriter configuration for additional screening lists (OFAC / EU / UK HMT) triggered only if the underwriter requires it. | Underwriter flow-down | Feature flag per underwriter |

### 3.8 FR-DS — Data Subject Rights (POPIA s23–s25)

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-DS-001 | P0 | `DataSubjectRequest` aggregate: type (`access` / `correction` / `deletion` / `objection`), subject identity (incl. verification evidence), date received, scope, assigned Information Officer, outcome, fulfilment date, evidence of response. | POPIA s23–s25; s55 | Schema + workflow |
| FR-DS-002 | P0 | Data-subject index: given a subject ID (ID number / passport / email / phone), retrieve **every** PI touchpoint across all claims, complaints, and communications. This is the #1 schema change — the current claim-centric model can't answer this. | POPIA s23 | Subject-indexed retrieval + performance test |
| FR-DS-003 | P0 | Access request fulfilment produces a structured export of the subject's PI with: categories of data held, recipients (incl. operators and sub-processors who accessed it), retention period, source. | POPIA s23 | Export format + test |
| FR-DS-004 | P1 | Objection flag on a data subject: when set, workflows honour the objection (i.e. processing stops except for legal claims under s11(3)). | POPIA s11(3) | Flag + enforcement |
| FR-DS-005 | P1 | PAIA-compliant access request form available on public site; all requests ingested into the same data-subject-request workflow. | PAIA s14, s51 | Form + intake |

### 3.9 FR-INC — Incident & Breach Notification (POPIA s22 + Cybercrimes s54)

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-INC-001 | P0 | `Incident` aggregate: `detection_time`, `detected_by`, `category` (`unauthorised_access` / `data_loss` / `ransomware` / `misdirected_comms` / `lost_device` / `other`), `affected_records_estimate`, `affected_data_subjects`, `containment_actions`, `notification_decision`, `notified_regulator_at`, `notified_subjects_at`, `resolution_notes`, `preservation_hold` flag. | POPIA s22 | Schema + workflow |
| FR-INC-002 | P0 | Breach detection hooks: auth-anomaly signals, repeated access failures, mass exports, unauthorised role escalations. Each detection generates an `Incident` in `triage` state. | POPIA s19 | Detection jobs + test |
| FR-INC-003 | P0 | Incident decision workflow: `triage` → `assess_notifiability` → `notified` / `not_notifiable` with reasoning captured. Notification via POPIA online portal; record the portal reference. | POPIA s22 | Workflow + portal reference field |
| FR-INC-004 | P0 | Preservation hold: when an incident is opened, affected records (claims, documents, users, audit trail) are marked `preservation_hold=true`, blocking retention-driven purge. | ECTA s17; Cybercrimes s39 (live) | Hold enforced in retention engine |
| FR-INC-005 | P1 | Cybercrimes s54 dormant placeholder: build the 72-hour SAPS reporting workflow but gate behind a feature flag until s54 is proclaimed and form-and-manner regulations are gazetted. Expose the clock and the report builder as dry-run tooling for RTUSA's compliance team. | Cybercrimes Act s54 (dormant) | Feature-flagged endpoint + docs |
| FR-INC-006 | P1 | Incident register / dashboard for the Information Officer, showing open incidents, notification deadlines, and aggregate trends. | POPIA s17 / s19 | UI |

### 3.10 FR-RET — Retention & Legal Hold

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-RET-001 | P0 | Retention policy engine resolves the minimum retention period for each record type by taking the MAX over all applicable rules (FAIS 5y, FICA residual 5y from STR, tax 5y, prescription for disputes). Records are not purged until the max is exceeded AND no legal hold applies. | POPIA s14; FAIS s18 | Policy resolver + unit tests |
| FR-RET-002 | P0 | `LegalHold` entity: `id`, `reason`, `applied_by`, `applied_at`, `released_at`, `released_by`, `scope_query` (JSONB — which records it covers). A matching record cannot be purged while any hold is active. | ECTA s17 | Schema + enforcement |
| FR-RET-003 | P0 | Retention-driven purge runs as a daily job; every purge generates a `retention.destroyed` audit event with method (hard-delete / de-identify) and affected record identifiers. Destruction must prevent reconstruction in intelligible form. | POPIA s14; s17 | Purge job + audit |
| FR-RET-004 | P1 | Destruction log is itself retained under the same retention class as the underlying record's audit trail. | POPIA s17 | Log retention configured |

### 3.11 FR-REP — Reporting & Export

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-REP-001 | P0 | **Claims pack export** — single signed bundle (PDF/A human-readable + JSON structured + manifest with file hashes + signature over manifest) for any claim on demand. The PDF/A must include: full timeline, policy details, insurer, documents, communications, decisions, repudiation letter, complaints linked, sanctions screening summary, SLA performance. | ECTA s17; FAIS s3(2); insurer audit rights | Export function + format verifier |
| FR-REP-002 | P0 | **Bordereaux export per underwriter** — configurable cadence (weekly / monthly), line-item per claim with every Rule 17.7.3 field, reconcilable to source claim IDs and to the insurer's general ledger. | Binder Reg 6.3 | Export + schedule |
| FR-REP-003 | P1 | **NFO RFI response bundle** — same format as FR-REP-001 but tailored to NFO's indexed PDF expectations. Auto-generated on `ombud_rfi_received_at`; hash of output captured for non-repudiation. | NFO practice; PPR Rule 18.10 | Tested against NFO field requirements |
| FR-REP-004 | P1 | Complaints report covering Rule 18.8.3 counts per period, per underwriter, per TCF outcome. | PPR Rule 18.8.3 | CSV + JSON export |
| FR-REP-005 | P1 | Claims statistics report covering Rule 17.7.3 (received / paid / repudiated with reasons / escalated / ombud-referred / outstanding) per period per underwriter — feeds insurer's Omni-Risk Return once FSCA publishes the final template. | PPR Rule 17.7.3; Omni-CBR / ORR | Report |
| FR-REP-006 | P1 | Fee-evidence export per binder period: volume of work performed (steps executed, time logged, decisions taken) to defend the 4% claims-settlement fee as "commensurate with activity". | Binder Reg 6.3 fee caps | Export |
| FR-REP-007 | P2 | Insurer audit mode — time-bounded, scoped read-only external login for an underwriter's auditor, logs what they viewed. | Binder Reg 6.3 audit rights | Auth flow + audit |

### 3.12 FR-CONFIG — Configuration Change Control

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-CONFIG-001 | P0 | All business-rule configuration (R50k threshold, SLA hours per step, retention classes, template text, per-underwriter settings) lives in a versioned config store with full change audit. Every decision records the config version in force at the time. | FAIS record-keeping; binder audit | Config versioning + snapshot on decisions |
| FR-CONFIG-002 | P1 | Changes to configuration above a risk threshold (e.g. routing threshold, retention classes) require a second-approver. | FSCA conduct expectations | Approval workflow |

### 3.13 FR-INFO — Information Officer & PAIA

| ID | Priority | Requirement | Source | Acceptance |
|---|---|---|---|---|
| FR-INFO-001 | P0 | Information Officer profile within User: name, contact, registration date with the Regulator, deputy IOs. Visible on the public site and in PAIA manual. | POPIA s55 | Profile + public rendering |
| FR-INFO-002 | P0 | PAIA s51 manual published as a static page on the public site, sourced from structured content editable by the IO. | PAIA s51 | Manual + editor |
| FR-INFO-003 | P1 | IO dashboard aggregating: pending data-subject requests, open incidents, retention purges awaiting action, special-info access anomalies. | POPIA s55 | Dashboard |

---

## 4. Technical requirements

### 4.1 TR-ARCH — Architecture

| ID | Requirement |
|---|---|
| TR-ARCH-001 | Introduce a server-side API. All workflow state, audit writes, sanctions screening, document storage, reporting, and auth flow through the API. The React SPA becomes a client of the API. |
| TR-ARCH-002 | Workflow engine runs **server-side**. `ADVANCE_WORKFLOW`, `REVERT_WORKFLOW`, and every business-rule check (Rule 17.6.2 timer, repudiation validator, sanctions gate, tipping-off guard) move into the API. The client's `useReducer` is replaced by server-owned state fetched via queries. |
| TR-ARCH-003 | Per-underwriter multi-tenancy readiness: every record carries an `underwriter_id`; queries scope by it; reports group by it. Even if RTUSA starts with one underwriter, make the join explicit from day one. |
| TR-ARCH-004 | Clean separation of "evidence store" (append-only, POPIA/FAIS-retention-bound) from "working store" (OLTP for active claims). The evidence store receives events; the working store holds mutable views computed from them. |
| TR-ARCH-005 | Typed end-to-end contracts (e.g. tRPC / OpenAPI + generated client). Reuses existing TypeScript types where compatible but centralises them in a shared package. |

### 4.2 TR-DATA — Data Model

| ID | Requirement |
|---|---|
| TR-DATA-001 | New aggregates: `User`, `Session`, `AuditEvent`, `Complaint`, `Incident`, `SanctionsListVersion`, `SanctionsScreeningEvent`, `SuspiciousClaimFlag`, `DataSubjectRequest`, `LegalHold`, `ConfigVersion`, `Underwriter`. |
| TR-DATA-002 | `Claim` aggregate gains fields: `underwriter_id`, `binder_reference`, `insurer_claim_number`, `financial_service_terminated_at`, `last_sanctions_screen_at`, `sanctions_status`, `preservation_hold`, `retention_class`, `file_locked`. |
| TR-DATA-003 | `WorkflowFields` gains: `repudiation_reason_code` (enum), `repudiation_policy_clause_ref`, `repudiation_plain_language_text`, `repudiation_representation_deadline`, `repudiation_time_bar_snapshot`, `repudiation_legal_action_window_ends`, `decision_notified_at`, `representation_received_at`, `representation_response_at`, `raf_referral`, `raf_case_reference`. |
| TR-DATA-004 | `ClaimDocument` gains: `sha256`, `storage_key`, `classification` (`standard` / `special_personal_information`), `mime_type`, `size_bytes`, `uploaded_by_user_id`, `upload_source`, `preservation_hold`. Classification is required at upload. |
| TR-DATA-005 | `AuditEntry` is renamed `AuditEvent` and extended per FR-AUDIT-002. The old client-generated `audit.ts` is removed. |
| TR-DATA-006 | `DraftCommunication` is split into `Communication` (both directions, final) and `CommunicationDraft` (mutable while editing). Final `Communication` records have `direction` (in/out), `delivery_status`, `dispatch_provider_message_id`, `archived_body_hash`. |
| TR-DATA-007 | Data-subject index: a separate `DataSubjectLink` table joining a canonical subject identifier to any record containing that subject's PI (claim, complaint, communication, document). Populated by triggers or application code on write. |
| TR-DATA-008 | `Contact` (existing `Contact` seed) gains `fsp_number`, `sanctions_status`, `last_screened_at` for assessors/investigators/repairers (they are also screening targets). |

### 4.3 TR-SEC — Security

| ID | Requirement |
|---|---|
| TR-SEC-001 | TLS 1.3 mandatory; HSTS; CSP; SameSite=Lax cookies; short-lived JWT with refresh. |
| TR-SEC-002 | All PII at rest is encrypted via DB-level encryption; document object store uses server-side encryption with a KMS key managed by RTUSA. |
| TR-SEC-003 | Secrets (API keys, SMTP credentials, screening vendor keys) live in a secret manager; never in env vars committed to git. |
| TR-SEC-004 | Application users have no direct DB access; DB access is via the API service role only. Admin DB access is itself audited. |
| TR-SEC-005 | SQL injection: parameterised queries only, enforced via lint rule or ORM. |
| TR-SEC-006 | XSS: output encoding on all rendered user content; existing React escaping is fine but guard against `dangerouslySetInnerHTML`. |
| TR-SEC-007 | Vulnerability scanning on dependencies (npm audit / Dependabot / Snyk) in CI. |
| TR-SEC-008 | Backup strategy: daily encrypted backups to separate KMS key, restore tested quarterly, 35-day retention on snapshots. |

### 4.4 TR-INT — Integrations

| ID | Requirement |
|---|---|
| TR-INT-001 | FIC TFS list consumer — scheduled job that polls `https://transfer.fic.gov.za/public/folder/.../Consolidated United Nations Security Council Sanctions List.xml` every 6h with ETag, parses to `SanctionsListVersion`. |
| TR-INT-002 | Outbound SMTP relay — provider-agnostic interface with a reference implementation (Postmark / SES / SendGrid). Every send produces a dispatch record with provider message ID. |
| TR-INT-003 | Inbound email capture — minimum: bounce handler. Optional: full inbound MX capture for claimant replies linked to claims. |
| TR-INT-004 | Object storage — S3-compatible client with WORM policy; Cape Town (af-south-1) region. |
| TR-INT-005 | OIDC auth provider integration. |
| TR-INT-006 | Nimbus / ROC bridge integrations — out of compliance scope for this document but must not regress; the current copy-paste pattern remains until a real integration exists. |
| TR-INT-007 | (Phase 2) Commercial sanctions aggregator SDK (ComplyAdvantage / Sanction Scanner / sanctions.io). Adapter interface so Phase 1 (FIC XML) and Phase 2 are swappable. |
| TR-INT-008 | (Phase 2) goAML programmatic filing — until then, a manual upload path for goAML submission PDFs. |

### 4.5 TR-OBS — Observability

| ID | Requirement |
|---|---|
| TR-OBS-001 | Structured JSON logs with correlation IDs; never log PII payloads in plaintext. |
| TR-OBS-002 | Metrics: claims created/closed, SLA breach counts, sanctions screening latency, auth failures, incident counts, retention purges. |
| TR-OBS-003 | Distributed tracing for request flows that cross service boundaries. |
| TR-OBS-004 | Alerting: audit-chain integrity failure, incident opened, sanctions list fetch failure, screening backlog, Rule 17.6.2 deadline approaching, retention purge failure. |
| TR-OBS-005 | Non-production environments do **not** receive production data; seed data only. |

### 4.6 TR-INFRA — Infrastructure & Data Residency

| ID | Requirement |
|---|---|
| TR-INFRA-001 | Primary hosting in AWS `af-south-1` (Cape Town). Any cross-border transfer requires a POPIA s72 justification documented in a "Transfers" register. |
| TR-INFRA-002 | Separate environments: dev / staging / prod. Prod gated behind approval; prod secrets not accessible from dev. |
| TR-INFRA-003 | Infrastructure-as-code (Terraform or CDK) with peer-reviewed changes in git. |
| TR-INFRA-004 | Disaster recovery: RPO ≤ 1h, RTO ≤ 4h. Quarterly DR drill. |
| TR-INFRA-005 | NTP sync to a trusted source (`pool.ntp.org` region ZA or AWS Time Sync). NTP drift monitored. |

---

## 5. Impact on the existing codebase (file-by-file)

| File | Change type | Notes |
|---|---|---|
| `src/types/index.ts` | **Rewrite** | Add User, Session, AuditEvent, Complaint, Incident, Sanctions*, LegalHold, DataSubjectRequest, Underwriter; extend Claim, WorkflowFields, ClaimDocument; split DraftCommunication. Retain string-literal-union discipline (CLAUDE.md). |
| `src/context/ClaimContext.tsx` | **Replace with API client** | Workflow state becomes server-owned; reducer logic migrates to the API. Keep the hook surface so UI components need minimal changes. |
| `src/context/ContactContext.tsx` | **Extend** | Contacts gain FSP numbers and sanctions status fields. |
| `src/lib/audit.ts` | **Delete** | Replaced by server-side audit writer; module-level counter is unsafe. |
| `src/lib/workflow-engine.ts` | **Port to server** | Keep the TypeScript functions as a shared package so UI + API can both reason about transitions; move the write path to the API. |
| `src/lib/communication-templates.ts` | **Refactor** | Templates stay in TS but become an input to the dispatcher, not the authoritative send path. Add `pre_send_guard` check for `claim.sanctions_status`. Capture `template_version`. |
| `src/lib/trend-utils.ts` | **Unchanged or minor** | Dashboard helpers — will consume API data instead of local state. |
| `src/data/seed-claims.ts` | **Dev-only** | Moves behind an env flag; never loaded in prod. |
| `src/data/seed-contacts.ts` | **Same** | Seed only; real contacts come from admin CRUD. |
| `src/data/seed-historical-claims.ts` | **Same** | Seed only. |
| `src/data/workflow-definitions.ts` | **Shared package** | Moves into a shared workflows package consumed by both client and server. |
| `src/components/claims/actions/internal-approval.tsx` | **Rewrite** | Replace the free-text rejection reason with the seven-field FR-CLAIM-003 form; server-side validator returns field errors; add 10-day timer display. |
| `src/components/claims/actions/*` | **Audit pass** | Every action component must route through the API, never mutate state directly; surface server errors; show sanctions-status blocks where relevant. |
| `src/components/claims/action-panel.tsx` | **Extend** | Dispatch to new actions, show hold states (compliance hold / file lock). |
| `src/components/claims/draft-communication-modal.tsx` | **Rewrite** | Becomes the send flow — operator previews the drafted message, clicks send, server dispatches, UI shows delivery status. Remove copy-paste affordance. |
| `src/components/claims/panels/audit-trail-panel.tsx` | **Extend** | Reads from server audit store; keep markdown export as "informal", add "download signed bundle" for FR-AUDIT-008. |
| `src/components/claims/panels/communications-panel.tsx` | **Extend** | Show both inbound and outbound; show suppression events with reason; link to template version. |
| `src/components/claims/panels/documents-panel.tsx` | **Extend** | Show classification, hash, uploader, read-log count for special-info docs. |
| `src/components/document-drop-zone.tsx` | **Extend** | Hash on upload; classification prompt. |
| `src/components/claims-list/new-claim-dialog.tsx` | **Extend** | Capture additional FNOL fields; enforce FR-CLAIM-001 first-business-day rule via backend. |
| `src/pages/claim-detail-page.tsx` | **Extend** | Add Sanctions tab, Complaints tab, Incidents link; show file-locked banner; show 10-day / 45-day timers. |
| `src/pages/claims-list-page.tsx` | **Extend** | Filters for sanctions status, preservation hold, underwriter. |
| `src/pages/dashboard-page.tsx` | **Extend** | Add compliance-officer panels (open incidents, data-subject requests, retention due). |
| `src/pages/contacts-page.tsx` | **Extend** | Show screening status per contact. |
| **NEW** `src/pages/complaints-page.tsx` | **New** | Complaint list, filters, detail view. |
| **NEW** `src/pages/incidents-page.tsx` | **New** | Incident register / dashboard for IO. |
| **NEW** `src/pages/reports-page.tsx` | **New** | Bordereaux, claims stats, complaints stats, fee evidence. |
| **NEW** `src/pages/data-subjects-page.tsx` | **New** | Data-subject request workflow. |
| **NEW** `src/pages/admin-audit-page.tsx` | **New** | Compliance-officer audit explorer. |
| `src/App.tsx` | **Extend** | New routes; auth guard; role-based route visibility. |
| **NEW** backend service | **New** | API, workflow engine, audit store, sanctions worker, retention engine, dispatcher. |
| **NEW** infra repo | **New** | IaC for AWS af-south-1 + secret manager + observability stack. |

**Deprecated features (must be gated or removed from production):**
- `FAST_FORWARD` reducer action (demo only).
- `REVERT_WORKFLOW` in production (demo only; dev retains for iteration).
- Client-side markdown audit export as the authoritative export.
- Free-text `assignedTo` as the actor of audit events.
- Copy-paste-and-send communications pattern.

---

## 6. Phasing

The work falls naturally into four phases. Each phase ends at a point where the resulting system is safe to promote to a new environment.

**Phase 0 — Compliance spike (prerequisite).**
Scope: TR-ARCH-001, TR-ARCH-002, FR-AUTH-001 through FR-AUTH-005, FR-AUDIT-001 through FR-AUDIT-005, TR-INFRA-001, TR-SEC-001 through TR-SEC-003, TR-OBS-001.
Deliverable: an authenticated API with persistent storage, server-side workflow engine, and a working audit store. The existing SPA UX keeps running, but every write goes through the API and is attributed to a real user. No production data yet.

**Phase 1 — P0 compliance core.**
Scope: all remaining P0 functional requirements (FR-CLAIM-001 through FR-CLAIM-006, FR-COMM-001 through FR-COMM-004, FR-DOC-001 through FR-DOC-004, FR-COMPL-001 through FR-COMPL-005, FR-SANC-001 through FR-SANC-007, FR-DS-001 through FR-DS-003, FR-INC-001 through FR-INC-004, FR-RET-001 through FR-RET-003, FR-REP-001, FR-REP-002, FR-CONFIG-001, FR-INFO-001 through FR-INFO-002) plus the TR items they depend on.
Deliverable: a system that can safely touch production data, with legal sign-off on the operator agreement, Information Officer registered, and PAIA manual published.

**Phase 2 — P1 audit-readiness.**
Scope: all P1 functional requirements (FR-AUDIT-008/009, FR-AUTH-006/007, FR-CLAIM-007/008/009, FR-COMM-005/006, FR-DOC-005/006, FR-COMPL-006/007/008, FR-SANC-008/009, FR-DS-004/005, FR-INC-005/006, FR-RET-004, FR-REP-003 through FR-REP-006, FR-CONFIG-002, FR-INFO-003) plus supporting TR items.
Deliverable: a system ready for the first insurer audit, with bordereaux, NFO RFI response bundles, complaints reporting, and legal-hold capability.

**Phase 3 — P2 hardening.**
Scope: FR-AUTH-008, FR-COMM-007, FR-DOC-007, FR-COMPL-009, FR-REP-007, plus the commercial sanctions aggregator (FR-SANC-009 phase 2), goAML programmatic filing (FR-SANC-008 phase 2), and any outstanding FR items.
Deliverable: fully scoped compliance posture with room to absorb COFI transition when it hits.

---

## 7. Risks and dependencies

1. **Legal-counsel dependency.** Several P0 requirements hinge on calls legal counsel must make: calendar-vs-business-day reading of Rule 17.6.2, operator-agreement drafting, confirmation that RTUSA holds a binder, POPIA cross-border justification, underwriter flow-down analysis. These should be resolved before Phase 0 completes; Phase 1 cannot finish without them.
2. **Underwriter flow-down surprises.** RTUSA's binder/intermediary agreement with its underwriter(s) may impose controls tighter than this document anticipates (e.g. specific bordereaux formats, insurer-mandated screening vendors, cybersecurity flow-down from Joint Standard 2 of 2024 even though the broker is not directly in scope). The agreement text must be reviewed before Phase 1 freezes on concrete reporting formats.
3. **COFI Bill uncertainty.** The Bill is Cabinet-approved but pre-introduction. Final activity taxonomy is not public. Some Phase 3 decisions (activity tagging, re-licensing mapping) may need to be reworked once COFI regulations are gazetted. Low risk in the near term; design ClaimPilot to be activity-tag-friendly.
4. **NFO Scheme Rules ambiguity.** The PDF could not be parsed by research tooling; a compliance officer must read it directly to confirm the binding-determination threshold, 6-week rule, commercial-complainant eligibility, and case-fee model. Affects FR-COMPL-008, FR-COMPL-009.
5. **PCC 44A "without delay" interpretation.** Phase 1 commits to event-driven screening; the exact timing SLA needs confirmation from the FIC PCC 44A PDF.
6. **Cybercrimes Act s54 commencement.** If the form-and-manner regulations drop during Phase 1 or Phase 2, the feature-flagged s54 reporting path (FR-INC-005) must be promoted to live. Small code change but needs to be watched.
7. **Data migration.** Once the backend exists and seed data moves to dev-only, any real claims data RTUSA wants to import (historical from Zoho / Nimbus / Rock) must go through an import path that preserves the evidentiary audit trail — you cannot simply bulk-insert and lose the history. This is its own mini-project.
8. **Non-RTUSA users of the same codebase.** If ClaimPilot is later offered to other brokers, per-tenant configuration, per-tenant KMS keys, and per-tenant data residency become material. TR-ARCH-003 sets up the foundation but does not finish the job.
9. **Fast-forward removal breaks demos.** The `FAST_FORWARD` reducer is central to the current demo narrative. Removing it from prod without providing a demo-mode alternative will hurt customer iterations. Keep a dev-gated version.
10. **Schema reset on refresh is a feature in the prototype.** Customers have been demoing against seed data that resets. The backend cannot replicate this out of the box; dev environments will need an explicit "reset seed" endpoint to preserve the demo loop.

---

## 8. Requirements summary (counts)

- **Functional requirements**: 24 P0, 18 P1, 9 P2 — **51 total**
- **Technical requirements**: 31 (architecture, data, security, integrations, observability, infrastructure)
- **New aggregates introduced**: 11 (User, Session, AuditEvent, Complaint, Incident, SanctionsListVersion, SanctionsScreeningEvent, SuspiciousClaimFlag, DataSubjectRequest, LegalHold, ConfigVersion — plus the renamed/extended Claim, Communication, Contact, ClaimDocument, WorkflowFields)
- **New pages**: 5 (complaints, incidents, reports, data-subjects, admin-audit)
- **Deprecated features**: 5 (fast-forward, prod-side revert, client-side markdown export, free-text actor, copy-paste send)

---

## 9. Change log

| Date | Change | Author |
|---|---|---|
| 2026-04-11 | Initial draft from consolidated SA regulatory research + codebase audit. Companion to `sa-regulatory-compliance-spec.md`. | Fred / Claude |
