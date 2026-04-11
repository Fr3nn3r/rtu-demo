import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // Single worker keeps runs predictable while the suite is small. Each test
  // already has its own `page` context, so React in-memory state is isolated
  // per test — bumping workers later is safe, but unnecessary at this size.
  fullyParallel: false,
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
