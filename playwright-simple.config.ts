import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'e2e/features/health-check.feature',
  steps: 'e2e/steps/health-check.steps.ts',
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
    // Base URL for our application
    baseURL: 'http://localhost:3000',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
  },
  
  // HTML reporter for test reports
  reporter: [
    ['html'],
    ['list'],
  ],
  
  // Output directory for test artifacts
  outputDir: 'e2e/test-results',
  
  // Test timeout
  timeout: 30000,
  
  // Retry failed tests once
  retries: 1,
});