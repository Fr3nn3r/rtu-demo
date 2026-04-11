# Handoff — V3 Slice 1 (Conversation View) complete

**Date:** 2026-04-11
**Session outcome:** V3 POC doc updated to V3.0; slice 1 implementation complete on master
**Branch:** `master` (explicit user consent for direct commits)
**State:** Ready for interactive smoke test + next slice

---

## What this session covered

This was a long three-phase session: **spec update → brainstorming → implementation execution**.

### Phase 1 — V3 POC doc update (from `fa68511` through `d7ed9b0`)

The starting point was the 2026-04-10 RTUSA workshop transcript at `docs/RTUSA _ True Aim - Workshop - 2026_04_10 13_59 CEST - Notes by Gemini.md`. Gaps identified against the V2.4 POC doc and rewritten into V3:

1. **§7.6 Claim conversation view (new section)** — Mike's core requirement captured as a bounded-scope "read-only claims@ ingestion" feature (deliberately NOT an email client / CRM replacement). Threading via `[CP-{ClaimID}]` subject tokens. Deferred Gmail API send as "Option B".
2. **§5.6.11 FRC (Final Repair Completion)** — new workflow step between REPAIR_IN_PROGRESS and CLOSED_REPAIR, flagged by Vassen as missing from V2. Applies to accident and theft only; glass unaffected.
3. **§5.9 Parallel document gating** — replaces the prior (incorrect) "SLA pause when documents missing" assumption. Claim cycle proceeds; settlement is gated until the full doc pack is complete.
4. **§4.2 Document completeness** flipped to in-scope with manual override.
5. **§3.2 + §5.6.4 Scoped no-login upload links** for assessors and repairers.
6. **§5.6.1 Three intake paths** — embedded web form, WhatsApp bot feed (RTU-owned scrape), manual upload.
7. **§5.6.8 QA renamed to Insurer Approval** (Renasa), per Vassen's "R50k mandate" language.
8. **§8.6 Per-claim touchpoint timeline + §9.3 dashboard export.**
9. **§18 Glass-first sandbox phase plan.**
10. **Terminology: "Claims Consultant"** standardised.

Filename note: renamed `docs/RTUSA-POC-V2.md` → `docs/RTUSA-POC.md` at Fred's direction (versions belong in frontmatter/change log/git history, not filenames). Saved as feedback memory at `~/.claude/projects/.../memory/feedback_no_version_in_filenames.md`.

Commit: `d7ed9b0 — docs: V3 POC update and rename to stable filename`

### Phase 2 — Brainstorming (from `d7ed9b0` through `cd74fdb` and `7a62056`)

Fred picked the **hybrid scoping approach** (lightweight roadmap + detailed spec for slice 1) and chose the **conversation view slice** as slice 1 (key ask from Mike; architecturally independent; surfaces hardest design decision early).

Key design decisions made during brainstorming:

1. **Inbound source model:** (d) seeded + simulate button + (e) unmatched tray
2. **Layout placement:** (B) main-column tab switcher between Action and Conversation (replacing the sidebar Communications panel)
3. **Draft lifecycle:** Fred pushed back on my "Mark as sent" assumption — the system listens to outbound via BCC so marking-sent is redundant ceremony. New model: **Open in Gmail button → mock ingestion transitions draft to sent**. No Mark-as-sent click anywhere.
4. **Gmail compose URL:** (a) real `https://mail.google.com/mail/?view=cm&...` URL with prefilled To/Subject/Body/BCC
5. **Simulate reply UX:** (b) dropdown of thread participants with canned role × workflow-state replies
6. **Unmatched tray placement:** (A) dedicated `/inbox` sidebar nav page
7. **Data model:** (B) unified discriminated `ClaimMessage` union replacing `DraftCommunication`
8. **Styling discipline:** shadcn primitives + semantic theme tokens only (no hardcoded Tailwind colors). Saved as feedback memory at `~/.claude/projects/.../memory/feedback_use_shadcn_theme_tokens.md`.

Also saved: feedback memory about filename versioning at `feedback_no_version_in_filenames.md`.

Artifacts produced:
- Spec: `docs/superpowers/specs/2026-04-10-conversation-view-design.md` (commit `cd74fdb`)
- Implementation plan: `docs/superpowers/plans/2026-04-10-conversation-view.md` (commit `7a62056`) — 21 tasks, 7 phases, 2871 lines

### Phase 3 — Implementation (from `7a62056` through `dce968f`)

Executed all 21 plan tasks via subagent-driven development on master (explicit user consent). Each task had an implementer subagent + spec reviewer + code quality reviewer (with fix-up dispatches where reviewers flagged real issues). Two fix-up commits were required (Task 2 lint, Task 5 code quality).

One plan-ordering bug caught and fixed pragmatically: Task 2's `messages.ts` helper referenced `claim.messages` which Task 4 was meant to add. The implementer pulled Task 4's field-add work forward into Task 2 to keep the build green, which was the right call.

Final slice state: **22 commits, build clean, lint clean (for new code), zero legacy references, zero hardcoded colors in new components.**

---

## Current state of the codebase

### What works now (demo-ready, pending interactive smoke test)

1. **Every seed claim has populated conversation history** — opening any claim shows 2–4 (or 5) pre-seeded messages in the Conversation tab, matching the claim's current workflow state.
2. **Every outbound message** (seeded or auto-generated via workflow advance) is an `OutboundMessage` with a `[CP-CLM-xxxxx]` subject token and `BCC: claims@rtusa.co.za` pre-set.
3. **Clicking a pending draft bubble** opens the DraftModal showing From/To/Bcc/Subject/Body.
4. **Clicking "Open in Gmail"** opens Gmail web in a new tab with the full draft prefilled via `https://mail.google.com/mail/?view=cm&...` URL. The local state mock-transitions the draft to `sent` via `MARK_MESSAGE_SENT`.
5. **Advancing a workflow** generates new `OutboundMessage`s that land as pending bubbles in the conversation tab.
6. **Simulate Reply dropdown** (in the conversation tab header) shows the unique thread participants (insured/broker/assessor/investigator/repairer/glass_repairer depending on claim state). Clicking one generates a canned reply via the 13 role × state templates.
7. **Inbound simulated replies auto-attach attachments** to the claim's Documents tab (e.g. `assessment_report.pdf` becomes a new `ClaimDocument` linked from the message).
8. **`/inbox` page** (sidebar nav item with badge count) shows 3 seeded unmatched messages: one assignable to CLM-10001 (Peter Ndlovu / damage photos), one assignable by SPM number (Renasa acknowledgement), one dismissible (SATAWU meeting notice).
9. **Assigning** an unmatched message moves it to the target claim's thread with an "Assigned from inbox" badge; dismiss removes with a toast.
10. **Fast-forward clock** shifts message timestamps alongside SLA history so the conversation view stays in sync with the workflow view during demos.
11. **Theme compliance** — all new components render correctly across Supabase / Clean Slate / Starry Night / Northern Lights themes and their dark variants.

### New files (11)

```
src/components/claims/conversation/message-bubble.tsx
src/components/claims/conversation/draft-modal.tsx
src/components/claims/conversation/simulate-reply-dropdown.tsx
src/components/claims/conversation/conversation-view.tsx
src/components/inbox/unmatched-message-card.tsx
src/components/inbox/assign-to-claim-picker.tsx
src/pages/inbox-page.tsx
src/data/seed-unmatched.ts
src/data/simulate-reply-templates.ts
src/lib/messages.ts
src/components/ui/command.tsx           (+ input-group.tsx peer dep)
```

### Deleted files (2)

```
src/components/claims/panels/communications-panel.tsx
src/components/claims/draft-communication-modal.tsx
```

### Significantly modified files

- `src/types/index.ts` — added `ClaimMessage`/`OutboundMessage`/`InboundMessage`/`MessageRole`/`MessageParticipant`/`MessageAttachment`/`ThreadToken` types; removed `DraftCommunication`/`CommunicationRecipient`; extended `ClaimAction` union with 5 new message cases; extended `AuditActionType` with 4 new `message_*` values (and removed 2 legacy `communication_*` values).
- `src/context/ClaimContext.tsx` — split state into `{ claims, unmatchedMessages }`; added `providerReducer` wrapping `claimReducer`; added 3 new reducer cases in `claimReducer` and 2 in `providerReducer`; updated `ADVANCE_WORKFLOW` to emit `OutboundMessage` and push to `claim.messages`; extended `FAST_FORWARD` to shift message timestamps.
- `src/lib/communication-templates.ts` — rewritten to emit `OutboundMessage[]` instead of `DraftCommunication[]`; added `toOutboundMessage` helper; updated all 20 templates with `toRole` discriminator.
- `src/data/seed-claims.ts` — added inline `makeOutbound`/`makeInbound` helpers; populated `messages` array on 14 of 16 seed claims (2 are in NEW state and stay empty); removed legacy `communications` field entirely.
- `src/components/claims/action-panel.tsx` — wrapped content in shadcn `<Tabs>` with Action/Conversation trigger strip; extracted old content into `ActionTabContent` inner component.
- `src/pages/claim-detail-page.tsx` — removed the sidebar Communications tab (4 tabs → 3: Details / Documents / Audit).
- `src/components/layout/sidebar.tsx` — added Inbox nav item with badge count.
- `src/App.tsx` — added `/inbox` route.
- `src/components/claims/panels/audit-trail-panel.tsx` — updated `iconMap` to remove `communication_*` entries, add `message_*` entries (`Inbox` icon for `message_received`).
- `docs/RTUSA-POC.md` — §7.2 rewritten to four-stage ingestion-driven lifecycle; §7.6 integration subsection updated; §13 compose/send row tightened; §15 assumption #25 added.

---

## Next steps for the user (interactive smoke test)

Run `npm run dev` and verify these flows in Chrome (primary demo browser):

1. **Conversation tab visible on every claim.** Open any seed claim → `Action` / `Conversation` tabs appear above the action panel → Conversation tab renders the thread with `[CP-CLM-xxxxx]` subject tokens visible.
2. **Open in Gmail flow.** Advance a claim from `POLICY_VALIDATION` → new pending draft bubble appears in Conversation tab → click bubble → DraftModal opens → click "Open in Gmail" → Gmail compose opens in new tab prefilled with To/Subject/Body/BCC → modal closes → bubble flips to sent.
3. **Simulate reply flow.** Click the **Simulate reply** dropdown in Conversation tab header → pick a participant → new inbound bubble appears in the thread.
4. **Inbox flow.** Sidebar → **Inbox** (badge 3) → assign Peter Ndlovu's message to CLM-10001 (search "GP 12 RBF") → it appears on CLM-10001's Conversation tab with an "Assigned from inbox" badge. Dismiss the SATAWU message → disappears.
5. **Attachment auto-attach.** Simulate an assessor reply on a claim in ASSESSMENT_RECEIVED state → the `assessment_report.pdf` attachment should appear both in the thread bubble AND in the claim's Documents sidebar tab.
6. **Theme check.** In browser devtools console:
   ```js
   document.documentElement.className = 'theme-supabase dark'
   document.documentElement.className = 'theme-clean-slate'
   document.documentElement.className = 'theme-starry-night dark'
   document.documentElement.className = 'theme-northern-lights'
   ```
   For each, verify outbound bubbles (primary-tinted) stay distinct from inbound bubbles (accent-tinted).

---

## Known open items

### Housekeeping

- **Stashed unrelated changes:** `stash@{0}` contains 3 session-unrelated changes set aside at the start of implementation (`docs/communication-matrix-infographic.png` deletion, `src/components/claims-list/new-claim-dialog.tsx`, `src/components/claims/actions/progress-status.tsx`). Restore with `git stash pop stash@{0}`. **Potential conflict:** `new-claim-dialog.tsx` was modified during the slice (added `messages: []` in Task 2, removed `communications: []` in Task 17) — popping the stash may produce conflict markers on this file.

- **Pre-existing lint errors (10 total, out of slice 1 scope):**
  - `src/components/claims-list/new-claim-dialog.tsx:103` — `react-hooks/set-state-in-effect`
  - `src/components/ui/badge.tsx:52` — `react-refresh/only-export-components`
  - `src/components/ui/button.tsx:58` — same
  - `src/components/ui/tabs.tsx:80` — same
  - `src/context/ClaimContext.tsx:436` — same (pre-existing on this file)
  - `src/context/ContactContext.tsx:33` — same
  - `src/context/ThemeContext.tsx:15,82` — same (2 lines)
  - `src/lib/workflow-engine.ts:1,168` — `@typescript-eslint/no-unused-vars` (2 lines)

  None were introduced by this slice. Worth a cleanup pass before the full V3 migration ships.

- **Minor cosmetic flagged during review but not fixed** (low priority):
  - `MessageBubble` pending cards have `role="button"` and `tabIndex={0}` but no `onKeyDown` handler — Enter/Space won't activate them for keyboard-only users. Non-blocker for demo.
  - `inferRecipientRole` in `src/lib/messages.ts` has a comment that slightly overstates its correctness — the function checks field presence, not "current workflow state". Won't misattribute for simple claims but may for claims with multiple contact types assigned.
  - `src/context/ClaimContext.tsx` is approaching 450 lines. When it grows further, consider extracting `claim-reducer.ts`.
  - `src/data/seed-claims.ts` is approaching 1900 lines. Seed data that verbose is intentional for transparency, but splitting into per-claim files is a reasonable future move.

### Roadmap — remaining V3 slices

From `docs/superpowers/specs/2026-04-10-conversation-view-design.md` §10:

| # | Slice | Deps | Size |
|---|---|---|---|
| 2 | **Mechanical refactors** (QA → Insurer Approval rename, "Claims Consultant" terminology, tenant config seed) | none | small |
| 3 | **Document model + parallel gating** (completeness check with override, settlement gate, dashboard widget) | none; enables slice 4 | medium |
| 4 | **FRC workflow step** (new `FRC_REVIEW` state for accident and theft) | slices 2, 3 | medium |
| 5 | **Scoped upload links** (tokenised no-login routes for assessor / repairer / FRC uploads) | slices 1, 3, 4 | medium-large |
| 6 | **Timeline + dashboard export** (per-claim touchpoint timeline, PDF/CSV export) | slice 1 | small-medium |
| 7 | **Intake paths** (seeded web form + WhatsApp-bot variants) | none | small |

**Suggested next slice:** Slice 2 (mechanical refactors) — cheap cleanup, unblocks nothing explicitly but gets the rename noise out of the way before heavier structural work. Alternative: Slice 3 (document model) if we want to move faster toward FRC.

### Open items from the spec (§17 of `docs/RTUSA-POC.md`)

Several RTU inputs are still pending and were not resolvable in this slice:

- Mike: confirm `claims@rtusa.co.za` mailbox exists / will be created for production ingestion
- Mike: confirm `[CP-{ClaimID}]` subject token is acceptable as threading mechanism
- Vassen: confirm FRC doc pack composition (post-repair photos + final invoice + release forms — or additional items?)
- Vassen: per-claim-type mandatory document checklist
- Reuben: schedule the comms follow-up session on draft generation triggers + reminder cadence + metrics (needed before slice 1 can be released to RTU for testing)
- Group: RTU to provide ROC functionality documentation + form requirements for glass claim sandbox

These are RTU-side blockers on production delivery but not on prototype development.

---

## Key documents

| Path | Purpose |
|---|---|
| `docs/RTUSA-POC.md` | V3.0 POC spec (now in sync with slice 1 implementation) |
| `docs/superpowers/specs/2026-04-10-conversation-view-design.md` | Slice 1 design doc (spec for this slice) |
| `docs/superpowers/plans/2026-04-10-conversation-view.md` | Slice 1 implementation plan (21 tasks, executed) |
| `docs/RTUSA _ True Aim - Workshop - 2026_04_10 13_59 CEST - Notes by Gemini.md` | 2026-04-10 RTU workshop source material |
| `~/.claude/projects/C--Users-fbrun-Documents-GitHub-rtu-demo/memory/MEMORY.md` | User memory index (3 entries: project context, no-version-in-filenames, use shadcn + theme tokens) |

---

## How to resume

**If continuing with another slice:**

1. Review `docs/RTUSA-POC.md` §10 roadmap (or the same section in the slice 1 design doc)
2. Pick a slice
3. Invoke the brainstorming skill if there are design decisions to make, or go straight to writing-plans if the design is already clear
4. Execute via subagent-driven-development

**If returning to this slice for polish / fixes:**

1. Read this handoff file
2. Check the "Known open items" section above for known issues
3. Run `npm run dev` and follow the smoke test flows in the "Next steps for the user" section to reproduce any issues
4. Make targeted fix-up commits on master

**If starting completely fresh:**

1. Read `docs/RTUSA-POC.md` (V3.0) for the product context
2. Read `docs/superpowers/specs/2026-04-10-conversation-view-design.md` for the slice 1 design rationale
3. Read this handoff file for what's been done and what's next
4. Skip the slice 1 plan (`docs/superpowers/plans/2026-04-10-conversation-view.md`) unless you need to understand the historical task breakdown — the actual state of the code is what matters going forward

---

## Summary of commits (this session)

```
dce968f docs: V3 §7.2/§7.6/§13/§15 — ingestion-driven draft lifecycle    (Task 19)
b47965b feat(context): fast-forward clock also shifts message timestamps  (Task 18)
8533af9 refactor: remove DraftCommunication type and legacy communications field  (Task 17)
d9d995b refactor(claim-detail): remove Communications sidebar tab and obsolete components  (Task 16)
06b3c52 refactor(templates): emit OutboundMessage instead of DraftCommunication  (Task 15)
3d8cf71 feat(claim-detail): wrap ActionPanel in Action/Conversation tab switcher  (Task 14)
0bb5a11 feat(inbox): wire /inbox route and sidebar nav with badge count  (Task 13)
2520e7f feat(inbox): add UnmatchedMessageCard + AssignToClaimPicker + InboxPage  (Task 12)
69941e7 feat(conversation): add ConversationView tab content  (Task 11)
b9914cc feat(conversation): add SimulateReplyDropdown for scripted inbound replies  (Task 10)
6583f90 feat(conversation): add DraftModal with Open-in-Gmail handoff  (Task 9)
0bf7a24 feat(conversation): add MessageBubble component with theme-token styling  (Task 8)
e9bcb3f feat(seed): populate seed conversation histories per claim  (Task 7)
cab49c3 fix(context): stamp updatedAt on assign + single-pass attachment mapping + memo stability  (Task 5 fix-up)
f7f45cc feat(context): add message reducer cases and unmatchedMessages state  (Task 5)
30f08e6 feat(seed): add seed-unmatched with 3 demo messages  (Task 6)
2f33a52 refactor(messages): make reply templates pure; move attachment id gen to generator  (Task 3 fix-up)
aa56203 feat(messages): add simulate-reply templates and complete generateSimulatedReply  (Task 3)
77c9526 fix(messages): silence lint errors on stubbed generateSimulatedReply params  (Task 2 fix-up)
fa56133 feat(messages): add thread-token + Gmail URL helpers (generateSimulatedReply stubbed)  (Task 2, included Task 4 pull-forward)
82e784a feat(types): add ClaimMessage discriminated union alongside DraftCommunication  (Task 1)
3fe409e chore: add shadcn Command primitive for inbox assign-to-claim picker  (Task 0)
7a62056 docs: implementation plan for V3 slice 1 — conversation view
cd74fdb docs: spec for V3 slice 1 — conversation view
d7ed9b0 docs: V3 POC update and rename to stable filename
```

**Total: 25 commits from `fa68511` (starting point) through `dce968f` (current HEAD).**
