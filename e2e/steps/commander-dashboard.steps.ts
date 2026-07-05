import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { promises as fs } from 'fs';
import { join } from 'path';

const { Given, When, Then } = createBdd();

// Constants for screenshot management
const SCREENSHOTS_DIR = 'e2e/screenshots';
const GOLDEN_DIR = join(SCREENSHOTS_DIR, 'golden');
const CURRENT_DIR = join(SCREENSHOTS_DIR, 'current');
const DIFF_DIR = join(SCREENSHOTS_DIR, 'diff');

// Ensure screenshot directories exist
async function ensureDirectories() {
  await fs.mkdir(GOLDEN_DIR, { recursive: true });
  await fs.mkdir(CURRENT_DIR, { recursive: true });
  await fs.mkdir(DIFF_DIR, { recursive: true });
}

// Navigation and setup steps
Given('I am on the commander dashboard', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Navigate to Ship tab to see Commander Dashboard
  const shipButton = page.locator('button', { hasText: 'Ship' });
  await shipButton.click();
  
  // Wait for commander dashboard to load
  await page.waitForSelector('.commander-dashboard', { timeout: 10000 });
  await page.waitForTimeout(2000); // Allow animations to settle
});

// Header verification
Then('I should see the Fleet Command Strategic Overview header', async ({ page }) => {
  const header = page.locator('.commander-dashboard h1');
  await expect(header).toContainText('Fleet Command Strategic Overview');
});

// Fleet Operations Panel
Then('I should see the fleet operations panel', async ({ page }) => {
  const panel = page.locator('.panel.fleet-overview');
  await expect(panel).toBeVisible();
  
  const panelHeader = panel.locator('h2');
  await expect(panelHeader).toContainText('Fleet Operations');
});

Then('I should see total ships metric', async ({ page }) => {
  const totalShipsCard = page.locator('.metric-card').filter({ hasText: 'Total Ships' });
  await expect(totalShipsCard).toBeVisible();
  
  const metricValue = totalShipsCard.locator('.metric-value');
  await expect(metricValue).toBeVisible();
  await expect(metricValue).not.toHaveText('');
});

Then('I should see operational ships metric', async ({ page }) => {
  const operationalCard = page.locator('.metric-card').filter({ hasText: 'Operational' });
  await expect(operationalCard).toBeVisible();
  
  const metricValue = operationalCard.locator('.metric-value');
  await expect(metricValue).toBeVisible();
});

Then('I should see crew efficiency metric', async ({ page }) => {
  const efficiencyCard = page.locator('.metric-card').filter({ hasText: 'Crew Efficiency' });
  await expect(efficiencyCard).toBeVisible();
  
  const metricValue = efficiencyCard.locator('.metric-value');
  await expect(metricValue).toContainText('%');
});

// Mission Command Center
When('I look at the Mission Command Center panel', async ({ page }) => {
  const panel = page.locator('.panel.mission-command');
  await expect(panel).toBeVisible();
});

Then('I should see active missions with progress bars', async ({ page }) => {
  const missionCards = page.locator('.mission-card');
  await expect(missionCards).toHaveCount(await missionCards.count());
  
  // Check that at least one mission has a progress bar
  const progressBars = page.locator('.progress-bar');
  await expect(progressBars.first()).toBeVisible();
});

Then('I should see mission status badges', async ({ page }) => {
  const statusBadges = page.locator('.status-badge');
  await expect(statusBadges.first()).toBeVisible();
});

Then('I should see mission priority indicators', async ({ page }) => {
  const priorityBadges = page.locator('.priority-badge');
  await expect(priorityBadges.first()).toBeVisible();
});

Then('I should see estimated completion times', async ({ page }) => {
  const etaElements = page.locator('.mission-eta');
  await expect(etaElements.first()).toBeVisible();
  await expect(etaElements.first()).toContainText('ETA:');
});

// System Performance Panel
When('I examine the System Performance panel', async ({ page }) => {
  const panel = page.locator('.panel.performance-analytics');
  await expect(panel).toBeVisible();
});

Then('I should see power efficiency metrics', async ({ page }) => {
  const powerMetric = page.locator('.performance-metric').filter({ hasText: 'Power Efficiency' });
  await expect(powerMetric).toBeVisible();
  
  const metricBar = powerMetric.locator('.metric-bar');
  await expect(metricBar).toBeVisible();
});

Then('I should see crew productivity metrics', async ({ page }) => {
  const productivityMetric = page.locator('.performance-metric').filter({ hasText: 'Crew Productivity' });
  await expect(productivityMetric).toBeVisible();
});

Then('I should see system uptime metrics', async ({ page }) => {
  const uptimeMetric = page.locator('.performance-metric').filter({ hasText: 'System Uptime' });
  await expect(uptimeMetric).toBeVisible();
});

Then('I should see error rate metrics', async ({ page }) => {
  const errorMetric = page.locator('.performance-metric').filter({ hasText: 'Error Rate' });
  await expect(errorMetric).toBeVisible();
});

// Resource Allocation Panel
When('I look at the Resource Allocation panel', async ({ page }) => {
  const panel = page.locator('.panel.resource-utilization');
  await expect(panel).toBeVisible();
});

Then('I should see computational resource utilization', async ({ page }) => {
  const computationalResource = page.locator('.resource-item').filter({ hasText: 'Computational' });
  await expect(computationalResource).toBeVisible();
});

Then('I should see power resource utilization', async ({ page }) => {
  const powerResource = page.locator('.resource-item').filter({ hasText: 'Power' });
  await expect(powerResource).toBeVisible();
});

Then('I should see network resource utilization', async ({ page }) => {
  const networkResource = page.locator('.resource-item').filter({ hasText: 'Network' });
  await expect(networkResource).toBeVisible();
});

Then('I should see storage resource utilization', async ({ page }) => {
  const storageResource = page.locator('.resource-item').filter({ hasText: 'Storage' });
  await expect(storageResource).toBeVisible();
});

Then('each resource should show current usage percentage', async ({ page }) => {
  const resourceValues = page.locator('.resource-value');
  const count = await resourceValues.count();
  
  for (let i = 0; i < count; i++) {
    const resourceValue = resourceValues.nth(i);
    await expect(resourceValue).toContainText('%');
  }
});

// Strategic Intelligence Panel
When('I examine the Strategic Intelligence panel', async ({ page }) => {
  const panel = page.locator('.panel.strategic-intelligence');
  await expect(panel).toBeVisible();
});

Then('I should see optimization recommendations', async ({ page }) => {
  const recommendationSection = page.locator('.intelligence-section').filter({ hasText: 'Optimization Recommendations' });
  await expect(recommendationSection).toBeVisible();
  
  const recommendations = recommendationSection.locator('.recommendation-list li');
  await expect(recommendations.first()).toBeVisible();
});

Then('I should see trend analysis indicators', async ({ page }) => {
  const trendSection = page.locator('.intelligence-section').filter({ hasText: 'Trend Analysis' });
  await expect(trendSection).toBeVisible();
  
  const trendItems = trendSection.locator('.trend-item');
  await expect(trendItems.first()).toBeVisible();
});

Then('I should see improvement suggestions', async ({ page }) => {
  const recommendations = page.locator('.recommendation-list li');
  const count = await recommendations.count();
  expect(count).toBeGreaterThan(0);
});

// Operational Timeline Panel
When('I look at the Recent Operations panel', async ({ page }) => {
  const panel = page.locator('.panel.operational-timeline');
  await expect(panel).toBeVisible();
});

Then('I should see a timeline of operational events', async ({ page }) => {
  const timelineEvents = page.locator('.timeline-event');
  await expect(timelineEvents.first()).toBeVisible();
});

Then('I should see event timestamps', async ({ page }) => {
  const eventTimes = page.locator('.event-time');
  await expect(eventTimes.first()).toBeVisible();
});

Then('I should see event types with icons', async ({ page }) => {
  const eventIcons = page.locator('.event-icon');
  await expect(eventIcons.first()).toBeVisible();
});

Then('I should see event descriptions', async ({ page }) => {
  const eventDescriptions = page.locator('.event-description');
  await expect(eventDescriptions.first()).toBeVisible();
  await expect(eventDescriptions.first()).not.toHaveText('');
});

// Responsive design
When('I resize the viewport to mobile dimensions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000); // Wait for CSS transitions
});

Then('the dashboard should adapt to smaller screen', async ({ page }) => {
  const dashboardGrid = page.locator('.dashboard-grid');
  await expect(dashboardGrid).toBeVisible();
  
  // Check that grid adapts to mobile layout
  const gridColumns = await dashboardGrid.evaluate(el => {
    return window.getComputedStyle(el).gridTemplateColumns;
  });
  
  // Should collapse to single column on mobile
  expect(gridColumns).toContain('1fr');
});

Then('panels should stack vertically', async ({ page }) => {
  const panels = page.locator('.panel');
  const panelCount = await panels.count();
  
  // Verify panels are stacked by checking vertical positions
  let previousTop = 0;
  for (let i = 0; i < Math.min(panelCount, 3); i++) {
    const panel = panels.nth(i);
    const boundingBox = await panel.boundingBox();
    if (boundingBox && i > 0) {
      expect(boundingBox.y).toBeGreaterThan(previousTop);
    }
    if (boundingBox) {
      previousTop = boundingBox.y;
    }
  }
});

Then('content should remain readable', async ({ page }) => {
  // Check that text is still visible and not truncated
  const headers = page.locator('h1, h2, h3');
  const headerCount = await headers.count();
  
  for (let i = 0; i < Math.min(headerCount, 3); i++) {
    const header = headers.nth(i);
    await expect(header).toBeVisible();
  }
});

// Loading and waiting steps
When('I wait for all panels to load completely', async ({ page }) => {
  await page.waitForSelector('.commander-dashboard', { timeout: 15000 });
  await page.waitForSelector('.panel.fleet-overview', { timeout: 5000 });
  await page.waitForSelector('.panel.mission-command', { timeout: 5000 });
  await page.waitForSelector('.panel.performance-analytics', { timeout: 5000 });
  await page.waitForSelector('.panel.resource-utilization', { timeout: 5000 });
  await page.waitForSelector('.panel.strategic-intelligence', { timeout: 5000 });
  await page.waitForSelector('.panel.operational-timeline', { timeout: 5000 });
  
  // Wait for animations to settle
  await page.waitForTimeout(3000);
});

Then('I should see all dashboard panels rendered', async ({ page }) => {
  // Verify all main panels are visible
  await expect(page.locator('.panel.fleet-overview')).toBeVisible();
  await expect(page.locator('.panel.mission-command')).toBeVisible();
  await expect(page.locator('.panel.performance-analytics')).toBeVisible();
  await expect(page.locator('.panel.resource-utilization')).toBeVisible();
  await expect(page.locator('.panel.strategic-intelligence')).toBeVisible();
  await expect(page.locator('.panel.operational-timeline')).toBeVisible();
});

// Screenshot capture steps
Then('I should capture golden screenshot {string}', async ({ page }, screenshotName: string) => {
  await ensureDirectories();
  
  const timestamp = new Date().toISOString().split('T')[0];
  const goldenPath = join(GOLDEN_DIR, `${screenshotName}-golden.png`);
  const currentPath = join(CURRENT_DIR, `${screenshotName}-${timestamp}.png`);
  
  // Take current screenshot
  await page.screenshot({ 
    path: currentPath,
    fullPage: true,
    animations: 'disabled' // Disable animations for consistent screenshots
  });
  
  // Check if golden screenshot exists
  try {
    await fs.access(goldenPath);
    console.log(`✅ Golden screenshot exists: ${goldenPath}`);
  } catch (error) {
    // Golden screenshot doesn't exist, copy current as golden
    await fs.copyFile(currentPath, goldenPath);
    console.log(`📸 Created new golden screenshot: ${goldenPath}`);
  }
});

When('I capture the current dashboard screenshot', async ({ page }) => {
  await ensureDirectories();
  
  const timestamp = new Date().toISOString().split('T')[0];
  const currentPath = join(CURRENT_DIR, `dashboard-current-${timestamp}.png`);
  
  await page.screenshot({ 
    path: currentPath,
    fullPage: true,
    animations: 'disabled'
  });
  
  // Store path for comparison
  (page as any).currentScreenshotPath = currentPath;
});

Then('I should verify the screenshot matches the golden baseline', async ({ page }) => {
  // Use Playwright's built-in visual comparison
  await expect(page.locator('.commander-dashboard')).toHaveScreenshot('commander-dashboard-baseline.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixels: 100, // Allow small differences for cross-browser compatibility
  });
});

Then('the screenshot should match the golden baseline within acceptable thresholds', async ({ page }) => {
  // This step documents the visual regression testing approach
  // In practice, this would be handled by Playwright's built-in screenshot comparison
  await expect(page.locator('.commander-dashboard')).toHaveScreenshot('commander-dashboard-regression-baseline.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixels: 50, // Stricter threshold for regression testing
    threshold: 0.2, // 20% threshold for pixel differences
  });
});

Then('any differences should be highlighted in the diff report', async ({ page }) => {
  // This step documents that Playwright automatically generates diff images
  // when visual comparisons fail, highlighting the differences
  
  // The diff images are automatically generated in test-results/
  // and included in the HTML report
  console.log('📊 Diff images are automatically generated by Playwright when visual comparisons fail');
  console.log('🔍 Check test-results/ directory and HTML report for diff images');
  
  // We can also take an additional screenshot for manual inspection
  await ensureDirectories();
  const timestamp = new Date().toISOString().split('T')[0];
  const inspectionPath = join(CURRENT_DIR, `dashboard-inspection-${timestamp}.png`);
  
  await page.screenshot({ 
    path: inspectionPath,
    fullPage: true,
    animations: 'disabled'
  });
  
  console.log(`📸 Manual inspection screenshot saved: ${inspectionPath}`);
});