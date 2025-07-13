import { test, expect } from '@playwright/test';

// Act I: Awakening & Orientation Test Suite
// These tests validate the narrative-driven onboarding experience

test.describe('Act I: Mind-Ship Awakening', () => {
  test.beforeEach(async ({ page }) => {
    // Start with clean state - no previous user data
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Journey 1: First Contact - System Initialization', () => {
    test('should present darkened bridge on first visit', async ({ page }) => {
      await page.goto('/');
      
      // Bridge should be in stasis mode
      await expect(page.locator('.bridge-container')).toHaveClass(/stasis-mode/);
      await expect(page.locator('.bridge-header')).toContainText('STASIS MODE');
      
      // Only emergency lighting should be visible
      const emergencyLights = page.locator('.emergency-lighting');
      await expect(emergencyLights).toBeVisible();
      
      // Main bridge systems should be dormant
      const bridgeGrid = page.locator('.bridge-grid');
      await expect(bridgeGrid).toHaveClass(/dormant/);
      
      // Initialize button should be pulsing
      const initButton = page.locator('[data-testid="initialize-systems"]');
      await expect(initButton).toBeVisible();
      await expect(initButton).toHaveClass(/pulse-animation/);
    });

    test('should execute awakening sequence when systems initialized', async ({ page }) => {
      await page.goto('/');
      
      // Click initialize systems
      await page.click('[data-testid="initialize-systems"]');
      
      // Should transition to awakening state
      await expect(page.locator('.bridge-container')).toHaveClass(/awakening/);
      await expect(page.locator('.bridge-header')).toContainText('AWAKENING');
      
      // Bridge lights should gradually illuminate
      const bridgeLights = page.locator('.bridge-lights');
      await expect(bridgeLights).toBeVisible();
      
      // System panels should become visible
      const systemPanels = page.locator('.system-panel');
      await expect(systemPanels.first()).toBeVisible();
      
      // AI interface should appear
      const aiInterface = page.locator('.ai-interface');
      await expect(aiInterface).toBeVisible();
    });

    test('should introduce AI voice with accessibility options', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="initialize-systems"]');
      
      // Wait for AI introduction
      await page.waitForSelector('.ai-introduction');
      
      // Should show AI speaking indicator
      const aiSpeaking = page.locator('.ai-speaking-indicator');
      await expect(aiSpeaking).toBeVisible();
      
      // Should provide subtitle option
      const subtitleToggle = page.locator('[data-testid="subtitle-toggle"]');
      await expect(subtitleToggle).toBeVisible();
      
      // Should show communication preferences
      const commPrefs = page.locator('.communication-preferences');
      await expect(commPrefs).toBeVisible();
      
      // Should introduce as ARIA
      const introduction = page.locator('.ai-introduction-text');
      await expect(introduction).toContainText('ARIA');
      await expect(introduction).toContainText('Autonomous Reasoning Intelligence Assistant');
    });

    test('should allow executive preference configuration', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Should offer communication style options
      const styleOptions = page.locator('.communication-style-options');
      await expect(styleOptions).toBeVisible();
      
      // Test selecting formal communication style
      await page.click('[data-testid="style-formal"]');
      await expect(page.locator('[data-testid="style-formal"]')).toBeChecked();
      
      // Test update frequency selection
      await page.selectOption('[data-testid="update-frequency"]', 'hourly');
      
      // Test alert priority selection
      await page.selectOption('[data-testid="alert-priorities"]', 'critical');
      
      // Save preferences
      await page.click('[data-testid="save-preferences"]');
      
      // Should advance to next stage
      await expect(page.locator('.bridge-container')).toHaveClass(/configured/);
    });
  });

  test.describe('Journey 2: Ship Diagnostics - Understanding Your Domain', () => {
    test.beforeEach(async ({ page }) => {
      // Complete initial awakening
      await page.goto('/');
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
    });

    test('should display comprehensive bridge systems overview', async ({ page }) => {
      // Bridge overview should be visible
      const bridgeOverview = page.locator('.bridge-overview');
      await expect(bridgeOverview).toBeVisible();
      
      // Should show grid layout of ship systems
      const systemGrid = page.locator('.ship-systems-grid');
      await expect(systemGrid).toBeVisible();
      
      // Should show system status indicators
      const statusIndicators = page.locator('.system-status-indicator');
      await expect(statusIndicators).toHaveCount(6); // Expected number of ship systems
      
      // Should show overall ship health
      const shipHealth = page.locator('.ship-health-metrics');
      await expect(shipHealth).toBeVisible();
      await expect(shipHealth).toContainText('SYSTEM HEALTH');
      
      // Critical systems should be highlighted
      const criticalSystems = page.locator('.system-critical');
      await expect(criticalSystems.first()).toBeVisible();
    });

    test('should provide detailed department information', async ({ page }) => {
      // Click on first department
      await page.click('.department-panel:first-child');
      
      // Should show department details
      const departmentDetails = page.locator('.department-details');
      await expect(departmentDetails).toBeVisible();
      
      // Should show system information
      const systemInfo = page.locator('.system-information');
      await expect(systemInfo).toBeVisible();
      
      // Should show crew assignments (if any)
      const crewAssignments = page.locator('.crew-assignments');
      await expect(crewAssignments).toBeVisible();
      
      // Should show pending tasks
      const pendingTasks = page.locator('.pending-tasks');
      await expect(pendingTasks).toBeVisible();
      
      // Should allow priority setting
      const priorityControls = page.locator('.priority-controls');
      await expect(priorityControls).toBeVisible();
    });

    test('should display available crew manifest', async ({ page }) => {
      // Access crew manifest
      await page.click('[data-testid="crew-manifest"]');
      
      // Should show available AI agents
      const crewList = page.locator('.crew-list');
      await expect(crewList).toBeVisible();
      
      // Should show agent specializations
      const agentSpecializations = page.locator('.agent-specialization');
      await expect(agentSpecializations.first()).toBeVisible();
      
      // Should show assignment status
      const assignmentStatus = page.locator('.assignment-status');
      await expect(assignmentStatus.first()).toBeVisible();
      
      // Should allow capability preview
      const capabilityPreview = page.locator('.capability-preview');
      await expect(capabilityPreview.first()).toBeVisible();
    });

    test('should allow agent capability exploration', async ({ page }) => {
      await page.click('[data-testid="crew-manifest"]');
      
      // Select first agent
      await page.click('.agent-card:first-child');
      
      // Should show skill profile
      const skillProfile = page.locator('.skill-profile');
      await expect(skillProfile).toBeVisible();
      
      // Should show example tasks
      const exampleTasks = page.locator('.example-tasks');
      await expect(exampleTasks).toBeVisible();
      
      // Should show communication style
      const communicationStyle = page.locator('.communication-style');
      await expect(communicationStyle).toBeVisible();
      
      // Should allow department assignment
      const assignmentControls = page.locator('.assignment-controls');
      await expect(assignmentControls).toBeVisible();
      
      // Test assignment
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      
      // Should show assignment confirmation
      await expect(page.locator('.assignment-confirmation')).toBeVisible();
    });
  });

  test.describe('Integration Tests - Full Journey Flow', () => {
    test('should complete full Act I awakening flow', async ({ page }) => {
      await page.goto('/');
      
      // Stage 1: System Initialization
      await expect(page.locator('.bridge-container')).toHaveClass(/stasis-mode/);
      await page.click('[data-testid="initialize-systems"]');
      
      // Stage 2: AI Introduction
      await page.waitForSelector('.ai-introduction');
      await page.click('[data-testid="style-formal"]');
      await page.selectOption('[data-testid="update-frequency"]', 'hourly');
      await page.click('[data-testid="save-preferences"]');
      
      // Stage 3: System Diagnostics
      await page.waitForSelector('.bridge-overview');
      await page.click('.department-panel:first-child');
      await page.click('[data-testid="crew-manifest"]');
      
      // Stage 4: First Assignment
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      
      // Should complete Act I
      await expect(page.locator('.bridge-container')).toHaveClass(/act-1-complete/);
      await expect(page.locator('.progress-indicator')).toContainText('Act I Complete');
      
      // Should unlock Act II
      const actIIUnlock = page.locator('.act-2-unlock');
      await expect(actIIUnlock).toBeVisible();
    });
  });

  test.describe('State Persistence', () => {
    test('should save awakening progress', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.ai-introduction');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      
      // Refresh page
      await page.reload();
      
      // Should maintain awakened state
      await expect(page.locator('.bridge-container')).not.toHaveClass(/stasis-mode/);
      await expect(page.locator('.bridge-overview')).toBeVisible();
    });

    test('should preserve user preferences', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.selectOption('[data-testid="update-frequency"]', 'hourly');
      await page.click('[data-testid="save-preferences"]');
      
      // Navigate to preferences
      await page.click('[data-testid="preferences-menu"]');
      
      // Should show saved preferences
      await expect(page.locator('[data-testid="style-formal"]')).toBeChecked();
      await expect(page.locator('[data-testid="update-frequency"]')).toHaveValue('hourly');
    });
  });

  test.describe('Accessibility & Usability', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Should be able to navigate with keyboard
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="initialize-systems"]')).toBeFocused();
      
      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
      await expect(page.locator('.bridge-container')).toHaveClass(/awakening/);
    });

    test('should provide screen reader support', async ({ page }) => {
      await page.goto('/');
      
      // Should have proper ARIA labels
      const initButton = page.locator('[data-testid="initialize-systems"]');
      await expect(initButton).toHaveAttribute('aria-label', /initialize/i);
      
      // Should have status announcements
      await page.click('[data-testid="initialize-systems"]');
      const statusRegion = page.locator('[role="status"]');
      await expect(statusRegion).toBeVisible();
    });

    test('should handle reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      
      // Animations should be reduced
      const initButton = page.locator('[data-testid="initialize-systems"]');
      await expect(initButton).not.toHaveClass(/pulse-animation/);
      
      // Should still function without animations
      await page.click('[data-testid="initialize-systems"]');
      await expect(page.locator('.bridge-container')).toHaveClass(/awakening/);
    });
  });
});