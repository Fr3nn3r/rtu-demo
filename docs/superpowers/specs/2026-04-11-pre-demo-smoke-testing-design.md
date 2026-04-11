---
title: Pre-demo smoke testing
status: draft
date: 2026-04-11
---

# Pre-demo smoke testing

## Problem

Basic navigation in the ClaimPilot prototype is currently broken — a few clicks into the app produce a blank screen. Trivial regressions like this are being discovered during hands-on demo rehearsal rather than before. The cost is high: every white-screen surprise burns demo confidence and eats time that should go to iterating on the product with the customer.

The root cause of "blank screen instead of useful error" is that the React tree has no Error Boundary, so any thrown error during render collapses the entire app silently. Beyond that, there is no automated coverage of any kind, so there is no way to verify "nothing obvious broke" short of manually clicking through every route and workflow before every demo.

## Goals

1. Convert every blank-screen bug into a visible, debuggable error — including the one currently in the app.
2. Establish an automated pre-demo gate that catches the most common classes of regression (broken routes, missing imports, broken workflow transitions, console errors during render).
3. Keep the dev inner loop fast. Verification is explicit and on-demand, not wired into every build.

## Non-goals

- Unit tests on `workflow-engine.ts` or other pure modules. The E2E happy paths exercise these end-to-end, which has higher ROI for a prototype.
- Visual regression testing. Too brittle while design is still iterating.
- CI. The demo runs from Fred's laptop; a local verify command is the correct gate.
- Context/data mocking. Tests hit the real seed data and real providers — faithful behavior is the point.
- Cross-browser coverage. Chromium only — the demo environment is Chrome.

## Architecture

### Error Boundary

A single route-level `ErrorBoundary` component wraps the `<Outlet />` inside `AppShell`. Each route renders inside the boundary, so a crash on one page shows a visible error message while the navigation chrome (sidebar, top bar) remains functional and the user can navigate away.

- **Location**: `src/components/layout/error-boundary.tsx`.
- **Fallback UI**: card with title "Something went wrong", the error message, stack trace (in `import.meta.env.DEV`), and a "Reset" button that clears boundary state and re-renders children.
- **Integration point**: `AppShell` wraps its `<Outlet />` in `<ErrorBoundary>`. No per-route wiring needed.
- **Why a class component**: React Error Boundaries require `componentDidCatch` / `getDerivedStateFromError` and have no functional equivalent.

The boundary lands as its own change, independent of the testing work. Immediately after it ships, the current blank-screen bug becomes a visible error whose message tells us what to fix.

### Playwright

Playwright is the test runner. Rationale:

- Real Chromium, not a jsdom fake. The bugs we're catching are routing/render/integration issues, which is where jsdom diverges from real browsers most.
- Single install (`@playwright/test` + `npx playwright install chromium`).
- Built-in trace viewer, screenshot/video on failure, UI mode with time-travel.
- Cypress offers no meaningful advantage and is heavier.
- Vitest + RTL is the wrong tool for this specific problem.

### Playwright config

`playwright.config.ts` at repo root:

- `projects`: single `{ name: 'chromium', use: devices['Desktop Chrome'] }`.
- `webServer`: `{ command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true, timeout: 120_000 }` — auto-starts dev server when not running; reuses if already up so tests can be iterated on without restart churn.
- `use.baseURL`: `http://localhost:5173`.
- `use.trace`: `'retain-on-failure'` — full trace saved whenever a test fails.
- `use.screenshot`: `'only-on-failure'`.
- `use.video`: `'retain-on-failure'`.
- `retries`: `0` locally. No CI, so no point in retry-on-flake masking real issues.
- `testDir`: `tests/`.

### Test file structure

All smoke tests live in a single file, `tests/smoke.spec.ts`, organized in three `test.describe` blocks:

#### 1. Route smoke

For each top-level route, a test that:
1. Navigates directly (`page.goto(route)`).
2. Asserts page-level heading is visible (locator scoped to a known heading per page).
3. Asserts no `console.error` was emitted during load (via a `page.on('console')` listener set up in `beforeEach`).
4. Asserts `document.body` contains non-whitespace text (sanity check against blank screens).

Routes covered:
- `/` (redirects to `/claims`)
- `/claims`
- `/claims/:claimId` — uses a known seed claim ID (first claim from `seed-claims.ts`).
- `/inbox`
- `/dashboard`
- `/contacts`

#### 2. Sidebar navigation smoke

A single test that:
1. Starts at `/claims`.
2. Clicks each sidebar link in sequence (Claims → Inbox → Dashboard → Contacts → Claims).
3. After each click: asserts URL changed, asserts new page heading is visible, asserts no console errors.

This catches stateful navigation bugs that a fresh-page-load test misses — which is exactly the class of bug currently in the app ("blank screen after a few clicks" implies state, not a cold load).

#### 3. Happy path per claim type

Three tests, one per claim type (Accident, Theft, Glass). Each test:
1. Picks a seed claim known to be at the first workflow state for its type (or creates one via the new-claim dialog if no such seed exists — TBD during implementation).
2. Walks the claim state-by-state through its full workflow by filling in the action panel form at each step and clicking the advance button.
3. After each advance: asserts workflow stepper advanced, asserts no console errors, asserts next action panel rendered.
4. Final assertion: claim reaches the `closed` state.

Happy paths are written incrementally — Accident first (most complex, covers the auto-routing branches), then Theft (covers mandatory QA and investigation), then Glass (shortest). Each one lands and runs green before the next begins.

### Console error capture

The most important assertion across all tests. A `beforeEach` hook in every describe block attaches a `page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })` listener and resets the `errors` array. An `afterEach` asserts `errors.length === 0`.

React logs render errors to `console.error` even when an Error Boundary catches them. This catches a huge class of bugs for free — including missing keys, invalid prop types, unhandled promise rejections, and state-update-on-unmounted-component warnings.

## npm scripts

```json
"smoke": "playwright test",
"smoke:headed": "playwright test --headed",
"smoke:ui": "playwright test --ui",
"verify": "tsc -b && eslint . && playwright test"
```

- `npm run smoke` — headless, fastest. Default.
- `npm run smoke:headed` — opens real browser so you can watch clicks happen. For debugging a failing test.
- `npm run smoke:ui` — Playwright UI mode, step through test execution frame-by-frame.
- `npm run verify` — full gate: TypeScript + ESLint + smoke. This is the "am I safe to demo?" command.

Deliberately **not** wired into `npm run build`. Build stays fast for iteration. Verification is explicit.

## Ordering of work

These steps are sequential and should not be collapsed — each one's output informs the next.

1. **Add Error Boundary** (standalone change). Ship, verify manually that a thrown error in a child now shows the fallback instead of a blank screen.
2. **Diagnose and fix the current blank-screen bug** using the now-visible error from step 1. Scope of this fix is unknown until the error surfaces.
3. **Install Playwright and baseline config**. `npm install -D @playwright/test`, `npx playwright install chromium`, add `playwright.config.ts`, add npm scripts, add `tests/` to `.gitignore` exceptions if needed, verify `npm run smoke` runs (with an empty test file).
4. **Write route smoke tests**. Should all pass (because step 2 fixed the current bug). If any fail, loop back.
5. **Write sidebar navigation smoke test**. Should pass.
6. **Write Accident happy path**. Land it, verify green.
7. **Write Theft happy path**. Land it, verify green.
8. **Write Glass happy path**. Land it, verify green.
9. **Document the pre-demo ritual** in the project README: "Before demoing, run `npm run verify`. If it fails, don't demo."

## Open questions

- **Known seed claim IDs**: The route smoke test for `/claims/:claimId` needs a stable ID. `seed-claims.ts` needs to be inspected to confirm a suitable ID exists, or the test should read the first ID from the seed array dynamically (via an exported constant). This is decided during implementation.
- **Happy-path starting state**: Whether each happy-path test starts from an existing seed claim at state-zero, or creates a fresh claim via the new-claim dialog. Preference: use seed claims if available at the right starting state, because it's less UI coupling; fall back to new-claim dialog otherwise. Decided per claim type during implementation.
- **Action panel form data**: The exact data each happy path enters at each step. This is discovered per action panel during implementation by reading the action panel components in `src/components/claims/actions/`.

## Success criteria

- `npm run verify` exits 0 on a healthy main branch.
- A deliberately introduced regression (e.g., removing a `return` from a route component) causes `npm run verify` to fail with an actionable error message.
- The current blank-screen bug is fixed.
- The pre-demo ritual is documented and can be followed by Fred without consulting this spec.

## Change log

- **2026-04-11**: Initial draft.
