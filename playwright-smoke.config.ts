import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'e2e/features/smoke-test.feature',
  steps: 'e2e/steps/smoke-test.steps.ts',
});

export default defineConfig({
  testDir,
  
  // Configure projects for chromium only (simplest)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // Global test settings
  use: {
    // Base URL for backend API (will be set by Docker environment)
    baseURL: process.env.BACKEND_URL || 'http://localhost:8000',
  },
  
  // HTML reporter for test reports
  reporter: [
    ['list'],
    ['html'],
  ],
  
  // Output directory for test artifacts
  outputDir: 'e2e/test-results',
  
  // Test timeout (shorter for smoke tests)
  timeout: 30000,
  
  // No retries for smoke tests - they should be reliable
  retries: 0,
});