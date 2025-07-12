import { test, expect } from '@playwright/test';

// Visual Regression Test Suite
// These tests capture and compare visual states across different journey stages

test.describe('Visual Regression Testing', () => {
  // Configure for visual testing
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Core Journey Visual States', () => {
    test('should capture stasis mode baseline', async ({ page }) => {
      // Ensure stasis mode is properly loaded
      await expect(page.locator('.bridge-container')).toHaveClass(/stasis-mode/);
      await expect(page.locator('[data-testid="initialize-systems"]')).toBeVisible();
      
      // Wait for animations to settle
      await page.waitForTimeout(2000);
      
      // Capture baseline screenshot
      await expect(page).toHaveScreenshot('stasis-mode-baseline.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture awakening sequence progression', async ({ page }) => {
      // Initial stasis state
      await expect(page.locator('.bridge-container')).toHaveClass(/stasis-mode/);
      await expect(page).toHaveScreenshot('awakening-00-stasis.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Click initialize
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('awakening-01-initializing.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Wait for awakening state
      await expect(page.locator('.bridge-container')).toHaveClass(/awakening/);
      await page.waitForTimeout(2000);
      await expect(page).toHaveScreenshot('awakening-02-systems-online.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // AI introduction appears
      await page.waitForSelector('.ai-introduction');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('awakening-03-ai-introduction.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture communication preference configuration', async ({ page }) => {
      // Navigate to communication preferences
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Capture preference selection state
      await expect(page).toHaveScreenshot('preferences-01-options.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Select formal style
      await page.click('[data-testid="style-formal"]');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('preferences-02-formal-selected.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Configure update frequency
      await page.selectOption('[data-testid="update-frequency"]', 'hourly');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('preferences-03-configured.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Save preferences
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('preferences-04-saved.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture bridge diagnostic overview', async ({ page }) => {
      // Complete initial setup
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      await page.waitForTimeout(2000);
      
      // Capture bridge overview
      await expect(page).toHaveScreenshot('diagnostic-01-overview.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Click on crew manifest
      await page.click('[data-testid="crew-manifest"]');
      await page.waitForSelector('.crew-list');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('diagnostic-02-crew-manifest.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Select an agent
      await page.click('.agent-card:first-child');
      await page.waitForSelector('.agent-details');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('diagnostic-03-agent-details.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Assign to department
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('diagnostic-04-assignment.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Confirm assignment
      await page.click('[data-testid="confirm-assignment"]');
      await page.waitForSelector('.assignment-confirmation');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('diagnostic-05-assigned.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Voice Discovery Visual Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Complete Act I
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      await page.waitForSelector('.act-2-resonance');
    });

    test('should capture voice discovery scenarios', async ({ page }) => {
      // Access voice discovery
      await page.click('[data-testid="begin-voice-discovery"]');
      await page.waitForSelector('.command-scenarios');
      await page.waitForTimeout(2000);
      
      // Capture scenario presentation
      await expect(page).toHaveScreenshot('voice-01-scenario-intro.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Show command approaches
      await page.waitForSelector('.command-approach');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('voice-02-approaches.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Select direct approach
      await page.click('[data-testid="approach-direct"]');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('voice-03-direct-selected.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Progress to next scenario
      await page.click('[data-testid="next-scenario"]');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('voice-04-next-scenario.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture system tuning interface', async ({ page }) => {
      // Skip to system tuning
      await page.click('[data-testid="begin-voice-discovery"]');
      await page.click('[data-testid="skip-to-tuning"]');
      await page.waitForSelector('.system-tuning');
      await page.waitForTimeout(2000);
      
      // Capture tuning interface
      await expect(page).toHaveScreenshot('tuning-01-interface.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Adjust directness setting
      await page.click('[data-testid="directness-high"]');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('tuning-02-directness-high.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Configure update frequency
      await page.selectOption('[data-testid="update-frequency"]', 'real-time');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('tuning-03-realtime.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Save tuning preferences
      await page.click('[data-testid="save-tuning-prefs"]');
      await page.waitForSelector('.tuning-confirmation');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('tuning-04-saved.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Mission Interface Visual States', () => {
    test.beforeEach(async ({ page }) => {
      // Complete Acts I & II setup
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      await page.click('[data-testid="begin-voice-discovery"]');
      await page.click('[data-testid="quick-setup"]');
      await page.waitForSelector('.mission-interface');
    });

    test('should capture mission selection flow', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Mission interface overview
      await expect(page).toHaveScreenshot('mission-01-interface.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Select starter mission
      await page.click('.starter-mission:first-child');
      await page.waitForSelector('.mission-details');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('mission-02-selected.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Assign agent
      await page.click('.available-agent:first-child');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('mission-03-agent-selected.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Confirm assignment
      await page.click('[data-testid="assign-to-mission"]');
      await page.waitForSelector('.assignment-confirmed');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('mission-04-assigned.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Launch mission
      await page.click('[data-testid="launch-mission"]');
      await page.waitForSelector('.mission-monitoring');
      await page.waitForTimeout(2000);
      await expect(page).toHaveScreenshot('mission-05-active.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture mission monitoring states', async ({ page }) => {
      // Launch a mission first
      await page.click('.starter-mission:first-child');
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      await page.click('[data-testid="launch-mission"]');
      await page.waitForSelector('.mission-monitoring');
      await page.waitForTimeout(2000);
      
      // Active monitoring
      await expect(page).toHaveScreenshot('monitoring-01-active.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Simulate progress update
      await page.click('[data-testid="simulate-progress"]');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('monitoring-02-progress.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Complete mission
      await page.click('[data-testid="simulate-completion"]');
      await page.waitForSelector('.mission-results');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('monitoring-03-complete.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Fleet Operations Visual Complexity', () => {
    test.beforeEach(async ({ page }) => {
      // Fast-track to Act III
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      await page.click('[data-testid="begin-voice-discovery"]');
      await page.click('[data-testid="quick-setup"]');
      await page.click('.starter-mission:first-child');
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      await page.click('[data-testid="launch-mission"]');
      await page.click('[data-testid="simulate-completion"]');
      await page.fill('[data-testid="mission-feedback"]', 'Success');
      await page.click('[data-testid="submit-feedback"]');
      await page.waitForSelector('.act-3-emergence');
    });

    test('should capture fleet management interface', async ({ page }) => {
      // Access fleet management
      await page.click('[data-testid="fleet-management"]');
      await page.waitForSelector('.fleet-interface');
      await page.waitForTimeout(2000);
      
      // Fleet overview
      await expect(page).toHaveScreenshot('fleet-01-overview.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Multi-ship missions
      await page.click('[data-testid="multi-ship-missions"]');
      await page.waitForSelector('.complex-missions');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('fleet-02-multi-ship.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Select complex mission
      await page.click('.complex-mission:first-child');
      await page.waitForSelector('.ship-assignment');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('fleet-03-mission-selected.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Assign ships
      await page.click('.ship-available:first-child');
      await page.click('[data-testid="assign-primary-role"]');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('fleet-04-ship-assigned.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture strategic planning interface', async ({ page }) => {
      await page.click('[data-testid="fleet-management"]');
      await page.click('[data-testid="strategic-planner"]');
      await page.waitForSelector('.strategic-planner');
      await page.waitForTimeout(2000);
      
      // Strategic planning interface
      await expect(page).toHaveScreenshot('strategic-01-planner.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Add strategic objective
      await page.fill('[data-testid="strategic-objective"]', 'Expand exploration capabilities');
      await page.selectOption('[data-testid="timeline"]', '6-months');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('strategic-02-objective-entered.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Add objective
      await page.click('[data-testid="add-objective"]');
      await page.waitForSelector('.strategic-plan');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('strategic-03-plan-created.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    test('should maintain visual consistency across different browser engines', async ({ page, browserName }) => {
      // Complete basic setup
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      await page.waitForTimeout(2000);
      
      // Capture browser-specific screenshot
      await expect(page).toHaveScreenshot(`bridge-overview-${browserName}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Performance Visual States', () => {
    test('should capture interface under load', async ({ page }) => {
      // Complete setup and reach high-complexity state
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      
      // Fast-track to complex operations
      await page.waitForSelector('.bridge-overview');
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      await page.click('[data-testid="begin-voice-discovery"]');
      await page.click('[data-testid="quick-setup"]');
      await page.click('.starter-mission:first-child');
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      await page.click('[data-testid="launch-mission"]');
      await page.click('[data-testid="simulate-completion"]');
      await page.fill('[data-testid="mission-feedback"]', 'Success');
      await page.click('[data-testid="submit-feedback"]');
      
      await page.click('[data-testid="fleet-management"]');
      await page.waitForTimeout(3000);
      
      // Simulate high load
      await page.click('[data-testid="simulate-high-load"]');
      await page.waitForTimeout(2000);
      
      // Capture under load
      await expect(page).toHaveScreenshot('performance-under-load.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
});