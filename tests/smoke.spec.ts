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

    const linkSequence: { label: string | RegExp; urlPattern: RegExp }[] = [
      { label: /^Inbox/, urlPattern: /\/inbox$/ },
      { label: 'Dashboard', urlPattern: /\/dashboard$/ },
      { label: 'Contacts', urlPattern: /\/contacts$/ },
      { label: 'Claims', urlPattern: /\/claims$/ },
    ]

    for (const step of linkSequence) {
      const linkLocator =
        typeof step.label === 'string'
          ? page.getByRole('link', { name: step.label, exact: true })
          : page.getByRole('link', { name: step.label })
      await linkLocator.click()
      await expect(page).toHaveURL(step.urlPattern)
      await expect(page.getByRole('heading').first()).toBeVisible()
      await expect(
        page.getByRole('heading', { name: 'Something went wrong' })
      ).toHaveCount(0)
    }

    expect(errors, 'no console errors during sidebar navigation').toEqual([])
  })
})
