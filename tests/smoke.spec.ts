import { test, expect } from '@playwright/test'

test('sanity: homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/claims/)
})
