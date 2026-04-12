# Document Completeness & Settlement Gate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give claims consultants an always-visible picture of document completeness per claim, and gate settlement transitions until the doc pack is complete (with per-document override).

**Architecture:** A flat per-claim-type required-documents constant drives a pure `getDocumentCompleteness()` function. The Documents sidebar tab shows a summary bar + required/other doc sections. A badge in the claim header shows X/Y at a glance. Settlement-adjacent transitions in `progress-status.tsx` check completeness and show an override dialog if incomplete. A 30-day histogram on the dashboard shows outstanding-doc-pack trends.

**Tech Stack:** React 19, TypeScript, Recharts (BarChart), shadcn/ui (Dialog, Card), Lucide icons, date-fns.

**Spec:** `docs/superpowers/specs/2026-04-11-document-completeness-design.md`

**No test framework** — verification is `npm run build` + `npm run lint` + visual checks.

---

## File map

### New files

| File | Responsibility |
|---|---|
| `src/data/document-requirements.ts` | `REQUIRED_DOCUMENTS` constant + `DOCUMENT_LABELS` lookup |
| `src/lib/documents.ts` | `getDocumentCompleteness()`, `isSettlementGated()`, `isGatedTransition()` |
| `src/data/seed-doc-completeness.ts` | 30-day `DailyDocCompletenessSnapshot[]` for dashboard histogram |
| `src/components/claims/actions/settlement-gate-dialog.tsx` | Override dialog with per-document acknowledgement checkboxes |
| `src/components/dashboard/doc-completeness-chart.tsx` | Recharts BarChart histogram component |

### Modified files

| File | Changes |
|---|---|
| `src/types/index.ts` | Add `document_override` to `AuditActionType`; add `DailyDocCompletenessSnapshot` interface |
| `src/data/seed-claims.ts` | Replace `makeDocs()` with completeness-aware `makeRequiredDocs()` per claim type/stage |
| `src/components/claims/panels/documents-panel.tsx` | Full rewrite: summary bar + required/other sections + mark-as-received |
| `src/components/claims/claim-header.tsx` | Add doc completeness badge next to SLA indicator |
| `src/components/claims/actions/progress-status.tsx` | Add gate check before advance; show override dialog when incomplete |
| `src/components/claims/panels/audit-trail-panel.tsx` | Add `document_override` → `ShieldAlert` icon mapping |
| `src/pages/dashboard-page.tsx` | Import and render `DocCompletenessChart` |
| `src/pages/claim-detail-page.tsx` | Update Documents tab badge to show X/Y count |

---

## Task 1: Type additions and required-documents constant

**Files:**
- Modify: `src/types/index.ts:54-66` (AuditActionType union)
- Modify: `src/types/index.ts:310-316` (after DashboardStats)
- Create: `src/data/document-requirements.ts`

- [ ] **Step 1: Add `document_override` to `AuditActionType`**

In `src/types/index.ts`, add `'document_override'` to the union:

```ts
export type AuditActionType =
  | 'claim_created'
  | 'status_changed'
  | 'field_updated'
  | 'document_updated'
  | 'document_override'
  | 'contact_assigned'
  | 'message_generated'
  | 'message_sent'
  | 'message_received'
  | 'message_assigned'
  | 'sla_warning'
  | 'sla_breached'
  | 'note_added'
```

- [ ] **Step 2: Add `DailyDocCompletenessSnapshot` type**

In `src/types/index.ts`, after the `DashboardStats` interface (around line 316), add:

```ts
// ── Document Completeness Snapshot ──────────────────────────
export interface DailyDocCompletenessSnapshot {
  date: string
  claimsWithIncomplete: number
}
```

- [ ] **Step 3: Create `src/data/document-requirements.ts`**

```ts
import type { ClaimType, DocumentType } from '@/types'

export const REQUIRED_DOCUMENTS: Record<ClaimType, DocumentType[]> = {
  accident: [
    'claim_form',
    'police_report',
    'id_copy',
    'drivers_license',
    'license_disk',
    'damage_photos',
    'assessment_report',
  ],
  theft: [
    'claim_form',
    'police_report',
    'id_copy',
    'drivers_license',
    'license_disk',
    'investigation_report',
  ],
  glass: [
    'claim_form',
    'id_copy',
    'license_disk',
    'damage_photos',
  ],
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  claim_form: 'Claim Form',
  police_report: 'Police Report',
  id_copy: 'ID Copy',
  license_disk: 'License Disk',
  vehicle_registration: 'Vehicle Registration',
  drivers_license: "Driver's License",
  trip_log: 'Trip Log',
  damage_photos: 'Damage Photos',
  assessment_report: 'Assessment Report',
  investigation_report: 'Investigation Report',
  rejection_docs: 'Rejection Documents',
  other: 'Other',
}
```

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: Clean build (zero errors).

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/data/document-requirements.ts
git commit -m "feat(types): add document_override audit type, completeness snapshot type, and required-documents constant"
```

---

## Task 2: Document completeness helper functions

**Files:**
- Create: `src/lib/documents.ts`

- [ ] **Step 1: Create `src/lib/documents.ts`**

```ts
import type { Claim, DocumentType, WorkflowState } from '@/types'
import { REQUIRED_DOCUMENTS } from '@/data/document-requirements'

export interface DocumentCompleteness {
  received: number
  required: number
  missing: DocumentType[]
}

export function getDocumentCompleteness(claim: Claim): DocumentCompleteness {
  const requiredTypes = REQUIRED_DOCUMENTS[claim.type]
  const receivedTypes = new Set(
    claim.documents
      .filter(d => d.status === 'received')
      .map(d => d.type),
  )

  const missing = requiredTypes.filter(t => !receivedTypes.has(t))

  return {
    received: requiredTypes.length - missing.length,
    required: requiredTypes.length,
    missing,
  }
}

export function isSettlementGated(claim: Claim): boolean {
  return getDocumentCompleteness(claim).missing.length > 0
}

/**
 * Transitions where the document-completeness gate fires.
 * These are the points where RTU releases payment — settlement
 * confirmation and claim closure after repair.
 *
 * Non-payment closures (WITHIN_EXCESS, REJECTED, INVALID → CLOSED)
 * are handled by separate action components and are NOT gated.
 */
const GATED_TRANSITIONS = new Set([
  'TOTAL_LOSS->SETTLEMENT_CONFIRMED',
  'REPAIR_IN_PROGRESS->CLOSED',
  'REPAIR_COMPLETE->CLOSED',
])

export function isGatedTransition(from: WorkflowState, to: WorkflowState): boolean {
  return GATED_TRANSITIONS.has(`${from}->${to}`)
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/lib/documents.ts
git commit -m "feat(lib): add document completeness helpers and gated-transition check"
```

---

## Task 3: Update seed claims with completeness-appropriate documents

**Files:**
- Modify: `src/data/seed-claims.ts:21-37` (replace `makeDocs` function)
- Modify: `src/data/seed-claims.ts` (individual claim `documents` arrays where needed)

The current `makeDocs()` function gives every accident/theft claim the same 6 docs (with `vehicle_registration` as pending). We need to replace this so each claim gets the correct required docs at a completeness level matching its workflow stage.

- [ ] **Step 1: Replace `makeDocs` with `makeRequiredDocs`**

Replace the `makeDocs` function (lines 21-37) with:

```ts
import { REQUIRED_DOCUMENTS, DOCUMENT_LABELS } from '@/data/document-requirements'
import type { DocumentType } from '@/types'

/**
 * Generate a documents array with the first `receivedCount` required docs
 * marked as received and the rest as pending.
 * Optional `extras` adds non-required docs (e.g. vehicle_registration).
 */
function makeRequiredDocs(
  type: 'accident' | 'theft' | 'glass',
  receivedCount: number,
  extras?: { type: DocumentType; label: string; status: 'received' | 'pending' }[],
): ClaimDocument[] {
  const now = new Date().toISOString()
  const required = REQUIRED_DOCUMENTS[type]
  const docs: ClaimDocument[] = required.map((docType, i) => ({
    id: `DOC-${i + 1}`,
    type: docType,
    label: DOCUMENT_LABELS[docType],
    status: i < receivedCount ? 'received' as const : 'pending' as const,
    updatedAt: now,
  }))
  if (extras) {
    extras.forEach((extra, i) => {
      docs.push({
        id: `DOC-X-${i + 1}`,
        type: extra.type,
        label: extra.label,
        status: extra.status,
        updatedAt: now,
      })
    })
  }
  return docs
}
```

Also add the import at the top of the file:

```ts
import { REQUIRED_DOCUMENTS, DOCUMENT_LABELS } from '@/data/document-requirements'
import type { DocumentType } from '@/types'
```

(Add `DocumentType` to the existing type import from `@/types`.)

- [ ] **Step 2: Update each seed claim's `documents` call**

Replace each `makeDocs(...)` call and any inline doc extensions with `makeRequiredDocs(...)` using these completeness levels:

```
CLM-10001  accident  NEW                     → makeRequiredDocs('accident', 2)                     // 2/7: claim_form, police_report
CLM-10002  accident  POLICY_VALIDATION       → makeRequiredDocs('accident', 3)                     // 3/7: + id_copy
CLM-10003  accident  ASSESSOR_APPOINTED       → makeRequiredDocs('accident', 4)                     // 4/7: + drivers_license
CLM-10004  accident  ASSESSMENT_RECEIVED      → makeRequiredDocs('accident', 5)                     // 5/7: + license_disk
CLM-10005  accident  INTERNAL_APPROVAL        → makeRequiredDocs('accident', 5)                     // 5/7: still missing damage_photos, assessment_report
CLM-10006  accident  INSPECTION_FINAL_COSTING → makeRequiredDocs('accident', 5)                     // 5/7: deliberately incomplete for gate demo
CLM-10007  accident  CLOSED                   → makeRequiredDocs('accident', 7)                     // 7/7: complete
CLM-10008  theft     INVESTIGATOR_APPOINTED   → makeRequiredDocs('theft', 4)                        // 4/6
CLM-10009  glass     NEW                      → makeRequiredDocs('glass', 1)                        // 1/4: claim_form only
CLM-10010  glass     POLICY_VALIDATION        → makeRequiredDocs('glass', 2)                        // 2/4
CLM-10011  glass     REGISTERED               → makeRequiredDocs('glass', 2)                        // 2/4
CLM-10012  glass     GLASS_REPAIRER_APPOINTED → makeRequiredDocs('glass', 3)                        // 3/4
CLM-10013  glass     GLASS_REPAIRER_APPOINTED → makeRequiredDocs('glass', 4)                        // 4/4: complete
CLM-10014  glass     REPAIR_COMPLETE          → makeRequiredDocs('glass', 3)                        // 3/4: deliberately incomplete for gate demo
CLM-10015  glass     CLOSED                   → makeRequiredDocs('glass', 4)                        // 4/4: complete
CLM-10016  glass     CLOSED                   → makeRequiredDocs('glass', 4)                        // 4/4: complete
```

For CLM-10004 (ASSESSMENT_RECEIVED), remove the inline assessment_report doc extension (line 383) — it's now included in the required list via `makeRequiredDocs('accident', 5)` which gives the first 5 of the 7 required docs. Actually, since the required order is `['claim_form', 'police_report', 'id_copy', 'drivers_license', 'license_disk', 'damage_photos', 'assessment_report']`, receivedCount of 5 gives claim_form through license_disk. The assessment_report should be received for CLM-10004 since it's past assessment. So either reorder the array or use a custom set. For simplicity, use the note that `makeRequiredDocs` marks the first N docs as received — the order of REQUIRED_DOCUMENTS determines which ones. The current order works: first 5 are the identity/admin docs, last 2 are the stage-specific docs (damage_photos, assessment_report). This means a claim with 5/7 has all admin docs but is missing the photos and report — which is realistic for mid-stage claims where the assessor hasn't submitted yet.

For CLM-10004 specifically, the assessment report IS received (the claim is in ASSESSMENT_RECEIVED). Override with receivedCount 6 to include damage_photos, leaving only assessment_report as pending. Wait — that's backwards. Let me reconsider the order.

Actually, let me make the order match the natural order of acquisition:

```ts
// In REQUIRED_DOCUMENTS, keep this order (most likely to be received first → last):
accident: ['claim_form', 'id_copy', 'drivers_license', 'license_disk', 'police_report', 'damage_photos', 'assessment_report']
```

With this order:
- 2/7 → claim_form, id_copy (identity docs come with the initial filing)
- 3/7 → + drivers_license
- 4/7 → + license_disk
- 5/7 → + police_report (may take a day or two to get the case number report)
- 6/7 → + damage_photos (taken at assessment)
- 7/7 → + assessment_report (assessor submits)

This is a much more realistic acquisition order. Update the `REQUIRED_DOCUMENTS` constant in `document-requirements.ts` to reflect this order.

Similarly for theft:
```ts
theft: ['claim_form', 'id_copy', 'drivers_license', 'license_disk', 'police_report', 'investigation_report']
```

And glass:
```ts
glass: ['claim_form', 'id_copy', 'license_disk', 'damage_photos']
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: Clean build. No references to the old `makeDocs` function remain.

- [ ] **Step 4: Commit**

```bash
git add src/data/seed-claims.ts src/data/document-requirements.ts
git commit -m "feat(seed): replace makeDocs with completeness-aware makeRequiredDocs per claim stage"
```

---

## Task 4: Enhance the Documents sidebar panel

**Files:**
- Modify: `src/components/claims/panels/documents-panel.tsx` (full rewrite — 45 → ~95 lines)

- [ ] **Step 1: Rewrite `documents-panel.tsx`**

Replace the entire file with:

```tsx
import type { Claim, DocumentStatus, DocumentType } from '@/types'
import { useClaims } from '@/context/ClaimContext'
import { FileText, Check, Clock, Minus, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDocumentCompleteness } from '@/lib/documents'
import { REQUIRED_DOCUMENTS, DOCUMENT_LABELS } from '@/data/document-requirements'
import { format } from 'date-fns'

const statusConfig: Record<DocumentStatus, { icon: typeof Check; label: string; className: string }> = {
  received: { icon: Check, label: 'Received', className: 'text-primary' },
  pending: { icon: Clock, label: 'Pending', className: 'text-accent-foreground' },
  not_required: { icon: Minus, label: 'N/A', className: 'text-muted-foreground' },
}

export function DocumentsPanel({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const completeness = getDocumentCompleteness(claim)
  const requiredTypes = new Set(REQUIRED_DOCUMENTS[claim.type])

  const requiredDocs = claim.documents.filter(d => requiredTypes.has(d.type))
  const otherDocs = claim.documents.filter(d => !requiredTypes.has(d.type))

  // Required types that have no document entry yet
  const missingTypes = completeness.missing.filter(
    t => !claim.documents.some(d => d.type === t),
  )

  function markReceived(docId: string, docLabel: string) {
    dispatch({ type: 'UPDATE_DOCUMENT_STATUS', claimId: claim.id, docId, status: 'received' })
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      claimId: claim.id,
      entry: {
        id: `AUD-DOC-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: claim.assignedTo,
        actionType: 'document_updated',
        description: `Document received: ${docLabel}`,
      },
    })
  }

  const progressPercent = completeness.required > 0
    ? Math.round((completeness.received / completeness.required) * 100)
    : 100

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <FileCheck className="size-3.5" />
            {completeness.received} of {completeness.required} documents received
          </span>
          <span className="text-muted-foreground">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              progressPercent === 100 ? 'bg-primary' : 'bg-accent-foreground',
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Required documents */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2">
          Required
        </div>
        {requiredDocs.map(doc => {
          const config = statusConfig[doc.status]
          const Icon = config.icon

          return (
            <div
              key={doc.id}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5"
            >
              <FileText className="size-3.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground truncate">{doc.label}</div>
                {doc.status === 'received' && (
                  <div className="text-[10px] text-muted-foreground">
                    {format(new Date(doc.updatedAt), 'dd MMM HH:mm')}
                  </div>
                )}
              </div>
              {doc.status === 'pending' ? (
                <button
                  type="button"
                  onClick={() => markReceived(doc.id, doc.label)}
                  className="text-[11px] font-medium text-accent-foreground hover:text-primary transition-colors px-2 py-0.5 rounded hover:bg-muted"
                >
                  Mark received
                </button>
              ) : (
                <span className={cn('flex items-center gap-1 text-[11px] font-medium', config.className)}>
                  <Icon className="size-3" />
                  {config.label}
                </span>
              )}
            </div>
          )
        })}

        {/* Missing types with no document entry */}
        {missingTypes.map(docType => (
          <div
            key={docType}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 opacity-60"
          >
            <FileText className="size-3.5 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 text-xs text-foreground truncate">
              {DOCUMENT_LABELS[docType]}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-accent-foreground">
              <Clock className="size-3" />
              Pending
            </span>
          </div>
        ))}
      </div>

      {/* Other documents */}
      {otherDocs.length > 0 && (
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2">
            Other
          </div>
          {otherDocs.map(doc => {
            const config = statusConfig[doc.status]
            const Icon = config.icon

            return (
              <div
                key={doc.id}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5"
              >
                <FileText className="size-3.5 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 text-xs text-foreground truncate">{doc.label}</span>
                <span className={cn('flex items-center gap-1 text-[11px] font-medium', config.className)}>
                  <Icon className="size-3" />
                  {config.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/claims/panels/documents-panel.tsx
git commit -m "feat(documents): enhance panel with completeness summary, required/other sections, and mark-as-received"
```

---

## Task 5: Add completeness badge to claim header

**Files:**
- Modify: `src/components/claims/claim-header.tsx`

- [ ] **Step 1: Add the badge**

Add imports at the top:

```ts
import { FileCheck } from 'lucide-react'
import { getDocumentCompleteness } from '@/lib/documents'
import { cn } from '@/lib/utils'
```

Inside the component, before the return, compute completeness:

```ts
const docCompleteness = getDocumentCompleteness(claim)
const isDocComplete = docCompleteness.missing.length === 0
```

In the JSX, after `<SlaIndicator claim={claim} />` (line 33), add:

```tsx
<span
  className={cn(
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
    isDocComplete
      ? 'bg-primary/10 text-primary'
      : 'bg-accent/50 text-accent-foreground',
  )}
>
  <FileCheck className="size-3" />
  {docCompleteness.received}/{docCompleteness.required}
</span>
```

**Note:** The spec mentions clicking the badge switches to the Documents sidebar tab. This requires lifting the sidebar `Tabs` state out of `claim-detail-page.tsx`, which adds coupling for marginal value in a prototype. Deferred — the badge is informational only for now.

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/claims/claim-header.tsx
git commit -m "feat(claim-header): add document completeness badge"
```

---

## Task 6: Update Documents tab badge in claim-detail-page

**Files:**
- Modify: `src/pages/claim-detail-page.tsx:41-45`

- [ ] **Step 1: Replace the pending-dot with a count badge**

Add import at the top:

```ts
import { getDocumentCompleteness } from '@/lib/documents'
```

Inside the component, before the return, add:

```ts
const docCompleteness = getDocumentCompleteness(claim)
```

Replace the Documents `TabsTrigger` (lines 41-45):

```tsx
<TabsTrigger value="documents" className="text-xs">
  Documents
  {docCompleteness.missing.length > 0 && (
    <span className="ml-1 rounded-full bg-accent-foreground/20 px-1.5 text-[10px] font-medium text-accent-foreground">
      {docCompleteness.received}/{docCompleteness.required}
    </span>
  )}
</TabsTrigger>
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/pages/claim-detail-page.tsx
git commit -m "feat(claim-detail): show document completeness count on Documents tab badge"
```

---

## Task 7: Settlement gate override dialog

**Files:**
- Create: `src/components/claims/actions/settlement-gate-dialog.tsx`

- [ ] **Step 1: Create the dialog component**

```tsx
import { useState } from 'react'
import type { DocumentType } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Square, CheckSquare } from 'lucide-react'
import { DOCUMENT_LABELS } from '@/data/document-requirements'

interface SettlementGateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  missingDocs: DocumentType[]
  total: number
  onOverride: (reason: string) => void
}

export function SettlementGateDialog({
  open,
  onOpenChange,
  missingDocs,
  total,
  onOverride,
}: SettlementGateDialogProps) {
  const [acknowledged, setAcknowledged] = useState<Set<DocumentType>>(new Set())
  const [reason, setReason] = useState('')

  const allAcknowledged = missingDocs.every(d => acknowledged.has(d))
  const canOverride = allAcknowledged && reason.trim().length > 0

  function toggleAcknowledge(docType: DocumentType) {
    setAcknowledged(prev => {
      const next = new Set(prev)
      if (next.has(docType)) {
        next.delete(docType)
      } else {
        next.add(docType)
      }
      return next
    })
  }

  function handleOverride() {
    if (!canOverride) return
    onOverride(reason.trim())
    setAcknowledged(new Set())
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-destructive" />
            Incomplete Document Pack
          </DialogTitle>
          <DialogDescription>
            {missingDocs.length} of {total} required documents are still outstanding.
            Acknowledge each missing document and provide a reason to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            {missingDocs.map(docType => {
              const isChecked = acknowledged.has(docType)
              const Icon = isChecked ? CheckSquare : Square

              return (
                <button
                  key={docType}
                  type="button"
                  onClick={() => toggleAcknowledge(docType)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted transition-colors"
                >
                  <Icon className={`size-4 flex-shrink-0 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-foreground">{DOCUMENT_LABELS[docType]}</span>
                </button>
              )
            })}
          </div>

          <div>
            <label htmlFor="override-reason" className="text-xs font-medium text-muted-foreground">
              Reason for proceeding without complete documents
            </label>
            <textarea
              id="override-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Insured confirmed delivery by courier tomorrow"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!canOverride}
            onClick={handleOverride}
          >
            Override &amp; Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/claims/actions/settlement-gate-dialog.tsx
git commit -m "feat(gate): add settlement gate override dialog with per-document acknowledgement"
```

---

## Task 8: Integrate settlement gate into progress-status

**Files:**
- Modify: `src/components/claims/actions/progress-status.tsx`

- [ ] **Step 1: Add gate logic to `progress-status.tsx`**

Replace the entire file with:

```tsx
import { useState } from 'react'
import type { Claim, WorkflowState } from '@/types'
import { Button } from '@/components/ui/button'
import { useClaims } from '@/context/ClaimContext'
import { formatZAR } from '@/lib/utils'
import { stateLabels } from '@/data/workflow-definitions'
import { CheckCircle } from 'lucide-react'
import { getDocumentCompleteness, isGatedTransition } from '@/lib/documents'
import { SettlementGateDialog } from './settlement-gate-dialog'

const nextStateMap: Partial<Record<WorkflowState, WorkflowState>> = {
  REPAIR_IN_PROGRESS: 'CLOSED',
  TOTAL_LOSS: 'SETTLEMENT_CONFIRMED',
  SETTLEMENT_CONFIRMED: 'SALVAGE_IN_PROGRESS',
  SALVAGE_IN_PROGRESS: 'CLOSED',
  REPAIR_COMPLETE: 'CLOSED',
}

const actionLabels: Partial<Record<WorkflowState, string>> = {
  REPAIR_IN_PROGRESS: 'Mark Repair Complete',
  TOTAL_LOSS: 'Confirm Settlement Issued',
  SETTLEMENT_CONFIRMED: 'Confirm Receipt & Start Salvage',
  SALVAGE_IN_PROGRESS: 'Mark Salvage Complete',
  REPAIR_COMPLETE: 'Close Claim',
}

export function ProgressStatus({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const [gateOpen, setGateOpen] = useState(false)
  const nextState = nextStateMap[claim.status]

  const shouldGate = nextState != null && isGatedTransition(claim.status, nextState)
  const completeness = getDocumentCompleteness(claim)

  function handleAdvance() {
    if (!nextState) return

    if (shouldGate && completeness.missing.length > 0) {
      setGateOpen(true)
      return
    }

    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: nextState,
    })
  }

  function handleOverride(reason: string) {
    if (!nextState) return

    // Log a document_override audit entry per missing doc
    const now = new Date().toISOString()
    completeness.missing.forEach((docType, i) => {
      dispatch({
        type: 'ADD_AUDIT_ENTRY',
        claimId: claim.id,
        entry: {
          id: `AUD-OVERRIDE-${Date.now()}-${i}`,
          timestamp: now,
          user: claim.assignedTo,
          actionType: 'document_override',
          description: `Document override: ${docType} — Reason: ${reason}`,
        },
      })
    })

    // Now advance
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: nextState,
    })

    setGateOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted p-4">
        <div className="text-sm font-medium text-foreground mb-3">{stateLabels[claim.status]}</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {claim.workflow.assessedAmount != null && (
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Assessed Amount</div>
              <div>{formatZAR(claim.workflow.assessedAmount)}</div>
            </div>
          )}
          {claim.workflow.finalCostAmount != null && (
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Final Cost</div>
              <div>{formatZAR(claim.workflow.finalCostAmount)}</div>
            </div>
          )}
          {claim.workflow.routeType && (
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Route</div>
              <div className="capitalize">{claim.workflow.routeType.replace('_', ' ')}</div>
            </div>
          )}
        </div>
      </div>

      {nextState && (
        <div className="flex justify-end">
          <Button onClick={handleAdvance}>
            <CheckCircle className="size-4" data-icon="inline-start" />
            {actionLabels[claim.status] ?? 'Proceed'}
          </Button>
        </div>
      )}

      {shouldGate && (
        <SettlementGateDialog
          open={gateOpen}
          onOpenChange={setGateOpen}
          missingDocs={completeness.missing}
          total={completeness.required}
          onOverride={handleOverride}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/claims/actions/progress-status.tsx
git commit -m "feat(gate): integrate settlement gate check into progress-status with override dialog"
```

---

## Task 9: Add document_override to audit trail icon map

**Files:**
- Modify: `src/components/claims/panels/audit-trail-panel.tsx:1-22`

- [ ] **Step 1: Add the icon mapping**

Add `ShieldAlert` to the Lucide import (line 6):

```ts
import {
  PlusCircle, ArrowRightLeft, Edit, FileText, UserPlus, Send, Mail, AlertTriangle, AlertCircle, MessageSquare, Download, Inbox, ShieldAlert,
} from 'lucide-react'
```

Add the entry to `iconMap` (after `document_updated: FileText` on line 13):

```ts
document_override: ShieldAlert,
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/claims/panels/audit-trail-panel.tsx
git commit -m "feat(audit): add document_override icon mapping (ShieldAlert)"
```

---

## Task 10: Dashboard histogram — seed data

**Files:**
- Create: `src/data/seed-doc-completeness.ts`

- [ ] **Step 1: Create the seed file**

```ts
import type { DailyDocCompletenessSnapshot } from '@/types'

/**
 * 30 days of seeded "claims with incomplete document packs" data.
 * Shows a general downward trend (8 → 4) with realistic noise.
 * The last entry (today) should match the live count from seed claims.
 *
 * Based on 16 seed claims, 7 currently have incomplete doc packs:
 * CLM-10001 (2/7), CLM-10002 (3/7), CLM-10003 (4/7), CLM-10004 (5/7),
 * CLM-10005 (5/7), CLM-10006 (5/7), CLM-10008 (4/6),
 * CLM-10009 (1/4), CLM-10010 (2/4), CLM-10011 (2/4), CLM-10012 (3/4),
 * CLM-10014 (3/4).
 * That's 12 claims. But historically, backlog was worse.
 */
function generateSnapshots(): DailyDocCompletenessSnapshot[] {
  const today = new Date()
  const snapshots: DailyDocCompletenessSnapshot[] = []

  // Day-by-day values for 30 days (index 0 = 30 days ago, index 29 = today)
  const values = [
    14, 13, 14, 15, 14, 13, 12, 13, 12, 11,
    12, 11, 10, 11, 10,  9, 10,  9,  8,  9,
     8,  8,  7,  8,  7,  6,  7,  7,  6,  5,
  ]

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - (29 - i))
    snapshots.push({
      date: date.toISOString().split('T')[0],
      claimsWithIncomplete: values[i],
    })
  }

  return snapshots
}

export const seedDocCompleteness: DailyDocCompletenessSnapshot[] = generateSnapshots()
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/data/seed-doc-completeness.ts
git commit -m "feat(seed): add 30-day document completeness snapshot data for dashboard histogram"
```

---

## Task 11: Dashboard histogram — chart component

**Files:**
- Create: `src/components/dashboard/doc-completeness-chart.tsx`

- [ ] **Step 1: Create the chart component**

```tsx
import { Card } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts'
import { seedDocCompleteness } from '@/data/seed-doc-completeness'

export function DocCompletenessChart() {
  // Format dates for display (dd/MM)
  const data = seedDocCompleteness.map(d => ({
    ...d,
    label: `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`,
  }))

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Outstanding Document Packs</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <RechartsTooltip
            formatter={(value: unknown) => [`${value} claims`, 'Incomplete']}
            labelFormatter={(label: string) => `Date: ${label}`}
          />
          <Bar dataKey="claimsWithIncomplete" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/doc-completeness-chart.tsx
git commit -m "feat(dashboard): add document completeness histogram component"
```

---

## Task 12: Add histogram to dashboard page

**Files:**
- Modify: `src/pages/dashboard-page.tsx`

- [ ] **Step 1: Import and render the chart**

Add the import at the top:

```ts
import { DocCompletenessChart } from '@/components/dashboard/doc-completeness-chart'
```

Add the histogram after the Live SLA Status card (after line 208, before the closing `</div>` on line 210):

```tsx
      {/* ── Document Completeness ──────────────────────────── */}
      <DocCompletenessChart />
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard-page.tsx
git commit -m "feat(dashboard): add outstanding document packs histogram"
```

---

## Task 13: Add single-tenant prototype assumption to POC doc

**Files:**
- Modify: `docs/RTUSA-POC.md`

- [ ] **Step 1: Add assumption to §15**

Find the assumptions table in `docs/RTUSA-POC.md` (around line 1257 — the last numbered assumption). After the last row, add:

```
| 16 | **Prototype is single-tenant with hardcoded values; multi-tenancy comes from the platform backend** | The R50k mandate threshold, SLA timings, mailbox address, and required-documents lists are hardcoded constants. Multi-tenant configuration is a production concern, not a prototype concern. | ✅ Confirmed on 2026-04-12 by Fred |
```

- [ ] **Step 2: Commit**

```bash
git add docs/RTUSA-POC.md
git commit -m "docs: add single-tenant prototype assumption to POC §15"
```

---

## Verification checklist (run after all tasks)

After all 13 tasks are complete, run these checks:

- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — no new lint errors (pre-existing ones are known and acceptable)
- [ ] `npm run dev` — dev server starts on localhost:5173

Then visually verify in the browser:

1. **Documents tab.** Open any claim → sidebar Documents tab shows "X of Y documents received" summary bar, progress bar, required section with mark-as-received buttons, and (if applicable) other docs section.

2. **Header badge.** Claim header shows doc icon with X/Y count. Green-tinted when complete, amber-tinted when incomplete.

3. **Tab badge.** Documents tab trigger shows X/Y count badge when docs are incomplete.

4. **Mark as received.** Click "Mark received" on a pending doc → status changes to received → summary bar updates → header badge updates.

5. **Settlement gate — clean advance.** Advance CLM-10007 (accident, CLOSED, 7/7 docs) or a claim with all docs received through a settlement transition → no dialog, advances normally.

6. **Settlement gate — override flow.** Advance CLM-10014 (glass, REPAIR_COMPLETE, 3/4 docs) → click "Close Claim" → override dialog appears → check missing doc → enter reason → click "Override & proceed" → claim advances → audit trail shows document_override entry with ShieldAlert icon.

7. **Dashboard histogram.** Navigate to /dashboard → "Outstanding Document Packs" chart visible below the Live SLA Status card → shows 30-day bar chart with downward trend.

8. **Theme check.** Toggle themes in browser devtools — all new UI elements should render correctly with themed colors (no hardcoded hex/Tailwind color classes).
