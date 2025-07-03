import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

// Background - Health check steps
Given('the spaceship bridge backend is running on port {int}', async ({ request }, port: number) => {
  const response = await request.get(`http://localhost:${port}/health`);
  expect(response.status()).toBe(200);
});

Given('the React frontend is running on port {int}', async ({ request }, port: number) => {
  const response = await request.get(`http://localhost:${port}/`);
  expect(response.status()).toBe(200);
});

// Backend health check steps
When('I check the backend health endpoint', async ({ request }) => {
  const response = await request.get('http://localhost:8000/health');
  expect(response.status()).toBe(200);
});

Then('the backend should respond with status {int}', async ({ request }, expectedStatus: number) => {
  const response = await request.get('http://localhost:8000/health');
  expect(response.status()).toBe(expectedStatus);
});

Then('the response should indicate the service is healthy', async ({ request }) => {
  const response = await request.get('http://localhost:8000/health');
  const responseBody = await response.json();
  expect(responseBody.status).toBe('healthy');
});

// Frontend health check steps
When('I navigate to the frontend application', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

Then('the frontend should load successfully', async ({ page }) => {
  // Check that the page loaded without errors
  await expect(page).toHaveURL(/localhost:3000/);
});

Then('I should see the USS AGENTOPIA BRIDGE interface', async ({ page }) => {
  const header = page.locator('h1');
  await expect(header).toContainText('USS_AGENTOPIA Bridge');
});

// Screenshot and visual capture steps
When('I navigate to the bridge interface', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

When('I wait for the interface to fully load', async ({ page }) => {
  // Wait for key elements to be present
  await page.waitForSelector('h1', { timeout: 10000 });
  await page.waitForSelector('.bridge-grid', { timeout: 10000 });
  
  // Additional wait for any dynamic content
  await page.waitForTimeout(2000);
});

Then('I should take a screenshot for progress documentation', async ({ page }) => {
  const timestamp = new Date().toISOString().split('T')[0];
  await page.screenshot({
    path: `e2e/screenshots/bridge-progress-${timestamp}.png`,
    fullPage: true
  });
});

Then('the screenshot should show the current development state', async ({ page }) => {
  // Verify key elements are visible before taking screenshot
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.bridge-grid')).toBeVisible();
  
  // Take a second screenshot showing loaded state
  const timestamp = new Date().toISOString().split('T')[0];
  await page.screenshot({
    path: `e2e/screenshots/bridge-loaded-${timestamp}.png`,
    fullPage: true
  });
});