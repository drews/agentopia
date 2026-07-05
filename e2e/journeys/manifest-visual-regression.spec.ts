import { test, expect } from '@playwright/test';

test.describe('Manifest View Visual Regression Tests', () => {
  test.use({ 
    viewport: { width: 1920, height: 1080 },
    // Disable animations for consistent screenshots
    actionTimeout: 10000,
    navigationTimeout: 30000
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to manifest view
    const manifestButton = page.locator('button', { hasText: 'Manifest' });
    await manifestButton.click();
    await page.waitForTimeout(2000); // Wait for view to load and animations to settle
  });

  test('manifest overview - full page golden screenshot', async ({ page }) => {
    // Ensure we're on the default Agent Performance tab
    const agentPerfTab = page.locator('.tab-button', { hasText: 'Agent Performance' });
    await expect(agentPerfTab).toHaveClass(/active/);
    
    // Wait for agent cards to load
    await page.waitForSelector('.agent-card', { timeout: 10000 });
    await page.waitForTimeout(1000); // Allow metrics to settle
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('manifest-overview-golden.png', {
      fullPage: true,
      animations: 'disabled',
      clip: null
    });
  });

  test('agent performance tab - golden screenshot', async ({ page }) => {
    // Ensure we're on the Agent Performance tab
    const agentPerfTab = page.locator('.tab-button', { hasText: 'Agent Performance' });
    if (!await agentPerfTab.locator('.active').isVisible()) {
      await agentPerfTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Wait for content to load
    await page.waitForSelector('.agents-grid', { timeout: 10000 });
    await page.waitForTimeout(1500); // Wait for dynamic content to settle
    
    // Take screenshot of just the tab content area
    const tabContent = page.locator('.tab-content');
    await expect(tabContent).toHaveScreenshot('manifest-agent-performance-golden.png', {
      animations: 'disabled'
    });
  });

  test('system health tab - golden screenshot', async ({ page }) => {
    // Switch to System Health tab
    const systemHealthTab = page.locator('.tab-button', { hasText: 'System Health' });
    await systemHealthTab.click();
    await page.waitForTimeout(1000);
    
    // Wait for system health content to load
    await page.waitForSelector('.system-overview', { timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Take screenshot of system health tab
    const tabContent = page.locator('.tab-content');
    await expect(tabContent).toHaveScreenshot('manifest-system-health-golden.png', {
      animations: 'disabled'
    });
  });

  test('task flow tab - golden screenshot', async ({ page }) => {
    // Switch to Task Flow tab
    const taskFlowTab = page.locator('.tab-button', { hasText: 'Task Flow' });
    await taskFlowTab.click();
    await page.waitForTimeout(1000);
    
    // Wait for task flow content to load
    await page.waitForSelector('.tasks-view', { timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Take screenshot of task flow tab
    const tabContent = page.locator('.tab-content');
    await expect(tabContent).toHaveScreenshot('manifest-task-flow-golden.png', {
      animations: 'disabled'
    });
  });

  test('individual agent card - detailed golden screenshot', async ({ page }) => {
    // Wait for agent cards
    await page.waitForSelector('.agent-card', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Take screenshot of first agent card for detailed comparison
    const firstAgentCard = page.locator('.agent-card').first();
    await expect(firstAgentCard).toHaveScreenshot('manifest-agent-card-golden.png', {
      animations: 'disabled'
    });
  });

  test('tab navigation states - golden screenshot', async ({ page }) => {
    // Capture tab bar in default state
    const tabBar = page.locator('.manifest-tabs');
    await expect(tabBar).toHaveScreenshot('manifest-tabs-default-golden.png', {
      animations: 'disabled'
    });
    
    // Click System Health tab and capture
    const systemHealthTab = page.locator('.tab-button', { hasText: 'System Health' });
    await systemHealthTab.click();
    await page.waitForTimeout(300);
    
    await expect(tabBar).toHaveScreenshot('manifest-tabs-system-health-active-golden.png', {
      animations: 'disabled'
    });
    
    // Click Task Flow tab and capture
    const taskFlowTab = page.locator('.tab-button', { hasText: 'Task Flow' });
    await taskFlowTab.click();
    await page.waitForTimeout(300);
    
    await expect(tabBar).toHaveScreenshot('manifest-tabs-task-flow-active-golden.png', {
      animations: 'disabled'
    });
  });

  test('responsive mobile view - golden screenshot', async ({ page }) => {
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Take full page screenshot in mobile view
    await expect(page).toHaveScreenshot('manifest-mobile-golden.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('responsive tablet view - golden screenshot', async ({ page }) => {
    // Switch to tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Take full page screenshot in tablet view
    await expect(page).toHaveScreenshot('manifest-tablet-golden.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('system health component grid - golden screenshot', async ({ page }) => {
    // Switch to System Health tab
    const systemHealthTab = page.locator('.tab-button', { hasText: 'System Health' });
    await systemHealthTab.click();
    await page.waitForTimeout(1000);
    
    // Focus on component grid
    const componentGrid = page.locator('.components-grid');
    if (await componentGrid.isVisible()) {
      await expect(componentGrid).toHaveScreenshot('manifest-component-grid-golden.png', {
        animations: 'disabled'
      });
    }
  });

  test('system metrics display - golden screenshot', async ({ page }) => {
    // Switch to System Health tab
    const systemHealthTab = page.locator('.tab-button', { hasText: 'System Health' });
    await systemHealthTab.click();
    await page.waitForTimeout(1000);
    
    // Focus on metrics section
    const systemMetrics = page.locator('.system-metrics');
    if (await systemMetrics.isVisible()) {
      await expect(systemMetrics).toHaveScreenshot('manifest-system-metrics-golden.png', {
        animations: 'disabled'
      });
    }
  });

  test('task priority badges - golden screenshot', async ({ page }) => {
    // Switch to Task Flow tab
    const taskFlowTab = page.locator('.tab-button', { hasText: 'Task Flow' });
    await taskFlowTab.click();
    await page.waitForTimeout(1000);
    
    // Capture task cards to show priority badges
    const tasksList = page.locator('.tasks-list');
    if (await tasksList.isVisible()) {
      await expect(tasksList).toHaveScreenshot('manifest-task-priorities-golden.png', {
        animations: 'disabled'
      });
    }
  });

  test('progress bars and resource indicators - golden screenshot', async ({ page }) => {
    // On Agent Performance tab by default
    await page.waitForSelector('.resource-bar', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Focus on the first agent card's resource section
    const resourceSection = page.locator('.agent-card .metric-group').last();
    await expect(resourceSection).toHaveScreenshot('manifest-resource-bars-golden.png', {
      animations: 'disabled'
    });
  });

  test('dark theme styling verification - golden screenshot', async ({ page }) => {
    // Full manifest view to verify dark theme consistency
    await expect(page).toHaveScreenshot('manifest-dark-theme-golden.png', {
      fullPage: true,
      animations: 'disabled',
      // Ensure we capture the full themed interface
      clip: null
    });
  });

  test('manifest header and navigation - golden screenshot', async ({ page }) => {
    // Capture just the top section with header and navigation
    const manifestHeader = page.locator('.manifest-view').first();
    await expect(manifestHeader).toHaveScreenshot('manifest-header-nav-golden.png', {
      animations: 'disabled',
      clip: { x: 0, y: 0, width: 1920, height: 200 }
    });
  });

  // Test with specific data states for consistent comparison
  test('agent status variations - golden screenshot', async ({ page }) => {
    // Wait for agents to load with different statuses
    await page.waitForSelector('.agent-card', { timeout: 10000 });
    await page.waitForTimeout(2000); // Allow status updates to cycle
    
    // Take screenshot to capture different agent statuses
    const agentsGrid = page.locator('.agents-grid');
    await expect(agentsGrid).toHaveScreenshot('manifest-agent-statuses-golden.png', {
      animations: 'disabled'
    });
  });
});

// Additional test for comparison against previous versions
test.describe('Manifest View - Regression Comparison', () => {
  test.use({ 
    viewport: { width: 1920, height: 1080 }
  });

  test('manifest view matches baseline - full comparison', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to manifest
    const manifestButton = page.locator('button', { hasText: 'Manifest' });
    await manifestButton.click();
    await page.waitForTimeout(2000);
    
    // Wait for all content to be ready
    await page.waitForSelector('.agent-card', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Take baseline screenshot for comparison
    await expect(page).toHaveScreenshot('manifest-baseline-comparison.png', {
      fullPage: true,
      animations: 'disabled',
      // Use threshold for slight variations in dynamic content
      threshold: 0.1
    });
  });
});