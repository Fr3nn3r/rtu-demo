# Conversation view — V3 Slice 1 design

**Date:** 2026-04-10
**Status:** Draft
**Owner:** Fred / TrueAim
**Context:** First implementation slice of the V3 POC update (`docs/RTUSA-POC.md`, §7.6). Delivers the claim conversation view — a unified per-claim thread that replaces the existing sidebar Communications panel — plus an unmatched inbound tray at `/inbox`. Uses read-only ingestion with mock state transitions driven by a Gmail compose handoff.

---

## 1. Overview

### 1.1 What this slice delivers

Slice 1 of the V3 migration: the **claim conversation view** — a full-width tab on the claim detail page that renders both outbound drafts and inbound messages chronologically. Replaces the current sidebar Communications panel. Adds a dedicated `/inbox` page for unmatched inbound messages with an assign-to-claim action. Introduces an ingestion-driven draft lifecycle that removes "Mark as sent" in favour of an explicit Gmail handoff.

This is the first slice because:
1. It is the biggest demo moment from V3 — Mike asked for it as his primary requirement.
2. It is architecturally independent — no other V3 slice blocks it.
3. It forces us to make the hardest design decision (how inbound email is represented in a frontend-only POC) early, so downstream slices can assume the data shape.

### 1.2 Goals

1. **Any consultant opens any claim and sees a complete conversation trail** — inbound + outbound, chronological, without navigating anywhere else. Addresses Mike's core ask.
2. **The draft lifecycle honestly represents production.** No "Mark as sent" ceremony. The consultant clicks "Open in Gmail" (real prefilled compose URL); Gmail opens in a new tab; the mock ingestion immediately flips the draft to sent in the thread. This is the hinge that makes the V3 comms model demonstrable.
3. **Simulate reply dropdown** lets a presenter click a thread participant and get a plausible canned reply threaded into the conversation, so demos feel alive without a real backend.
4. **The `/inbox` unmatched tray** shows seeded ambiguous and not-claim-related messages, with a searchable assign-to-claim action that moves a message onto the target claim's thread in real time.
5. **Every seed claim ships with 2–4 messages of history** so the conversation view is populated from first load — no "empty tab" feel.
6. **The V3 POC doc §7.2 / §7.6 are updated** to reflect the ingestion-driven lifecycle agreed during brainstorming — spec and prototype stay consistent.

### 1.3 Non-goals (explicit)

Everything in the deferred list of the scope fence (see §9). Most importantly:

- **No compose-from-UI.** The only outbound drafts in the system are the auto-generated ones at workflow triggers. There is no "new message" button anywhere.
- **No real ingestion.** Mock ingestion fires on Open-in-Gmail click and on Simulate Reply click. There is no polling, no Gmail API, no IMAP.
- **No reminder auto-pause** when inbound arrives — that is a reminders/SLA slice.
- **No scoped upload links** for assessors/repairers — those ride on top of the conversation view in a later slice.
- **No FRC step, no document completeness model, no QA rename.** All other V3 groups are separate slices — see the roadmap in §10.
- **No touchpoint timeline, no dashboard export.** Slice 6.

### 1.4 Demo success criteria ("done")

1. `npm run build` clean; `npm run lint` clean.
2. Opening any seed claim shows a populated Conversation tab in the main column.
3. Clicking a pending draft on any claim opens a modal; clicking Open in Gmail opens Gmail web in a new tab with all fields prefilled, including `BCC: claims@rtusa.co.za`; the draft bubble in the thread flips to sent within the same click.
4. Simulate Reply dropdown works on every thread participant for 2–3 sample claims; no generic fallback text is visible.
5. `/inbox` page visible in sidebar with badge count; seeded unmatched messages appear; assign-to-claim picker moves a message to the target claim's thread and decrements the badge; dismiss removes without assignment.
6. Existing workflow advance flows untouched: advancing a claim still auto-generates drafts at trigger points, now appearing as pending bubbles in the conversation.
7. `docs/RTUSA-POC.md` updates: §7.2 rewritten, §7.6 clarified, §13 tightened, §15 assumption #25 added.
8. All four themes render the conversation view correctly — toggle through Supabase / Clean Slate / Starry Night / Northern Lights and verify distinguishable primary / accent / destructive bubble variants.
9. Dark mode renders correctly — toggle `.dark` class and verify all semantic tokens resolve.

---

## 2. Approach

### 2.1 Chosen approach: unified message model (Approach B)

After weighing alternatives we chose **Approach B — Unified message model**: rename `DraftCommunication` to `ClaimMessage` with a discriminated union on `direction: 'outbound' | 'inbound'`. Single array per claim: `claim.messages`.

**Rejected:**

- **Approach A (minimal extension with two types)** — creates duplicated code paths for "display inbound" vs "display outbound." Every future feature (reminder pause, chase SLAs, threading, indicators) would need to walk both arrays. Not sustainable across V3 slices.
- **Approach C (threads as first-class entities)** — architecturally correct but overkill for a POC. Right refactor target when we eventually need to split/merge threads, which is beyond MVP.

**Why B wins:**

1. The draft lifecycle is already getting rewritten (no mark-as-sent → ingestion-driven). If we are refactoring the state model anyway, the rest of the unification is nearly free.
2. Every deferred feature in the scope fence becomes a simple `claim.messages` filter rather than a cross-array merge.
3. Invalid combinations (e.g. outbound with `claimId: null`) are unrepresentable by type.

### 2.2 Scope strategy

The V3 POC update is too large for a single spec. We are using the **hybrid roadmap approach**: this document contains the detailed design for Slice 1 (conversation view) plus a lightweight roadmap (§10) naming the remaining slices. Each subsequent slice gets its own spec + implementation plan cycle when we pick it up.

---

## 3. Data model

### 3.1 `ClaimMessage` (discriminated union)

Replaces `DraftCommunication`. Defined in `src/types/index.ts`:

```ts
// ── Thread tokens ──────────────────────────────────────────
// Every message carries a stable token matching the pattern CP-CLM-{N}
// e.g. "CP-CLM-10001". Outbound drafts embed this in the Subject line;
// simulated inbound replies preserve it (threading); seeded unmatched
// messages deliberately lack it (that is why they are unmatched).
export type ThreadToken = string

// ── Message participants ──────────────────────────────────
export type MessageRole =
  | 'consultant'
  | 'insured'
  | 'broker'
  | 'assessor'
  | 'investigator'
  | 'repairer'
  | 'glass_repairer'
  | 'insurer'
  | 'unknown'

export interface MessageParticipant {
  name: string
  email: string
  role: MessageRole
}

// ── Attachments ───────────────────────────────────────────
export interface MessageAttachment {
  id: string
  name: string
  documentId?: string  // set when auto-attached to claim.documents
}

// ── Outbound ──────────────────────────────────────────────
export interface OutboundMessage {
  id: string
  claimId: string              // outbound is always attached to a claim
  direction: 'outbound'
  state: 'pending' | 'sent'    // flips to 'sent' on Open-in-Gmail click
  source: 'draft_generated'    // always, in MVP
  threadToken: ThreadToken
  trigger: string              // which workflow trigger fired this draft

  from: MessageParticipant     // always a consultant (the assigned one)
  to: string[]
  cc?: string[]
  bcc: string[]                // includes claims@rtusa.co.za

  subject: string              // includes [${threadToken}] prefix
  body: string
  attachments: MessageAttachment[]

  generatedAt: string          // when the draft was auto-generated
  sentAt?: string              // set on mock ingestion after Open-in-Gmail
}

// ── Inbound ───────────────────────────────────────────────
export interface InboundMessage {
  id: string
  claimId: string | null       // null when in unmatched tray
  direction: 'inbound'
  state: 'received'
  source: 'seeded' | 'simulated' | 'unmatched_assigned'
  threadToken: ThreadToken | null  // null = unmatched

  from: MessageParticipant
  to: string[]                 // typically [claims@rtusa.co.za, consultant email]

  subject: string
  body: string
  attachments: MessageAttachment[]

  receivedAt: string
}

// ── The discriminated union ───────────────────────────────
export type ClaimMessage = OutboundMessage | InboundMessage
```

### 3.2 Changes to `Claim`

```ts
export interface Claim {
  // ... existing fields ...

  // REMOVED:
  // communications: DraftCommunication[]

  // NEW:
  messages: ClaimMessage[]    // outbound + inbound, chronological
}
```

Sorted by `generatedAt` (outbound) or `receivedAt` (inbound) at render time. The conversation view reads `claim.messages` directly.

### 3.3 Changes to `ClaimContextValue`

```ts
interface ClaimContextValue {
  // ... existing fields ...

  unmatchedMessages: InboundMessage[]   // top-level unmatched tray
  getUnmatchedCount: () => number
}
```

Unmatched messages live on the context, not on any specific claim. When a consultant assigns one to a claim, the reducer removes it from `unmatchedMessages`, stamps `claimId` + `threadToken`, and appends to the target claim's `messages`. The `source` becomes `'unmatched_assigned'` so the audit trail can say *"assigned from unmatched tray by {user}"*.

### 3.4 Removed / renamed types

| Before | After |
|---|---|
| `DraftCommunication` | Deleted (superseded by `OutboundMessage`) |
| `CommunicationRecipient` (`'insured' \| 'broker' \| 'provider'`) | Deleted — `MessageRole` replaces it at richer granularity |
| `claim.communications: DraftCommunication[]` | `claim.messages: ClaimMessage[]` |

### 3.5 New reducer actions

```ts
| { type: 'ADD_MESSAGE'; claimId: string; message: ClaimMessage }

| { type: 'MARK_MESSAGE_SENT'; claimId: string; messageId: string }
  // fires on Open-in-Gmail click — represents mock ingestion

| { type: 'SIMULATE_INBOUND_REPLY'; claimId: string; fromRole: MessageRole }
  // builds a canned reply via templates and appends to claim.messages

| { type: 'ASSIGN_UNMATCHED_TO_CLAIM'; messageId: string; targetClaimId: string }
  // moves from context.unmatchedMessages → target claim.messages.
  // The reducer derives the threadToken from the target claim via
  // buildThreadToken() — the action payload does not carry it explicitly.

| { type: 'DISMISS_UNMATCHED'; messageId: string }
  // removes from context.unmatchedMessages (no audit — toast only)
```

Removed: `ADD_COMMUNICATION`, `MARK_COMMUNICATION_SENT`.

**Design decision — no audit for dismissed unmatched messages.** Dismissing an unmatched message has no claim to log the audit against. Since state is in-memory (reverts on refresh), we use a toast for feedback and skip audit logging rather than introduce a top-level audit store.

### 3.6 New audit action types

```ts
export type AuditActionType =
  | 'claim_created'
  | 'status_changed'
  | 'field_updated'
  | 'document_updated'
  | 'contact_assigned'
  // REMOVED: 'communication_sent', 'communication_generated'
  // NEW:
  | 'message_generated'
  | 'message_sent'
  | 'message_received'
  | 'message_assigned'
  | 'sla_warning'
  | 'sla_breached'
  | 'note_added'
```

### 3.7 Helper functions (new file `src/lib/messages.ts`)

```ts
buildThreadToken(claim: Claim): ThreadToken
  // returns `CP-${claim.id}` — e.g. "CP-CLM-10001"

formatSubjectWithToken(subject: string, token: ThreadToken): string
  // prepends "[CP-CLM-10001] " to the subject

parseTokenFromSubject(subject: string): ThreadToken | null
  // used by assignment flow; seeded tray is pre-populated with token: null

buildGmailComposeUrl(msg: OutboundMessage): string
  // returns https://mail.google.com/mail/?view=cm&fs=1&to=...&su=...&body=...&bcc=...

getLatestOutboundRecipients(claim: Claim): MessageRole[]
  // used by the simulate-reply dropdown to show thread participants

generateSimulatedReply(claim: Claim, fromRole: MessageRole): InboundMessage
  // picks a template from a role × workflow-state lookup and returns an InboundMessage
```

### 3.8 Attachment auto-attach behavior

When `SIMULATE_INBOUND_REPLY` produces a message with attachments, the reducer:

1. Creates the `InboundMessage` with `attachments: MessageAttachment[]`
2. For each attachment, creates a matching `ClaimDocument` with `type: 'other'`, the attachment's name as label, `status: 'received'`
3. Stores the new doc's id in `attachment.documentId` so the conversation view can link-render to the document tab

This keeps the V3 §7.6 behavior faithful: *"Attachments on inbound messages are automatically stored as claim documents."*

---

## 4. Components

### 4.1 File changes summary

| File | Change |
|---|---|
| `src/components/claims/panels/communications-panel.tsx` | Delete |
| `src/components/claims/draft-communication-modal.tsx` | Delete |
| `src/components/claims/action-panel.tsx` | Modify — extract current `ActionContent` switch into a local `ActionTabContent` component; wrap the exported `ActionPanel` in shadcn `<Tabs>` with two triggers: "Action" (current content) and "Conversation" (new `<ConversationView>`). Action is the default active tab. |
| `src/components/claims/conversation/conversation-view.tsx` | New — the full conversation tab content |
| `src/components/claims/conversation/message-bubble.tsx` | New — renders one `ClaimMessage` |
| `src/components/claims/conversation/simulate-reply-dropdown.tsx` | New — dropdown in conversation header |
| `src/components/claims/conversation/draft-modal.tsx` | New — review + Open-in-Gmail button |
| `src/pages/inbox-page.tsx` | New — the `/inbox` unmatched tray page |
| `src/components/inbox/unmatched-message-card.tsx` | New — one row in the inbox list |
| `src/components/inbox/assign-to-claim-picker.tsx` | New — searchable claim picker |
| `src/components/layout/sidebar.tsx` | Modify — add `/inbox` nav item with badge count |
| `src/App.tsx` | Modify — add `/inbox` route |
| `src/pages/claim-detail-page.tsx` | Modify — remove sidebar Communications tab |
| `src/context/ClaimContext.tsx` | Modify — add `unmatchedMessages`, new reducer cases |
| `src/lib/communication-templates.ts` | Modify — emit `OutboundMessage` with `threadToken`, `bcc`, `state: 'pending'` |
| `src/lib/messages.ts` | New — helper functions from §3.7 |
| `src/data/simulate-reply-templates.ts` | New — role × workflow-state → canned reply body |
| `src/data/seed-claims.ts` | Modify — add `messages: ClaimMessage[]` per claim; remove legacy `communications` |
| `src/data/seed-unmatched.ts` | New — 3 seeded unmatched inbound messages |
| `src/types/index.ts` | Modify — types from §3.1–3.6 |
| `src/lib/audit.ts` | Modify — expand action types |

**Total:** 9 new files, 10 modifications, 2 deletions.

### 4.2 Main column layout change

The main column of the claim detail page changes from one `ActionPanel` to a tabbed container:

```
┌──────────────────────────────────────────────────────┐
│  [Action]  [Conversation (3)]                        │ ← tab strip
├──────────────────────────────────────────────────────┤
│                                                      │
│  (Active tab content — either Action or Conversation)│
│                                                      │
└──────────────────────────────────────────────────────┘
```

The Conversation tab badge shows `claim.messages.length`. Default active tab is **Action** so consultants land on their primary workflow surface.

### 4.3 Conversation tab content

```
┌──────────────────────────────────────────────────────┐
│  Thread — CLM-10001           [Simulate reply ▾]     │ ← header
├──────────────────────────────────────────────────────┤
│                                                      │
│  ↑ older                                             │
│                                                      │
│  [→ outbound to Peter, sent Mon 09:14]               │
│  [← inbound from Peter, Mon 11:32]  📎 1 attachment  │
│  [→ outbound to Peter, sent Mon 11:45]               │
│  [→ draft to Peter, pending — Open in Gmail]         │
│                                                      │
│  ↓ newer                                             │
└──────────────────────────────────────────────────────┘
```

Header contains:

1. **Claim header summary** — claim ID, insured name, vehicle
2. **Last inbound indicator** — *"Last inbound: Peter Ndlovu, 2h ago"* — small, right-aligned, shows metadata of the most recent received message
3. **Simulate reply dropdown** — lists unique thread participants by role; disabled until at least one outbound has been sent

### 4.4 `MessageBubble` visual rules — theme-token discipline

All styling uses semantic theme tokens from `src/index.css`. No hardcoded Tailwind color classes (e.g. `bg-blue-50`, `border-amber-500`). This is required so tweakcn can swap the theme without touching component code. See `~/.claude/projects/.../memory/feedback_use_shadcn_theme_tokens.md` for the rule.

| State | Bubble styling | Rationale |
|---|---|---|
| **Outbound sent** | `<Card>` with `border-l-4 border-l-primary bg-primary/5` | Primary = brand color, signals "ours / authoritative." Shifts with the theme but always reads as the primary action color. |
| **Outbound pending draft** | `<Card>` with `border-l-4 border-l-dashed border-l-primary bg-primary/5 opacity-70` + `<Badge variant="outline">Draft — not yet sent</Badge>` | Same border color as sent to signal "same direction"; dashed + muted + badge signals "not committed." Clickable → opens DraftModal. |
| **Inbound received** | `<Card>` with `border-l-4 border-l-accent-foreground bg-accent/30` | Accent = secondary UI emphasis. Visually distinct from primary without picking an arbitrary second hue. |
| **Inbound from unmatched (after assignment)** | Same as inbound received + `<Badge variant="secondary">Assigned from inbox</Badge>` near the timestamp | The badge is the only differentiator. |
| **Inbound rejection / system-ack** | `<Card>` with `border-l-4 border-l-destructive/50 bg-destructive/5` | Uses the destructive token for negative signals. |

**Common bubble structure:**

```tsx
<Card className="p-3 mb-3 [direction-specific classes]">
  <div className="flex items-baseline justify-between gap-2 mb-1">
    <div className="text-xs font-medium text-foreground">
      {direction === 'outbound' ? '→' : '←'} {participantLabel}
    </div>
    <div className="text-[11px] text-muted-foreground">
      {formatTimestamp(message)}
    </div>
  </div>
  <div className="text-xs font-medium text-foreground mb-1">
    {message.subject}
  </div>
  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
    {bodyPreview}
  </div>
  {message.attachments.length > 0 && <AttachmentChips attachments={message.attachments} />}
</Card>
```

### 4.5 shadcn primitives used

| Primitive | Used for |
|---|---|
| `Card` | Message bubbles, unmatched message cards, draft modal container |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Action / Conversation tab switcher |
| `Dialog` | DraftModal |
| `DropdownMenu` + subcomponents | Simulate reply participant picker |
| `Command` + subcomponents | AssignToClaimPicker combobox |
| `Badge` (default, secondary, outline, destructive variants) | Draft pending, "assigned from inbox", "not claim-related" |
| `Button` (default, outline, ghost, destructive variants) | Open in Gmail, Assign, Dismiss, Cancel |
| `ScrollArea` | Conversation thread scrolling for long histories |
| `Separator` | Dividers between consecutive days (optional) |
| Sonner `toast` (existing) | Open-in-Gmail confirmation, assign / dismiss, errors |

Any primitives missing from `src/components/ui/` are added via the standard shadcn workflow. Check during implementation.

### 4.6 Inbox page (`/inbox`)

Sidebar nav: `📥 Inbox` with badge showing `unmatchedMessages.length` when > 0. Badge uses `variant="secondary"` with sidebar tokens, no hardcoded colors.

Page layout:

```
┌──────────────────────────────────────────────────────┐
│  Unmatched Inbound (3)                               │
│  Messages in claims@ without a CP token. Assign each │
│  to a claim or mark as not claim-related.            │
├──────────────────────────────────────────────────────┤
│  [UnmatchedMessageCard]                              │
│  [UnmatchedMessageCard]                              │
│  [UnmatchedMessageCard]                              │
└──────────────────────────────────────────────────────┘
```

Each `UnmatchedMessageCard` is a `Card` component showing `from`, `subject`, body preview, `receivedAt`, and two actions:

- **Assign to claim…** — opens `AssignToClaimPicker` (Command combobox searching across all claims by SPM number, policyholder name, or vehicle reg). On selection, dispatches `ASSIGN_UNMATCHED_TO_CLAIM`.
- **Not claim-related** — dispatches `DISMISS_UNMATCHED`, shows toast.

Empty state (zero unmatched): *"All inbound is threaded. Nothing to triage."*

### 4.7 Draft modal (new `draft-modal.tsx`)

Triggered by clicking a pending outbound bubble. Replaces the existing `draft-communication-modal.tsx` entirely.

```
┌─── Draft email ───────────────────────────────────┐
│                                                   │
│  From:    Nikki Pearmain <nikki@rtusa.co.za>      │
│  To:      peter@sagelooma.co.za                   │
│  Bcc:     claims@rtusa.co.za                      │
│  Subject: [CP-CLM-10001] Assessment Required —... │
│                                                   │
│  Dear Peter,                                      │
│  Please find attached the claim for the 2022...   │
│  ...                                              │
│                                                   │
├───────────────────────────────────────────────────┤
│                 [Cancel]  [Open in Gmail ↗]       │
└───────────────────────────────────────────────────┘
```

"Open in Gmail" click handler:

```ts
function handleOpenInGmail() {
  const url = buildGmailComposeUrl(message)
  window.open(url, '_blank', 'noopener,noreferrer')
  dispatch({ type: 'MARK_MESSAGE_SENT', claimId: claim.id, messageId: message.id })
  onClose()
  toast.success('Opened in Gmail. Draft marked as sent.')
}
```

The consultant sees, in one click:
1. Gmail compose open in a new tab, prefilled with To / Subject / Body / Bcc
2. Modal close
3. Thread re-renders with the draft bubble now showing as sent

### 4.8 Data flow summary

```
Seed load
  → seed-claims.ts      → claim.messages (array)
  → seed-unmatched.ts   → context.unmatchedMessages

Workflow transition (existing)
  → generateCommunication() returns OutboundMessage (pending)
  → reducer appends to claim.messages
  → ConversationView re-renders, shows new pending bubble

Consultant clicks pending draft
  → DraftModal opens
  → Consultant clicks "Open in Gmail"
  → window.open(gmailComposeUrl)
  → dispatch MARK_MESSAGE_SENT
  → reducer flips message.state to 'sent', sets sentAt, logs audit entry
  → ConversationView re-renders, bubble fills in

Consultant clicks Simulate Reply → picks role
  → dispatch SIMULATE_INBOUND_REPLY { claimId, fromRole }
  → reducer calls generateSimulatedReply(claim, fromRole)
  → returns InboundMessage with role-templated body
  → if message has attachments, reducer also appends ClaimDocuments
  → appends message to claim.messages
  → logs audit message_received
  → ConversationView re-renders

Consultant assigns unmatched message
  → AssignToClaimPicker → dispatch ASSIGN_UNMATCHED_TO_CLAIM
  → reducer removes from unmatchedMessages
  → stamps claimId, source: 'unmatched_assigned', threadToken
  → appends to target claim.messages
  → logs audit message_assigned on the target claim
```

---

## 5. Seed data

### 5.1 Seed conversations on each claim

Every seed claim in `src/data/seed-claims.ts` gets a `messages: ClaimMessage[]` field with 2–4 pre-populated entries tailored to the claim's current workflow state:

| Claim workflow state | Seeded messages |
|---|---|
| `NEW` | 0 messages |
| `POLICY_VALIDATION` | 1 outbound: claim acknowledgement to insured (sent) |
| `REGISTERED` | 2 outbound: acknowledgement to insured + to broker (both sent) |
| `ASSESSOR_APPOINTED` | 3 messages: acks to insured and broker + assessor appointment email (all sent) |
| `ASSESSMENT_RECEIVED` | 4 messages: the above + 1 inbound from assessor with canned body + seeded `assessment_report.pdf` attachment that auto-attaches to `claim.documents` |
| `INTERNAL_APPROVAL` / `INSURER_APPROVAL` | Above + inbound from assessor with recommended settlement |
| `REPAIR_IN_PROGRESS` | Above + outbound to repairer (sent) + inbound from repairer confirming receipt |
| `WITHIN_EXCESS` / `INVALID` / `REJECTED` / `CLOSED` | 1 outbound: terminal notification (sent) |
| `GLASS_REPAIRER_APPOINTED` / `REPAIR_COMPLETE` | 2 messages: outbound dispatch to glass repairer + inbound confirmation |

Helper `makeMessage()` defined inline in `seed-claims.ts` to keep the seed file readable — matches the existing `makeSLA()` and `makeDocs()` pattern.

Timestamps on seeded messages are relative to `claim.createdAt` — e.g. acknowledgement lands 1 hour after, assessor appointment 3 hours after, assessor reply 6 hours after.

**Fast-forward clock integration:** the existing `FAST_FORWARD` reducer case in `ClaimContext.tsx` currently only shifts `slaHistory` timestamps. As part of this slice, the reducer must also shift every message's `generatedAt` / `sentAt` / `receivedAt` by the same `shiftMs`, so the conversation view stays consistent with the SLA clock when a presenter advances time during a demo. The reducer change is a straightforward addition inside the `case 'FAST_FORWARD'` arm.

### 5.2 Seed unmatched tray (`src/data/seed-unmatched.ts`)

Three seeded messages covering three demo scenarios:

1. **Assignable — clearly belongs to a claim.** Sender: `peter@sagelooma.co.za`. Subject: `Re: Toyota Corolla GP 12 RBF — photos attached`. Body references vehicle registration `GP 12 RBF` matching `CLM-10001` (Sipho Dlamini). Has an attachment `damage_photos.zip`. No CP token in subject.
2. **Assignable via SPM number.** Sender: `noreply@renasa.co.za`. Subject: `Claim acknowledged — SPM-9987654`. Body references the SPM number of another seed claim. Demonstrates assignment via SPM search.
3. **Dismissible.** Sender: `info@satawu.org.za`. Subject: `Upcoming taxi industry meeting — Tuesday 15 April`. Body is a meeting notice with no claim linkage.

All three have `receivedAt` within the last 6 hours so the inbox feels current.

### 5.3 Simulate reply templates (`src/data/simulate-reply-templates.ts`)

Lookup keyed by `(MessageRole × WorkflowState) → ReplyTemplate`:

```ts
type ReplyTemplate = {
  subjectPrefix: string   // e.g. "Re: "
  body: (claim: Claim) => string
  attachments?: (claim: Claim) => MessageAttachment[]
}

type RoleStateKey = `${MessageRole}:${WorkflowState}` | `${MessageRole}:*`

const templates: Record<RoleStateKey, ReplyTemplate> = {
  'assessor:ASSESSOR_APPOINTED': { ... },
  'assessor:ASSESSMENT_RECEIVED': { ... attachments: ... },
  'insured:*': { ... },
  'broker:*': { ... },
  'repairer:REPAIR_IN_PROGRESS': { ... },
  // ~15 entries covering common role × state combos
}
```

**Coverage target:** 12–18 templates. Fallback resolution order: exact `role:state` → `role:*` → generic acknowledgement. Every click must return something plausible — no visible generic fallback during demo.

`generateSimulatedReply(claim, fromRole)`:
1. Resolves template via `(fromRole, claim.status)`
2. Picks `from` participant: for assessor/investigator/repairer, look up the assigned contact; for insured/broker, read from `claim.insured` / `claim.broker`
3. Builds `InboundMessage` with `threadToken` copied from the latest outbound (preserves threading)
4. If template has attachments, includes them — reducer auto-attaches to `claim.documents`
5. Sets `receivedAt` to `now` + random 0–90s jitter

### 5.4 Gmail compose URL

```ts
function buildGmailComposeUrl(msg: OutboundMessage): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: msg.to.join(','),
    su: msg.subject,
    body: msg.body,
    bcc: msg.bcc.join(','),
  })
  if (msg.cc?.length) params.set('cc', msg.cc.join(','))
  return `https://mail.google.com/mail/?${params.toString()}`
}
```

Opens via `window.open(url, '_blank', 'noopener,noreferrer')`. If user not signed in, Google redirects to sign-in — harmless for demo.

**Body length caveat:** Gmail's `body` param has a practical ~2000-character limit. Current draft bodies are under ~800 chars; not a concern. If exceeded, truncate with *"... (preview — open draft in ClaimPilot for full body)"*.

### 5.5 Thread token format

```ts
function buildThreadToken(claim: Claim): ThreadToken {
  return `CP-${claim.id}`  // e.g. "CP-CLM-10001"
}

function formatSubjectWithToken(subject: string, token: ThreadToken): string {
  return `[${token}] ${subject}`
}

function parseTokenFromSubject(subject: string): ThreadToken | null {
  const match = subject.match(/\[CP-([A-Z]+-\d+)\]/)
  return match ? `CP-${match[1]}` : null
}
```

The token is rendered visibly in every message subject line so Mike can see the threading mechanism during demo. Seeded unmatched messages deliberately lack the token pattern.

---

## 6. V3 POC doc updates

Same commit as the slice. Four edits to `docs/RTUSA-POC.md`:

### 6.1 §7.2 Draft email lifecycle — rewrite

Replace the current three-stage lifecycle with four stages:

1. **Auto-generated** — workflow transition fires; draft created with `[CP-{ClaimID}]` token in subject and `BCC: claims@rtusa.co.za` pre-set; appears as pending bubble in conversation view; audit entry records generation.
2. **Review** — consultant opens draft from conversation view; modal displays From / To / Bcc / Subject / Body.
3. **Open in Gmail** — consultant clicks "Open in Gmail"; Gmail web opens in new tab with all fields prefilled including BCC; consultant sends from Gmail.
4. **Ingestion-driven sent state** — ingestion worker sees the sent message in `claims@` and flips draft's state from `pending` to `sent` in claim's conversation. The consultant never clicks "Mark as sent" — transitions are always ingestion-driven.

Call out explicitly: **there is no "Mark as sent" click in ClaimPilot.**

### 6.2 §7.6 Claim conversation view — clarification

Update the "Integration with §7.2 draft lifecycle" subsection. Replace:

> "The consultant still copies drafts to clipboard and sends from Gmail as today. Nothing about the draft generation or mark-as-sent flow changes."

with:

> "The consultant still reviews drafts generated at workflow triggers, but the handoff to Gmail is explicit (Open in Gmail) and the sent-state transition is driven by ingestion, not by a consultant click. The conversation view is the single source of truth for message state — nothing in the UI can mark a message as sent independently of what the ingestion worker sees."

Add a new sub-bullet under the MVP capability table: **"Draft lifecycle is ingestion-driven, not click-driven."**

### 6.3 §13 Scope exclusions — tighten

Change:

> "Compose / send email from ClaimPilot — Out. Draft-only + read-only inbound ingestion per §7.6."

to:

> "Compose / send email from ClaimPilot — Out. ClaimPilot generates drafts and hands the consultant off to Gmail via a prefilled compose URL. Sent state is driven by ingestion seeing the BCC'd message, not by a ClaimPilot click."

### 6.4 §15 — new assumption #25

> **#25. BCC discipline (or Send-As delegate) is a hard prerequisite for the conversation view to work.** If the consultant forgets to BCC `claims@`, the ingestion worker will not see the outbound message and the draft will remain visually pending. ClaimPilot does not enforce this at MVP. Mitigation: the Gmail compose URL pre-populates the BCC field, so consultants only need to not remove it. Status: open — confirm mitigation is sufficient with Mike.

---

## 7. Verification checklist

1. `npm run build` — clean, no TypeScript errors
2. `npm run lint` — clean, no warnings
3. Open every seed claim — conversation tab renders, messages visible, no empty states except `NEW` claims
4. Click a pending draft — modal opens, Gmail URL is valid, `window.open` works, draft flips to sent
5. Simulate Reply dropdown works on every thread participant for 2–3 sample claims — no generic fallback
6. Navigate to `/inbox` — seeded unmatched appear with badge count
7. Assign unmatched to target claim — disappears from inbox, appears on target claim, badge decrements
8. Dismiss unmatched — disappears from inbox, toast, badge decrements
9. Existing workflow advance flows untouched — drafts still auto-generated and appear as pending bubbles
10. `docs/RTUSA-POC.md` updates visible in diff — §7.2, §7.6, §13, §15 only
11. All four themes render correctly — Supabase / Clean Slate / Starry Night / Northern Lights
12. Dark mode renders correctly across all four themes

---

## 8. Risks and rollback

### 8.1 Risks

**Risk 1 — `DraftCommunication` → `ClaimMessage` rename breaks something I do not expect.**
The rename touches types, context reducer, communication templates, every action component that generates comms, seed data, and the sidebar Communications panel (being deleted). TypeScript catches most of it but a stray string literal like `'DraftCommunication'` in a toast or audit description would escape.
*Mitigation:* full-project grep for `DraftCommunication` and `communications` (as a field name) before committing.

**Risk 2 — Gmail compose URL browser quirks.**
Safari and some Chromium variants handle `window.open` with prefilled query strings slightly differently. URL-length edge cases vary.
*Mitigation:* test in Chrome (primary demo browser) and Firefox. Note Safari limitations if found; RTU uses Chrome.

**Risk 3 — Simulate reply template fallback fires for an unhandled role × state combo and shows generic "Acknowledged" text during a demo.**
*Mitigation:* explicit test during implementation — walk every seed claim through `simulate reply` for every thread participant; add templates for anything that falls through to the generic.

### 8.2 Rollback

Single slice commit. Pure frontend changes. If something breaks after merge, `git revert` restores previous working state cleanly. No database, no migrations, no external state. The only cross-slice blast radius is the `DraftCommunication → ClaimMessage` rename — subsequent work that assumes the rename would need rebasing if reverted.

---

## 9. Scope fence

### 9.1 IN (core — this slice)

1. New Conversation tab in the main column of the claim detail page (layout B)
2. Unified message data model — inbound + outbound drafts on same timeline
3. Inline draft bubbles rendering from the moment they are generated
4. "Open in Gmail" button → real Gmail compose URL with prefilled To / Subject / Body / BCC
5. Mock ingestion trigger on Open-in-Gmail click → draft transitions from pending → sent in local state. Removes "Mark as sent".
6. Simulate reply dropdown in conversation tab header — pick thread participant, get canned templated reply
7. Seeded conversation history on every seed claim (2–4 messages)
8. Unmatched tray at `/inbox`, sidebar nav with badge count
9. 3 seeded unmatched messages (2 assignable, 1 dismissible)
10. Assign-to-claim action in unmatched tray
11. "Not claim-related" dismiss action
12. Inbound attachments auto-attach to Documents panel
13. `[CP-{ClaimID}]` subject token rendered visibly in every message
14. Remove existing Communications sidebar tab
15. V3 POC doc §7.2 / §7.6 / §13 / §15 updates

### 9.2 DEFERRED (not this slice)

- Reminder auto-pause on inbound (reminders/SLA slice)
- "Last inbound from [party]" indicator on claim list rows (polish)
- Draft template editor (out of scope per V3 §13)
- Gmail API send / Option B (out of MVP per V3 §14)
- Cross-claim conversation search (V3 §14 future)
- Per-claim touchpoint timeline (slice 6)
- Dashboard export (slice 6)
- Scoped upload links (slice 5)
- FRC workflow step (slice 4)
- Document completeness model + settlement gate (slice 3)
- QA → Insurer Approval rename (slice 2)

### 9.3 Design decisions confirmed during brainstorm

- **Layout:** main-column tab switcher (Action / Conversation) — option B
- **Data model:** unified discriminated union (`ClaimMessage`) — approach B
- **Inbound source:** seeded + simulate button + unmatched tray — option d+e
- **Simulate reply UX:** dropdown of thread participants — option b
- **Unmatched tray placement:** dedicated `/inbox` sidebar nav page — option A
- **Draft lifecycle:** no "Mark as sent"; ingestion-driven via Open in Gmail
- **Gmail URL:** real `mail.google.com` compose URL — option a
- **Last-inbound indicator:** included as small header convenience (in scope despite scope fence)
- **Styling discipline:** shadcn primitives + semantic theme tokens only (no hardcoded Tailwind colors)

---

## 10. V3 roadmap (lightweight)

This roadmap names the remaining V3 slices. Each subsequent slice gets its own spec + implementation plan cycle when picked up. Roadmap is not a detailed design of slices 2–7.

### 10.1 Suggested sequence

| # | Slice | Description | Deps | Size |
|---|---|---|---|---|
| 1 | **Conversation view** (this spec) | Unified thread, ingestion-driven drafts, unmatched tray, `/inbox` | none | medium |
| 2 | **Mechanical refactors** | QA → Insurer Approval rename; "Claims Consultant" terminology; tenant config seed | none | small |
| 3 | **Document model + gating** | Completeness check with override, parallel gating at settlement (V3 §5.9), dashboard widget | none architecturally; enables slice 4 | medium |
| 4 | **FRC workflow step** | New `FRC_REVIEW` state for accident and theft; new action panel component; draft templates | slices 2, 3 | medium |
| 5 | **Scoped upload links** | Tokenised no-login routes for assessor / repairer / FRC uploads | slices 1, 3, 4 | medium-large |
| 6 | **Timeline + dashboard export** | Per-claim touchpoint timeline; PDF/CSV export | slice 1 | small-medium |
| 7 | **Intake paths** | Seeded web form + WhatsApp-bot variants; "new claim" dialog polish | none | small |

### 10.2 Rationale for the order

- **Slice 1 first:** biggest demo win, architecturally independent, surfaces hardest design decision (inbound data shape) early.
- **Slice 2 second:** cheap cleanup; mechanical rename noise out of the way before larger edits.
- **Slices 3 → 4:** document model unblocks FRC, which is where the gating actually matters.
- **Slice 5:** rides on 1, 3, 4 — the upload surface needs the thread (dispatch), the doc model (receive), and FRC (use).
- **Slices 6, 7:** additive polish; land after structural work is stable.

---

## Appendix A — Brainstorming trace

Design decisions made during the 2026-04-10 brainstorming session with Fred. Captured here so future readers understand *why* each choice was made.

| Decision | Source |
|---|---|
| Hybrid roadmap + detailed first-slice spec | Fred picked option (c) |
| Conversation view first | Fred: *"conversation view is key to get right to help us in limiting the scope"* |
| Visual companion used for layout and placement questions; terminal for architectural ones | Per brainstorming skill guidance |
| Seeded + simulate + unmatched tray | Fred picked d + e |
| Main-column tab switcher layout | Fred picked option B |
| No "Mark as sent" click; ingestion-driven state | Fred pushback: *"if we're going to listen to the conversations anyway it doesn't make sense to have a 'mark as sent' button in our UI, it should be more like an 'open in gmail link'"* — cleaner model than V3 draft doc |
| Real Gmail compose URL | Fred picked option (a) |
| Simulate reply dropdown of participants | Fred picked option (b) |
| Dedicated `/inbox` sidebar page | Fred picked option A |
| Unified discriminated union (`ClaimMessage`) | Fred picked approach B |
| shadcn + theme token discipline | Fred: *"make sure to use the shadcn and existing css primitives to allow seamless tweakcn theming"* — saved as permanent feedback memory |
