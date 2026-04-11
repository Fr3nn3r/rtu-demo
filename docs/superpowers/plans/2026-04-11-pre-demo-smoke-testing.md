# Pre-demo Smoke Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert silent blank-screen crashes into visible errors via a React Error Boundary, and establish a Playwright-based pre-demo smoke gate that verifies every route, sidebar navigation, and one happy path per claim type (Accident, Theft, Glass).

**Architecture:** A single route-level Error Boundary wraps `<Outlet />` inside `AppShell` so any render error shows a visible fallback instead of blanking the app. Playwright runs in a single Chromium project against `npm run dev` (auto-started via `webServer`), and all smoke tests live in one file `tests/smoke.spec.ts` organized into three `test.describe` blocks (route smoke, sidebar navigation, happy-path-per-claim-type). Verification is gated behind an explicit `npm run verify` that runs `tsc → eslint → playwright`; `npm run build` stays fast.

**Tech Stack:** React 19 + TypeScript + Vite + `@playwright/test` (new dev dependency) + Chromium.

**Spec reference:** `docs/superpowers/specs/2026-04-11-pre-demo-smoke-testing-design.md`

---

## File Inventory

**Create:**
- `src/components/layout/error-boundary.tsx` — Class component with `componentDidCatch` / `getDerivedStateFromError`; renders a fallback card in error state.
- `playwright.config.ts` — Playwright config: Chromium only, `webServer` auto-starts dev server, `baseURL: http://localhost:5173`.
- `tests/smoke.spec.ts` — All smoke tests (route smoke, sidebar nav, happy paths) in one file.

**Modify:**
- `src/components/layout/app-shell.tsx` — Wrap `<Outlet />` in `<ErrorBoundary>`.
- `package.json` — Add `@playwright/test` devDep and `smoke`, `smoke:headed`, `smoke:ui`, `verify` scripts.
- `.gitignore` — Add `playwright-report/`, `test-results/`, `playwright/.cache/`.
- `README.md` — Add a "Pre-demo verification" section describing the ritual. (Create if missing.)
- Whatever file(s) contain the current blank-screen bug — scope unknown until Task 2.

---

## Task 1: Add Error Boundary + wire into AppShell

**Files:**
- Create: `src/components/layout/error-boundary.tsx`
- Modify: `src/components/layout/app-shell.tsx`

Goal: A single route-level Error Boundary converts any render error into a visible fallback UI while preserving the navigation chrome (TopBar + Sidebar).

- [ ] **Step 1: Create `src/components/layout/error-boundary.tsx`**

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to console so it shows up in dev tools and Playwright's console listener.
    console.error('[ErrorBoundary] caught render error', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <Card className="mx-auto mt-8 max-w-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-6 flex-shrink-0 text-destructive" />
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This page hit an unexpected error. The navigation sidebar still works — pick a different page or reset below.
              </p>
            </div>

            <div className="rounded-md border border-border bg-muted p-3 font-mono text-xs">
              <div className="font-semibold text-destructive">{error.name}: {error.message}</div>
              {import.meta.env.DEV && error.stack && (
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-muted-foreground">
                  {error.stack}
                </pre>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={this.handleReset}>
                <RotateCcw className="size-3.5" data-icon="inline-start" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }
}
```

- [ ] **Step 2: Wrap `<Outlet />` in `AppShell` with the boundary**

Replace the entire contents of `src/components/layout/app-shell.tsx` with:

```tsx
import { Outlet } from 'react-router-dom'
import { TopBar } from './top-bar'
import { Sidebar } from './sidebar'
import { ErrorBoundary } from './error-boundary'

export function AppShell() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 bg-background">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify the type check still passes**

Run: `npm run build`
Expected: Build succeeds with zero TypeScript errors.

If it fails with an error about `import.meta.env`, ensure `vite-env.d.ts` is present (it should be). If it fails on `ErrorInfo` or `ReactNode` imports, verify your React version supports `type` imports (React 19 does).

- [ ] **Step 4: Verify the boundary works by forcing an error**

Start the dev server:

```bash
npm run dev
```

In a second terminal, temporarily add a throw to `src/pages/claims-list-page.tsx` — at the top of the `ClaimsListPage` function body, insert:

```tsx
throw new Error('ERROR_BOUNDARY_TEST')
```

Navigate to http://localhost:5173/claims in the browser. Expected: the page shows the Error Boundary fallback card with "Something went wrong" and the text "Error: ERROR_BOUNDARY_TEST". The sidebar on the left is still clickable.

Click Dashboard in the sidebar. Expected: Dashboard renders normally (the error was scoped to the Claims route).

- [ ] **Step 5: Remove the temporary throw and commit**

Undo the temporary throw in `claims-list-page.tsx`. Verify by navigating back to /claims that the page renders normally.

```bash
git add src/components/layout/error-boundary.tsx src/components/layout/app-shell.tsx
git commit -m "feat(layout): add route-level ErrorBoundary to surface render errors"
```

---

## Task 2: Diagnose and fix the current blank-screen bug

**Files:** Unknown until diagnosis — the Error Boundary from Task 1 will surface the offending component and error.

Goal: Reproduce the current "blank screen after a few clicks" bug with the Error Boundary in place and fix whatever it surfaces. No test code yet — this is a diagnostic task.

- [ ] **Step 1: Start the dev server and reproduce**

```bash
npm run dev
```

Open http://localhost:5173 in Chrome. Open DevTools → Console. Click around the app following realistic demo flows:

1. Claims list → click into the first claim → click Conversation tab → click back.
2. Claims list → click Inbox → click Dashboard → click Contacts → click Claims.
3. Open each claim in the list in succession.
4. On a claim detail page, click each sidebar tab (Details / Documents / Audit).
5. Try fast-forward buttons if visible.

Note the exact click sequence that triggers the Error Boundary fallback (or the console error, if the error occurs in an effect rather than render).

- [ ] **Step 2: Read the error message and stack**

When the fallback appears, read the error name, message, and stack from the card. The stack identifies the file and line. Also read the console — `componentDidCatch` logged the component stack there, which tells you which React component tree chain hit the error.

If the error doesn't trigger the boundary (i.e. it's an effect-time error, not a render error), the DevTools console will still show it. Read the stack there.

- [ ] **Step 3: Locate the offending code**

Open the file from the stack trace. Read the surrounding code. Typical causes of blank-screen-after-a-few-clicks in this codebase:

- Accessing a property on `undefined` from a context lookup (e.g. `getClaimById` returning undefined when the route param is stale).
- Missing `?? []` / optional chaining on `claim.messages`, `claim.documents`, `claim.slaHistory`, or similar array fields on recently-added claim records.
- An effect with a stale closure firing after navigation away from a claim detail page.
- A component relying on a workflow field that doesn't exist on every claim type.

- [ ] **Step 4: Fix the root cause**

Apply the minimum fix needed. Do not scope-creep into unrelated cleanup. The goal is a working navigation flow, nothing more.

- [ ] **Step 5: Verify the fix**

Repeat the exact click sequence from Step 1. Expected: no more Error Boundary fallback, no more console errors. Repeat two additional random click sequences. Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -p  # review each hunk
git commit -m "fix(<area>): <one-line description of the bug>"
```

Replace `<area>` and `<description>` with the actual scope of the fix. Example: `fix(claim-detail): guard against stale claimId after navigation`.

---

## Task 3: Install Playwright + baseline config

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `playwright.config.ts`
- Create: `tests/smoke.spec.ts` (with a single sanity test)

Goal: Playwright installed, config in place, `npm run smoke` runs a passing sanity test against the dev server.

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Expected: `@playwright/test` added to `devDependencies` in `package.json`, Chromium binary downloaded (~150MB), no errors.

- [ ] **Step 2: Add npm scripts to `package.json`**

In `package.json`, replace the `"scripts"` block with:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "smoke": "playwright test",
  "smoke:headed": "playwright test --headed",
  "smoke:ui": "playwright test --ui",
  "verify": "tsc -b && eslint . && playwright test"
}
```

- [ ] **Step 3: Add Playwright artifacts to `.gitignore`**

Append these lines to `.gitignore`:

```
# Playwright
playwright-report/
test-results/
playwright/.cache/
```

- [ ] **Step 4: Create `playwright.config.ts` at the repo root**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
```

- [ ] **Step 5: Create `tests/smoke.spec.ts` with a sanity test**

```ts
import { test, expect } from '@playwright/test'

test('sanity: homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/claims/)
})
```

- [ ] **Step 6: Run the sanity test**

```bash
npm run smoke
```

Expected: Playwright starts the dev server, runs one test, reports `1 passed`, and shuts down. If Playwright complains it can't find the dev server, verify `vite` is actually running on port 5173 by running `npm run dev` manually first.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .gitignore playwright.config.ts tests/smoke.spec.ts
git commit -m "chore(test): install playwright + baseline smoke sanity test"
```

---

## Task 4: Route smoke tests

**Files:**
- Modify: `tests/smoke.spec.ts`

Goal: For each top-level route and for a known seed claim detail page, verify the page renders a heading, the body has content, and no console errors were emitted.

- [ ] **Step 1: Replace `tests/smoke.spec.ts` with the route smoke suite**

```ts
import { test, expect, type Page } from '@playwright/test'

/**
 * Attach listeners that collect any console-error-level messages and any
 * uncaught page errors. Returns the array so assertions can check it.
 */
function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => {
    errors.push(`pageerror: ${err.message}`)
  })
  return errors
}

test.describe('Route smoke', () => {
  const routes: { path: string; label: string }[] = [
    { path: '/', label: 'root redirect' },
    { path: '/claims', label: 'claims list' },
    { path: '/claims/CLM-10001', label: 'claim detail (CLM-10001)' },
    { path: '/inbox', label: 'inbox' },
    { path: '/dashboard', label: 'dashboard' },
    { path: '/contacts', label: 'contacts' },
  ]

  for (const route of routes) {
    test(`renders ${route.label} (${route.path})`, async ({ page }) => {
      const errors = captureConsoleErrors(page)

      await page.goto(route.path)

      // Body has content (not a blank screen).
      const bodyText = await page.locator('body').innerText()
      expect(bodyText.trim().length, 'body should not be empty').toBeGreaterThan(0)

      // At least one heading is visible.
      await expect(page.getByRole('heading').first()).toBeVisible()

      // Error Boundary fallback is not visible.
      await expect(page.getByText('Something went wrong')).toHaveCount(0)

      // No console errors or uncaught exceptions during load.
      expect(errors, 'no console errors during page load').toEqual([])
    })
  }
})
```

- [ ] **Step 2: Run the route smoke suite**

```bash
npm run smoke
```

Expected: 6 tests pass (one per route). If any fail, the failure output tells you which route and which assertion. If a route crashes with an Error Boundary fallback, loop back to Task 2 and fix the underlying bug.

If a test fails with "heading not visible" on `/dashboard` — the dashboard may not use a `role=heading` element. Open `src/pages/dashboard-page.tsx` and check: if there's no `<h1>`/`<h2>`/etc., relax the assertion for `/dashboard` to `await expect(page.locator('main')).toBeVisible()` or find a stable element.

- [ ] **Step 3: Commit**

```bash
git add tests/smoke.spec.ts
git commit -m "test(smoke): cover every top-level route"
```

---

## Task 5: Sidebar navigation smoke test

**Files:**
- Modify: `tests/smoke.spec.ts`

Goal: Simulate the exact user behavior that triggered the original bug — clicking through sidebar links in sequence without a full page reload between clicks.

- [ ] **Step 1: Append the sidebar navigation describe block to `tests/smoke.spec.ts`**

Add this below the existing `test.describe('Route smoke', ...)` block:

```ts
test.describe('Sidebar navigation smoke', () => {
  test('walks through all sidebar links without errors', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await page.goto('/claims')
    await expect(page.getByRole('heading').first()).toBeVisible()

    const linkSequence: { label: string; urlPattern: RegExp }[] = [
      { label: 'Inbox', urlPattern: /\/inbox$/ },
      { label: 'Dashboard', urlPattern: /\/dashboard$/ },
      { label: 'Contacts', urlPattern: /\/contacts$/ },
      { label: 'Claims', urlPattern: /\/claims$/ },
    ]

    for (const step of linkSequence) {
      await page.getByRole('link', { name: step.label, exact: true }).click()
      await expect(page).toHaveURL(step.urlPattern)
      await expect(page.getByRole('heading').first()).toBeVisible()
      await expect(page.getByText('Something went wrong')).toHaveCount(0)
    }

    expect(errors, 'no console errors during sidebar navigation').toEqual([])
  })
})
```

- [ ] **Step 2: Run the full smoke suite**

```bash
npm run smoke
```

Expected: 7 tests pass (6 route + 1 sidebar nav).

If the test fails with "link not found", the sidebar `NavLink` might render the label text differently. Open `src/components/layout/sidebar.tsx` and verify the label strings match exactly.

If the test fails because the Inbox badge count suffix changes the accessible name (e.g. "Inbox 3"), use a regex instead: `name: /^Inbox/`.

- [ ] **Step 3: Commit**

```bash
git add tests/smoke.spec.ts
git commit -m "test(smoke): sidebar navigation sequence smoke"
```

---

## Task 6: Accident happy-path test

**Files:**
- Modify: `tests/smoke.spec.ts`

Goal: Walk `CLM-10001` (seed Accident claim at `NEW` state) all the way through the workflow to `CLOSED`, asserting at each step that no console errors occur and the action panel heading advances.

**Happy path state sequence:**
`NEW → POLICY_VALIDATION → REGISTERED → ASSESSOR_APPOINTED → ASSESSMENT_RECEIVED → INTERNAL_APPROVAL → AOL → ROUTE_TYPE → INSPECTION_FINAL_COSTING → REPAIR_IN_PROGRESS → CLOSED`

**Why INTERNAL_APPROVAL path:** `resolveAutoRoute(30000, 5000)` returns `INTERNAL_APPROVAL` (assessed > excess, assessed ≤ R50k threshold). That matches `getLinearPath('accident')` in `src/data/workflow-definitions.ts`.

- [ ] **Step 1: Append the Accident happy-path describe block to `tests/smoke.spec.ts`**

```ts
test.describe('Happy path: Accident', () => {
  test('CLM-10001 walks from NEW to CLOSED', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await page.goto('/claims/CLM-10001')
    await expect(page.getByRole('heading', { name: 'New Claim' })).toBeVisible()

    // NEW → POLICY_VALIDATION
    await page.getByRole('button', { name: /Confirm & Proceed to Policy Validation/i }).click()
    await expect(page.getByRole('heading', { name: 'Policy Validation' })).toBeVisible()

    // POLICY_VALIDATION → REGISTERED
    await page.getByLabel('Policy Number').fill('POL-TEST-001')
    await page.getByLabel('Excess Amount (ZAR)').fill('5000')
    await page.getByRole('button', { name: /Confirm Valid/i }).click()
    await expect(page.getByRole('heading', { name: 'Registered' })).toBeVisible()

    // REGISTERED → ASSESSOR_APPOINTED
    await page.getByLabel('SPM Claim Number').fill('SPM-TEST-001')
    await page.getByRole('button', { name: /Confirm Registration/i }).click()
    await expect(page.getByRole('heading', { name: 'Assessor Appointed' })).toBeVisible()

    // ASSESSOR_APPOINTED → ASSESSMENT_RECEIVED
    // Pick the first seeded assessor (CON-001: Pieter van der Merwe).
    await page.getByRole('button', { name: /Pieter van der Merwe/ }).click()
    await page.getByRole('button', { name: /Confirm Appointment/i }).click()
    await expect(page.getByRole('heading', { name: 'Assessment Received' })).toBeVisible()

    // ASSESSMENT_RECEIVED → INTERNAL_APPROVAL (auto-routed because 30000 > 5000 and ≤ 50000)
    await page.getByLabel('Assessed Amount (ZAR)').fill('30000')
    await page.getByRole('button', { name: /Submit Assessment/i }).click()
    await expect(page.getByRole('heading', { name: 'Internal Approval' })).toBeVisible()

    // INTERNAL_APPROVAL → AOL
    await page.getByRole('button', { name: 'Approve', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'AOL Generated' })).toBeVisible()

    // AOL → ROUTE_TYPE
    await page.getByRole('button', { name: /Confirm AOL Generated/i }).click()
    await expect(page.getByRole('heading', { name: 'Route Decision' })).toBeVisible()

    // ROUTE_TYPE → INSPECTION_FINAL_COSTING (repair branch)
    // RouteType renders two large card-buttons; the first contains "Repair".
    await page.locator('button:has-text("Repair")').first().click()
    await expect(page.getByRole('heading', { name: 'Inspection & Costing' })).toBeVisible()

    // INSPECTION_FINAL_COSTING → REPAIR_IN_PROGRESS
    await page.getByLabel('Final Cost (ZAR)').fill('28000')
    await page.getByRole('button', { name: /Confirm Final Cost/i }).click()
    await expect(page.getByRole('heading', { name: 'Repair in Progress' })).toBeVisible()

    // REPAIR_IN_PROGRESS → CLOSED
    await page.getByRole('button', { name: /Mark Repair Complete/i }).click()
    await expect(page.getByRole('heading', { name: 'Closed' })).toBeVisible()

    expect(errors, 'no console errors during accident happy path').toEqual([])
  })
})
```

- [ ] **Step 2: Run the full smoke suite**

```bash
npm run smoke
```

Expected: 8 tests pass.

Likely failure modes and fixes:

- **"button not found: Pieter van der Merwe"** — verify seed contact CON-001 still exists in `src/data/seed-contacts.ts`. If the contact was renamed, update the test locator.
- **"heading 'Internal Approval' not visible"** — auto-route returned something other than `INTERNAL_APPROVAL`. Re-check the amounts: excess must be below 30000 and 30000 must be ≤ 50000. If the threshold moved, adjust the assessed value in the test.
- **"button 'Repair' is not visible"** — the RouteType component renders two card-buttons each containing "Repair" text (one as the button label, one inside "Vehicle will be sent for inspection and repair"). The `.first()` selector should grab the first match. If Playwright reports strict-mode violations, switch to `getByRole('button').filter({ hasText: 'Repair' }).first()`.
- **Flaky advance between states** — if the heading assertion fires before React finishes re-rendering, Playwright's auto-waiting should handle it, but if not, add `await page.waitForLoadState('networkidle')` — though in this SPA there's no network, so a brief `await expect(...).toBeVisible({ timeout: 2000 })` should suffice.

- [ ] **Step 3: Commit**

```bash
git add tests/smoke.spec.ts
git commit -m "test(smoke): accident happy path CLM-10001 → CLOSED"
```

---

## Task 7: Theft happy-path test

**Files:**
- Modify: `tests/smoke.spec.ts`

Goal: Walk `CLM-10008` (the only seed Theft claim, starting at `INVESTIGATOR_APPOINTED`) to `CLOSED`. This path starts mid-workflow because no seed claim exists at Theft NEW state — acceptable per the spec's open-question resolution (use seed claim in-place when available).

**Happy path state sequence (from INVESTIGATOR_APPOINTED):**
`INVESTIGATOR_APPOINTED → INVESTIGATION_RECEIVED → QA_APPOINTED → QA_DECISION → AOL → ROUTE_TYPE → INSPECTION_FINAL_COSTING → REPAIR_IN_PROGRESS → CLOSED`

**Note on investigation-received.tsx:** The submit button is disabled until the `DocumentDropZone` fires `onProcessed`. The dropzone is triggered by clicking the idle zone (`onClick` at `document-drop-zone.tsx:81`); processing takes ~3.5 seconds (100 progress ticks × 35ms). The test must click the dropzone and wait for the submit button to become enabled.

- [ ] **Step 1: Append the Theft happy-path describe block to `tests/smoke.spec.ts`**

```ts
test.describe('Happy path: Theft', () => {
  test('CLM-10008 walks from INVESTIGATOR_APPOINTED to CLOSED', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await page.goto('/claims/CLM-10008')
    await expect(page.getByRole('heading', { name: 'Investigator Appointed' })).toBeVisible()

    // INVESTIGATOR_APPOINTED → INVESTIGATION_RECEIVED
    // Pick the first seeded investigator (CON-004: Sipho Dlamini).
    await page.getByRole('button', { name: /Sipho Dlamini/ }).click()
    await page.getByRole('button', { name: /Confirm Appointment/i }).click()
    await expect(page.getByRole('heading', { name: 'Investigation Received' })).toBeVisible()

    // INVESTIGATION_RECEIVED → QA_APPOINTED
    // The submit button is disabled until the DocumentDropZone onProcessed fires.
    // Click the idle dropzone to start it (onClick handler in document-drop-zone.tsx).
    await page.getByText(/Upload Investigation Report/i).click()
    const proceedToQa = page.getByRole('button', { name: /Confirm Investigation Received/i })
    await expect(proceedToQa).toBeEnabled({ timeout: 10_000 })
    await proceedToQa.click()
    await expect(page.getByRole('heading', { name: 'QA Appointed' })).toBeVisible()

    // QA_APPOINTED → QA_DECISION → AOL (approve)
    await page.getByRole('button', { name: /QA Approve/i }).click()
    await expect(page.getByRole('heading', { name: 'AOL Generated' })).toBeVisible()

    // AOL → ROUTE_TYPE
    await page.getByRole('button', { name: /Confirm AOL Generated/i }).click()
    await expect(page.getByRole('heading', { name: 'Route Decision' })).toBeVisible()

    // ROUTE_TYPE → INSPECTION_FINAL_COSTING (repair branch)
    await page.locator('button:has-text("Repair")').first().click()
    await expect(page.getByRole('heading', { name: 'Inspection & Costing' })).toBeVisible()

    // INSPECTION_FINAL_COSTING → REPAIR_IN_PROGRESS
    await page.getByLabel('Final Cost (ZAR)').fill('25000')
    await page.getByRole('button', { name: /Confirm Final Cost/i }).click()
    await expect(page.getByRole('heading', { name: 'Repair in Progress' })).toBeVisible()

    // REPAIR_IN_PROGRESS → CLOSED
    await page.getByRole('button', { name: /Mark Repair Complete/i }).click()
    await expect(page.getByRole('heading', { name: 'Closed' })).toBeVisible()

    expect(errors, 'no console errors during theft happy path').toEqual([])
  })
})
```

Note: the QA step may render a `QA_APPOINTED` heading and then directly transition to `QA_DECISION` via the approve click — the QaDecision component handles both states. The intermediate "QA Decision" heading is not asserted here because clicking Approve on the QA_APPOINTED screen goes directly to AOL.

- [ ] **Step 2: Run the full smoke suite**

```bash
npm run smoke
```

Expected: 9 tests pass.

Likely failure modes:

- **Dropzone click doesn't trigger processing** — Playwright may click the dropzone while it's not in `idle` state. Check with `npm run smoke:headed` to watch the test run. If the state machine in `document-drop-zone.tsx` has changed, update the locator.
- **Investigation Received heading never appears** — Confirm the InvestigationReceived action panel is rendered for the INVESTIGATION_RECEIVED state by checking `src/components/claims/action-panel.tsx:137-138`.
- **10-second timeout on `proceedToQa.toBeEnabled`** — The dropzone progress interval runs 100 ticks at 35ms each = 3.5s. 10s should be ample. If it times out, debug with `npm run smoke:headed`.

- [ ] **Step 3: Commit**

```bash
git add tests/smoke.spec.ts
git commit -m "test(smoke): theft happy path CLM-10008 → CLOSED"
```

---

## Task 8: Glass happy-path test

**Files:**
- Modify: `tests/smoke.spec.ts`

Goal: Walk `CLM-10009` (seed Glass claim at `NEW` state) all the way to `CLOSED`. Glass is the shortest workflow.

**Happy path state sequence:**
`NEW → POLICY_VALIDATION → REGISTERED → GLASS_REPAIRER_APPOINTED → REPAIR_COMPLETE → CLOSED`

- [ ] **Step 1: Append the Glass happy-path describe block to `tests/smoke.spec.ts`**

```ts
test.describe('Happy path: Glass', () => {
  test('CLM-10009 walks from NEW to CLOSED', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await page.goto('/claims/CLM-10009')
    await expect(page.getByRole('heading', { name: 'New Claim' })).toBeVisible()

    // NEW → POLICY_VALIDATION
    await page.getByRole('button', { name: /Confirm & Proceed to Policy Validation/i }).click()
    await expect(page.getByRole('heading', { name: 'Policy Validation' })).toBeVisible()

    // POLICY_VALIDATION → REGISTERED
    await page.getByLabel('Policy Number').fill('POL-GLASS-001')
    await page.getByLabel('Excess Amount (ZAR)').fill('2500')
    await page.getByRole('button', { name: /Confirm Valid/i }).click()
    await expect(page.getByRole('heading', { name: 'Registered' })).toBeVisible()

    // REGISTERED → GLASS_REPAIRER_APPOINTED
    await page.getByLabel('SPM Claim Number').fill('SPM-GLASS-001')
    await page.getByRole('button', { name: /Confirm Registration/i }).click()
    await expect(page.getByRole('heading', { name: 'Glass Repairer Appointed' })).toBeVisible()

    // GLASS_REPAIRER_APPOINTED → REPAIR_COMPLETE
    // Pick the first seeded glass repairer (CON-008: PG Glass Johannesburg).
    await page.getByRole('button', { name: /PG Glass Johannesburg/ }).click()
    await page.getByRole('button', { name: /Confirm Appointment/i }).click()
    await expect(page.getByRole('heading', { name: 'Repair Complete' })).toBeVisible()

    // REPAIR_COMPLETE → CLOSED
    await page.getByRole('button', { name: /Close Claim/i }).click()
    await expect(page.getByRole('heading', { name: 'Closed' })).toBeVisible()

    expect(errors, 'no console errors during glass happy path').toEqual([])
  })
})
```

- [ ] **Step 2: Run the full smoke suite**

```bash
npm run smoke
```

Expected: 10 tests pass.

Likely failure modes:

- **"button 'PG Glass Johannesburg' not found"** — verify CON-008 is still present in `src/data/seed-contacts.ts`. If renamed, update the test.
- **`heading 'Repair Complete' not visible`** — REPAIR_COMPLETE uses `ProgressStatus` (see `src/components/claims/action-panel.tsx:168`); the h3 uses `stepConfig.label` which is `'Repair Complete'` per `workflow-definitions.ts`. Should render. If not, trace via `npm run smoke:ui`.

- [ ] **Step 3: Run `npm run verify` to prove the full gate**

```bash
npm run verify
```

Expected: TypeScript check passes, ESLint passes, 10 Playwright tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/smoke.spec.ts
git commit -m "test(smoke): glass happy path CLM-10009 → CLOSED"
```

---

## Task 9: Document the pre-demo ritual

**Files:**
- Modify: `README.md` (create if missing)

Goal: Record the pre-demo verification ritual so Fred doesn't need to consult the spec.

- [ ] **Step 1: Check whether README.md exists**

```bash
ls README.md
```

If it exists, open it. If not, create one with the block below as its only content (Step 2).

- [ ] **Step 2: Add or append the Pre-demo verification section**

Append to the end of `README.md` (or create `README.md` containing only this block):

```markdown
## Pre-demo verification

Before demoing to a customer, run the full verification gate:

```bash
npm run verify
```

This runs TypeScript type check (`tsc -b`), ESLint (`eslint .`), and Playwright smoke tests (`playwright test`) against a Playwright-managed dev server. If any step fails, **do not demo** — investigate and fix before proceeding.

### Smoke test scope

The smoke suite (`tests/smoke.spec.ts`) covers:

- **Route smoke** — Every top-level route renders without console errors: `/`, `/claims`, `/claims/:id`, `/inbox`, `/dashboard`, `/contacts`.
- **Sidebar navigation** — Clicking through every sidebar link in sequence without a full reload.
- **Happy paths** — One full workflow walk per claim type:
  - Accident: `CLM-10001` (NEW → ... → CLOSED via Internal Approval branch)
  - Theft: `CLM-10008` (INVESTIGATOR_APPOINTED → ... → CLOSED)
  - Glass: `CLM-10009` (NEW → ... → CLOSED)

### Debugging failures

- `npm run smoke:headed` — watch the tests run in a real Chrome window.
- `npm run smoke:ui` — Playwright's time-travel debugger.
- Screenshots, videos, and traces for failed tests are saved under `test-results/`.

Any render error in the app is caught by the route-level Error Boundary (`src/components/layout/error-boundary.tsx`) and surfaced as a visible fallback card with the error message and stack — no more blank screens.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: pre-demo verification ritual in README"
```

---

## Spec coverage check

| Spec requirement | Implemented in |
|---|---|
| Error Boundary at route level | Task 1 |
| Error Boundary fallback with message, stack in dev, reset button | Task 1 Step 1 |
| Error Boundary wraps `<Outlet />` in `AppShell` | Task 1 Step 2 |
| Fix current blank-screen bug | Task 2 |
| Install `@playwright/test` + Chromium | Task 3 Step 1 |
| Playwright config: Chromium-only, webServer, baseURL, traces on failure | Task 3 Step 4 |
| `npm run smoke`, `smoke:headed`, `smoke:ui`, `verify` scripts | Task 3 Step 2 |
| Gitignore `playwright-report/`, `test-results/` | Task 3 Step 3 |
| Route smoke tests for every top-level route | Task 4 |
| Console error capture via `page.on('console')` + `page.on('pageerror')` | Task 4 Step 1 (`captureConsoleErrors` helper) |
| Sidebar navigation smoke | Task 5 |
| Happy path Accident | Task 6 |
| Happy path Theft | Task 7 |
| Happy path Glass | Task 8 |
| Pre-demo ritual documented in README | Task 9 |
| NOT wired into `npm run build` | Task 3 Step 2 (build script unchanged) |

## Out-of-scope (confirmed with spec)

- Unit tests on `workflow-engine.ts`.
- Cross-browser (Firefox, WebKit).
- CI integration.
- Visual regression tests.
- Context or data mocking.
