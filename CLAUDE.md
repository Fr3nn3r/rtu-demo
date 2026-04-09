# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ClaimPilot** — a frontend-only React prototype demoing automated motor insurance claims workflow for RTU Insurance Services (RTUSA), a South African taxi fleet insurance broker. Built for rapid iteration with the customer; no backend, all state in-memory.

The customer currently tracks claims across 3 disconnected systems (Zoho, Nimbus, Rock) using spreadsheets. This prototype replaces that with a unified workflow visibility tool.

## Commands

```bash
npm run dev      # Dev server with HMR (localhost:5173)
npm run build    # TypeScript check + Vite production build → /dist
npm run preview  # Serve production build locally
npm run lint     # ESLint check
```

No test framework is configured.

## Tech Stack

- **React 19 + TypeScript 5.9 + Vite 8** (path alias: `@/*` → `./src/*`)
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin — theme tokens defined in `src/index.css` via `@theme` block
- **shadcn/ui** (base-nova style) + Radix UI primitives + Lucide icons
- **react-router-dom** — routes: `/claims`, `/claims/:claimId`, `/dashboard`, `/contacts`
- **Recharts** for dashboard KPIs, **date-fns** for SA timezone date handling, **Sonner** for toasts

## Architecture

### State Management

Two React Context providers wrap the app (no external state library):

- **ClaimContext** (`src/context/ClaimContext.tsx`) — `useReducer` holding all claims. Actions: `ADVANCE_WORKFLOW`, `REVERT_WORKFLOW`, `UPDATE_CLAIM`, `CREATE_CLAIM`, `FAST_FORWARD`. State resets on page refresh. Exposes selectors: `getClaimById`, `getDashboardStats`, `getClaimSLAStatus`.
- **ContactContext** (`src/context/ContactContext.tsx`) — static seed contacts (assessors, investigators, repairers).

### Workflow Engine

`src/lib/workflow-engine.ts` — the core logic layer:
- **SLA computation**: `computeSLAStatus(record)` → percent elapsed, status tier (within/approaching/breached), time remaining
- **State machine**: `getNextStates(claimType, currentState)` → valid transitions
- **Auto-routing** (Accident only): `resolveAutoRoute(assessed, excess, threshold=R50k)` → routes based on amount vs excess vs R50k threshold
- **Revert**: `getPreviousState(claim)` → looks up prior state from SLA history

`src/data/workflow-definitions.ts` — per-claim-type step metadata (label, SLA hours, bridge system, contact type) and transition adjacency maps.

### Three Claim Type Workflows

1. **Accident**: Full path — validation → registration → assessor → assessment → auto-route (within excess / internal approval / QA) → AOL → route type → repair or total loss → closed
2. **Theft**: Simplified — no excess collection, mandatory QA, investigation instead of assessment
3. **Glass**: Shortest — validation → registration → glass repairer → closed

### Communication Engine

`src/lib/communication-templates.ts` — 11 email draft generators triggered at workflow transitions. Drafts are displayed in a modal; operator copies to clipboard and sends manually.

### Bridge Systems (Simulated)

- **Nimbus**: Policy lookup (shown as copy-paste fields at policy validation step)
- **Rock**: Claim registration, assessor/QA appointment, AOL generation (shown as info banners)

### Component Organization

- `src/components/claims/actions/` — one component per workflow step (e.g., `policy-validation.tsx`, `appoint-contact.tsx`, `qa-decision.tsx`)
- `src/components/claims/panels/` — sidebar tabs (details, documents, communications, audit trail)
- `src/components/claims/` — shared claim UI (stepper, SLA indicators, header, action panel dispatch)
- `src/components/dashboard/` — KPI cards, charts, breached claims list
- `src/components/ui/` — shadcn primitives

### Seed Data

- `src/data/seed-claims.ts` — 10 claims across types/states/SLA conditions for demo
- `src/data/seed-contacts.ts` — assessors, investigators, repairers
- South African locale: ZAR amounts, GP/ND vehicle registrations, realistic names
- Fast-forward buttons shift all timestamps backward to simulate time passage

## Conventions

- **String literal unions** for types — no TypeScript enums (see `src/types/index.ts`)
- **`erasableSyntaxOnly: true`** in tsconfig — no parameter properties or const enums
- All styling via Tailwind class composition; no CSS-in-JS libraries
- SLA color system: green (within, <75%), amber (approaching, 75–99%), red (breached, ≥100%)

## Key Documentation

- `docs/RTUSA-Prototype-Spec.md` — full V2 spec: workflows, SLA design, seed data, screen inventory, demo walkthrough script
- `plans/` — numbered implementation plans tracking iteration history
