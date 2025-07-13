import { test, expect } from '@playwright/test';

// Act II: Resonance & Voice Discovery Test Suite
// These tests validate finding command voice and establishing smooth operations

test.describe('Act II: Resonance & Voice Discovery', () => {
  test.beforeEach(async ({ page }) => {
    // Complete Act I before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Fast-track through Act I
    await page.click('[data-testid="initialize-systems"]');
    await page.waitForSelector('.communication-preferences');
    await page.click('[data-testid="style-formal"]');
    await page.click('[data-testid="save-preferences"]');
    await page.waitForSelector('.bridge-overview');
    
    // Complete basic diagnostics
    await page.click('[data-testid="crew-manifest"]');
    await page.click('.agent-card:first-child');
    await page.selectOption('[data-testid="assign-department"]', 'engineering');
    await page.click('[data-testid="confirm-assignment"]');
    
    // Should now be at Act II
    await page.waitForSelector('.act-2-resonance');
  });

  test.describe('Journey 3: Finding Your Command Voice', () => {
    test('should present command voice discovery scenarios', async ({ page }) => {
      // Access voice discovery interface
      await page.click('[data-testid="begin-voice-discovery"]');
      
      // Should show command scenarios
      const commandScenarios = page.locator('.command-scenarios');
      await expect(commandScenarios).toBeVisible();
      
      // Should present scenario questions
      const scenarioQuestion = page.locator('.scenario-question');
      await expect(scenarioQuestion).toBeVisible();
      
      // Should offer different command approaches
      const commandApproaches = page.locator('.command-approach');
      await expect(commandApproaches).toHaveCount(3); // Expect 3 command approaches
      
      // Should show system adaptation preview
      const adaptationPreview = page.locator('.adaptation-preview');
      await expect(adaptationPreview).toBeVisible();
    });

    test('should adapt system tuning based on command voice', async ({ page }) => {
      await page.click('[data-testid="begin-voice-discovery"]');
      
      // Select direct command style
      await page.click('[data-testid="approach-direct"]');
      await page.click('[data-testid="next-scenario"]');
      
      // Complete several scenarios
      for (let i = 0; i < 3; i++) {
        await page.click('[data-testid="approach-direct"]');
        await page.click('[data-testid="next-scenario"]');
      }
      
      // Should show system tuning recommendations
      const tuningRecommendations = page.locator('.tuning-recommendations');
      await expect(tuningRecommendations).toBeVisible();
      await expect(tuningRecommendations).toContainText('Direct Communication');
      
      // Should show system adaptation
      const systemAdaptation = page.locator('.system-adaptation');
      await expect(systemAdaptation).toBeVisible();
      await expect(systemAdaptation).toContainText('Quick responses');
    });

    test('should configure system responsiveness tuning', async ({ page }) => {
      await page.click('[data-testid="begin-voice-discovery"]');
      
      // Skip to system tuning
      await page.click('[data-testid="skip-to-tuning"]');
      
      // Should show system tuning interface
      const systemTuning = page.locator('.system-tuning');
      await expect(systemTuning).toBeVisible();
      
      // Should allow command directness setting
      const commandDirectness = page.locator('[data-testid="command-directness"]');
      await expect(commandDirectness).toBeVisible();
      
      // Test setting high directness
      await page.click('[data-testid="directness-high"]');
      await expect(page.locator('[data-testid="directness-high"]')).toBeChecked();
      
      // Should show update frequency options
      const updateFrequency = page.locator('.update-frequency');
      await expect(updateFrequency).toBeVisible();
      
      // Test setting frequency
      await page.selectOption('[data-testid="update-frequency"]', 'real-time');
      
      // Should show decision speed options
      const decisionSpeed = page.locator('.decision-speed');
      await expect(decisionSpeed).toBeVisible();
      
      // Test speed settings
      await page.check('[data-testid="quick-decisions"]');
      await page.check('[data-testid="immediate-alerts"]');
      
      // Save tuning preferences
      await page.click('[data-testid="save-tuning-prefs"]');
      
      // Should show confirmation
      await expect(page.locator('.tuning-confirmation')).toBeVisible();
    });

    test('should enable personal dashboard configuration', async ({ page }) => {
      await page.click('[data-testid="begin-personalization"]');
      await page.click('[data-testid="skip-to-dashboard"]');
      
      // Should show dashboard customization
      const dashboardCustomizer = page.locator('.dashboard-customizer');
      await expect(dashboardCustomizer).toBeVisible();
      
      // Should allow panel arrangement
      const arrangePanels = page.locator('.arrange-panels');
      await expect(arrangePanels).toBeVisible();
      
      // Test drag and drop (simulate)
      await page.dragAndDrop('.panel-missions', '.panel-area-1');
      await page.dragAndDrop('.panel-agents', '.panel-area-2');
      
      // Should allow priority information settings
      const priorityInfo = page.locator('.priority-information');
      await expect(priorityInfo).toBeVisible();
      
      // Test priority selections
      await page.check('[data-testid="priority-mission-status"]');
      await page.check('[data-testid="priority-agent-health"]');
      
      // Should allow custom alert categories
      const alertCategories = page.locator('.alert-categories');
      await expect(alertCategories).toBeVisible();
      
      // Test custom alert
      await page.fill('[data-testid="custom-alert-name"]', 'Resource Depletion');
      await page.click('[data-testid="add-custom-alert"]');
      
      // Save dashboard configuration
      await page.click('[data-testid="save-dashboard-config"]');
      
      // Should apply configuration
      await expect(page.locator('.dashboard-applied')).toBeVisible();
    });

    test('should setup communication rhythm preferences', async ({ page }) => {
      await page.click('[data-testid="begin-personalization"]');
      await page.click('[data-testid="skip-to-communication"]');
      
      // Should show communication rhythm setup
      const commRhythm = page.locator('.communication-rhythm');
      await expect(commRhythm).toBeVisible();
      
      // Should allow briefing time setup
      const briefingTimes = page.locator('.briefing-times');
      await expect(briefingTimes).toBeVisible();
      
      // Test setting briefing times
      await page.check('[data-testid="briefing-morning"]');
      await page.check('[data-testid="briefing-evening"]');
      
      // Should allow progress report frequency
      const progressFreq = page.locator('.progress-frequency');
      await expect(progressFreq).toBeVisible();
      
      // Test frequency selection
      await page.selectOption('[data-testid="progress-frequency"]', 'hourly');
      
      // Should allow exception reporting setup
      const exceptionReporting = page.locator('.exception-reporting');
      await expect(exceptionReporting).toBeVisible();
      
      // Test exception settings
      await page.selectOption('[data-testid="exception-reporting"]', 'immediate');
      
      // Save communication preferences
      await page.click('[data-testid="save-comm-rhythm"]');
      
      // Should show rhythm confirmation
      await expect(page.locator('.rhythm-confirmation')).toBeVisible();
    });
  });

  test.describe('Journey 4: First Mission Assignment', () => {
    test.beforeEach(async ({ page }) => {
      // Complete personalization setup
      await page.click('[data-testid="begin-personalization"]');
      await page.click('[data-testid="quick-setup"]'); // Use quick setup for tests
      await page.waitForSelector('.mission-interface');
    });

    test('should display available missions', async ({ page }) => {
      // Should show mission interface
      const missionInterface = page.locator('.mission-interface');
      await expect(missionInterface).toBeVisible();
      
      // Should show mission types
      const missionTypes = page.locator('.mission-types');
      await expect(missionTypes).toBeVisible();
      
      // Should show complexity levels
      const complexityLevels = page.locator('.complexity-levels');
      await expect(complexityLevels).toBeVisible();
      
      // Should show starter missions
      const starterMissions = page.locator('.starter-missions');
      await expect(starterMissions).toBeVisible();
      
      // Should show required resources
      const requiredResources = page.locator('.required-resources');
      await expect(requiredResources.first()).toBeVisible();
    });

    test('should enable mission selection and planning', async ({ page }) => {
      // Select a starter mission
      await page.click('.starter-mission:first-child');
      
      // Should show mission details
      const missionDetails = page.locator('.mission-details');
      await expect(missionDetails).toBeVisible();
      
      // Should show resource requirements
      const resourceReqs = page.locator('.resource-requirements');
      await expect(resourceReqs).toBeVisible();
      
      // Should show available vs required
      const resourceComparison = page.locator('.resource-comparison');
      await expect(resourceComparison).toBeVisible();
      
      // Should allow agent assignment
      const agentAssignment = page.locator('.agent-assignment');
      await expect(agentAssignment).toBeVisible();
      
      // Test assigning agents
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      
      // Should show assignment confirmation
      await expect(page.locator('.assignment-confirmed')).toBeVisible();
    });

    test('should allow success criteria definition', async ({ page }) => {
      await page.click('.starter-mission:first-child');
      
      // Should show success criteria section
      const successCriteria = page.locator('.success-criteria');
      await expect(successCriteria).toBeVisible();
      
      // Should have default criteria
      const defaultCriteria = page.locator('.default-criteria');
      await expect(defaultCriteria).toBeVisible();
      
      // Should allow custom criteria
      const customCriteria = page.locator('.custom-criteria');
      await expect(customCriteria).toBeVisible();
      
      // Test adding custom criterion
      await page.fill('[data-testid="custom-criterion"]', 'Complete within 2 hours');
      await page.click('[data-testid="add-criterion"]');
      
      // Should show added criterion
      const addedCriterion = page.locator('.added-criterion');
      await expect(addedCriterion).toContainText('Complete within 2 hours');
      
      // Should allow timeline setting
      const timelineSetting = page.locator('.timeline-setting');
      await expect(timelineSetting).toBeVisible();
      
      // Test timeline
      await page.selectOption('[data-testid="mission-timeline"]', '4-hours');
    });

    test('should launch mission and show monitoring interface', async ({ page }) => {
      await page.click('.starter-mission:first-child');
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      
      // Launch mission
      await page.click('[data-testid="launch-mission"]');
      
      // Should show mission monitoring
      const missionMonitoring = page.locator('.mission-monitoring');
      await expect(missionMonitoring).toBeVisible();
      
      // Should show progress indicators
      const progressIndicators = page.locator('.progress-indicators');
      await expect(progressIndicators).toBeVisible();
      
      // Should show real-time updates
      const realtimeUpdates = page.locator('.realtime-updates');
      await expect(realtimeUpdates).toBeVisible();
      
      // Should show intervention controls
      const interventionControls = page.locator('.intervention-controls');
      await expect(interventionControls).toBeVisible();
      
      // Should show agent coordination
      const agentCoordination = page.locator('.agent-coordination');
      await expect(agentCoordination).toBeVisible();
    });

    test('should handle mission completion and assessment', async ({ page }) => {
      await page.click('.starter-mission:first-child');
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      await page.click('[data-testid="launch-mission"]');
      
      // Simulate mission completion
      await page.click('[data-testid="simulate-completion"]');
      
      // Should show mission results
      const missionResults = page.locator('.mission-results');
      await expect(missionResults).toBeVisible();
      
      // Should show detailed results
      const detailedResults = page.locator('.detailed-results');
      await expect(detailedResults).toBeVisible();
      
      // Should show agent performance
      const agentPerformance = page.locator('.agent-performance');
      await expect(agentPerformance).toBeVisible();
      
      // Should allow feedback provision
      const feedbackInterface = page.locator('.feedback-interface');
      await expect(feedbackInterface).toBeVisible();
      
      // Test providing feedback
      await page.fill('[data-testid="mission-feedback"]', 'Excellent coordination between agents');
      await page.click('[data-testid="submit-feedback"]');
      
      // Should show recommendations
      const recommendations = page.locator('.future-recommendations');
      await expect(recommendations).toBeVisible();
      
      // Should unlock next act
      await expect(page.locator('.act-3-unlock')).toBeVisible();
    });
  });

  test.describe('Integration Tests - Executive Agency Development', () => {
    test('should complete full Act II personalization flow', async ({ page }) => {
      // Complete personalization
      await page.click('[data-testid="begin-personalization"]');
      
      // Quick leadership assessment
      await page.click('[data-testid="response-collaborative"]');
      await page.click('[data-testid="next-scenario"]');
      await page.click('[data-testid="response-collaborative"]');
      await page.click('[data-testid="complete-assessment"]');
      
      // Set delegation preferences
      await page.click('[data-testid="authority-medium"]');
      await page.selectOption('[data-testid="approval-threshold"]', 'medium-value');
      await page.click('[data-testid="save-delegation-prefs"]');
      
      // Configure dashboard
      await page.click('[data-testid="save-dashboard-config"]');
      
      // Set communication rhythm
      await page.check('[data-testid="briefing-morning"]');
      await page.selectOption('[data-testid="progress-frequency"]', 'hourly');
      await page.click('[data-testid="save-comm-rhythm"]');
      
      // Complete first mission
      await page.click('.starter-mission:first-child');
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      await page.click('[data-testid="launch-mission"]');
      await page.click('[data-testid="simulate-completion"]');
      await page.fill('[data-testid="mission-feedback"]', 'Good first mission');
      await page.click('[data-testid="submit-feedback"]');
      
      // Should complete Act II
      await expect(page.locator('.act-2-complete')).toBeVisible();
      await expect(page.locator('.executive-agency-developed')).toBeVisible();
    });
  });

  test.describe('Executive Agency Metrics Tracking', () => {
    test('should track confidence development', async ({ page }) => {
      await page.click('[data-testid="begin-personalization"]');
      
      // Check initial confidence
      const initialConfidence = page.locator('.confidence-metric');
      await expect(initialConfidence).toBeVisible();
      
      // Complete successful actions
      await page.click('[data-testid="quick-setup"]');
      await page.click('.starter-mission:first-child');
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      await page.click('[data-testid="launch-mission"]');
      await page.click('[data-testid="simulate-completion"]');
      
      // Should show increased confidence
      const updatedConfidence = page.locator('.confidence-metric');
      await expect(updatedConfidence).toHaveAttribute('data-level', 'medium');
    });

    test('should track delegation comfort', async ({ page }) => {
      await page.click('[data-testid="begin-personalization"]');
      
      // Set high delegation preferences
      await page.click('[data-testid="authority-high"]');
      await page.selectOption('[data-testid="approval-threshold"]', 'high-value');
      await page.click('[data-testid="save-delegation-prefs"]');
      
      // Complete mission with high delegation
      await page.click('[data-testid="save-dashboard-config"]');
      await page.click('[data-testid="save-comm-rhythm"]');
      await page.click('.starter-mission:first-child');
      await page.click('.available-agent:first-child');
      await page.click('[data-testid="assign-to-mission"]');
      await page.click('[data-testid="launch-mission"]');
      await page.click('[data-testid="simulate-completion"]');
      
      // Should show delegation comfort increase
      const delegationComfort = page.locator('.delegation-comfort-metric');
      await expect(delegationComfort).toHaveAttribute('data-level', 'high');
    });
  });

  test.describe('Personalization Persistence', () => {
    test('should save executive style preferences', async ({ page }) => {
      await page.click('[data-testid="begin-personalization"]');
      await page.click('[data-testid="response-collaborative"]');
      await page.click('[data-testid="complete-assessment"]');
      
      // Save preferences
      await page.click('[data-testid="authority-medium"]');
      await page.click('[data-testid="save-delegation-prefs"]');
      
      // Refresh page
      await page.reload();
      
      // Should maintain preferences
      await page.click('[data-testid="view-preferences"]');
      await expect(page.locator('.executive-style')).toContainText('Collaborative');
      await expect(page.locator('[data-testid="authority-medium"]')).toBeChecked();
    });

    test('should preserve dashboard configuration', async ({ page }) => {
      await page.click('[data-testid="begin-personalization"]');
      await page.click('[data-testid="quick-setup"]');
      
      // Configure dashboard
      await page.check('[data-testid="priority-mission-status"]');
      await page.check('[data-testid="priority-agent-health"]');
      await page.click('[data-testid="save-dashboard-config"]');
      
      // Refresh page
      await page.reload();
      
      // Should maintain dashboard config
      await expect(page.locator('.priority-mission-status')).toBeVisible();
      await expect(page.locator('.priority-agent-health')).toBeVisible();
    });
  });
});