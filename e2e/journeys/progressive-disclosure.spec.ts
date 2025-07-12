import { test, expect } from '@playwright/test';

// Progressive Disclosure Test Suite
// These tests validate the progressive revelation of capabilities and complexity

test.describe('Progressive Disclosure System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Capability Revelation Timing', () => {
    test('should hide advanced features until appropriate mastery level', async ({ page }) => {
      // Initial state - advanced features should be hidden
      await page.goto('/');
      
      // Fleet management should not be visible
      await expect(page.locator('[data-testid="fleet-management"]')).not.toBeVisible();
      
      // Strategic planning should not be available
      await expect(page.locator('[data-testid="strategic-planner"]')).not.toBeVisible();
      
      // Multi-ship operations should be hidden
      await expect(page.locator('[data-testid="multi-ship-missions"]')).not.toBeVisible();
      
      // Resource optimization should not be accessible
      await expect(page.locator('[data-testid="resource-optimizer"]')).not.toBeVisible();
    });

    test('should progressively reveal features through Act progression', async ({ page }) => {
      // Complete Act I
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Basic crew management should now be available
      await expect(page.locator('[data-testid="crew-manifest"]')).toBeVisible();
      
      // But advanced features still hidden
      await expect(page.locator('[data-testid="fleet-management"]')).not.toBeVisible();
      
      // Complete basic assignment
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      
      // Voice discovery should now be available
      await expect(page.locator('[data-testid="begin-voice-discovery"]')).toBeVisible();
      
      // Complete Act II
      await page.click('[data-testid="begin-voice-discovery"]');
      await page.click('[data-testid="quick-setup"]');
      await page.click('.starter-mission:first-child');
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      await page.click('[data-testid="launch-mission"]');
      await page.click('[data-testid="simulate-completion"]');
      await page.fill('[data-testid="mission-feedback"]', 'Successful mission');
      await page.click('[data-testid="submit-feedback"]');
      
      // Advanced features should now be available
      await expect(page.locator('[data-testid="fleet-management"]')).toBeVisible();
    });

    test('should show capability previews without full access', async ({ page }) => {
      // Complete Act I only
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Should show preview of upcoming capabilities
      const upcomingFeatures = page.locator('.upcoming-features');
      await expect(upcomingFeatures).toBeVisible();
      
      // Should show locked feature previews
      const lockedPreviews = page.locator('.locked-feature-preview');
      await expect(lockedPreviews.first()).toBeVisible();
      
      // Should show progression requirements
      const progressRequirements = page.locator('.progress-requirements');
      await expect(progressRequirements).toBeVisible();
      
      // Clicking locked features should show unlock requirements
      await page.click('.locked-feature-preview:first-child');
      const unlockRequirements = page.locator('.unlock-requirements');
      await expect(unlockRequirements).toBeVisible();
      await expect(unlockRequirements).toContainText('Complete');
    });
  });

  test.describe('Complexity Gradation', () => {
    test('should start with simple controls and add complexity gradually', async ({ page }) => {
      // Complete basic setup
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Initial controls should be simple
      const basicControls = page.locator('.basic-controls');
      await expect(basicControls).toBeVisible();
      
      // Advanced options should be collapsed
      const advancedOptions = page.locator('.advanced-options');
      await expect(advancedOptions).not.toBeVisible();
      
      // Should have "Show More" options
      const showMore = page.locator('[data-testid="show-advanced-options"]');
      await expect(showMore).toBeVisible();
      
      // Clicking show more should reveal additional complexity
      await page.click('[data-testid="show-advanced-options"]');
      await expect(advancedOptions).toBeVisible();
      
      // Should be able to collapse back to simple view
      await page.click('[data-testid="hide-advanced-options"]');
      await expect(advancedOptions).not.toBeVisible();
    });

    test('should provide guided workflows for complex operations', async ({ page }) => {
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
      await page.fill('[data-testid="mission-feedback"]', 'Successful');
      await page.click('[data-testid="submit-feedback"]');
      
      // Access complex operation
      await page.click('[data-testid="fleet-management"]');
      await page.click('[data-testid="multi-ship-missions"]');
      
      // Should offer guided workflow
      const guidedWorkflow = page.locator('.guided-workflow');
      await expect(guidedWorkflow).toBeVisible();
      
      // Should show step-by-step progression
      const workflowSteps = page.locator('.workflow-step');
      await expect(workflowSteps.first()).toBeVisible();
      
      // Should highlight current step
      const currentStep = page.locator('.workflow-step.current');
      await expect(currentStep).toBeVisible();
      
      // Should provide contextual help
      const contextualHelp = page.locator('.contextual-help');
      await expect(contextualHelp).toBeVisible();
    });

    test('should allow expert mode for experienced users', async ({ page }) => {
      // Complete journey to expert level
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Fast track through Acts
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
      await page.fill('[data-testid="mission-feedback"]', 'Expert level');
      await page.click('[data-testid="submit-feedback"]');
      
      // Should detect expert usage patterns
      const expertMode = page.locator('.expert-mode');
      await expect(expertMode).toBeVisible();
      
      // Should offer expert mode toggle
      const expertToggle = page.locator('[data-testid="enable-expert-mode"]');
      await expect(expertToggle).toBeVisible();
      
      // Enable expert mode
      await page.click('[data-testid="enable-expert-mode"]');
      
      // Should show condensed, advanced interface
      const expertInterface = page.locator('.expert-interface');
      await expect(expertInterface).toBeVisible();
      
      // Should hide guided workflows by default
      const guidedWorkflow = page.locator('.guided-workflow');
      await expect(guidedWorkflow).not.toBeVisible();
      
      // Should show all options simultaneously
      const allOptions = page.locator('.all-options-visible');
      await expect(allOptions).toBeVisible();
    });
  });

  test.describe('Contextual Information Architecture', () => {
    test('should show relevant information based on current context', async ({ page }) => {
      // Complete basic setup
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // In overview context
      const overviewInfo = page.locator('.context-overview');
      await expect(overviewInfo).toBeVisible();
      
      // Navigate to crew management
      await page.click('[data-testid="crew-manifest"]');
      
      // Should switch to crew context
      const crewInfo = page.locator('.context-crew');
      await expect(crewInfo).toBeVisible();
      await expect(overviewInfo).not.toBeVisible();
      
      // Should show crew-relevant actions
      const crewActions = page.locator('.crew-actions');
      await expect(crewActions).toBeVisible();
      
      // Should hide non-relevant information
      const systemInfo = page.locator('.context-systems');
      await expect(systemInfo).not.toBeVisible();
    });

    test('should adapt help and guidance to user proficiency', async ({ page }) => {
      // Complete basic setup
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // As beginner, should show detailed guidance
      const beginnerGuidance = page.locator('.beginner-guidance');
      await expect(beginnerGuidance).toBeVisible();
      
      // Should show tooltips
      const tooltips = page.locator('.help-tooltip');
      await expect(tooltips.first()).toBeVisible();
      
      // Complete several successful actions
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      
      await page.click('[data-testid="begin-voice-discovery"]');
      await page.click('[data-testid="quick-setup"]');
      
      // Should reduce guidance intensity
      const reducedGuidance = page.locator('.reduced-guidance');
      await expect(reducedGuidance).toBeVisible();
      
      // Should make tooltips optional
      const optionalTooltips = page.locator('.optional-tooltips');
      await expect(optionalTooltips).toBeVisible();
    });

    test('should maintain progressive disclosure state across sessions', async ({ page }) => {
      // Complete partial progression
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      
      // Should save progression state
      const progressState = page.locator('.progress-state');
      await expect(progressState).toHaveAttribute('data-level', 'intermediate');
      
      // Refresh page
      await page.reload();
      
      // Should maintain progression level
      await expect(page.locator('.progress-state')).toHaveAttribute('data-level', 'intermediate');
      
      // Should maintain feature availability
      await expect(page.locator('[data-testid="begin-voice-discovery"]')).toBeVisible();
      
      // Should not show beginner-only features
      await expect(page.locator('.beginner-only')).not.toBeVisible();
    });
  });

  test.describe('Error Recovery and Graceful Degradation', () => {
    test('should gracefully handle incomplete progressive disclosure states', async ({ page }) => {
      // Simulate corrupted state
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('agentopia-progress', '{"corrupted": true}');
      });
      
      await page.reload();
      
      // Should detect corrupted state
      const stateRecovery = page.locator('.state-recovery');
      await expect(stateRecovery).toBeVisible();
      
      // Should offer recovery options
      const recoveryOptions = page.locator('.recovery-options');
      await expect(recoveryOptions).toBeVisible();
      
      // Should allow starting fresh
      const startFresh = page.locator('[data-testid="start-fresh"]');
      await expect(startFresh).toBeVisible();
      
      // Should allow state reconstruction
      const reconstructState = page.locator('[data-testid="reconstruct-state"]');
      await expect(reconstructState).toBeVisible();
    });

    test('should handle feature unlock failures gracefully', async ({ page }) => {
      // Complete progression but simulate unlock failure
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Simulate network failure during unlock
      await page.route('**/api/unlock-feature', route => {
        route.abort('failed');
      });
      
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      
      // Should show unlock failure message
      const unlockFailure = page.locator('.unlock-failure');
      await expect(unlockFailure).toBeVisible();
      
      // Should offer retry mechanism
      const retryUnlock = page.locator('[data-testid="retry-unlock"]');
      await expect(retryUnlock).toBeVisible();
      
      // Should not break existing functionality
      const existingFeatures = page.locator('.existing-features');
      await expect(existingFeatures).toBeVisible();
    });
  });

  test.describe('Accessibility in Progressive Disclosure', () => {
    test('should announce feature unlocks to screen readers', async ({ page }) => {
      // Complete progression with screen reader simulation
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      
      // Should have ARIA live region for announcements
      const liveRegion = page.locator('[aria-live="polite"]');
      await expect(liveRegion).toBeVisible();
      
      // Should announce feature unlock
      await expect(liveRegion).toContainText('New feature unlocked');
      
      // Should provide context about what was unlocked
      await expect(liveRegion).toContainText('Voice Discovery');
    });

    test('should maintain keyboard navigation through progressive states', async ({ page }) => {
      // Test keyboard navigation in basic state
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Should be able to navigate with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Continue progression
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Keyboard navigation should still work
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Should be able to access new features via keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Should activate crew manifest
      
      await expect(page.locator('.crew-list')).toBeVisible();
    });
  });
});