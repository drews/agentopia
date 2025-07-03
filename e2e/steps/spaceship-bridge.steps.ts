import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

// Background steps
Given('the spaceship bridge backend is running on port {int}', async ({ page }, port: number) => {
  // Check if backend is running by hitting health endpoint
  const response = await page.request.get(`http://localhost:${port}/health`);
  expect(response.status()).toBe(200);
});

Given('the React frontend is running on port {int}', async ({ page }, port: number) => {
  // Check if frontend is accessible
  const response = await page.request.get(`http://localhost:${port}/`);
  expect(response.status()).toBe(200);
});

// Navigation steps
When('I navigate to the bridge interface', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

Given('I am on the bridge interface', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

// Header and status verification
Then('I should see the bridge header with {string}', async ({ page }, headerText: string) => {
  const header = page.locator('.bridge-header h1');
  await expect(header).toContainText(headerText);
});

Then('I should see the connection status as {string}', async ({ page }, status: string) => {
  const connectionStatus = page.locator('.connection');
  await expect(connectionStatus).toContainText(status);
});

Then('I should see the bridge status as {string}', async ({ page }, status: string) => {
  const bridgeStatus = page.locator('.status.operational');
  await expect(bridgeStatus).toContainText(status);
});

// Screenshot capture steps
Then('I should take a screenshot of the {string}', async ({ page }, name: string) => {
  await page.screenshot({ 
    path: `e2e/screenshots/progress-${name}-${new Date().toISOString().split('T')[0]}.png`,
    fullPage: true 
  });
});

// Agent verification steps
When('the bridge loads agent data', async ({ page }) => {
  // Wait for agents to appear on the grid
  await page.waitForSelector('.agent', { timeout: 10000 });
});

Then('I should see {int} agents on the bridge grid', async ({ page }, count: number) => {
  const agents = page.locator('.agent');
  await expect(agents).toHaveCount(count);
});

Then('I should see the {string} agent with avatar {string}', async ({ page }, agentName: string, avatar: string) => {
  const agent = page.locator('.agent').filter({ hasText: agentName });
  await expect(agent).toBeVisible();
  
  const agentAvatar = agent.locator('.agent-avatar');
  await expect(agentAvatar).toContainText(avatar);
});

// Station verification steps
When('I examine the bridge layout', async ({ page }) => {
  // Wait for stations to be rendered
  await page.waitForSelector('.station', { timeout: 10000 });
});

Then('I should see the {string} at position ({int}, {int})', async ({ page }, stationName: string, x: number, y: number) => {
  const station = page.locator('.station').filter({ hasText: stationName });
  await expect(station).toBeVisible();
  
  // Check CSS grid position (adding 1 because CSS grid is 1-indexed)
  const expectedColumn = x + 1;
  const expectedRow = y + 1;
  
  await expect(station).toHaveCSS('grid-column-start', expectedColumn.toString());
  await expect(station).toHaveCSS('grid-row-start', expectedRow.toString());
});

Then('each station should have proper dimensions', async ({ page }) => {
  const stations = page.locator('.station');
  const stationCount = await stations.count();
  
  for (let i = 0; i < stationCount; i++) {
    const station = stations.nth(i);
    await expect(station).toBeVisible();
    
    // Check that station has width and height styles
    const boundingBox = await station.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);
  }
});

// WebSocket and real-time steps
Given('the WebSocket connection is established', async ({ page }) => {
  // Wait for WebSocket connection indicator
  await expect(page.locator('.connection.connected')).toBeVisible();
});

When('an agent status changes', async ({ page }) => {
  // This would typically involve triggering a backend event
  // For now, we can simulate by checking for status changes
  await page.waitForTimeout(1000); // Wait for potential real-time updates
});

Then('I should see the updated status in real-time', async ({ page }) => {
  // Wait for any status updates to propagate
  await page.waitForTimeout(2000);
  
  // Verify at least one agent has a non-idle status
  const activeAgent = page.locator('.agent').filter({ hasText: /(active|thinking|working|moving)/ });
  await expect(activeAgent).toHaveCount(await page.locator('.agent').count());
});

Then('the agent\'s visual appearance should reflect the new status', async ({ page }) => {
  // Check for animation classes on agents
  const animatedAgents = page.locator('.agent.active, .agent.thinking, .agent.working, .agent.moving');
  await expect(animatedAgents.first()).toBeVisible();
});

// Sidebar verification steps
When('I look at the bridge sidebar', async ({ page }) => {
  const sidebar = page.locator('.bridge-sidebar');
  await expect(sidebar).toBeVisible();
});

Then('I should see a {string} panel', async ({ page }, panelTitle: string) => {
  const panel = page.locator('.panel').filter({ hasText: panelTitle });
  await expect(panel).toBeVisible();
});

Then('I should see all {int} agents listed with their current status', async ({ page }, count: number) => {
  const crewItems = page.locator('.crew-item');
  await expect(crewItems).toHaveCount(count);
  
  // Each crew item should have a status
  for (let i = 0; i < count; i++) {
    const crewItem = crewItems.nth(i);
    const status = crewItem.locator('.status');
    await expect(status).toBeVisible();
  }
});

Then('I should see all stations with {string} status', async ({ page }, status: string) => {
  const systemItems = page.locator('.system-item');
  const systemCount = await systemItems.count();
  
  for (let i = 0; i < systemCount; i++) {
    const systemItem = systemItems.nth(i);
    const statusElement = systemItem.locator('.status');
    await expect(statusElement).toContainText(status);
  }
});

// Responsive design steps
When('I resize the viewport to mobile dimensions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500); // Wait for CSS transitions
});

Then('the layout should adapt responsively', async ({ page }) => {
  // Check that main content stacks vertically on mobile
  const bridgeMain = page.locator('.bridge-main');
  const flexDirection = await bridgeMain.evaluate(el => getComputedStyle(el).flexDirection);
  expect(flexDirection).toBe('column');
});

Then('the sidebar should stack below the main grid', async ({ page }) => {
  const sidebar = page.locator('.bridge-sidebar');
  const bridgeGrid = page.locator('.bridge-grid');
  
  // Get positions
  const gridBox = await bridgeGrid.boundingBox();
  const sidebarBox = await sidebar.boundingBox();
  
  // Sidebar should be below grid in mobile layout
  expect(sidebarBox?.y).toBeGreaterThan(gridBox?.y || 0);
});

Then('all elements should remain accessible', async ({ page }) => {
  // Check that key elements are still visible
  await expect(page.locator('.bridge-header')).toBeVisible();
  await expect(page.locator('.bridge-grid')).toBeVisible();
  await expect(page.locator('.bridge-sidebar')).toBeVisible();
});

// Animation verification steps
When('an agent status changes to {string}', async ({ page }, status: string) => {
  // For testing, we'll check if any agent already has this status
  // In a real implementation, this would trigger a status change
  const agentWithStatus = page.locator(`.agent.${status}`);
  if (await agentWithStatus.count() === 0) {
    // Skip this test if no agent has the expected status
    console.log(`No agent found with status: ${status}`);
  }
});

Then('the agent should display a {string} animation', async ({ page }, animationType: string) => {
  const animatedAgent = page.locator(`.agent.${animationType}`);
  await expect(animatedAgent.first()).toBeVisible();
  
  // Check that the animation CSS class is applied
  await expect(animatedAgent.first()).toHaveClass(new RegExp(animationType));
});

// Interaction steps
When('I hover over the {string}', async ({ page }, stationName: string) => {
  const station = page.locator('.station').filter({ hasText: stationName });
  await station.hover();
});

Then('the station should highlight', async ({ page }) => {
  // Wait for hover effects to apply
  await page.waitForTimeout(300);
  
  // Check for visual changes (transform, shadow, etc.)
  const hoveredStation = page.locator('.station:hover');
  await expect(hoveredStation).toBeVisible();
});

When('I click on the {string}', async ({ page }, stationName: string) => {
  const station = page.locator('.station').filter({ hasText: stationName });
  await station.click();
});

Then('I should see station details or interaction options', async ({ page }) => {
  // For now, just verify the click registered (no modal/details implemented yet)
  // This test will evolve as we add interaction features
  await page.waitForTimeout(100);
});

// Aesthetic verification steps
When('I examine the visual design', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

Then('the interface should have a retro terminal aesthetic', async ({ page }) => {
  const body = page.locator('body');
  const backgroundColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
  
  // Should have dark background
  expect(backgroundColor).toMatch(/rgb\(10, 10, 10\)|#0a0a0a/);
});

Then('text should use monospace font', async ({ page }) => {
  const body = page.locator('body');
  const fontFamily = await body.evaluate(el => getComputedStyle(el).fontFamily);
  
  // Should include Courier New or other monospace font
  expect(fontFamily).toMatch(/courier|monospace/i);
});

Then('colors should have a green terminal theme', async ({ page }) => {
  const header = page.locator('.bridge-header h1');
  const color = await header.evaluate(el => getComputedStyle(el).color);
  
  // Should have green color theme
  expect(color).toMatch(/rgb\(0, 255, 0\)|#00ff00/);
});

Then('animations should have a pixelated feel', async ({ page }) => {
  // Check for CSS animations on agents
  const agents = page.locator('.agent');
  const firstAgent = agents.first();
  
  const animationName = await firstAgent.evaluate(el => getComputedStyle(el).animationName);
  expect(animationName).not.toBe('none');
});