import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'e2e/features/*.feature',
  steps: 'e2e/steps/*.ts',
  missingSteps: 'skip-scenario', // Skip scenarios with missing step definitions
});

export default defineConfig({
  testDir,
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  
  // Global test settings
  use: {
    // Base URL for our application (supports Docker environment)
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on first retry
    video: 'on-first-retry',
    
    // Record trace on first retry
    trace: 'on-first-retry',
  },
  
  // Configure test artifacts
  expect: {
    // Take screenshots for visual comparison
    toHaveScreenshot: {
      // Allow some pixel differences for cross-browser compatibility
      maxDiffPixels: 100,
    },
  },
  
  // HTML reporter for beautiful test reports
  reporter: [
    ['html'],
    ['json', { outputFile: 'e2e/test-results/results.json' }],
  ],
  
  // Output directory for test artifacts
  outputDir: 'e2e/test-results',
  
  // Test timeout
  timeout: 30000,
  
  // Retry failed tests
  retries: 1,
  
  // Run tests in parallel
  workers: 2,
});