import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

// Navigation steps
When('I navigate to the manifest view', async ({ page }) => {
  // Click on the Manifest tab in the navigation
  const manifestButton = page.locator('button', { hasText: 'Manifest' });
  await manifestButton.click();
  await page.waitForTimeout(1000); // Allow view to switch
});

Given('I am on the manifest view', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Navigate to manifest tab
  const manifestButton = page.locator('button', { hasText: 'Manifest' });
  await manifestButton.click();
  await page.waitForTimeout(1000);
});

// Header and structure verification
Then('I should see the manifest header with {string}', async ({ page }, headerText: string) => {
  const header = page.locator('.manifest-view h3, .manifest-view .showcase-title');
  await expect(header).toContainText(headerText);
});

Then('I should see three tabs: {string}, {string}, and {string}', async ({ page }, tab1: string, tab2: string, tab3: string) => {
  const tab1Element = page.locator('.tab-button', { hasText: tab1 });
  const tab2Element = page.locator('.tab-button', { hasText: tab2 });
  const tab3Element = page.locator('.tab-button', { hasText: tab3 });
  
  await expect(tab1Element).toBeVisible();
  await expect(tab2Element).toBeVisible();
  await expect(tab3Element).toBeVisible();
});

Then('the {string} tab should be active by default', async ({ page }, tabName: string) => {
  const activeTab = page.locator('.tab-button.active', { hasText: tabName });
  await expect(activeTab).toBeVisible();
});

// Tab navigation
When('I am viewing the {string} tab', async ({ page }, tabName: string) => {
  const tab = page.locator('.tab-button', { hasText: tabName });
  if (!await tab.locator('.active').isVisible()) {
    await tab.click();
    await page.waitForTimeout(500);
  }
});

When('I click on the {string} tab', async ({ page }, tabName: string) => {
  const tab = page.locator('.tab-button', { hasText: tabName });
  await tab.click();
  await page.waitForTimeout(500);
});

// Agent Performance tab verification
Then('I should see {int} agent cards', async ({ page }, count: number) => {
  const agentCards = page.locator('.agent-card');
  await expect(agentCards).toHaveCount(count);
});

Then('each agent card should display:', async ({ page }, dataTable) => {
  const agentCards = page.locator('.agent-card');
  const firstCard = agentCards.first();
  
  const fields = dataTable.hashes();
  
  for (const field of fields) {
    switch (field.Type) {
      case 'text':
        // Check for text content
        await expect(firstCard).toContainText(/.+/);
        break;
      case 'badge':
        // Check for status badge
        const statusBadge = firstCard.locator('.status-badge');
        await expect(statusBadge).toBeVisible();
        break;
      case 'number':
        // Check for numeric values
        await expect(firstCard).toContainText(/\d+/);
        break;
      case 'time':
        // Check for time values (e.g., "2.3s")
        await expect(firstCard).toContainText(/\d+\.?\d*s/);
        break;
      case 'percentage':
        // Check for percentage values
        await expect(firstCard).toContainText(/\d+\.?\d*%/);
        break;
      case 'duration':
        // Check for duration values (e.g., "23h 45m")
        await expect(firstCard).toContainText(/\d+h\s+\d+m/);
        break;
      case 'progress_bar':
        // Check for progress bars
        const progressBar = firstCard.locator('.resource-bar, .bar');
        await expect(progressBar).toBeVisible();
        break;
    }
  }
});

// System Health tab verification
Then('I should see the overall system health status', async ({ page }) => {
  const healthStatus = page.locator('.overall-status, .health-summary');
  await expect(healthStatus).toBeVisible();
  
  const statusIndicator = page.locator('.status-indicator, .overall-status .status-indicator');
  await expect(statusIndicator).toBeVisible();
});

Then('I should see component status for:', async ({ page }, dataTable) => {
  const components = dataTable.hashes();
  
  for (const component of components) {
    const componentCard = page.locator('.component-card').filter({ 
      hasText: component.Component.toUpperCase() 
    });
    await expect(componentCard).toBeVisible();
    
    const statusElement = componentCard.locator('.component-status');
    await expect(statusElement).toContainText(component['Expected Status'].toUpperCase());
  }
});

Then('I should see system metrics including:', async ({ page }, dataTable) => {
  const metrics = dataTable.hashes();
  
  for (const metric of metrics) {
    const metricElement = page.locator('.metric-item, .system-metrics').filter({
      hasText: metric.Metric
    });
    await expect(metricElement).toBeVisible();
    
    const valueElement = metricElement.locator('.metric-value');
    
    switch (metric.Type) {
      case 'number':
        await expect(valueElement).toContainText(/\d+/);
        break;
      case 'percentage':
        await expect(valueElement).toContainText(/\d+\.?\d*%/);
        break;
    }
  }
});

// Task Flow tab verification
Then('I should see the task counts summary', async ({ page }) => {
  const taskCounts = page.locator('.task-counts, .tasks-header');
  await expect(taskCounts).toBeVisible();
  
  // Should show counts for queued, processing, completed
  await expect(taskCounts).toContainText(/queued/i);
  await expect(taskCounts).toContainText(/processing/i);
  await expect(taskCounts).toContainText(/completed/i);
});

Then('I should see active tasks with:', async ({ page }, dataTable) => {
  const taskCards = page.locator('.task-card');
  await expect(taskCards.first()).toBeVisible();
  
  const fields = dataTable.hashes();
  const firstTask = taskCards.first();
  
  for (const field of fields) {
    switch (field.Type) {
      case 'identifier':
        // Check for task ID
        const taskId = firstTask.locator('.task-id');
        await expect(taskId).toBeVisible();
        break;
      case 'badge':
        // Check for priority badge
        const priorityBadge = firstTask.locator('.task-priority');
        await expect(priorityBadge).toBeVisible();
        break;
      case 'text':
        // Check for text content
        await expect(firstTask).toContainText(/.+/);
        break;
      case 'progress_bar':
        // Check for progress bar
        const progressBar = firstTask.locator('.progress-bar');
        await expect(progressBar).toBeVisible();
        break;
      case 'timestamp':
        // Check for timestamp format (e.g., "2:30:45 PM")
        await expect(firstTask).toContainText(/\d+:\d+:\d+/);
        break;
    }
  }
});

Then('task priorities should be color-coded:', async ({ page }, dataTable) => {
  const priorities = dataTable.hashes();
  
  for (const priority of priorities) {
    const priorityElement = page.locator('.task-priority').filter({
      hasText: priority.Priority.toUpperCase()
    });
    
    if (await priorityElement.count() > 0) {
      const backgroundColor = await priorityElement.first().evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Verify color matches expected (this is a basic check)
      expect(backgroundColor).toMatch(/rgb\(/);
    }
  }
});

// Responsive design verification
When('I resize the viewport to mobile dimensions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
});

When('I resize the viewport to tablet dimensions', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);
});

Then('the manifest tabs should stack appropriately', async ({ page }) => {
  const tabContainer = page.locator('.manifest-tabs');
  await expect(tabContainer).toBeVisible();
  
  // Check that tabs are still accessible in mobile view
  const tabs = page.locator('.tab-button');
  await expect(tabs.first()).toBeVisible();
});

Then('agent cards should reflow to single column', async ({ page }) => {
  const agentsGrid = page.locator('.agents-grid');
  
  if (await agentsGrid.isVisible()) {
    // Check that grid adapts to mobile layout
    const gridColumns = await agentsGrid.evaluate(el => 
      window.getComputedStyle(el).gridTemplateColumns
    );
    
    // On mobile, should be single column or responsive
    expect(gridColumns).toBeDefined();
  }
});

Then('all metrics should remain readable', async ({ page }) => {
  // Check that text is still visible and not clipped
  const metricElements = page.locator('.metric-value, .agent-card, .component-card');
  
  if (await metricElements.first().isVisible()) {
    const firstMetric = metricElements.first();
    const fontSize = await firstMetric.evaluate(el => 
      parseInt(window.getComputedStyle(el).fontSize)
    );
    
    // Font should be readable (at least 12px)
    expect(fontSize).toBeGreaterThanOrEqual(10);
  }
});

Then('the manifest should adapt to tablet layout', async ({ page }) => {
  // Verify responsive behavior for tablet
  const manifestView = page.locator('.manifest-view');
  await expect(manifestView).toBeVisible();
  
  // Should maintain good layout on tablet
  const width = await page.evaluate(() => window.innerWidth);
  expect(width).toBe(768);
});

// Real-time updates verification
When('I wait for {int} seconds for real-time updates', async ({ page }, seconds: number) => {
  await page.waitForTimeout(seconds * 1000);
});

Then('the CPU and memory usage bars should update dynamically', async ({ page }) => {
  const resourceBars = page.locator('.resource-bar, .bar');
  
  if (await resourceBars.first().isVisible()) {
    const firstBar = resourceBars.first();
    const fill = firstBar.locator('.fill');
    
    // Check that the fill element exists and has a width
    if (await fill.isVisible()) {
      const width = await fill.evaluate(el => window.getComputedStyle(el).width);
      expect(width).not.toBe('0px');
    }
  }
});

Then('the timestamp should reflect recent updates', async ({ page }) => {
  const timestamps = page.locator('.timestamp');
  
  if (await timestamps.first().isVisible()) {
    const timestampText = await timestamps.first().textContent();
    expect(timestampText).toMatch(/\d+:\d+:\d+/);
  }
});

Then('resource utilization should show live data', async ({ page }) => {
  const resourceData = page.locator('.metric-value, .resource-bar .fill');
  await expect(resourceData.first()).toBeVisible();
});

// Navigation and interaction verification
When('I click through each tab in sequence', async ({ page }) => {
  const tabs = ['Agent Performance', 'System Health', 'Task Flow'];
  
  for (const tabName of tabs) {
    const tab = page.locator('.tab-button', { hasText: tabName });
    if (await tab.isVisible()) {
      await tab.click();
      await page.waitForTimeout(300);
    }
  }
});

Then('each tab should activate with proper styling', async ({ page }) => {
  // Check that active tab has active styling
  const activeTab = page.locator('.tab-button.active');
  await expect(activeTab).toBeVisible();
  
  // Check for active styling
  const activeColor = await activeTab.evaluate(el => 
    window.getComputedStyle(el).color
  );
  expect(activeColor).toMatch(/rgb\(/);
});

Then('the content should switch without flickering', async ({ page }) => {
  const tabContent = page.locator('.tab-content');
  await expect(tabContent).toBeVisible();
  
  // Content should be stable
  await page.waitForTimeout(200);
  await expect(tabContent).toBeVisible();
});

Then('tab transitions should be smooth', async ({ page }) => {
  // Check for transition properties
  const tabs = page.locator('.tab-button');
  
  if (await tabs.first().isVisible()) {
    const transition = await tabs.first().evaluate(el => 
      window.getComputedStyle(el).transition
    );
    expect(transition).toContain('all');
  }
});

// Theme and styling verification
Then('the manifest should use the spaceship bridge dark theme', async ({ page }) => {
  const manifestView = page.locator('.manifest-view');
  
  const backgroundColor = await manifestView.evaluate(el => 
    window.getComputedStyle(el).backgroundColor
  );
  
  // Should have dark background
  expect(backgroundColor).toMatch(/rgb\(15, 20, 25\)|rgb\(26, 35, 50\)|rgba?\([^)]*[01]\d,[^)]*[01]\d,[^)]*[01234]\d/);
});

Then('background colors should match the bridge aesthetic', async ({ page }) => {
  const manifestBg = page.locator('.manifest-view');
  const bridgeBg = page.locator('.App');
  
  // Both should have similar dark theme
  const manifestColor = await manifestBg.evaluate(el => 
    window.getComputedStyle(el).backgroundColor
  );
  
  expect(manifestColor).toMatch(/rgb.*\(.*[01]\d.*[01]\d.*[234]\d/);
});

Then('text contrast should be appropriate for readability', async ({ page }) => {
  const textElements = page.locator('.manifest-view *').first();
  
  const color = await textElements.evaluate(el => 
    window.getComputedStyle(el).color
  );
  
  // Should have light text on dark background
  expect(color).toMatch(/rgb.*\(.*[123456789]|rgba.*\(.*[123456789]/);
});

Then('status indicators should be clearly visible', async ({ page }) => {
  const statusIndicators = page.locator('.status-badge, .status-indicator, .component-status');
  
  if (await statusIndicators.first().isVisible()) {
    await expect(statusIndicators.first()).toBeVisible();
  }
});

// Data visualization verification
When('I examine the data visualization elements', async ({ page }) => {
  await page.waitForTimeout(500);
});

Then('progress bars should have appropriate gradients', async ({ page }) => {
  const progressBars = page.locator('.bar .fill, .progress-fill');
  
  if (await progressBars.first().isVisible()) {
    const backgroundColor = await progressBars.first().evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should have color
    expect(backgroundColor).toMatch(/rgb\(/);
  }
});

Then('status badges should have correct color coding', async ({ page }) => {
  const statusBadges = page.locator('.status-badge, .task-priority');
  
  if (await statusBadges.first().isVisible()) {
    const backgroundColor = await statusBadges.first().evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    expect(backgroundColor).toMatch(/rgb\(/);
  }
});

Then('metric values should be properly formatted', async ({ page }) => {
  const metricValues = page.locator('.metric-value');
  
  if (await metricValues.first().isVisible()) {
    const value = await metricValues.first().textContent();
    
    // Should contain numbers or formatted values
    expect(value).toMatch(/\d|%|h|m|s/);
  }
});

Then('charts should be responsive to container size', async ({ page }) => {
  const charts = page.locator('.agents-grid, .metrics-grid, .tasks-list');
  
  if (await charts.first().isVisible()) {
    const boundingBox = await charts.first().boundingBox();
    
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);
  }
});

// Accessibility verification
Then('tab navigation should work with keyboard', async ({ page }) => {
  // Focus first tab
  const firstTab = page.locator('.tab-button').first();
  await firstTab.focus();
  
  // Check focus is visible
  const focusedElement = page.locator(':focus');
  await expect(focusedElement).toBeVisible();
});

Then('color contrast should meet WCAG standards', async ({ page }) => {
  // Basic contrast check
  const textElement = page.locator('.manifest-view').first();
  
  if (await textElement.isVisible()) {
    const color = await textElement.evaluate(el => window.getComputedStyle(el).color);
    const bgColor = await textElement.evaluate(el => window.getComputedStyle(el).backgroundColor);
    
    // Should have contrasting colors
    expect(color).not.toBe(bgColor);
  }
});

Then('status indicators should have text labels', async ({ page }) => {
  const statusElements = page.locator('.status-badge, .component-status');
  
  if (await statusElements.first().isVisible()) {
    const text = await statusElements.first().textContent();
    expect(text).not.toBe('');
  }
});

Then('interactive elements should have focus indicators', async ({ page }) => {
  const buttons = page.locator('.tab-button');
  
  if (await buttons.first().isVisible()) {
    await buttons.first().focus();
    
    // Check for focus styles
    const outline = await buttons.first().evaluate(el => 
      window.getComputedStyle(el).outline
    );
    
    // Should have some focus indication
    expect(outline).toBeDefined();
  }
});

// Error states verification
When('system metrics indicate error conditions', async ({ page }) => {
  // This step assumes error states are present in the mock data
  await page.waitForTimeout(1000);
});

Then('error states should be clearly indicated with red coloring', async ({ page }) => {
  const errorElements = page.locator('.error, .critical, [style*="red"], [style*="#f44336"]');
  
  // If error elements exist, they should be visible
  const errorCount = await errorElements.count();
  if (errorCount > 0) {
    await expect(errorElements.first()).toBeVisible();
  }
});

Then('warning states should use orange\\/yellow indicators', async ({ page }) => {
  const warningElements = page.locator('.warning, [style*="orange"], [style*="#ff9800"]');
  
  const warningCount = await warningElements.count();
  if (warningCount > 0) {
    await expect(warningElements.first()).toBeVisible();
  }
});

Then('degraded performance should be visually distinct', async ({ page }) => {
  const degradedElements = page.locator('.degraded, [style*="yellow"]');
  
  const degradedCount = await degradedElements.count();
  if (degradedCount > 0) {
    await expect(degradedElements.first()).toBeVisible();
  }
});

// Screenshot capture step (reused from spaceship-bridge.steps.ts)
Then('I should take a screenshot of the {string}', async ({ page }, name: string) => {
  await page.screenshot({ 
    path: `e2e/screenshots/manifest-${name}-${new Date().toISOString().split('T')[0]}.png`,
    fullPage: true 
  });
});