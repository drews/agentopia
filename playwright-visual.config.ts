import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'e2e/features/*.feature',
  steps: 'e2e/steps/*.ts',
  missingSteps: 'skip-scenario',
});

export default defineConfig({
  testDir,
  
  // Include both BDD and journey spec files
  testMatch: [
    '**/*.spec.ts',
    '**/features/*.feature'
  ],

  // Configure projects for visual regression testing
  projects: [
    {
      name: 'chromium-visual',
      use: { 
        ...devices['Desktop Chrome'],
        // Consistent viewport for screenshots
        viewport: { width: 1920, height: 1080 },
      },
    },
    // Add mobile project for responsive testing
    {
      name: 'mobile-visual',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],
  
  // Global test settings optimized for visual testing
  use: {
    // Base URL for our application
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Always capture screenshots for visual tests
    screenshot: 'only-on-failure',
    
    // Disable video for performance
    video: 'off',
    
    // Disable trace for performance in visual tests
    trace: 'off',
    
    // Longer timeout for visual tests
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  
  // Configure test artifacts for visual regression
  expect: {
    // Take screenshots for visual comparison
    toHaveScreenshot: {
      // Stricter pixel matching for regression testing
      maxDiffPixels: 50,
      // Use a specific threshold for consistency
      threshold: 0.05,
      // Standardize animation handling
      animations: 'disabled',
    },
  },
  
  // HTML reporter with visual diff capabilities
  reporter: [
    ['html', { 
      outputFolder: 'e2e/visual-reports',
      open: 'never' 
    }],
    ['json', { outputFile: 'e2e/visual-results/results.json' }],
    ['list'],
  ],
  
  // Output directory for visual test artifacts
  outputDir: 'e2e/visual-results',
  
  // Longer timeout for visual tests
  timeout: 45000,
  
  // Don't retry visual tests to avoid inconsistencies
  retries: 0,
  
  // Run visual tests sequentially for consistency
  workers: 1,
  
  // Global setup for visual tests
  globalSetup: undefined,
  globalTeardown: undefined,
});