# Plan: Correct Theft Claim Workflow per PRD V2.2

> Session: `1b7fd3e8` | Date: 2026-03-28 | Commit: `a3912aa`

## Context

PRD V2.2 (2026-03-28) corrected the theft workflow. It was incorrectly modelled as a copy of the accident flow with only the assessor/investigator step changed. Per the RTU Optimised Claims Flow spec:

- Theft claims do **not** collect excess at policy validation
- Theft claims do **not** have an assessed amount
- Theft claims do **not** route through auto-routing (no excess comparison)
- Theft claims do **not** go to WITHIN_EXCESS or INTERNAL_APPROVAL
- **All** theft claims go directly from INVESTIGATION_RECEIVED → QA_APPOINTED (higher risk = mandatory QA)

## Changes (7 files modified, 1 new file)

### 1. `src/data/workflow-definitions.ts` — Core workflow fix
- **Theft policy validation step** (line 205): Remove "and excess amount" from description
- **Theft investigation received step** (line 232): Change to "Upload the investigation report and confirm receipt" (no assessed amount)
- **Remove** `WITHIN_EXCESS` and `INTERNAL_APPROVAL` step definitions from `theftSteps` (lines 235-249)
- **Theft transitions** (line 357): Change `INVESTIGATION_RECEIVED: ['WITHIN_EXCESS', 'INTERNAL_APPROVAL', 'QA_APPOINTED']` → `INVESTIGATION_RECEIVED: ['QA_APPOINTED']`
- **Remove** `WITHIN_EXCESS` and `INTERNAL_APPROVAL` transitions from `theftTransitions` (lines 358-359)
- **Theft linear path** (line 482): Replace `INTERNAL_APPROVAL` with `QA_APPOINTED, QA_DECISION`

### 2. `src/data/seed-claims.ts` — Remove excess from theft seeds
- **CLM-10003** (line 194): Remove `excessAmount: 8_000`
- **CLM-10005** (line 332): Remove `excessAmount: 12_000`

### 3. NEW: `src/components/claims/actions/investigation-received.tsx`
- New component for theft's INVESTIGATION_RECEIVED state
- Simple UI: upload confirmation + advance to QA_APPOINTED
- No amount inputs, no auto-routing — hardcoded `toState: 'QA_APPOINTED'`
- Separate from `AssessmentReceived` because the UIs are fundamentally different

### 4. `src/components/claims/action-panel.tsx` — Wire new component
- Import `InvestigationReceived`
- Split the combined case (lines 98-100): `ASSESSMENT_RECEIVED` → `AssessmentReceived`, `INVESTIGATION_RECEIVED` → `InvestigationReceived`

### 5. `src/components/claims/actions/policy-validation.tsx` — Hide excess for theft
- Add `const isTheft = claim.type === 'theft'`
- Conditionally hide excess amount input field
- Fix disabled condition: only require excess for non-theft
- Conditionally exclude `excessAmount` from dispatch data
- Update bridge banner instruction text

### 6. `src/components/claims/actions/qa-decision.tsx` — Fix description for theft
- Line 45-46: Replace hardcoded "exceeds R50,000" text with conditional:
  - Theft: "All theft claims require QA review before approval."
  - Accident: Keep existing text with amounts

### 7. `src/components/claims/actions/register-on-rock.tsx` — Hide excess for theft
- Line 45: Wrap excess `CopyableField` in `{claim.type !== 'theft' && (...)}`

## Files NOT changed (and why)
- `types/index.ts` — Optional fields, still used by accident
- `workflow-engine.ts` — `resolveAutoRoute()` still used by accident; theft never calls it
- `ClaimContext.tsx` — Generic reducer, no claim-type logic
- `communication-templates.ts` — `within_excess` template still valid for accident
- `closed.tsx`, `claim-details-panel.tsx` — Already null-safe
- `internal-approval.tsx`, `within-excess.tsx` — Still valid for accident

## Implementation order
1. `workflow-definitions.ts` (foundational)
2. `seed-claims.ts` (data consistency)
3. Create `investigation-received.tsx` (new component)
4. `action-panel.tsx` (wire it up)
5. `policy-validation.tsx` (UI fix)
6. `qa-decision.tsx` (UI fix)
7. `register-on-rock.tsx` (UI fix)

## Verification
1. `npm run build` — confirm no TypeScript errors
2. `npm run dev` — open in browser
3. Test theft claims CLM-10003 and CLM-10005:
   - CLM-10003 (REGISTERED): Advance to INVESTIGATOR_APPOINTED — no excess shown on Rock registration
   - CLM-10005 (INVESTIGATOR_APPOINTED): Advance to INVESTIGATION_RECEIVED — should show upload UI, not amount input
   - Continue advancing: should go directly to QA_APPOINTED (no routing decision, no excess/internal approval options)
4. Test accident claim to confirm no regression — auto-routing with amounts should still work
5. Check the workflow stepper on theft claims — should show QA_APPOINTED/QA_DECISION in the path, not INTERNAL_APPROVAL
6. Create a new theft claim and walk through policy validation — excess field should not appear
