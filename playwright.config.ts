import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'vite',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    env: { VITE_E2E: '1' },
    cwd: process.cwd()
  }
});



