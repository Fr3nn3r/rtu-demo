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

      // Error Boundary fallback is not visible. Match by heading role so we
      // don't get false positives from user content that mentions this phrase.
      await expect(
        page.getByRole('heading', { name: 'Something went wrong' })
      ).toHaveCount(0)

      // No console errors or uncaught exceptions during load. Note: React
      // dev-mode warnings (missing keys, invalid props, etc.) also arrive as
      // console.error and will trip this assertion — that's intentional.
      expect(errors, 'no console errors during page load').toEqual([])
    })
  }
})

test.describe('Sidebar navigation smoke', () => {
  test('walks through all sidebar links without errors', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await page.goto('/claims')
    await expect(page.getByRole('heading').first()).toBeVisible()

    // All labels are regex — Inbox needs it for the optional badge suffix,
    // and anchoring the others with `\b` keeps them equally strict while
    // letting the loop body stay uniform.
    const linkSequence: { label: RegExp; urlPattern: RegExp }[] = [
      { label: /^Inbox\b/, urlPattern: /\/inbox$/ },
      { label: /^Dashboard\b/, urlPattern: /\/dashboard$/ },
      { label: /^Contacts\b/, urlPattern: /\/contacts$/ },
      { label: /^Claims\b/, urlPattern: /\/claims$/ },
    ]

    for (const step of linkSequence) {
      await page.getByRole('link', { name: step.label }).click()
      await expect(page).toHaveURL(step.urlPattern)
      await expect(page.getByRole('heading').first()).toBeVisible()
      await expect(
        page.getByRole('heading', { name: 'Something went wrong' })
      ).toHaveCount(0)
    }

    expect(errors, 'no console errors during sidebar navigation').toEqual([])
  })
})

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
