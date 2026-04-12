# V3 Slice 3 — Document Completeness & Settlement Gate

**Date:** 2026-04-11
**Status:** Design approved, pending implementation plan
**Depends on:** Slice 1 (conversation view) — complete on master
**Enables:** Slice 4 (FRC workflow step) — FRC gate extension
**POC references:** §4.2 (document completeness), §5.9 (parallel document gating)

---

## 1. Goal

Give claims consultants an instant, always-visible picture of whether a claim's required document pack is complete — and gate settlement until it is.

**Framing:** the "completeness picture" is the headline feature. The settlement gate is a natural consequence, not the primary validation target. RTUSA's core pain is "docs are scattered across three systems and we don't know what's missing until too late." This slice solves that at the per-claim level.

---

## 2. What determines completeness

A flat per-claim-type required-documents list. No workflow-state scoping — the same list applies from claim creation through settlement.

```
accident (7): claim_form, police_report, id_copy, drivers_license, license_disk, damage_photos, assessment_report
theft    (6): claim_form, police_report, id_copy, drivers_license, license_disk, investigation_report
glass    (4): claim_form, id_copy, license_disk, damage_photos
```

These are placeholder defaults. Vassen owes confirmation of the real per-claim-type checklist (POC §17 open item). The data model can absorb changes to these lists without structural rework — they're a plain constant, not a schema.

Completeness is **derived, not stored**. A pure function computes it from the claim's `documents[]` array and the required-docs constant:

```ts
function getDocumentCompleteness(claim: Claim): {
  received: number
  required: number
  missing: DocumentType[]
}
```

This function lives in `src/lib/documents.ts` and is called wherever the UI needs completeness information.

---

## 3. UI components

### 3.1 Documents sidebar tab (enhanced)

The existing documents panel gets three additions:

**Summary bar** at the top of the panel:
- Text: "X of Y documents received"
- Small progress bar, themed: green when complete, amber when >50% received, muted/default when early.
- No hardcoded colors — uses semantic theme tokens per the project's styling discipline.

**Required docs section:**
- Lists every document from `REQUIRED_DOCUMENTS[claim.type]`.
- Each row shows the document label, current status, and (if received) the received date.
- Missing docs show a **"Mark as received"** button that dispatches `UPDATE_DOCUMENT_STATUS` with `status: 'received'` and timestamps the change. An audit entry is added.
- Already-received docs show a check icon.

**Other docs section:**
- Documents on the claim that aren't in the required list (e.g., `other` type docs attached via conversation/inbox).
- Shown below the required section, visually separated.
- No impact on the completeness calculation.

### 3.2 Claim header badge

A small indicator added to the existing claim header component, alongside the SLA indicator:

- Displays a Lucide doc icon (e.g., `FileCheck` or `Files`) with "X/Y" text.
- Color follows simple thresholds: green/muted when all received (100%), amber when partially complete (>0% and <100%), no red state — the settlement gate handles urgency, not the badge.
- Clicking the badge switches the sidebar to the Documents tab.

### 3.3 No other UI changes

No changes to the stepper, claims list page, or action panel (beyond the settlement gate — see §4). The claims list is a natural follow-up if RTUSA validates the per-claim picture, but it's a separate design surface (column layout, sort/filter) deferred for now.

---

## 4. Settlement gate

### 4.1 Where it fires

The gate checks document completeness when the consultant tries to advance into:
- `SETTLEMENT_CONFIRMED`
- `CLOSED`

All earlier transitions are **ungated** — the claim cycle proceeds freely, per POC §5.9. This is the core design principle: missing docs block settlement, not workflow progress.

**FRC extension (slice 4):** When `FRC_REVIEW` lands in slice 4, the gate extends to the `FRC_REVIEW → CLOSED_REPAIR` transition as well. This slice prepares the gate infrastructure; slice 4 adds the additional gate point.

### 4.2 Gate behavior

In the action component for the relevant workflow step, before dispatching `ADVANCE_WORKFLOW`:

1. Call `getDocumentCompleteness(claim)`.
2. If `missing.length === 0` — advance normally, zero friction.
3. If `missing.length > 0` — show an **override dialog**:
   - Warning text: "X of Y required documents are still outstanding."
   - List of each missing document type with an **individual acknowledgement checkbox**.
   - A **reason text field** (shared across all items — the reason for overriding is typically one decision, not per-doc).
   - "Cancel" button returns to the action panel.
   - "Override & proceed" button is **disabled** until every checkbox is checked AND the reason field is non-empty.
4. On override: dispatch `ADVANCE_WORKFLOW`, then dispatch one `ADD_AUDIT_ENTRY` per missing document with action type `document_override`, capturing the document type and the override reason.

### 4.3 Audit trail

New audit action type: `'document_override'`

Each override produces one audit entry per missing document, e.g.:
- "Document override: drivers_license — Reason: insured confirmed delivery by courier tomorrow"
- Displayed in the audit trail with a distinct icon (Lucide `ShieldAlert`).

### 4.4 No blanket bypass

Per POC §5.9 explicit non-goal: "No blanket bypass that marks a claim complete with missing documents." The per-document checkbox design enforces this — the consultant must individually acknowledge each gap.

---

## 5. Dashboard histogram

### 5.1 Chart specification

A new Recharts `BarChart` component in `src/components/dashboard/`:

- **Title:** "Outstanding Document Packs"
- **X-axis:** dates (last 30 days)
- **Y-axis:** count of claims with at least one missing required document on that day
- **Bar color:** semantic theme tokens (consistent with existing dashboard charts)
- **Placement:** added to the dashboard layout alongside existing charts

### 5.2 Data source

A new seed array in `src/data/seed-doc-completeness.ts`:

```ts
interface DailyDocCompletenessSnapshot {
  date: string              // ISO date, e.g. '2026-04-01'
  claimsWithIncomplete: number
}
```

~30 entries showing a general downward trend (8 → 4 claims with incomplete packs) with realistic noise (spikes when new claims arrive with empty doc packs). The final entry's value matches the live count derived from the actual seed claims.

### 5.3 Fast-forward behavior

The histogram is static seeded data — fast-forward does not shift it. This is consistent with how `HistoricalClaim[]` data works for the existing trend charts.

---

## 6. Seed data updates

### 6.1 Claim document completeness states

Each seed claim's `documents[]` is updated so required docs from `REQUIRED_DOCUMENTS[claim.type]` are present with workflow-appropriate statuses:

| Claim stage | Completeness target | Typical received docs |
|---|---|---|
| POLICY_VALIDATION / REGISTERED | 2–3 of required | claim_form, id_copy |
| ASSESSOR_APPOINTED / ASSESSMENT_RECEIVED | 4–5 of required | + damage_photos, police_report |
| INTERNAL_APPROVAL / QA states | 5–6 of required | + drivers_license |
| Late-stage / CLOSED | All required | Complete |
| 1–2 late-stage claims, deliberately incomplete | ~5 of required | Missing 2 docs, to demo the settlement gate |

Documents currently on seed claims that aren't in the required list are preserved — they render in the "other docs" section.

### 6.2 No changes to existing seed data

`HistoricalClaim[]`, seed contacts, seed unmatched messages — all unchanged.

---

## 7. Data model changes

### 7.1 No changes to `ClaimDocument`

The existing `{ id, type, label, status, updatedAt }` shape is sufficient. `status: 'received'` means the doc is in; `status: 'pending'` means it's not. The required-docs constant tells us which docs to check.

### 7.2 New constant: `REQUIRED_DOCUMENTS`

```ts
const REQUIRED_DOCUMENTS: Record<ClaimType, DocumentType[]> = {
  accident: ['claim_form', 'police_report', 'id_copy', 'drivers_license', 'license_disk', 'damage_photos', 'assessment_report'],
  theft:    ['claim_form', 'police_report', 'id_copy', 'drivers_license', 'license_disk', 'investigation_report'],
  glass:    ['claim_form', 'id_copy', 'license_disk', 'damage_photos'],
}
```

Location: `src/data/document-requirements.ts` (new file, parallel to `workflow-definitions.ts`).

### 7.3 New helper: `src/lib/documents.ts`

Pure functions:
- `getDocumentCompleteness(claim)` — returns `{ received, required, missing }`.
- `isSettlementGated(claim)` — returns `boolean` (shorthand: `getDocumentCompleteness(claim).missing.length > 0`).

### 7.4 New audit action type

Add `'document_override'` to the `AuditActionType` union in `src/types/index.ts`.

### 7.5 New seed data type

`DailyDocCompletenessSnapshot` in `src/types/index.ts` (or co-located in the seed file if we prefer to keep the type local — implementer's call).

### 7.6 Dashboard stats extension

Add a `claimsWithIncompleteDocuments` field to `DashboardStats` (or compute it inline in the dashboard from the claims array — implementer's call on whether it's worth adding to the type vs. deriving locally).

---

## 8. Explicitly out of scope

| Item | Reason | Where it lands |
|---|---|---|
| Document-chase SLA (POC §5.9 line 809) | Timer/reminder engine concern; prototype doesn't have background workers | Future slice or backend |
| FRC gate point (`FRC_REVIEW → CLOSED_REPAIR`) | `FRC_REVIEW` state doesn't exist yet | Slice 4 |
| Claims list completeness column | Separate design surface (column layout, sort/filter) | Follow-up if RTUSA validates per-claim picture |
| "Request missing doc" email action from Documents tab | Couples slice 1 conversation infra with document model | Follow-up iteration |
| Per-document capture-point scoping ("needed by state X") | Adds complexity not yet validated as useful | Upgrade from flat list if RTUSA asks for it |
| Multi-tenancy / tenant config | Prototype validates functional requirements; tenancy comes from platform backend | Backend / production |
| Template-editable required doc lists | Static constant is sufficient for prototype | Backend / production |

---

## 9. Files expected to change

### New files
- `src/data/document-requirements.ts` — `REQUIRED_DOCUMENTS` constant
- `src/lib/documents.ts` — `getDocumentCompleteness`, `isSettlementGated` helpers
- `src/data/seed-doc-completeness.ts` — `DailyDocCompletenessSnapshot[]` (30 days)
- `src/components/dashboard/doc-completeness-chart.tsx` — histogram component
- Settlement gate override dialog component (location TBD by implementer — could be in `src/components/claims/actions/` or a shared dialog)

### Modified files
- `src/types/index.ts` — add `document_override` audit type, `DailyDocCompletenessSnapshot` type
- `src/components/claims/panels/documents-panel.tsx` — enhanced with summary bar, required/other sections, mark-as-received buttons
- `src/components/claims/claim-header.tsx` (or equivalent) — add completeness badge
- `src/components/claims/action-panel.tsx` (or specific action components) — settlement gate check before advance
- `src/components/claims/panels/audit-trail-panel.tsx` — add `document_override` icon mapping
- `src/data/seed-claims.ts` — update document arrays for completeness realism
- `src/pages/dashboard-page.tsx` (or equivalent) — add histogram to layout
- `src/context/ClaimContext.tsx` — add `getDocumentCompleteness` to exposed selectors (or keep in `src/lib/documents.ts` and import directly — implementer's call)
- `docs/RTUSA-POC.md` — add single-tenant prototype assumption to §15

---

## 10. Design decisions log

| Decision | Choice | Rationale |
|---|---|---|
| Completeness framing | (A) "Completeness picture" — ambient visibility is the headline, gate is a consequence | RTUSA's pain is not knowing what's missing; the gate is a safety net |
| Required-docs shape | (a) Flat per-claim-type list, no workflow-state scoping | Minimum viable; upgrade to state-scoped if RTUSA asks for it |
| Indicator placement | (b) Documents tab + claim header badge | Always visible without tab-switch; claims list deferred |
| Gate behavior | (c) Hard gate at settlement transitions only, ungated elsewhere | Faithful to POC §5.9 — claim cycle proceeds, settlement is gated |
| Doc interaction | (c) View + mark-as-received toggle | Minimum interactive; email-request action deferred |
| Override granularity | Per-document acknowledgement, per POC §5.9 | No blanket bypass — consultant must acknowledge each missing doc |
| Dashboard widget | (a) KPI histogram — outstanding docs over time, 30-day bars | Answers "is the backlog improving?" management question |
| Seed completeness | Workflow-stage-appropriate distribution, 1–2 deliberately incomplete late-stage | Demos both the picture and the gate |
| Multi-tenancy | Deferred — prototype is single-tenant with hardcoded values | Platform backend owns tenancy; this repo validates functional requirements |
